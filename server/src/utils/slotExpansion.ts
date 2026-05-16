function parseTimeToMinutes(t: string) {
  const [hh, mm] = t.split(':').map(Number);
  return hh * 60 + mm;
}

function addMinutes(date: Date, mins: number) {
  return new Date(date.getTime() + mins * 60 * 1000);
}

function combineDateAndTime(date: Date, timeStr: string) {
  const [hh, mm] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}

// Split a time window into multiple occurrences of slotDurationMins
function splitWindow(start: Date, end: Date, slotDurationMins: number) {
  const out: { start: Date; end: Date }[] = [];
  let cur = new Date(start);
  while (addMinutes(cur, slotDurationMins) <= end) {
    out.push({ start: new Date(cur), end: addMinutes(cur, slotDurationMins) });
    cur = addMinutes(cur, slotDurationMins);
  }
  return out;
}

/**
 * Expand a single availability slot into concrete occurrences within a date range.
 * slot: { id, guruId, mode, dayOfWeek?, date?, startDate?, endDate?, startTime?, endTime?, slotDurationMins }
 */
export function expandSlotOccurrences(slot: any, rangeStartIso: string, rangeEndIso: string) {
  const rangeStart = new Date(rangeStartIso);
  const rangeEnd = new Date(rangeEndIso);
  const occurrences: { slotId: string; guruId: string; start: Date; end: Date }[] = [];

  const duration = slot.slotDurationMins || 60;

  if (slot.mode === 'ONE_TIME') {
    if (!slot.date) return occurrences;
    const start = new Date(slot.date);
    const end = addMinutes(start, duration);
    if (start >= rangeStart && start <= rangeEnd)
      occurrences.push({ slotId: slot.id, guruId: slot.guruId, start, end });
    return occurrences;
  }

  // DAILY_RANGE: iterate calendar days between slot.startDate and slot.endDate (inclusive)
  if (slot.mode === 'DAILY_RANGE') {
    if (!slot.startDate || !slot.endDate || !slot.startTime || !slot.endTime) return occurrences;
    const startDate = new Date(slot.startDate);
    const endDate = new Date(slot.endDate);
    const iterStart = startDate > rangeStart ? startDate : rangeStart;
    const iterEnd = endDate < rangeEnd ? endDate : rangeEnd;
    for (let d = new Date(iterStart); d <= iterEnd; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      const windowStart = combineDateAndTime(day, slot.startTime);
      const windowEnd = combineDateAndTime(day, slot.endTime);
      const parts = splitWindow(windowStart, windowEnd, duration);
      parts.forEach((p) =>
        occurrences.push({ slotId: slot.id, guruId: slot.guruId, start: p.start, end: p.end }),
      );
    }
    return occurrences;
  }

  // WEEKLY mode (default): find matching weekdays in range
  // slot.dayOfWeek is 0-6 (Sun-Sat) per schema
  if (slot.mode === 'WEEKLY' || !slot.mode) {
    if (typeof slot.dayOfWeek !== 'number' || !slot.startTime || !slot.endTime) return occurrences;
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === slot.dayOfWeek) {
        const windowStart = combineDateAndTime(d, slot.startTime);
        const windowEnd = combineDateAndTime(d, slot.endTime);
        const parts = splitWindow(windowStart, windowEnd, duration);
        parts.forEach((p) =>
          occurrences.push({ slotId: slot.id, guruId: slot.guruId, start: p.start, end: p.end }),
        );
      }
    }
    return occurrences;
  }

  return occurrences;
}

/**
 * Expand multiple slots into occurrences aggregated and sorted.
 */
export function expandSlots(slots: any[], rangeStartIso: string, rangeEndIso: string) {
  const all: { slotId: string; guruId: string; start: string; end: string }[] = [];
  for (const s of slots) {
    const occ = expandSlotOccurrences(s, rangeStartIso, rangeEndIso);
    occ.forEach((o) =>
      all.push({
        slotId: o.slotId,
        guruId: o.guruId,
        start: o.start.toISOString(),
        end: o.end.toISOString(),
      }),
    );
  }
  all.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return all;
}

export default { expandSlotOccurrences, expandSlots };
