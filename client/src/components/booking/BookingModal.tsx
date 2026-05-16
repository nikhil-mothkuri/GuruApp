import { useState } from 'react';
import { X, CalendarDays, RefreshCw } from 'lucide-react';
import { useCreateBooking } from '@/hooks/useBookings';
import type { AvailabilitySlot } from '@guruapp/shared';
import { useTranslation } from 'react-i18next';

interface Props {
  guruId: string;
  guruName: string;
  slot?: AvailabilitySlot;
  subscriptionOnly?: boolean;
  onClose: () => void;
}

export function BookingModal({ guruId, guruName, slot, subscriptionOnly = false, onClose }: Props) {
  const { t } = useTranslation();
  const initialType = subscriptionOnly ? 'SUBSCRIPTION' : 'APPOINTMENT';
  const [type, setType] = useState<'APPOINTMENT' | 'SUBSCRIPTION'>(initialType);
  const [date, setDate] = useState('');
  const [until, setUntil] = useState('');
  const createBooking = useCreateBooking();

  const today = new Date().toISOString().split('T')[0];

  const selectedDow = date ? new Date(`${date}T12:00:00`).getDay() : null;
  const dayMismatch = type === 'APPOINTMENT' && slot && date && selectedDow !== slot.dayOfWeek;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dayMismatch) return;

    const timeComponent = type === 'APPOINTMENT' && slot ? slot.startTime : '00:00';
    const scheduledAt = new Date(`${date}T${timeComponent}:00`).toISOString();

    await createBooking.mutateAsync({
      guruId,
      slotId: type === 'APPOINTMENT' && slot ? slot.id : undefined,
      type,
      scheduledAt,
      recurrenceRule:
        type === 'SUBSCRIPTION'
          ? { freq: 'DAILY', until: new Date(`${until}T23:59:59`).toISOString() }
          : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e8eaed]">
          <div>
            <h2 className="text-base font-medium text-[#202124]">
              {t('booking.title', { guruName })}
            </h2>
            {slot && (
              <p className="text-sm text-[#5f6368] mt-0.5">
                {t(`days.${slot.dayOfWeek}`)} · {slot.startTime} – {slot.endTime} ·{' '}
                {slot.slotDurationMins} min
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f1f3f4] transition-colors"
          >
            <X className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {!subscriptionOnly && slot && (
            <div>
              <p className="text-sm font-medium text-[#202124] mb-2">{t('booking.sessionType')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('APPOINTMENT')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    type === 'APPOINTMENT'
                      ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]'
                      : 'border-[#dadce0] text-[#5f6368] hover:border-[#aaa]'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" /> {t('booking.oneTime')}
                </button>
                <button
                  type="button"
                  onClick={() => setType('SUBSCRIPTION')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    type === 'SUBSCRIPTION'
                      ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]'
                      : 'border-[#dadce0] text-[#5f6368] hover:border-[#aaa]'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" /> {t('booking.recurring')}
                </button>
              </div>
            </div>
          )}

          {subscriptionOnly && (
            <div className="flex items-center gap-2 text-sm text-[#1a73e8] bg-[#e8f0fe] px-3 py-2 rounded-lg">
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">{t('booking.recurringLabel')}</span>
            </div>
          )}

          {type === 'APPOINTMENT' && (
            <div>
              <label className="block text-sm font-medium text-[#202124] mb-1.5">
                {t('booking.sessionDate')}
                {slot && (
                  <span className="ml-2 font-normal text-[#5f6368]">
                    {t('booking.mustBe', { day: t(`days.${slot.dayOfWeek}`) })}
                  </span>
                )}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={today}
                className="w-full border border-[#dadce0] rounded px-3 py-2.5 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
              {dayMismatch && slot && (
                <p className="text-[#d93025] text-xs mt-1.5">
                  {t('booking.dayMismatch', {
                    actual: t(`days.${selectedDow!}`),
                    expected: t(`days.${slot.dayOfWeek}`),
                  })}
                </p>
              )}
            </div>
          )}

          {type === 'SUBSCRIPTION' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1.5">
                  {t('booking.startDate')}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={today}
                  className="w-full border border-[#dadce0] rounded px-3 py-2.5 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1.5">
                  {t('booking.subscribeUntil')}
                </label>
                <input
                  type="date"
                  value={until}
                  onChange={(e) => setUntil(e.target.value)}
                  required
                  min={date || today}
                  className="w-full border border-[#dadce0] rounded px-3 py-2.5 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
                />
              </div>
            </>
          )}

          {createBooking.error && (
            <p className="text-[#d93025] text-sm bg-[#fce8e6] px-3 py-2 rounded">
              {(createBooking.error as { response?: { data?: { error?: { message?: string } } } })
                .response?.data?.error?.message ?? t('booking.failed')}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors"
            >
              {t('booking.cancel')}
            </button>
            <button
              type="submit"
              disabled={createBooking.isPending || !!dayMismatch}
              className="px-6 py-2 rounded-full text-sm font-medium bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors disabled:opacity-60 shadow-sm"
            >
              {createBooking.isPending ? t('booking.booking') : t('booking.confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
