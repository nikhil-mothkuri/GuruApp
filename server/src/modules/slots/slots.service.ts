import { CreateSlotDto, UpdateSlotDto } from '@guruapp/shared';
import { slotRepository } from '../../repositories/slot.repository';
import { guruRepository } from '../../repositories/guru.repository';
import { AppError } from '../../utils/appError';

// HH:MM strings compare correctly lexicographically when zero-padded.
const timesOverlap = (s1: string, e1: string, s2: string, e2: string) =>
  s1 < e2 && s2 < e1;

type ExistingSlot = {
  id: string;
  dayOfWeek: number | null;
  date: Date | string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  startTime: string | null;
  endTime: string | null;
};

type IncomingSlot = {
  mode?: string;
  dayOfWeek?: number | null;
  date?: Date | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  startTime?: string | null;
  endTime?: string | null;
};

const toIso = (v: Date | string | null | undefined): string | null =>
  v == null ? null : typeof v === 'string' ? v : v.toISOString();

function findOverlap(
  existing: ExistingSlot[],
  incoming: IncomingSlot,
  excludeId?: string,
): ExistingSlot | undefined {
  const s1 = incoming.startTime;
  const e1 = incoming.endTime;
  if (!s1 || !e1) return undefined;

  return existing.find((slot) => {
    if (slot.id === excludeId) return false;
    const s2 = slot.startTime;
    const e2 = slot.endTime;
    if (!s2 || !e2) return false;
    if (!timesOverlap(s1, e1, s2, e2)) return false;

    const incomingMode = incoming.mode ??
      (incoming.dayOfWeek != null ? 'WEEKLY' : incoming.date ? 'ONE_TIME' : 'DAILY_RANGE');

    // Weekly vs Weekly — same day of week
    if (incomingMode === 'WEEKLY' && incoming.dayOfWeek != null && slot.dayOfWeek != null) {
      return slot.dayOfWeek === incoming.dayOfWeek;
    }

    // One-time vs One-time — same calendar date
    if (incomingMode === 'ONE_TIME' && incoming.date && slot.date) {
      const d1 = toIso(incoming.date)?.slice(0, 10);
      const d2 = toIso(slot.date)?.slice(0, 10);
      return d1 != null && d1 === d2;
    }

    // One-time vs Weekly — the one-time date falls on that weekly day
    if (incomingMode === 'ONE_TIME' && incoming.date && slot.dayOfWeek != null) {
      return new Date(toIso(incoming.date)!).getUTCDay() === slot.dayOfWeek;
    }

    // Weekly vs One-time — the existing one-time falls on the incoming weekly day
    if (incomingMode === 'WEEKLY' && incoming.dayOfWeek != null && slot.date) {
      return new Date(toIso(slot.date)!).getUTCDay() === incoming.dayOfWeek;
    }

    // Daily-range vs Daily-range — date ranges share any common day
    if (
      incomingMode === 'DAILY_RANGE' &&
      incoming.startDate && incoming.endDate &&
      slot.startDate && slot.endDate
    ) {
      const is = toIso(incoming.startDate)!;
      const ie = toIso(incoming.endDate)!;
      const ss = toIso(slot.startDate)!;
      const se = toIso(slot.endDate)!;
      return is < se && ss < ie;
    }

    return false;
  });
}

export const slotsService = {
  async getByGuruId(guruProfileId: string) {
    return slotRepository.findByGuruProfileId(guruProfileId);
  },

  async getMySlots(userId: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    return slotRepository.findByGuruProfileId(profile.id);
  },

  async create(userId: string, dto: CreateSlotDto) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');

    const existing = await slotRepository.findByGuruProfileId(profile.id);
    const conflict = findOverlap(existing, dto as IncomingSlot);
    if (conflict) {
      throw new AppError(
        `This slot overlaps with an existing slot (${conflict.startTime}–${conflict.endTime}).`,
        409,
        'SLOT_OVERLAP',
      );
    }

    return slotRepository.create(profile.id, dto);
  },

  async update(userId: string, slotId: string, dto: UpdateSlotDto) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');

    const slot = await slotRepository.findById(slotId);
    if (!slot || slot.guruId !== profile.id) throw new AppError('Slot not found', 404, 'NOT_FOUND');

    // Merge existing slot with incoming updates to get the effective new state
    const merged: IncomingSlot = {
      mode: dto.mode ?? (slot.dayOfWeek != null ? 'WEEKLY' : slot.date ? 'ONE_TIME' : 'DAILY_RANGE'),
      dayOfWeek: dto.dayOfWeek !== undefined ? dto.dayOfWeek : slot.dayOfWeek,
      date: dto.date !== undefined ? dto.date : toIso(slot.date),
      startDate: dto.startDate !== undefined ? dto.startDate : toIso(slot.startDate),
      endDate: dto.endDate !== undefined ? dto.endDate : toIso(slot.endDate),
      startTime: dto.startTime ?? slot.startTime,
      endTime: dto.endTime ?? slot.endTime,
    };

    const existing = await slotRepository.findByGuruProfileId(profile.id);
    const conflict = findOverlap(existing, merged, slotId);
    if (conflict) {
      throw new AppError(
        `This slot overlaps with an existing slot (${conflict.startTime}–${conflict.endTime}).`,
        409,
        'SLOT_OVERLAP',
      );
    }

    return slotRepository.update(slotId, dto);
  },

  async delete(userId: string, slotId: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const slot = await slotRepository.findById(slotId);
    if (!slot || slot.guruId !== profile.id) throw new AppError('Slot not found', 404, 'NOT_FOUND');
    await slotRepository.delete(slotId);
  },
};
