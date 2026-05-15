import { useParams, Link } from 'react-router-dom';
import { useGuruDetail, useGuruSlots } from '@/hooks/useGurus';
import { useGuruRatings } from '@/hooks/useRatings';
import { useAddFavorite, useRemoveFavorite, useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/rating/StarRating';
import { Heart, Video, Calendar, ArrowLeft, RefreshCw } from 'lucide-react';
import { formatDate, DAY_NAMES } from '@/lib/utils';
import { BookingModal } from '@/components/booking/BookingModal';
import { useState } from 'react';
import type { AvailabilitySlot } from '@guruapp/shared';

export default function GuruProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: guru, isLoading } = useGuruDetail(id!);
  const { data: slots } = useGuruSlots(id!);
  const { data: ratingsData } = useGuruRatings(id!);
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { user } = useAuth();
  const [bookingSlot, setBookingSlot] = useState<AvailabilitySlot | null>(null);
  const [showSubscribe, setShowSubscribe] = useState(false);

  const isFavorited = favorites?.some((f: { userId: string }) => f.userId === id);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!guru) return <div className="text-center py-20 text-[#5f6368]">Guru not found.</div>;

  const toggleFavorite = () => {
    if (isFavorited) removeFavorite.mutate(id!);
    else addFavorite.mutate(id!);
  };

  const initial = guru.user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#1a73e8] hover:text-[#1557b0] mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </Link>

        {/* Header card */}
        <div className="bg-white border border-[#e0e0e0] rounded-2xl overflow-hidden mb-6 g-card">
          {/* Subtle header band */}
          <div className="h-3 bg-[#1a73e8]" />
          <div className="px-6 pt-5 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-5">
                {guru.user?.avatarUrl ? (
                  <img src={guru.user.avatarUrl} alt={guru.user?.name} className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md" loading="lazy" width={80} height={80} />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-medium text-3xl shadow-md select-none">
                    {initial}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-normal text-[#202124]">{guru.user?.name}</h1>
                  {guru.tagline && <p className="text-[#5f6368] mt-0.5 text-sm">{guru.tagline}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <StarRating value={guru.ratingAvg} readonly size="sm" />
                    <span className="text-sm text-[#5f6368]">{guru.ratingAvg.toFixed(1)} · {guru.ratingCount} reviews</span>
                  </div>
                </div>
              </div>

              {user && (
                <button
                  onClick={toggleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    isFavorited
                      ? 'border-[#ea4335] text-[#ea4335] bg-[#fce8e6]'
                      : 'border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4]'
                  }`}
                >
                  <Heart className={isFavorited ? 'w-4 h-4 fill-[#ea4335] text-[#ea4335]' : 'w-4 h-4'} />
                  {isFavorited ? 'Saved' : 'Save'}
                </button>
              )}
            </div>

            {guru.user?.bio && (
              <p className="text-[#3c4043] text-sm mt-4 leading-relaxed max-w-2xl">{guru.user.bio}</p>
            )}

            {guru.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {guru.skills.map((s: { id: string; skillName: string }) => (
                  <span key={s.id} className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full font-medium">{s.skillName}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">

            {guru.photos.length > 0 && (
              <section className="bg-white border border-[#e0e0e0] rounded-xl p-5 g-card">
                <h2 className="text-base font-medium text-[#202124] mb-4">Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {guru.photos.map((p: { id: string; url: string; caption: string | null }) => (
                    <img key={p.id} src={p.url} alt={p.caption ?? ''} className="w-full aspect-square object-cover rounded-lg" loading="lazy" />
                  ))}
                </div>
              </section>
            )}

            {guru.videos.length > 0 && (
              <section className="bg-white border border-[#e0e0e0] rounded-xl p-5 g-card">
                <h2 className="text-base font-medium text-[#202124] mb-4">Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {guru.videos.map((v: { id: string; youtubeUrl: string; title: string; thumbnailUrl: string | null }) => (
                    <a key={v.id} href={v.youtubeUrl} target="_blank" rel="noopener noreferrer"
                      className="flex gap-3 items-center p-3 rounded-lg border border-[#e0e0e0] hover:bg-[#f8f9fa] transition-colors">
                      {v.thumbnailUrl && <img src={v.thumbnailUrl} alt={v.title} className="w-20 h-14 object-cover rounded" loading="lazy" width={80} height={56} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#202124] line-clamp-2 font-medium">{v.title}</p>
                        <Video className="w-3.5 h-3.5 text-[#ea4335] mt-1.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {ratingsData?.data?.length > 0 && (
              <section className="bg-white border border-[#e0e0e0] rounded-xl p-5 g-card">
                <h2 className="text-base font-medium text-[#202124] mb-4">Reviews</h2>
                <div className="space-y-4">
                  {ratingsData.data.map((r: { id: string; stars: number; comment: string | null; createdAt: string; student?: { name: string } }) => (
                    <div key={r.id} className="pb-4 border-b border-[#f1f3f4] last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-[#202124]">{r.student?.name ?? 'Anonymous'}</span>
                        <span className="text-xs text-[#5f6368]">{formatDate(r.createdAt)}</span>
                      </div>
                      <StarRating value={r.stars} readonly size="sm" />
                      {r.comment && <p className="text-sm text-[#3c4043] mt-1.5 leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Availability sidebar */}
          <div>
            <section className="bg-white border border-[#e0e0e0] rounded-xl p-5 sticky top-24 g-card">
              <h2 className="text-base font-medium text-[#202124] mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1a73e8]" /> Availability
              </h2>

              {/* Option 1 — Recurring subscription */}
              <div className="mb-4 p-3 rounded-lg bg-[#f8f9fa] border border-[#e8eaed]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <RefreshCw className="w-4 h-4 text-[#1a73e8] flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[#202124]">Recurring sessions</p>
                      <p className="text-xs text-[#5f6368]">Daily sessions for a time period</p>
                    </div>
                  </div>
                  {user ? (
                    <button
                      onClick={() => setShowSubscribe(true)}
                      className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-full hover:bg-[#1557b0] transition-colors font-medium flex-shrink-0"
                    >
                      Subscribe
                    </button>
                  ) : (
                    <Link to="/login" className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-full hover:bg-[#1557b0] transition-colors font-medium flex-shrink-0">
                      Sign in
                    </Link>
                  )}
                </div>
              </div>

              {/* Option 2 — One-time appointment slots */}
              {(!slots || slots.length === 0) ? (
                <p className="text-xs text-[#5f6368] text-center py-3">No appointment slots available yet.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wide mb-2">One-time appointments</p>
                  {slots.map((slot: AvailabilitySlot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg bg-[#f8f9fa] border border-[#e8eaed]">
                      <div>
                        <p className="text-sm font-medium text-[#202124]">Every {DAY_NAMES[slot.dayOfWeek]}</p>
                        <p className="text-xs text-[#5f6368]">
                          {slot.startTime} – {slot.endTime} · {slot.slotDurationMins < 60
                            ? `${slot.slotDurationMins} min`
                            : `${slot.slotDurationMins / 60}h${slot.slotDurationMins % 60 ? ` ${slot.slotDurationMins % 60}m` : ''}`}
                        </p>
                      </div>
                      {user ? (
                        <button
                          onClick={() => setBookingSlot(slot)}
                          className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-full hover:bg-[#1557b0] transition-colors font-medium"
                        >
                          Book
                        </button>
                      ) : (
                        <Link to="/login" className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-full hover:bg-[#1557b0] transition-colors font-medium">
                          Sign in
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {bookingSlot && (
        <BookingModal guruId={id!} guruName={guru.user?.name ?? ''} slot={bookingSlot} onClose={() => setBookingSlot(null)} />
      )}
      {showSubscribe && (
        <BookingModal guruId={id!} guruName={guru.user?.name ?? ''} subscriptionOnly onClose={() => setShowSubscribe(false)} />
      )}
    </div>
  );
}
