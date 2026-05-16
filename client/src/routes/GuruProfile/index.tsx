import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGuruDetail, useGuruSlots, useSubmitInquiry } from '@/hooks/useGurus';
import { useGuruRatings } from '@/hooks/useRatings';
import { useGuruProducts } from '@/hooks/useProducts';
import { useAddFavorite, useRemoveFavorite, useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/rating/StarRating';
import {
  Heart,
  Video,
  Calendar,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
  Clock,
  Leaf,
  Zap,
  BookOpen,
  Sparkles,
  Brain,
  Wind,
  Flower2,
  Sun,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { BookingModal } from '@/components/booking/BookingModal';
import { ProductCard } from '@/components/product/ProductCard';
import { useState, useRef } from 'react';
import { QRCode } from 'react-qr-code';
import type { AvailabilitySlot } from '@guruapp/shared';
import type { Product } from '@guruapp/shared';
import { useTranslation } from 'react-i18next';

const SKILL_ICONS = [Leaf, Zap, BookOpen, Sparkles, Brain, Wind, Flower2, Sun];
const SKILL_COLORS = [
  { bg: 'bg-[#e6f4ea]', text: 'text-[#1e8e3e]', ring: 'ring-[#1e8e3e]/20' },
  { bg: 'bg-[#fff8e1]', text: 'text-[#f09300]', ring: 'ring-[#f09300]/20' },
  { bg: 'bg-[#e8f0fe]', text: 'text-[#1a73e8]', ring: 'ring-[#1a73e8]/20' },
  { bg: 'bg-[#fce8e6]', text: 'text-[#d93025]', ring: 'ring-[#d93025]/20' },
  { bg: 'bg-[#f3e8fd]', text: 'text-[#7c3aed]', ring: 'ring-[#7c3aed]/20' },
  { bg: 'bg-[#e0f7fa]', text: 'text-[#00838f]', ring: 'ring-[#00838f]/20' },
  { bg: 'bg-[#fdf3e7]', text: 'text-[#e65100]', ring: 'ring-[#e65100]/20' },
  { bg: 'bg-[#e8eaf6]', text: 'text-[#3949ab]', ring: 'ring-[#3949ab]/20' },
];

const DAY_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  };
  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#e0e0e0] shadow-sm flex items-center justify-center hover:bg-[#f8f9fa] transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-[#5f6368]" />
      </button>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#e0e0e0] shadow-sm flex items-center justify-center hover:bg-[#f8f9fa] transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-[#5f6368]" />
      </button>
    </div>
  );
}

export default function GuruProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: guru, isLoading } = useGuruDetail(id!);
  const { data: slots } = useGuruSlots(id!);
  const { data: ratingsData } = useGuruRatings(id!);
  const { data: productsData } = useGuruProducts(id!);
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const submitInquiry = useSubmitInquiry(id!);
  const { user } = useAuth();

  const [bookingSlot, setBookingSlot] = useState<AvailabilitySlot | null>(null);
  const [showSubscribe, setShowSubscribe] = useState(false);

  // Enquiry form state
  const [inqName, setInqName] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqMessage, setInqMessage] = useState('');
  const [inqSent, setInqSent] = useState(false);

  const isFavorited = favorites?.some((f: { userId: string }) => f.userId === id);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!guru)
    return <div className="text-center py-20 text-[#5f6368]">{t('guruProfile.notFound')}</div>;

  const toggleFavorite = () => {
    if (isFavorited) removeFavorite.mutate(id!);
    else addFavorite.mutate(id!);
  };

  const initial = guru.user?.name?.[0]?.toUpperCase() ?? '?';
  const todayAbbr = DAY_MAP[new Date().getDay()];
  const profileUrl = `${window.location.origin}/guru/${id}`;

  let businessHours: { day: string; open: string; close: string; closed: boolean }[] = [];
  if (guru.businessHours) {
    try { businessHours = JSON.parse(guru.businessHours); } catch { /* ignore */ }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitInquiry.mutateAsync({
      name: inqName,
      email: inqEmail,
      phone: inqPhone || undefined,
      message: inqMessage,
    });
    setInqSent(true);
    setInqName(''); setInqEmail(''); setInqPhone(''); setInqMessage('');
  };

  return (
    <div className="bg-[#f4f5f7] min-h-screen">
      <div className="max-w-lg mx-auto">

        {/* ── 1. BANNER + AVATAR ── */}
        <div className="relative">
          {/* Banner */}
          <div className="h-48 w-full overflow-hidden">
            {guru.bannerUrl ? (
              <img src={guru.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0d47a1] via-[#1a73e8] to-[#26a69a]">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>
            )}
          </div>

          {/* Back + Save buttons overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {user && (
              <button
                onClick={toggleFavorite}
                className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
                  isFavorited ? 'bg-[#ea4335]/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                }`}
              >
                <Heart className={isFavorited ? 'w-4 h-4 fill-white' : 'w-4 h-4'} />
              </button>
            )}
          </div>

          {/* Avatar overlapping banner */}
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
            {guru.user?.avatarUrl ? (
              <img
                src={guru.user.avatarUrl}
                alt={guru.user?.name}
                className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl"
                loading="lazy"
                width={112}
                height={112}
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0d47a1] to-[#1a73e8] border-4 border-white flex items-center justify-center text-white text-4xl font-bold shadow-xl select-none">
                {initial}
              </div>
            )}
          </div>
        </div>

        {/* ── 2. NAME + BIO + CONTACT ── */}
        <div className="bg-white pt-16 pb-6 px-5 text-center border-b border-[#e8eaed]">
          <h1 className="text-2xl font-bold text-[#202124]">{guru.user?.name}</h1>
          {guru.tagline && (
            <p className="text-sm text-[#5f6368] mt-1 italic">"{guru.tagline}"</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-2">
            <StarRating value={guru.ratingAvg} readonly size="sm" />
            <span className="text-sm text-[#5f6368]">
              {guru.ratingAvg.toFixed(1)} ({guru.ratingCount} reviews)
            </span>
          </div>

          {/* Bio */}
          {(guru.about || guru.user?.bio) && (
            <p className="text-sm text-[#3c4043] mt-4 leading-relaxed text-left">
              {guru.about || guru.user?.bio}
            </p>
          )}

          {/* Contact info */}
          {(guru.contactEmail || guru.contactPhone || guru.alternatePhone || guru.address) && (
            <div className="mt-5 space-y-2.5 text-left">
              {guru.contactEmail && (
                <a href={`mailto:${guru.contactEmail}`} className="flex items-center gap-3 text-sm text-[#3c4043] hover:text-[#1a73e8]">
                  <span className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#1a73e8]" />
                  </span>
                  {guru.contactEmail}
                </a>
              )}
              {guru.contactPhone && (
                <a href={`tel:${guru.contactPhone}`} className="flex items-center gap-3 text-sm text-[#3c4043] hover:text-[#1a73e8]">
                  <span className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#1a73e8]" />
                  </span>
                  {guru.contactPhone}
                </a>
              )}
              {guru.alternatePhone && (
                <a href={`tel:${guru.alternatePhone}`} className="flex items-center gap-3 text-sm text-[#3c4043] hover:text-[#1a73e8]">
                  <span className="w-8 h-8 rounded-full bg-[#f1f3f4] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#5f6368]" />
                  </span>
                  {guru.alternatePhone}
                </a>
              )}
              {guru.address && (
                <div className="flex items-start gap-3 text-sm text-[#3c4043]">
                  <span className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#1a73e8]" />
                  </span>
                  <span className="leading-relaxed">{guru.address}</span>
                </div>
              )}
              {guru.websiteUrl && (
                <a href={guru.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-[#1a73e8] hover:underline">
                  <span className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-[#1a73e8]" />
                  </span>
                  {guru.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          )}

          {/* WhatsApp CTA */}
          {guru.whatsappNumber && (
            <a
              href={`https://wa.me/${guru.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full py-3 bg-[#25d366] text-white font-semibold rounded-xl hover:bg-[#1ebe5d] transition-colors shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          )}
        </div>

        {/* ── 3. QR CODE ── */}
        <div className="bg-white mt-3 px-5 py-6 flex flex-col items-center gap-3 border-b border-[#e8eaed]">
          <p className="text-sm font-semibold text-[#202124]">Share this profile</p>
          <div className="p-3 bg-white border border-[#e0e0e0] rounded-xl shadow-sm">
            <QRCode value={profileUrl} size={140} />
          </div>
          <p className="text-xs text-[#9aa0a6] text-center">Scan to open this profile</p>
        </div>

        {/* ── 4. SERVICES (horizontal scroll) ── */}
        {guru.skills.length > 0 && (
          <div className="bg-white mt-3 px-5 py-5 border-b border-[#e8eaed]">
            <h2 className="text-base font-bold text-[#202124] mb-4">Our Services</h2>
            <HorizontalScroll>
              {guru.skills.map((s: { id: string; skillName: string }, i: number) => {
                const Icon = SKILL_ICONS[i % SKILL_ICONS.length];
                const col = SKILL_COLORS[i % SKILL_COLORS.length];
                return (
                  <div
                    key={s.id}
                    className="flex-shrink-0 w-32 flex flex-col items-center gap-2 p-4 rounded-xl border border-[#e8eaed] hover:shadow-md transition-shadow text-center cursor-default"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-4 ${col.bg} ${col.text} ${col.ring}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-[#202124] leading-tight">{s.skillName}</span>
                  </div>
                );
              })}
            </HorizontalScroll>
          </div>
        )}

        {/* ── 5. GALLERY (horizontal scroll) ── */}
        {guru.photos.length > 0 && (
          <div className="bg-white mt-3 px-5 py-5 border-b border-[#e8eaed]">
            <h2 className="text-base font-bold text-[#202124] mb-4">Gallery</h2>
            <HorizontalScroll>
              {guru.photos.map((p: { id: string; url: string; caption: string | null }) => (
                <img
                  key={p.id}
                  src={p.url}
                  alt={p.caption ?? ''}
                  className="flex-shrink-0 w-48 h-48 object-cover rounded-xl border border-[#e0e0e0]"
                  loading="lazy"
                />
              ))}
            </HorizontalScroll>
          </div>
        )}

        {/* ── 6. PRODUCTS ── */}
        {productsData?.data?.length > 0 && (
          <div className="bg-white mt-3 px-5 py-5 border-b border-[#e8eaed]">
            <h2 className="text-base font-bold text-[#202124] mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#1a73e8]" /> Products
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(productsData.data as Product[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* ── 7. TESTIMONIALS (horizontal scroll) ── */}
        {ratingsData?.data?.length > 0 && (
          <div className="bg-white mt-3 px-5 py-5 border-b border-[#e8eaed]">
            <h2 className="text-base font-bold text-[#202124] mb-4">What Students Say</h2>
            <HorizontalScroll>
              {ratingsData.data.map(
                (r: {
                  id: string;
                  stars: number;
                  comment: string | null;
                  createdAt: string;
                  student?: { name: string };
                }) => (
                  <div
                    key={r.id}
                    className="flex-shrink-0 w-64 p-4 rounded-xl border border-[#e8eaed] bg-[#f8f9fa] flex flex-col gap-2"
                  >
                    <StarRating value={r.stars} readonly size="sm" />
                    {r.comment && (
                      <p className="text-sm text-[#3c4043] leading-relaxed line-clamp-4">
                        "{r.comment}"
                      </p>
                    )}
                    <div className="mt-auto">
                      <p className="text-xs font-semibold text-[#202124]">
                        — {r.student?.name ?? 'Anonymous'}
                      </p>
                      <p className="text-xs text-[#9aa0a6]">{formatDate(r.createdAt, i18n.language)}</p>
                    </div>
                  </div>
                ),
              )}
            </HorizontalScroll>
          </div>
        )}

        {/* ── 8. VIDEOS ── */}
        {guru.videos.length > 0 && (
          <div className="bg-white mt-3 px-5 py-5 border-b border-[#e8eaed]">
            <h2 className="text-base font-bold text-[#202124] mb-4">Videos</h2>
            <div className="space-y-2">
              {guru.videos.map(
                (v: { id: string; youtubeUrl: string; title: string; thumbnailUrl: string | null }) => (
                  <a
                    key={v.id}
                    href={v.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 items-center p-3 rounded-xl border border-[#e0e0e0] hover:bg-[#f8f9fa] transition-colors"
                  >
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt={v.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" loading="lazy" width={80} height={56} />
                    ) : (
                      <div className="w-20 h-14 bg-[#f1f3f4] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video className="w-6 h-6 text-[#ea4335]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#202124] font-medium line-clamp-2">{v.title}</p>
                      <span className="text-xs text-[#ea4335] font-medium mt-1 inline-block">▶ YouTube</span>
                    </div>
                  </a>
                ),
              )}
            </div>
          </div>
        )}

        {/* ── 9. BUSINESS HOURS ── */}
        {businessHours.length > 0 && (
          <div className="bg-white mt-3 px-5 py-5 border-b border-[#e8eaed]">
            <h2 className="text-base font-bold text-[#202124] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1a73e8]" /> Working Hours
            </h2>
            <div className="space-y-1">
              {businessHours.map((row) => {
                const isToday = row.day === todayAbbr;
                return (
                  <div
                    key={row.day}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${isToday ? 'bg-[#e8f0fe]' : 'hover:bg-[#f8f9fa]'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold w-8 ${isToday ? 'text-[#1a73e8]' : 'text-[#202124]'}`}>{row.day}</span>
                      {isToday && (
                        <span className="text-[10px] bg-[#1a73e8] text-white px-1.5 py-0.5 rounded-full font-semibold">Today</span>
                      )}
                    </div>
                    {row.closed ? (
                      <span className="text-xs text-[#9aa0a6] italic">Closed</span>
                    ) : (
                      <span className={`text-sm ${isToday ? 'text-[#1a73e8] font-semibold' : 'text-[#3c4043]'}`}>
                        {row.open} – {row.close}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 10. BOOK APPOINTMENT ── */}
        <div className="bg-white mt-3 px-5 py-5 border-b border-[#e8eaed]">
          <h2 className="text-base font-bold text-[#202124] mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1a73e8]" /> Book an Appointment
          </h2>

          {/* Subscription option */}
          <div className="mb-3 p-4 rounded-xl bg-gradient-to-r from-[#e8f0fe] to-[#e8f4fd] border border-[#c5d8fd]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#1a73e8] flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#1a73e8]">Recurring Sessions</p>
                  <p className="text-xs text-[#3c4043]">Subscribe for daily access</p>
                </div>
              </div>
              {user ? (
                <button
                  onClick={() => setShowSubscribe(true)}
                  className="text-xs bg-[#1a73e8] text-white px-4 py-2 rounded-full hover:bg-[#1557b0] transition-colors font-semibold flex-shrink-0 shadow-sm"
                >
                  Subscribe
                </button>
              ) : (
                <Link to="/login" className="text-xs bg-[#1a73e8] text-white px-4 py-2 rounded-full hover:bg-[#1557b0] transition-colors font-semibold flex-shrink-0">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {!slots || slots.length === 0 ? (
            <p className="text-xs text-[#9aa0a6] text-center py-3">No time slots available yet.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#5f6368] uppercase tracking-wide">Available slots</p>
              {slots.map((slot: AvailabilitySlot) => (
                <div key={slot.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9fa] border border-[#e8eaed]">
                  <div>
                    <p className="text-sm font-semibold text-[#202124]">
                      Every {t(`days.${slot.dayOfWeek}`)}
                    </p>
                    <p className="text-xs text-[#5f6368]">
                      {slot.startTime} – {slot.endTime} ·{' '}
                      {slot.slotDurationMins < 60
                        ? `${slot.slotDurationMins} min`
                        : `${slot.slotDurationMins / 60}h${slot.slotDurationMins % 60 ? ` ${slot.slotDurationMins % 60}m` : ''}`}
                    </p>
                  </div>
                  {user ? (
                    <button
                      onClick={() => setBookingSlot(slot)}
                      className="text-xs bg-[#1a73e8] text-white px-4 py-2 rounded-full hover:bg-[#1557b0] transition-colors font-semibold shadow-sm"
                    >
                      Book
                    </button>
                  ) : (
                    <Link to="/login" className="text-xs bg-[#1a73e8] text-white px-4 py-2 rounded-full hover:bg-[#1557b0] transition-colors font-semibold">
                      Sign in
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 11. ENQUIRY FORM ── */}
        <div className="bg-white mt-3 px-5 py-5 mb-3 rounded-b-none">
          <h2 className="text-base font-bold text-[#202124] mb-1">Send an Enquiry</h2>
          <p className="text-xs text-[#5f6368] mb-4">Fill in the form below and your message will be sent directly to {guru.user?.name}.</p>

          {inqSent ? (
            <div className="text-center py-8 px-4">
              <div className="w-14 h-14 bg-[#e6f4ea] rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-[#1e8e3e]" />
              </div>
              <p className="text-base font-semibold text-[#202124]">Message sent!</p>
              <p className="text-sm text-[#5f6368] mt-1">We'll get back to you shortly.</p>
              <button
                onClick={() => setInqSent(false)}
                className="mt-4 text-sm text-[#1a73e8] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5f6368] mb-1">Your Name *</label>
                <input
                  required
                  value={inqName}
                  onChange={(e) => setInqName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5f6368] mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  value={inqEmail}
                  onChange={(e) => setInqEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5f6368] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={inqPhone}
                  onChange={(e) => setInqPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5f6368] mb-1">Message *</label>
                <textarea
                  required
                  value={inqMessage}
                  onChange={(e) => setInqMessage(e.target.value)}
                  placeholder="Write your message here…"
                  rows={4}
                  className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitInquiry.isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1a73e8] text-white font-semibold rounded-xl hover:bg-[#1557b0] disabled:opacity-60 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                {submitInquiry.isPending ? 'Sending…' : 'Send Message'}
              </button>
              {submitInquiry.isError && (
                <p className="text-xs text-[#d93025] text-center">Failed to send. Please try again.</p>
              )}
            </form>
          )}
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
