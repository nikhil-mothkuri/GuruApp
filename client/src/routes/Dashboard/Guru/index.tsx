import { useState } from 'react';
import { useMyGuruProfile, useUpdateGuruProfile, useAddSkill, useDeleteSkill, useAddVideo, useDeleteVideo } from '@/hooks/useGurus';
import { useGuruBookings } from '@/hooks/useBookings';
import { useMySlots, useCreateSlot, useDeleteSlot } from '@/hooks/useSlots';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/rating/StarRating';
import { formatDateTime, DAY_NAMES } from '@/lib/utils';
import { Plus, Trash2, Video, Clock, Calendar, Users, Star, Layers } from 'lucide-react';
import type { Booking } from '@guruapp/shared';
import type { AvailabilitySlot } from '@guruapp/shared';

const STATUS_CHIP: Record<string, string> = {
  PENDING:   'bg-[#fef7e0] text-[#b06000]',
  CONFIRMED: 'bg-[#e8f0fe] text-[#1a73e8]',
  COMPLETED: 'bg-[#e6f4ea] text-[#1e8e3e]',
  CANCELLED: 'bg-[#f1f3f4] text-[#5f6368]',
};

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function GuruDashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyGuruProfile();
  const { data: bookings } = useGuruBookings();
  const { data: slots } = useMySlots();
  const updateProfile = useUpdateGuruProfile();
  const addSkill = useAddSkill();
  const deleteSkill = useDeleteSkill();
  const addVideo = useAddVideo();
  const deleteVideo = useDeleteVideo();
  const createSlot = useCreateSlot();
  const deleteSlot = useDeleteSlot();

  const [tab, setTab] = useState<'profile' | 'availability' | 'bookings'>('profile');

  const [tagline, setTagline] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [slotForm, setSlotForm] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    slotDurationMins: 60,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
      <div className="w-8 h-8 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalBookings = (bookings as Booking[] | undefined)?.length ?? 0;
  const activeSlots = (slots as AvailabilitySlot[] | undefined)?.length ?? 0;
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  const handleUpdateTagline = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ tagline });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim()) { addSkill.mutate({ skillName: newSkill.trim() }); setNewSkill(''); }
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl && videoTitle) { addVideo.mutate({ youtubeUrl: videoUrl, title: videoTitle }); setVideoUrl(''); setVideoTitle(''); }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    createSlot.mutate(slotForm, {
      onSuccess: () => setSlotForm({ dayOfWeek: 1, startTime: '09:00', endTime: '10:00', slotDurationMins: 60 }),
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Hero Profile Card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e0e0e0] mb-6">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-[#0d47a1] to-[#1a73e8] relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
            />
          </div>

          {/* Avatar + rating */}
          <div className="px-6 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-[#e0e0e0]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0d47a1] to-[#1a73e8] border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-semibold select-none">
                  {initial}
                </div>
              )}
              <div className="mb-2 flex items-center gap-2">
                <StarRating value={profile?.ratingAvg ?? 0} readonly size="sm" />
                <span className="text-sm text-[#202124] font-medium">{profile?.ratingAvg?.toFixed(1)}</span>
                <span className="text-sm text-[#9aa0a6]">({profile?.ratingCount} reviews)</span>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-[#202124]">{user?.name}</h1>
            {profile?.tagline && (
              <p className="text-sm text-[#5f6368] mt-1 italic">"{profile.tagline}"</p>
            )}
            <span className="mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#e6f4ea] text-[#1e8e3e] tracking-wide uppercase">
              Guru
            </span>
          </div>

          {/* Stats row */}
          <div className="border-t border-[#f1f3f4] grid grid-cols-3 divide-x divide-[#f1f3f4]">
            <div className="py-4 px-4 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#5f6368]" />
                <span className="text-xl font-bold text-[#202124]">{totalBookings}</span>
              </div>
              <span className="text-xs text-[#5f6368]">Total Bookings</span>
            </div>
            <div className="py-4 px-4 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#fbbc04] fill-[#fbbc04]" />
                <span className="text-xl font-bold text-[#fbbc04]">{profile?.ratingAvg?.toFixed(1) ?? '—'}</span>
              </div>
              <span className="text-xs text-[#5f6368]">Avg Rating</span>
            </div>
            <div className="py-4 px-4 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#1a73e8]" />
                <span className="text-xl font-bold text-[#1a73e8]">{activeSlots}</span>
              </div>
              <span className="text-xs text-[#5f6368]">Active Slots</span>
            </div>
          </div>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-t-xl border border-b-0 border-[#e0e0e0] overflow-hidden">
          <div className="flex">
            {(['profile', 'availability', 'bookings'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  tab === t
                    ? 'border-[#1a73e8] text-[#1a73e8]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                }`}
              >
                {t === 'profile' ? 'My Profile' : t === 'availability' ? 'Availability' : 'Bookings'}
                {t === 'bookings' && totalBookings > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tab === t ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}>
                    {totalBookings}
                  </span>
                )}
                {t === 'availability' && activeSlots > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tab === t ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}>
                    {activeSlots}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content panel ──────────────────────────────────────────── */}
        <div className="bg-white rounded-b-xl border border-t border-t-[#e8eaed] border-[#e0e0e0] p-5">

          {/* ── Profile tab ──────────────────────────────────────────── */}
          {tab === 'profile' && (
            <div className="space-y-5">

              {/* Tagline */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3">Tagline</h2>
                <form onSubmit={handleUpdateTagline} className="flex gap-2">
                  <input
                    value={tagline || profile?.tagline || ''}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="A short tagline about what you teach…"
                    className="flex-1 border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
                  />
                  <button type="submit" disabled={updateProfile.isPending} className="px-5 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] disabled:opacity-60 transition-colors shadow-sm">
                    Save
                  </button>
                </form>
              </section>

              {/* Skills */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile?.skills?.map((s: { id: string; skillName: string }) => (
                    <span key={s.id} className="flex items-center gap-1 bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full text-xs font-medium">
                      {s.skillName}
                      <button onClick={() => deleteSkill.mutate(s.id)} className="ml-1 hover:text-[#d93025] transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {!profile?.skills?.length && (
                    <p className="text-xs text-[#9aa0a6]">No skills added yet.</p>
                  )}
                </div>
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill…"
                    className="flex-1 border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
                  />
                  <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </form>
              </section>

              {/* YouTube Videos */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3">YouTube Videos</h2>
                <div className="space-y-2 mb-4">
                  {profile?.videos?.map((v: { id: string; youtubeUrl: string; title: string }) => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]">
                      <div className="flex items-center gap-2 min-w-0">
                        <Video className="w-4 h-4 text-[#ea4335] flex-shrink-0" />
                        <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1a73e8] hover:underline truncate">{v.title}</a>
                      </div>
                      <button onClick={() => deleteVideo.mutate(v.id)} className="text-[#5f6368] hover:text-[#d93025] transition-colors ml-2 flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {!profile?.videos?.length && (
                    <p className="text-xs text-[#9aa0a6]">No videos added yet.</p>
                  )}
                </div>
                <form onSubmit={handleAddVideo} className="space-y-2">
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="YouTube URL"
                    className="w-full border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
                  />
                  <input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Video title"
                    className="w-full border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
                  />
                  <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add video
                  </button>
                </form>
              </section>

              {/* Photos */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3">Photos</h2>
                {profile?.photos?.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                    {profile.photos.map((p: { id: string; url: string }) => (
                      <div key={p.id} className="relative group">
                        <img src={p.url} alt="" className="w-full aspect-square object-cover rounded-lg" loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).querySelector('input[type=file]') as HTMLInputElement;
                  if (!input.files?.[0]) return;
                  const fd = new FormData();
                  fd.append('photo', input.files[0]);
                  await fetch('/api/gurus/me/photos', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` }, body: fd });
                  input.value = '';
                }}>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm text-[#5f6368] file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border file:border-[#dadce0] file:text-sm file:font-medium file:text-[#1a73e8] file:bg-white hover:file:bg-[#e8f0fe] file:transition-colors"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-4 py-1.5 text-sm text-[#1a73e8] border border-[#dadce0] rounded-full hover:bg-[#e8f0fe] transition-colors font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Upload
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* ── Availability tab ─────────────────────────────────────── */}
          {tab === 'availability' && (
            <div className="space-y-6">

              {/* Info banner */}
              <div className="bg-[#e8f0fe] rounded-xl p-4 text-sm leading-relaxed border border-[#c5d8fd]">
                <p className="font-semibold text-[#1a73e8] mb-1">How availability works</p>
                <p className="text-[#3c4043] text-xs">
                  Add slots to let students book <strong>one-time appointments</strong> with you on specific dates.
                  Each slot defines a recurring weekly window — for example, "every Monday 10:00–11:00" means
                  students can pick any upcoming Monday to book a 60-minute session with you.
                  Students can also book <strong>recurring daily sessions</strong> directly from your profile without needing a slot.
                </p>
              </div>

              {/* Add slot form */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1a73e8]" /> Add a new slot
                </h2>

                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#202124] mb-1.5">Day of week</label>
                    <select
                      value={slotForm.dayOfWeek}
                      onChange={(e) => setSlotForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                      className="w-full border border-[#dadce0] rounded-lg px-3 py-2.5 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors bg-white"
                    >
                      {DAY_NAMES.map((day, i) => (
                        <option key={i} value={i}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[#202124] mb-1.5">Start time</label>
                      <input
                        type="time"
                        value={slotForm.startTime}
                        onChange={(e) => setSlotForm((f) => ({ ...f, startTime: e.target.value }))}
                        required
                        className="w-full border border-[#dadce0] rounded-lg px-3 py-2.5 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#202124] mb-1.5">End time</label>
                      <input
                        type="time"
                        value={slotForm.endTime}
                        onChange={(e) => setSlotForm((f) => ({ ...f, endTime: e.target.value }))}
                        required
                        className="w-full border border-[#dadce0] rounded-lg px-3 py-2.5 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#202124] mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#5f6368]" /> Session duration
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DURATIONS.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setSlotForm((f) => ({ ...f, slotDurationMins: mins }))}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            slotForm.slotDurationMins === mins
                              ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]'
                              : 'border-[#dadce0] text-[#5f6368] hover:border-[#aaa]'
                          }`}
                        >
                          {mins < 60 ? `${mins} min` : `${mins / 60}h${mins % 60 ? ` ${mins % 60}m` : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {createSlot.error && (
                    <p className="text-[#d93025] text-xs bg-[#fce8e6] px-3 py-2 rounded-lg border border-[#f5c6c2]">
                      {(createSlot.error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ?? 'Failed to create slot'}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={createSlot.isPending}
                    className="flex items-center gap-2 px-5 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] disabled:opacity-60 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {createSlot.isPending ? 'Adding…' : 'Add slot'}
                  </button>
                </form>
              </section>

              {/* Existing slots */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-4">Your slots</h2>
                {!slots?.length ? (
                  <p className="text-sm text-[#5f6368] text-center py-8">
                    No slots yet. Add your first slot above so students can book appointments with you.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(slots as AvailabilitySlot[]).map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl border border-[#e8eaed] hover:border-[#dadce0] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-[#1a73e8]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#202124]">Every {DAY_NAMES[slot.dayOfWeek]}</p>
                            <p className="text-xs text-[#5f6368] mt-0.5">
                              {slot.startTime} – {slot.endTime} · {slot.slotDurationMins < 60
                                ? `${slot.slotDurationMins} min`
                                : `${slot.slotDurationMins / 60}h${slot.slotDurationMins % 60 ? ` ${slot.slotDurationMins % 60}m` : ''}`} sessions
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteSlot.mutate(slot.id)}
                          disabled={deleteSlot.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#d93025] border border-[#f5c6c2] rounded-full hover:bg-[#fce8e6] transition-colors disabled:opacity-50 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── Bookings tab ─────────────────────────────────────────── */}
          {tab === 'bookings' && (
            <div>
              {!bookings?.length ? (
                <div className="text-center py-16 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#e8f0fe] flex items-center justify-center">
                    <Users className="w-8 h-8 text-[#1a73e8]" />
                  </div>
                  <p className="text-[#202124] font-medium">No bookings yet</p>
                  <p className="text-sm text-[#5f6368]">Students will appear here once they book a session with you.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(bookings as Booking[]).map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-[#e8eaed] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#c5d8fd] hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {b.student?.avatarUrl ? (
                          <img src={b.student.avatarUrl} alt={b.student.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" width={40} height={40} />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e8e3e] to-[#34a853] flex items-center justify-center text-white font-medium text-sm select-none flex-shrink-0">
                            {b.student?.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#202124]">{b.student?.name}</p>
                          <p className="text-xs text-[#5f6368] mt-0.5">
                            {formatDateTime(b.scheduledAt)} · <span className="uppercase tracking-wide text-[#9aa0a6]">{b.type}</span>
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_CHIP[b.status]}`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
