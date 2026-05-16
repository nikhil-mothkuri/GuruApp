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

/** Horizontal scroll on mobile, hidden on md+ (pair with a grid sibling) */
function MobileScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') =>
    ref.current?.scrollBy({ left: dir === 'right' ? 260 : -260, behavior: 'smooth' });
  return (
    <div className="relative md:hidden">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#e0e0e0] shadow flex items-center justify-center"
      >
        <ChevronLeft className="w-4 h-4 text-[#5f6368]" />
      </button>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#e0e0e0] shadow flex items-center justify-center"
      >
        <ChevronRight className="w-4 h-4 text-[#5f6368]" />
      </button>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-[#e0e0e0] p-5 shadow-sm">
      <h2 className="text-base font-bold text-[#202124] mb-4 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#1a73e8]" />}
        {title}
      </h2>
      {children}
    </section>
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

  // ── Reusable sidebar sections (rendered in sidebar on lg+, inline on mobile) ──

  const ContactSection = (
    (guru.contactEmail || guru.contactPhone || guru.alternatePhone || guru.address || guru.websiteUrl || guru.whatsappNumber) ? (
      <SectionCard title="Contact">
        <div className="space-y-3">
          {guru.contactEmail && (
            <a href={`mailto:${guru.contactEmail}`} className="flex items-center gap-3 text-sm text-[#3c4043] hover:text-[#1a73e8] group">
              <span className="w-9 h-9 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0 group-hover:bg-[#d2e3fc] transition-colors">
                <Mail className="w-4 h-4 text-[#1a73e8]" />
              </span>
              <span className="truncate">{guru.contactEmail}</span>
            </a>
          )}
          {guru.contactPhone && (
            <a href={`tel:${guru.contactPhone}`} className="flex items-center gap-3 text-sm text-[#3c4043] hover:text-[#1a73e8] group">
              <span className="w-9 h-9 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-[#1a73e8]" />
              </span>
              {guru.contactPhone}
            </a>
          )}
          {guru.alternatePhone && (
            <a href={`tel:${guru.alternatePhone}`} className="flex items-center gap-3 text-sm text-[#3c4043] hover:text-[#1a73e8] group">
              <span className="w-9 h-9 rounded-full bg-[#f1f3f4] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-[#5f6368]" />
              </span>
              {guru.alternatePhone}
            </a>
          )}
          {guru.address && (
            <div className="flex items-start gap-3 text-sm text-[#3c4043]">
              <span className="w-9 h-9 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-[#1a73e8]" />
              </span>
              <span className="leading-relaxed">{guru.address}</span>
            </div>
          )}
          {guru.websiteUrl && (
            <a href={guru.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-[#1a73e8] hover:underline">
              <span className="w-9 h-9 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 text-[#1a73e8]" />
              </span>
              <span className="truncate">{guru.websiteUrl.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {guru.whatsappNumber && (
            <a
              href={`https://wa.me/${guru.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 bg-[#25d366] text-white font-semibold rounded-xl hover:bg-[#1ebe5d] transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          )}
        </div>
      </SectionCard>
    ) : null
  );

  const QRSection = (
    <SectionCard title="Share Profile">
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-white border border-[#e0e0e0] rounded-xl shadow-sm">
          <QRCode value={profileUrl} size={140} />
        </div>
        <p className="text-xs text-[#9aa0a6] text-center">Scan to open this profile</p>
      </div>
    </SectionCard>
  );

  const HoursSection = businessHours.length > 0 ? (
    <SectionCard title="Working Hours" icon={Clock}>
      <div className="space-y-1">
        {businessHours.map((row) => {
          const isToday = row.day === todayAbbr;
          return (
            <div
              key={row.day}
              className={`flex items-center justify-between py-2 px-2 rounded-lg ${isToday ? 'bg-[#e8f0fe]' : 'hover:bg-[#f8f9fa]'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold w-8 ${isToday ? 'text-[#1a73e8]' : 'text-[#202124]'}`}>{row.day}</span>
                {isToday && <span className="text-[10px] bg-[#1a73e8] text-white px-1.5 py-0.5 rounded-full font-bold">Today</span>}
              </div>
              {row.closed
                ? <span className="text-xs text-[#9aa0a6] italic">Closed</span>
                : <span className={`text-sm ${isToday ? 'text-[#1a73e8] font-semibold' : 'text-[#3c4043]'}`}>{row.open} – {row.close}</span>
              }
            </div>
          );
        })}
      </div>
    </SectionCard>
  ) : null;

  const BookingSection = (
    <SectionCard title="Book Appointment" icon={Calendar}>
      <div className="mb-3 p-3 rounded-xl bg-[#e8f0fe] border border-[#c5d8fd]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <RefreshCw className="w-4 h-4 text-[#1a73e8] flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1a73e8]">Recurring sessions</p>
              <p className="text-xs text-[#3c4043]">Subscribe for daily access</p>
            </div>
          </div>
          {user ? (
            <button onClick={() => setShowSubscribe(true)} className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-full hover:bg-[#1557b0] font-semibold flex-shrink-0">
              Subscribe
            </button>
          ) : (
            <Link to="/login" className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-full hover:bg-[#1557b0] font-semibold flex-shrink-0">
              Sign in
            </Link>
          )}
        </div>
      </div>
      {!slots || slots.length === 0 ? (
        <p className="text-xs text-[#9aa0a6] text-center py-2">No time slots available yet.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#5f6368] uppercase tracking-wide">Available slots</p>
          {slots.map((slot: AvailabilitySlot) => (
            <div key={slot.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8f9fa] border border-[#e8eaed]">
              <div>
                <p className="text-sm font-semibold text-[#202124]">Every {t(`days.${slot.dayOfWeek}`)}</p>
                <p className="text-xs text-[#5f6368]">
                  {slot.startTime} – {slot.endTime} · {slot.slotDurationMins < 60 ? `${slot.slotDurationMins}m` : `${slot.slotDurationMins / 60}h`}
                </p>
              </div>
              {user ? (
                <button onClick={() => setBookingSlot(slot)} className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-full hover:bg-[#1557b0] font-semibold">Book</button>
              ) : (
                <Link to="/login" className="text-xs bg-[#1a73e8] text-white px-3 py-1.5 rounded-full hover:bg-[#1557b0] font-semibold">Sign in</Link>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );

  return (
    <div className="bg-[#f4f6f8] min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* ── BANNER ── */}
        <div className="relative">
          <div className="h-48 md:h-64 lg:h-80 w-full overflow-hidden">
            {guru.bannerUrl ? (
              <img src={guru.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="relative w-full h-full bg-gradient-to-br from-[#0d47a1] via-[#1565c0] to-[#26a69a] overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            {user && (
              <button onClick={toggleFavorite}
                className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${isFavorited ? 'bg-[#ea4335]/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}>
                <Heart className={isFavorited ? 'w-4 h-4 fill-white' : 'w-4 h-4'} />
              </button>
            )}
          </div>
        </div>

        {/* ── HERO INFO (name, bio, contact) ── */}
        <div className="bg-white border-b border-[#e0e0e0] shadow-sm">
          <div className="max-w-6xl mx-auto px-4 md:px-8 pb-6">
            {/* Avatar + name row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 md:-mt-16 mb-4">
              <div className="self-center sm:self-auto flex-shrink-0">
                {guru.user?.avatarUrl ? (
                  <img src={guru.user.avatarUrl} alt={guru.user?.name}
                    className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-white object-cover shadow-xl"
                    loading="lazy" />
                ) : (
                  <div className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-[#0d47a1] to-[#1a73e8] border-4 border-white flex items-center justify-center text-white font-bold shadow-xl select-none text-3xl md:text-4xl">
                    {initial}
                  </div>
                )}
              </div>
              <div className="flex-1 sm:pb-2 text-center sm:text-left pt-2 sm:pt-14 md:pt-0">
                <h1 className="text-2xl md:text-3xl font-bold text-[#202124] leading-tight">{guru.user?.name}</h1>
                {guru.tagline && <p className="text-sm md:text-base text-[#5f6368] mt-1 italic">"{guru.tagline}"</p>}
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <StarRating value={guru.ratingAvg} readonly size="sm" />
                  <span className="text-sm text-[#5f6368]">{guru.ratingAvg.toFixed(1)} ({guru.ratingCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {(guru.about || guru.user?.bio) && (
              <p className="text-sm md:text-base text-[#3c4043] leading-relaxed mb-5 max-w-3xl">
                {guru.about || guru.user?.bio}
              </p>
            )}

            {/* Contact row — visible on desktop inside hero; hidden on mobile (shown in sidebar) */}
            {(guru.contactEmail || guru.contactPhone || guru.address) && (
              <div className="hidden md:flex flex-wrap gap-4 mb-4">
                {guru.contactEmail && (
                  <a href={`mailto:${guru.contactEmail}`} className="flex items-center gap-2 text-sm text-[#3c4043] hover:text-[#1a73e8]">
                    <Mail className="w-4 h-4 text-[#1a73e8]" /> {guru.contactEmail}
                  </a>
                )}
                {guru.contactPhone && (
                  <a href={`tel:${guru.contactPhone}`} className="flex items-center gap-2 text-sm text-[#3c4043] hover:text-[#1a73e8]">
                    <Phone className="w-4 h-4 text-[#1a73e8]" /> {guru.contactPhone}
                  </a>
                )}
                {guru.address && (
                  <span className="flex items-center gap-2 text-sm text-[#3c4043]">
                    <MapPin className="w-4 h-4 text-[#1a73e8]" /> {guru.address}
                  </span>
                )}
              </div>
            )}

            {/* CTA buttons row */}
            <div className="flex flex-wrap gap-3">
              {guru.whatsappNumber && (
                <a href={`https://wa.me/${guru.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25d366] text-white font-semibold rounded-full hover:bg-[#1ebe5d] transition-colors shadow-sm text-sm">
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              )}
              {guru.websiteUrl && (
                <a href={guru.websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#dadce0] text-[#3c4043] font-medium rounded-full hover:bg-[#f8f9fa] transition-colors text-sm">
                  <Globe className="w-4 h-4 text-[#5f6368]" /> {guru.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── BODY: two-column on lg+, single on mobile ── */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">

          {/* ── LEFT / MAIN COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Services */}
            {guru.skills.length > 0 && (
              <SectionCard title="Our Services">
                {/* Mobile: horizontal scroll */}
                <MobileScroll>
                  {guru.skills.map((s: { id: string; skillName: string }, i: number) => {
                    const Icon = SKILL_ICONS[i % SKILL_ICONS.length];
                    const col = SKILL_COLORS[i % SKILL_COLORS.length];
                    return (
                      <div key={s.id} className="flex-shrink-0 w-28 flex flex-col items-center gap-2 p-3 rounded-xl border border-[#e8eaed] text-center">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ring-4 ${col.bg} ${col.text} ${col.ring}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-[#202124] leading-tight">{s.skillName}</span>
                      </div>
                    );
                  })}
                </MobileScroll>
                {/* md+: grid */}
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {guru.skills.map((s: { id: string; skillName: string }, i: number) => {
                    const Icon = SKILL_ICONS[i % SKILL_ICONS.length];
                    const col = SKILL_COLORS[i % SKILL_COLORS.length];
                    return (
                      <div key={s.id} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#e8eaed] hover:border-[#c5d8fd] hover:shadow-sm transition-all text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-4 ${col.bg} ${col.text} ${col.ring}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-[#202124] leading-tight">{s.skillName}</span>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Gallery */}
            {guru.photos.length > 0 && (
              <SectionCard title="Gallery">
                <MobileScroll>
                  {guru.photos.map((p: { id: string; url: string; caption: string | null }) => (
                    <img key={p.id} src={p.url} alt={p.caption ?? ''} loading="lazy"
                      className="flex-shrink-0 w-44 h-44 object-cover rounded-xl border border-[#e0e0e0]" />
                  ))}
                </MobileScroll>
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {guru.photos.map((p: { id: string; url: string; caption: string | null }) => (
                    <img key={p.id} src={p.url} alt={p.caption ?? ''} loading="lazy"
                      className="w-full aspect-square object-cover rounded-xl border border-[#e0e0e0] hover:opacity-95 transition-opacity" />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Products */}
            {productsData?.data?.length > 0 && (
              <SectionCard title="Products" icon={ShoppingBag}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(productsData.data as Product[]).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Testimonials */}
            {ratingsData?.data?.length > 0 && (
              <SectionCard title="What Students Say">
                <MobileScroll>
                  {ratingsData.data.map((r: { id: string; stars: number; comment: string | null; createdAt: string; student?: { name: string } }) => (
                    <div key={r.id} className="flex-shrink-0 w-64 p-4 rounded-xl border border-[#e8eaed] bg-[#f8f9fa] flex flex-col gap-2">
                      <StarRating value={r.stars} readonly size="sm" />
                      {r.comment && <p className="text-sm text-[#3c4043] leading-relaxed line-clamp-4">"{r.comment}"</p>}
                      <div className="mt-auto pt-1">
                        <p className="text-xs font-semibold text-[#202124]">— {r.student?.name ?? 'Anonymous'}</p>
                        <p className="text-xs text-[#9aa0a6]">{formatDate(r.createdAt, i18n.language)}</p>
                      </div>
                    </div>
                  ))}
                </MobileScroll>
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {ratingsData.data.map((r: { id: string; stars: number; comment: string | null; createdAt: string; student?: { name: string } }) => (
                    <div key={r.id} className="p-4 rounded-xl border border-[#e8eaed] bg-[#f8f9fa] flex flex-col gap-2">
                      <StarRating value={r.stars} readonly size="sm" />
                      {r.comment && <p className="text-sm text-[#3c4043] leading-relaxed">"{r.comment}"</p>}
                      <div className="mt-auto pt-1">
                        <p className="text-xs font-semibold text-[#202124]">— {r.student?.name ?? 'Anonymous'}</p>
                        <p className="text-xs text-[#9aa0a6]">{formatDate(r.createdAt, i18n.language)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Videos */}
            {guru.videos.length > 0 && (
              <SectionCard title="Videos">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {guru.videos.map((v: { id: string; youtubeUrl: string; title: string; thumbnailUrl: string | null }) => (
                    <a key={v.id} href={v.youtubeUrl} target="_blank" rel="noopener noreferrer"
                      className="flex gap-3 items-center p-3 rounded-xl border border-[#e0e0e0] hover:bg-[#f8f9fa] hover:border-[#c5d8fd] transition-all">
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
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Mobile-only: contact, hours, QR, booking (before enquiry form) */}
            <div className="lg:hidden space-y-5">
              {ContactSection}
              {HoursSection}
              {BookingSection}
              {QRSection}
            </div>

            {/* Enquiry Form */}
            <SectionCard title={`Send an Enquiry to ${guru.user?.name}`} icon={Send}>
              {inqSent ? (
                <div className="text-center py-10 px-4">
                  <div className="w-14 h-14 bg-[#e6f4ea] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Send className="w-6 h-6 text-[#1e8e3e]" />
                  </div>
                  <p className="text-base font-semibold text-[#202124]">Message sent!</p>
                  <p className="text-sm text-[#5f6368] mt-1">We'll get back to you shortly.</p>
                  <button onClick={() => setInqSent(false)} className="mt-4 text-sm text-[#1a73e8] hover:underline">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">Your Name *</label>
                      <input required value={inqName} onChange={(e) => setInqName(e.target.value)}
                        placeholder="Full name"
                        className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">Email Address *</label>
                      <input required type="email" value={inqEmail} onChange={(e) => setInqEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">Phone Number</label>
                    <input type="tel" value={inqPhone} onChange={(e) => setInqPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">Message *</label>
                    <textarea required value={inqMessage} onChange={(e) => setInqMessage(e.target.value)}
                      placeholder="Write your message here…" rows={4} resize-none
                      className="w-full border border-[#dadce0] rounded-xl px-4 py-3 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-colors resize-none" />
                  </div>
                  <button type="submit" disabled={submitInquiry.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1a73e8] text-white font-semibold rounded-xl hover:bg-[#1557b0] disabled:opacity-60 transition-colors shadow-sm">
                    <Send className="w-4 h-4" />
                    {submitInquiry.isPending ? 'Sending…' : 'Send Message'}
                  </button>
                  {submitInquiry.isError && (
                    <p className="text-xs text-[#d93025] text-center">Failed to send. Please try again.</p>
                  )}
                </form>
              )}
            </SectionCard>
          </div>

          {/* ── RIGHT / SIDEBAR (lg+ only) ── */}
          <div className="hidden lg:flex flex-col gap-5 sticky top-6">
            {ContactSection}
            {HoursSection}
            {BookingSection}
            {QRSection}
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
