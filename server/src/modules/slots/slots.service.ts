import { CreateSlotDto, UpdateSlotDto } from '@guruapp/shared';
import { slotRepository } from '../../repositories/slot.repository';
import { guruRepository } from '../../repositories/guru.repository';
import { AppError } from '../../utils/appError';

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
    return slotRepository.create(profile.id, dto);
  },

  async update(userId: string, slotId: string, dto: UpdateSlotDto) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const slot = await slotRepository.findById(slotId);
    if (!slot || slot.guruId !== profile.id) throw new AppError('Slot not found', 404, 'NOT_FOUND');
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
