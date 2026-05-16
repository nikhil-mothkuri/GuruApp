import { useState, useRef, useEffect } from 'react';
import {
  useMyGuruProfile,
  useUpdateGuruProfile,
  useAddSkill,
  useDeleteSkill,
  useAddVideo,
  useDeleteVideo,
  useDeletePhoto,
  useUploadBanner,
  useUploadSkillImage,
} from '@/hooks/useGurus';
import { useGuruBookings } from '@/hooks/useBookings';
import { useMySlots, useCreateSlot, useDeleteSlot } from '@/hooks/useSlots';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/rating/StarRating';
import { formatDateTime } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Video,
  Calendar,
  Users,
  Star,
  Layers,
  Camera,
  X,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
  Clock,
  ImageIcon,
  Save,
  CheckCircle,
} from 'lucide-react';
import type { Booking } from '@guruapp/shared';
import type { AvailabilitySlot } from '@guruapp/shared';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

const STATUS_CHIP: Record<string, string> = {
  PENDING: 'bg-[#fef7e0] text-[#b06000]',
  CONFIRMED: 'bg-[#e8f0fe] text-[#1a73e8]',
  COMPLETED: 'bg-[#e6f4ea] text-[#1e8e3e]',
  CANCELLED: 'bg-[#f1f3f4] text-[#5f6368]',
};

const DAY_PILLS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  const value = `${String(h).padStart(2, '0')}:${m}`;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { value, label: `${displayH}:${m} ${period}` };
});

const DURATIONS: { mins: number; label: string }[] = [
  { mins: 15, label: '15 min' },
  { mins: 30, label: '30 min' },
  { mins: 45, label: '45 min' },
  { mins: 60, label: '1 hr' },
  { mins: 90, label: '1.5 hrs' },
  { mins: 120, label: '2 hrs' },
];

const formatLocalTime = (dateTime: string | Date) => {
  const date = new Date(dateTime);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const addMinutes = (time: string, mins: number) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes + mins, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function GuruDashboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading } = useMyGuruProfile();
  const deletePhoto = useDeletePhoto();
  const uploadBanner = useUploadBanner();
  const uploadSkillImage = useUploadSkillImage();
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  // All editable profile fields — initialised from profile on load
  const [tagline, setTagline] = useState('');
  const [about, setAbout] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [address, setAddress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const DEFAULT_HOURS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day, open: '08:00', close: '20:00', closed: false,
  }));
  const [businessHours, setBusinessHours] = useState(DEFAULT_HOURS);

  // Sync all fields when profile loads
  useEffect(() => {
    if (!profile) return;
    setTagline(profile.tagline ?? '');
    setAbout(profile.about ?? '');
    setContactEmail(profile.contactEmail ?? '');
    setContactPhone(profile.contactPhone ?? '');
    setAlternatePhone(profile.alternatePhone ?? '');
    setAddress(profile.address ?? '');
    setWebsiteUrl(profile.websiteUrl ?? '');
    setWhatsappNumber(profile.whatsappNumber ?? '');
    if (profile.businessHours) {
      try { setBusinessHours(JSON.parse(profile.businessHours)); } catch { /* keep defaults */ }
    }
  }, [profile]);

  // Per-item form state (not part of single-save)
  const [newSkill, setNewSkill] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [photoError, setPhotoError] = useState('');
  // Slot form state
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [slotStart, setSlotStart] = useState('09:00');
  const [slotEnd, setSlotEnd] = useState('10:00');
  const [slotDuration, setSlotDuration] = useState(60);
  const [slotMode, setSlotMode] = useState<'WEEKLY' | 'ONE_TIME' | 'DAILY_RANGE'>('WEEKLY');
  const [oneTimeDate, setOneTimeDate] = useState('');
  const [rangeStartDate, setRangeStartDate] = useState('');
  const [rangeEndDate, setRangeEndDate] = useState('');
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotError, setSlotError] = useState('');

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-8 h-8 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const totalBookings = (bookings as Booking[] | undefined)?.length ?? 0;
  const activeSlots = (slots as AvailabilitySlot[] | undefined)?.length ?? 0;
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({
      tagline,
      about,
      contactEmail,
      contactPhone,
      alternatePhone,
      address,
      websiteUrl,
      whatsappNumber,
      businessHours: JSON.stringify(businessHours),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill.mutate({ skillName: newSkill.trim() });
      setNewSkill('');
    }
  };

  const handleAddVideo = () => {
    if (videoUrl && videoTitle) {
      addVideo.mutate({ youtubeUrl: videoUrl, title: videoTitle });
      setVideoUrl('');
      setVideoTitle('');
    }
  };

  const toggleDay = (i: number) =>
    setSelectedDays((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const handleSaveSlots = async () => {
    setSlotSaving(true);
    setSlotError('');
    try {
      if (slotMode === 'WEEKLY') {
        if (selectedDays.size === 0) {
          setSlotError('Select at least one day.');
          setSlotSaving(false);
          return;
        }
        for (const day of Array.from(selectedDays).sort()) {
          await createSlot.mutateAsync({
            mode: 'WEEKLY',
            dayOfWeek: day,
            startTime: slotStart,
            endTime: slotEnd,
            slotDurationMins: slotDuration,
          });
        }
        setSelectedDays(new Set());
      } else if (slotMode === 'ONE_TIME') {
        if (!oneTimeDate) {
          setSlotError('Select a date/time');
          setSlotSaving(false);
          return;
        }
        const iso = new Date(oneTimeDate).toISOString();
        const startTime = formatLocalTime(oneTimeDate);
        const endTime = addMinutes(startTime, slotDuration);
        await createSlot.mutateAsync({
          mode: 'ONE_TIME',
          date: iso,
          startTime,
          endTime,
          slotDurationMins: slotDuration,
        });
        setOneTimeDate('');
      } else if (slotMode === 'DAILY_RANGE') {
        if (!rangeStartDate || !rangeEndDate) {
          setSlotError('Select start and end dates');
          setSlotSaving(false);
          return;
        }
        const startIso = new Date(rangeStartDate).toISOString();
        const endIso = new Date(rangeEndDate).toISOString();
        await createSlot.mutateAsync({
          mode: 'DAILY_RANGE',
          startDate: startIso,
          endDate: endIso,
          startTime: slotStart,
          endTime: slotEnd,
          slotDurationMins: slotDuration,
        });
        setRangeStartDate('');
        setRangeEndDate('');
      }
      setShowSlotForm(false);
      setSlotError('');
    } catch (err: unknown) {
      setSlotError(
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Failed to add slots.',
      );
    } finally {
      setSlotSaving(false);
    }
  };

  const canSaveSlots = () => {
    if (slotSaving) return false;
    if (slotMode === 'WEEKLY') return selectedDays.size > 0;
    if (slotMode === 'ONE_TIME') return !!oneTimeDate;
    if (slotMode === 'DAILY_RANGE')
      return !!rangeStartDate && !!rangeEndDate && slotStart < slotEnd;
    return false;
  };

  const TAB_LABELS: Record<'profile' | 'availability' | 'bookings', string> = {
    profile: t('guru.tabs.profile'),
    availability: t('guru.tabs.availability'),
    bookings: t('guru.tabs.bookings'),
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e0e0e0] mb-6">
          {/* Clickable banner */}
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className="relative w-full h-36 group focus:outline-none block overflow-hidden"
            title="Click to change cover photo"
          >
            {profile?.bannerUrl ? (
              <img
                src={profile.bannerUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#0d47a1] to-[#1a73e8]">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                  }}
                />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-white text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full">
                <ImageIcon className="w-4 h-4" /> Change cover photo
              </div>
            </div>
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              uploadBanner.mutate(file);
              e.target.value = '';
            }}
          />

          <div className="px-6 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              {/* Clickable avatar with camera overlay */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="relative group focus:outline-none"
                title="Change profile photo"
              >
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
                <span className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append('avatar', file);
                  try {
                    const res = await api.post('/users/me/avatar', fd);
                    updateUser({ avatarUrl: res.data.data.avatarUrl });
                    queryClient.invalidateQueries({ queryKey: ['gurus', 'me'] });
                  } catch {
                    // error surfaced by global handler
                  }
                  e.target.value = '';
                }}
              />
              <div className="mb-2 flex items-center gap-2">
                <StarRating value={profile?.ratingAvg ?? 0} readonly size="sm" />
                <span className="text-sm text-[#202124] font-medium">
                  {profile?.ratingAvg?.toFixed(1)}
                </span>
                <span className="text-sm text-[#9aa0a6]">({profile?.ratingCount} reviews)</span>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-[#202124]">{user?.name}</h1>
            {profile?.tagline && (
              <p className="text-sm text-[#5f6368] mt-1 italic">"{profile.tagline}"</p>
            )}
            <span className="mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#e6f4ea] text-[#1e8e3e] tracking-wide uppercase">
              {t('guru.badge')}
            </span>
          </div>

          <div className="border-t border-[#f1f3f4] grid grid-cols-3 divide-x divide-[#f1f3f4]">
            <div className="py-4 px-4 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#5f6368]" />
                <span className="text-xl font-bold text-[#202124]">{totalBookings}</span>
              </div>
              <span className="text-xs text-[#5f6368]">{t('guru.stats.totalBookings')}</span>
            </div>
            <div className="py-4 px-4 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#fbbc04] fill-[#fbbc04]" />
                <span className="text-xl font-bold text-[#fbbc04]">
                  {profile?.ratingAvg?.toFixed(1) ?? '—'}
                </span>
              </div>
              <span className="text-xs text-[#5f6368]">{t('guru.stats.avgRating')}</span>
            </div>
            <div className="py-4 px-4 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#1a73e8]" />
                <span className="text-xl font-bold text-[#1a73e8]">{activeSlots}</span>
              </div>
              <span className="text-xs text-[#5f6368]">{t('guru.stats.activeSlots')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-xl border border-b-0 border-[#e0e0e0] overflow-hidden">
          <div className="flex">
            {(['profile', 'availability', 'bookings'] as const).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  tab === tabKey
                    ? 'border-[#1a73e8] text-[#1a73e8]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                }`}
              >
                {TAB_LABELS[tabKey]}
                {tabKey === 'bookings' && totalBookings > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tab === tabKey ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}
                  >
                    {totalBookings}
                  </span>
                )}
                {tabKey === 'availability' && activeSlots > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tab === tabKey ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}
                  >
                    {activeSlots}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-b-xl border border-t border-t-[#e8eaed] border-[#e0e0e0] p-5">
          {/* Profile tab */}
          {tab === 'profile' && (
            <form onSubmit={handleSaveAll} className="space-y-5">
              {/* Tagline */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3">{t('guru.profile.tagline')}</h2>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={t('guru.profile.taglinePlaceholder')}
                  className="w-full border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
                />
              </section>

              {/* About / Bio */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3">About / Bio</h2>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Describe your background, expertise, founding story…"
                  rows={4}
                  className="w-full border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors resize-none"
                />
              </section>

              {/* Contact Info */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#1a73e8]" /> Contact Information
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#5f6368] flex-shrink-0" />
                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Contact email"
                      className="flex-1 border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#5f6368] flex-shrink-0" />
                    <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Primary phone (e.g. +91 9394804640)"
                      className="flex-1 border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#9aa0a6] flex-shrink-0" />
                    <input type="tel" value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)}
                      placeholder="Alternate phone (optional)"
                      className="flex-1 border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors" />
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#5f6368] flex-shrink-0 mt-2" />
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address" rows={2}
                      className="flex-1 border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors resize-none" />
                  </div>
                </div>
              </section>

              {/* Website & Social */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1a73e8]" /> Website & Social
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#5f6368] flex-shrink-0" />
                    <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="flex-1 border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25d366] flex-shrink-0" />
                    <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="WhatsApp number (e.g. +91 9394804640)"
                      className="flex-1 border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors" />
                  </div>
                </div>
              </section>

              {/* Business Hours */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1a73e8]" /> Business Hours
                </h2>
                <div className="space-y-2">
                  {businessHours.map((row, i) => (
                    <div key={row.day} className="flex items-center gap-3">
                      <span className="w-8 text-xs font-semibold text-[#5f6368]">{row.day}</span>
                      <label className="flex items-center gap-1.5 text-xs text-[#5f6368] cursor-pointer select-none">
                        <input type="checkbox" checked={!row.closed}
                          onChange={(e) => { const n = [...businessHours]; n[i] = { ...n[i], closed: !e.target.checked }; setBusinessHours(n); }}
                          className="rounded" />
                        Open
                      </label>
                      {!row.closed ? (
                        <>
                          <input type="time" value={row.open}
                            onChange={(e) => { const n = [...businessHours]; n[i] = { ...n[i], open: e.target.value }; setBusinessHours(n); }}
                            className="border border-[#dadce0] rounded px-2 py-1 text-xs outline-none focus:border-[#1a73e8]" />
                          <span className="text-xs text-[#9aa0a6]">to</span>
                          <input type="time" value={row.close}
                            onChange={(e) => { const n = [...businessHours]; n[i] = { ...n[i], close: e.target.value }; setBusinessHours(n); }}
                            className="border border-[#dadce0] rounded px-2 py-1 text-xs outline-none focus:border-[#1a73e8]" />
                        </>
                      ) : (
                        <span className="text-xs text-[#9aa0a6] italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Services — with image upload per card */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-1">Services</h2>
                <p className="text-xs text-[#5f6368] mb-3">These appear as service cards on your public profile. Add an image to each service.</p>
                {profile?.skills?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {profile.skills.map((s: { id: string; skillName: string; imageUrl: string | null }) => (
                      <div key={s.id} className="relative border border-[#e8eaed] rounded-xl overflow-hidden group">
                        {/* Service image or placeholder */}
                        <div className="aspect-square bg-[#f8f9fa] relative">
                          {s.imageUrl ? (
                            <img src={s.imageUrl} alt={s.skillName} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#dadce0]">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                          {/* Camera overlay to upload image */}
                          <label
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Upload service image"
                          >
                            <Camera className="w-6 h-6 text-white" />
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadSkillImage.mutate({ skillId: s.id, file });
                                e.target.value = '';
                              }} />
                          </label>
                        </div>
                        {/* Name + delete */}
                        <div className="px-2 py-2 flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-[#202124] truncate">{s.skillName}</span>
                          <button type="button" onClick={() => deleteSkill.mutate(s.id)}
                            className="flex-shrink-0 text-[#9aa0a6] hover:text-[#d93025] transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!profile?.skills?.length && (
                  <p className="text-xs text-[#9aa0a6] mb-3">No services added yet.</p>
                )}
                <div className="flex gap-2">
                  <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. Ayurvedic Consultation, Yoga…"
                    className="flex-1 border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors" />
                  <button type="button" onClick={handleAddSkill}
                    className="flex items-center gap-1 px-4 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </section>

              {/* Videos */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3">{t('guru.profile.videos')}</h2>
                <div className="space-y-2 mb-4">
                  {profile?.videos?.map((v: { id: string; youtubeUrl: string; title: string }) => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]">
                      <div className="flex items-center gap-2 min-w-0">
                        <Video className="w-4 h-4 text-[#ea4335] flex-shrink-0" />
                        <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1a73e8] hover:underline truncate">{v.title}</a>
                      </div>
                      <button type="button" onClick={() => deleteVideo.mutate(v.id)} className="text-[#5f6368] hover:text-[#d93025] transition-colors ml-2 flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {!profile?.videos?.length && <p className="text-xs text-[#9aa0a6]">{t('guru.profile.noVideos')}</p>}
                </div>
                <div className="space-y-2">
                  <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={t('guru.profile.videoUrlPlaceholder')}
                    className="w-full border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors" />
                  <input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder={t('guru.profile.videoTitlePlaceholder')}
                    className="w-full border border-[#dadce0] rounded-lg px-3 py-2 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors" />
                  <button type="button" onClick={handleAddVideo}
                    className="flex items-center gap-1 px-4 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> {t('guru.profile.addVideo')}
                  </button>
                </div>
              </section>

              {/* Photos */}
              <section className="border border-[#e8eaed] rounded-xl p-5 hover:border-[#dadce0] transition-colors">
                <h2 className="text-sm font-semibold text-[#202124] mb-3">{t('guru.profile.photos')}</h2>
                {profile?.photos?.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                    {profile.photos.map((p: { id: string; url: string }) => (
                      <div key={p.id} className="relative group">
                        <img src={p.url} alt="" className="w-full aspect-square object-cover rounded-lg" loading="lazy" />
                        <button type="button" onClick={() => deletePhoto.mutate(p.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#d93025]" title="Delete photo">
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" id="photo-upload"
                    className="text-sm text-[#5f6368] file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border file:border-[#dadce0] file:text-sm file:font-medium file:text-[#1a73e8] file:bg-white hover:file:bg-[#e8f0fe] file:transition-colors"
                    onChange={async (e) => {
                      setPhotoError('');
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append('photo', file);
                      try {
                        await api.post('/gurus/me/photos', fd);
                        e.target.value = '';
                        queryClient.invalidateQueries({ queryKey: ['gurus', 'me'] });
                      } catch (err: unknown) {
                        setPhotoError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Upload failed');
                      }
                    }} />
                </div>
                {photoError && <p className="text-xs text-[#d93025] mt-2">{photoError}</p>}
              </section>

              {/* ── Single Save Button ── */}
              <div className="sticky bottom-4 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold shadow-lg transition-all ${
                    saveSuccess
                      ? 'bg-[#1e8e3e] text-white'
                      : 'bg-[#1a73e8] text-white hover:bg-[#1557b0] disabled:opacity-60'
                  }`}
                >
                  {saveSuccess ? (
                    <><CheckCircle className="w-4 h-4" /> Saved!</>
                  ) : updateProfile.isPending ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Profile</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Availability tab */}
          {tab === 'availability' &&
            (() => {
              const allSlots = (slots as AvailabilitySlot[]) ?? [];
              const weeklySlots = allSlots.filter(
                (s) => s.dayOfWeek !== null && s.dayOfWeek !== undefined,
              );
              const oneTimeSlots = allSlots.filter((s) => s.date && s.dayOfWeek == null);
              const dailyRangeSlots = allSlots.filter(
                (s) => s.startDate && s.endDate && s.dayOfWeek == null,
              );
              const slotsByDay = Array.from({ length: 7 }, (_, i) =>
                weeklySlots.filter((s) => s.dayOfWeek === i),
              );
              const startLabel =
                TIME_OPTIONS.find((o) => o.value === slotStart)?.label ?? slotStart;
              const endLabel = TIME_OPTIONS.find((o) => o.value === slotEnd)?.label ?? slotEnd;
              const summaryDays = Array.from(selectedDays)
                .sort()
                .map((d) => DAY_FULL[d])
                .join(', ');
              return (
                <div className="space-y-5">
                  {/* Info banner */}
                  <div className="bg-[#e8f0fe] rounded-xl p-4 border border-[#c5d8fd]">
                    <p className="font-semibold text-[#1a73e8] text-sm mb-1">
                      How your availability works
                    </p>
                    <p className="text-xs text-[#3c4043] leading-relaxed">
                      Set the recurring weekly windows when students can book one-time appointments
                      with you. Students pick any upcoming date that falls on your available days.
                      For daily subscriptions, students book directly from your profile — no slot
                      needed.
                    </p>
                  </div>

                  {/* ── Weekly schedule grid ── */}
                  <section className="border border-[#e8eaed] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8eaed] bg-[#f8f9fa]">
                      <h2 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#1a73e8]" /> Weekly schedule
                      </h2>
                      {!showSlotForm && (
                        <button
                          onClick={() => {
                            setShowSlotForm(true);
                            setSlotError('');
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#1a73e8] hover:bg-[#e8f0fe] px-3 py-1.5 rounded-full transition-colors border border-[#c5d8fd]"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add time slot
                        </button>
                      )}
                    </div>

                    {/* 7-column day grid */}
                    <div
                      className="grid grid-cols-7 divide-x divide-[#f1f3f4]"
                      style={{ minHeight: 120 }}
                    >
                      {DAY_PILLS.map((abbr, i) => {
                        const daySlots = slotsByDay[i];
                        return (
                          <div key={i} className="p-2 flex flex-col items-center">
                            <p
                              className={`text-[11px] font-bold mb-2 ${daySlots.length ? 'text-[#1a73e8]' : 'text-[#9aa0a6]'}`}
                            >
                              {abbr}
                            </p>
                            {daySlots.length === 0 ? (
                              <p className="text-[10px] text-[#e8eaed] mt-3">—</p>
                            ) : (
                              daySlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="w-full mb-1.5 bg-[#e8f0fe] rounded-lg p-1.5 relative group text-center"
                                >
                                  <p className="text-[10px] font-semibold text-[#1a73e8] leading-tight">
                                    {slot.startTime}
                                  </p>
                                  <p className="text-[10px] text-[#1a73e8] leading-tight">
                                    {slot.endTime}
                                  </p>
                                  <p className="text-[9px] text-[#5f6368] mt-0.5">
                                    {DURATIONS.find((d) => d.mins === slot.slotDurationMins)
                                      ?.label ?? `${slot.slotDurationMins}m`}
                                  </p>
                                  <button
                                    onClick={() => deleteSlot.mutate(slot.id)}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-[#e8eaed] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fce8e6] hover:border-[#f5c6c2]"
                                  >
                                    <X className="w-2.5 h-2.5 text-[#d93025]" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {allSlots.length === 0 && (
                      <div className="text-center py-6 border-t border-[#f1f3f4]">
                        <p className="text-xs text-[#9aa0a6]">
                          No availability set. Add a time slot to get started.
                        </p>
                      </div>
                    )}

                    {(oneTimeSlots.length > 0 || dailyRangeSlots.length > 0) && (
                      <div className="border-t border-[#f1f3f4] py-4 px-4">
                        <h3 className="text-sm font-semibold text-[#202124] mb-3">
                          Other availability
                        </h3>
                        <div className="space-y-3">
                          {oneTimeSlots.map((slot) => {
                            const start = slot.startTime ?? formatLocalTime(slot.date!);
                            const end = slot.endTime ?? addMinutes(start, slot.slotDurationMins);
                            return (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between gap-3 bg-[#f8f9fa] rounded-lg p-3 border border-[#e8eaed]"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-[#202124]">
                                    One-time slot
                                  </p>
                                  <p className="text-xs text-[#5f6368]">
                                    {new Date(slot.date!).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right text-xs text-[#5f6368]">
                                  <div>
                                    {start} – {end}
                                  </div>
                                  <div>
                                    {DURATIONS.find((d) => d.mins === slot.slotDurationMins)
                                      ?.label ?? `${slot.slotDurationMins}m`}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {dailyRangeSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between gap-3 bg-[#f8f9fa] rounded-lg p-3 border border-[#e8eaed]"
                            >
                              <div>
                                <p className="text-sm font-semibold text-[#202124]">Daily range</p>
                                <p className="text-xs text-[#5f6368]">
                                  {new Date(slot.startDate!).toLocaleDateString()} →{' '}
                                  {new Date(slot.endDate!).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right text-xs text-[#5f6368]">
                                <div>
                                  {slot.startTime} – {slot.endTime}
                                </div>
                                <div>
                                  {DURATIONS.find((d) => d.mins === slot.slotDurationMins)?.label ??
                                    `${slot.slotDurationMins}m`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* ── Outlook-style "Add time slot" panel ── */}
                  {showSlotForm && (
                    <section className="border-2 border-[#1a73e8] rounded-xl overflow-hidden shadow-sm">
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-3 bg-[#e8f0fe] border-b border-[#c5d8fd]">
                        <h2 className="text-sm font-semibold text-[#1a73e8] flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" /> New recurring availability
                        </h2>
                        <button
                          onClick={() => {
                            setShowSlotForm(false);
                            setSelectedDays(new Set());
                            setOneTimeDate('');
                            setRangeStartDate('');
                            setSlotError('');
                          }}
                          className="p-1 rounded-full hover:bg-white/60 transition-colors"
                        >
                          <X className="w-4 h-4 text-[#1a73e8]" />
                        </button>
                      </div>

                      <div className="p-5 space-y-5">
                        {/* Recurrence pattern label */}
                        <div className="flex items-center gap-2 py-2 px-3 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]">
                          <RefreshCw className="w-3.5 h-3.5 text-[#5f6368]" />
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-[#5f6368] mr-2">Recurrence type</label>
                            <select
                              value={slotMode}
                              onChange={(e) => setSlotMode(e.target.value as any)}
                              className="border border-[#dadce0] rounded px-2 py-1 text-sm"
                            >
                              <option value="WEEKLY">Weekly (recurring weekly)</option>
                              <option value="ONE_TIME">One-time (specific date/time)</option>
                              <option value="DAILY_RANGE">
                                Daily range (every day between dates)
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* Day pills — "Repeat on" */}
                        {slotMode === 'WEEKLY' && (
                          <div>
                            <p className="text-xs font-semibold text-[#5f6368] uppercase tracking-wide mb-2">
                              Repeat on
                            </p>
                            <div className="flex gap-2">
                              {DAY_PILLS.map((abbr, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => toggleDay(i)}
                                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                                    selectedDays.has(i)
                                      ? 'bg-[#1a73e8] text-white shadow-sm ring-2 ring-[#1a73e8]/20'
                                      : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]'
                                  }`}
                                >
                                  {abbr}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {slotMode === 'ONE_TIME' && (
                          <div>
                            <p className="text-xs font-semibold text-[#5f6368] uppercase tracking-wide mb-2">
                              One-time date & time
                            </p>
                            <input
                              type="datetime-local"
                              value={oneTimeDate}
                              onChange={(e) => setOneTimeDate(e.target.value)}
                              className="w-full border border-[#dadce0] rounded-lg px-3 py-2 text-sm outline-none"
                            />
                          </div>
                        )}

                        {slotMode === 'DAILY_RANGE' && (
                          <div>
                            <p className="text-xs font-semibold text-[#5f6368] uppercase tracking-wide mb-2">
                              Range (start & end dates)
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="date"
                                value={rangeStartDate}
                                onChange={(e) => setRangeStartDate(e.target.value)}
                                className="border border-[#dadce0] rounded-lg px-3 py-2 text-sm"
                              />
                              <input
                                type="date"
                                value={rangeEndDate}
                                onChange={(e) => setRangeEndDate(e.target.value)}
                                className="border border-[#dadce0] rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                        )}

                        {/* Start / End time — side by side like Outlook */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#5f6368] uppercase tracking-wide mb-1.5">
                              Start time
                            </label>
                            <select
                              value={slotStart}
                              onChange={(e) => {
                                setSlotStart(e.target.value);
                                if (e.target.value >= slotEnd)
                                  setSlotEnd(
                                    TIME_OPTIONS.find((o) => o.value > e.target.value)?.value ??
                                      '23:30',
                                  );
                              }}
                              className="w-full border border-[#dadce0] rounded-lg px-3 py-2.5 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white transition-colors"
                            >
                              {TIME_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#5f6368] uppercase tracking-wide mb-1.5">
                              End time
                            </label>
                            <select
                              value={slotEnd}
                              onChange={(e) => setSlotEnd(e.target.value)}
                              className="w-full border border-[#dadce0] rounded-lg px-3 py-2.5 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white transition-colors"
                            >
                              {TIME_OPTIONS.filter((o) => o.value > slotStart).map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Session duration */}
                        <div>
                          <p className="text-xs font-semibold text-[#5f6368] uppercase tracking-wide mb-2">
                            Session duration
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {DURATIONS.map((d) => (
                              <button
                                key={d.mins}
                                type="button"
                                onClick={() => setSlotDuration(d.mins)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                  slotDuration === d.mins
                                    ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]'
                                    : 'border-[#dadce0] text-[#5f6368] hover:border-[#aaa]'
                                }`}
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Live summary */}
                        {selectedDays.size > 0 && (
                          <div className="px-4 py-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-sm text-[#166534]">
                            <p className="font-medium mb-0.5">Summary</p>
                            <p className="text-xs">
                              Every <strong>{summaryDays}</strong> · {startLabel} – {endLabel} ·{' '}
                              {DURATIONS.find((d) => d.mins === slotDuration)?.label}
                            </p>
                            <p className="text-xs mt-1 text-[#14532d]">
                              Creates {selectedDays.size} availability block
                              {selectedDays.size !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}

                        {slotError && (
                          <p className="text-xs text-[#d93025] bg-[#fce8e6] px-3 py-2 rounded-lg border border-[#f5c6c2]">
                            {slotError}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e8eaed]">
                          <button
                            type="button"
                            onClick={() => {
                              setShowSlotForm(false);
                              setSelectedDays(new Set());
                              setOneTimeDate('');
                              setRangeStartDate('');
                              setSlotError('');
                            }}
                            className="px-5 py-2 rounded-full text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveSlots}
                            disabled={!canSaveSlots()}
                            className="px-6 py-2 rounded-full text-sm font-medium bg-[#1a73e8] text-white hover:bg-[#1557b0] disabled:opacity-60 transition-colors shadow-sm"
                          >
                            {slotSaving ? 'Saving…' : 'Save availability'}
                          </button>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              );
            })()}

          {/* Bookings tab */}
          {tab === 'bookings' && (
            <div>
              {!bookings?.length ? (
                <div className="text-center py-16 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#e8f0fe] flex items-center justify-center">
                    <Users className="w-8 h-8 text-[#1a73e8]" />
                  </div>
                  <p className="text-[#202124] font-medium">{t('guru.bookings.emptyTitle')}</p>
                  <p className="text-sm text-[#5f6368]">{t('guru.bookings.emptySubtitle')}</p>
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
                          <img
                            src={b.student.avatarUrl}
                            alt={b.student.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            loading="lazy"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e8e3e] to-[#34a853] flex items-center justify-center text-white font-medium text-sm select-none flex-shrink-0">
                            {b.student?.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#202124]">{b.student?.name}</p>
                          <p className="text-xs text-[#5f6368] mt-0.5">
                            {formatDateTime(b.scheduledAt, i18n.language)} ·{' '}
                            <span className="uppercase tracking-wide text-[#9aa0a6]">{b.type}</span>
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_CHIP[b.status]}`}
                      >
                        {t(`status.${b.status}`)}
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
