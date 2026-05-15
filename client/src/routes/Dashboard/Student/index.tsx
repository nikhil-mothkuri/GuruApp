import { useState } from 'react';
import { useMyBookings, useCancelBooking } from '@/hooks/useBookings';
import { useFavorites } from '@/hooks/useFavorites';
import { useCreateRating } from '@/hooks/useRatings';
import { useAuth } from '@/hooks/useAuth';
import { GuruCard, type GuruCardData } from '@/components/guru/GuruCard';
import { StarRating } from '@/components/rating/StarRating';
import { formatDateTime } from '@/lib/utils';
import type { Booking } from '@guruapp/shared';
import { BookOpen, CheckCircle, Heart, Calendar } from 'lucide-react';

const STATUS_CHIP: Record<string, string> = {
  PENDING:   'bg-[#fef7e0] text-[#b06000]',
  CONFIRMED: 'bg-[#e8f0fe] text-[#1a73e8]',
  COMPLETED: 'bg-[#e6f4ea] text-[#1e8e3e]',
  CANCELLED: 'bg-[#f1f3f4] text-[#5f6368]',
};

function RatingModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const rate = useCreateRating(booking.id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await rate.mutateAsync({ stars, comment: comment || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 pt-6 pb-4 border-b border-[#e8eaed]">
          <h2 className="text-base font-semibold text-[#202124]">Rate your session</h2>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <StarRating value={stars} onChange={setStars} size="lg" />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={3}
            className="w-full border border-[#dadce0] rounded-lg px-3 py-2.5 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] resize-none transition-colors"
          />
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-full text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={rate.isPending} className="px-6 py-2 rounded-full text-sm font-medium bg-[#1a73e8] text-white hover:bg-[#1557b0] disabled:opacity-60 shadow-sm transition-colors">
              {rate.isPending ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useMyBookings();
  const { data: favorites } = useFavorites();
  const cancelBooking = useCancelBooking();
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [tab, setTab] = useState<'bookings' | 'favorites'>('bookings');

  const totalCount = bookings?.length ?? 0;
  const completedCount = (bookings as Booking[] | undefined)?.filter((b) => b.status === 'COMPLETED').length ?? 0;
  const favCount = favorites?.length ?? 0;
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Hero Profile Card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e0e0e0] mb-6">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-[#1a73e8] to-[#4285f4] relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
            />
          </div>

          {/* Avatar + role badge */}
          <div className="px-6 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-[#e0e0e0]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#4285f4] border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-semibold select-none">
                  {initial}
                </div>
              )}
              <span className="mb-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] tracking-wide uppercase">
                Student
              </span>
            </div>
            <h1 className="text-xl font-semibold text-[#202124]">{user?.name}</h1>
            <p className="text-sm text-[#5f6368] mt-0.5">{user?.email}</p>
          </div>

          {/* Stats row */}
          <div className="border-t border-[#f1f3f4] grid grid-cols-3 divide-x divide-[#f1f3f4]">
            <div className="py-4 px-4 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#5f6368]" />
                <span className="text-xl font-bold text-[#202124]">{totalCount}</span>
              </div>
              <span className="text-xs text-[#5f6368]">Total Bookings</span>
            </div>
            <div className="py-4 px-4 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#1e8e3e]" />
                <span className="text-xl font-bold text-[#1e8e3e]">{completedCount}</span>
              </div>
              <span className="text-xs text-[#5f6368]">Completed</span>
            </div>
            <div className="py-4 px-4 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#ea4335]" />
                <span className="text-xl font-bold text-[#ea4335]">{favCount}</span>
              </div>
              <span className="text-xs text-[#5f6368]">Favourites</span>
            </div>
          </div>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-t-xl border border-b-0 border-[#e0e0e0] overflow-hidden">
          <div className="flex">
            {(['bookings', 'favorites'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  tab === t
                    ? 'border-[#1a73e8] text-[#1a73e8]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                }`}
              >
                {t === 'bookings' ? 'My Bookings' : 'Favourites'}
                {t === 'bookings' && totalCount > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tab === t ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}>
                    {totalCount}
                  </span>
                )}
                {t === 'favorites' && favCount > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tab === t ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}>
                    {favCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content panel ──────────────────────────────────────────── */}
        <div className="bg-white rounded-b-xl border border-t border-t-[#e8eaed] border-[#e0e0e0] p-5 min-h-52">

          {/* Bookings tab */}
          {tab === 'bookings' && (
            <div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-[#f1f3f4] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : !bookings?.length ? (
                <div className="text-center py-16 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#e8f0fe] flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-[#1a73e8]" />
                  </div>
                  <p className="text-[#202124] font-medium">No bookings yet</p>
                  <p className="text-sm text-[#5f6368]">Find a guru to get started on your learning journey.</p>
                  <a
                    href="/"
                    className="mt-1 px-5 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors shadow-sm"
                  >
                    Browse Gurus
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {(bookings as Booking[]).map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-[#e8eaed] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#c5d8fd] hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {b.guru?.avatarUrl ? (
                          <img src={b.guru.avatarUrl} alt={b.guru.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" width={40} height={40} />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#4285f4] flex items-center justify-center text-white font-medium text-sm select-none flex-shrink-0">
                            {b.guru?.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#202124]">{b.guru?.name}</p>
                          <p className="text-xs text-[#5f6368] mt-0.5">
                            {formatDateTime(b.scheduledAt)} · <span className="uppercase tracking-wide text-[#9aa0a6]">{b.type}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CHIP[b.status]}`}>
                          {b.status}
                        </span>
                        {['PENDING', 'CONFIRMED'].includes(b.status) && (
                          <button
                            onClick={() => cancelBooking.mutate(b.id)}
                            className="text-xs text-[#d93025] hover:bg-[#fce8e6] border border-[#f5c6c2] px-2.5 py-1 rounded-full transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        )}
                        {b.status === 'COMPLETED' && !b.rating && (
                          <button
                            onClick={() => setRatingBooking(b)}
                            className="text-xs text-[#1a73e8] hover:bg-[#e8f0fe] border border-[#c5d8fd] px-2.5 py-1 rounded-full transition-colors font-medium"
                          >
                            Rate
                          </button>
                        )}
                        {b.rating && <StarRating value={(b.rating as unknown as { stars: number }).stars} readonly size="sm" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favourites tab */}
          {tab === 'favorites' && (
            <div>
              {!favorites?.length ? (
                <div className="text-center py-16 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#fce8e6] flex items-center justify-center">
                    <Heart className="w-8 h-8 text-[#ea4335]" />
                  </div>
                  <p className="text-[#202124] font-medium">No favourites yet</p>
                  <p className="text-sm text-[#5f6368]">Browse gurus and save the ones you love.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((guru: GuruCardData) => <GuruCard key={guru.id} guru={guru} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {ratingBooking && <RatingModal booking={ratingBooking} onClose={() => setRatingBooking(null)} />}
    </div>
  );
}
