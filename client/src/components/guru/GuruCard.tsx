import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GuruCardData {
  id: string;
  tagline: string | null;
  ratingAvg: number;
  ratingCount: number;
  user: { id: string; name: string; avatarUrl: string | null };
  skills: { id: string; skillName: string }[];
}

interface Props {
  guru: GuruCardData;
}

export function GuruCard({ guru }: Props) {
  const name = guru.user?.name ?? '';
  const avatarUrl = guru.user?.avatarUrl ?? null;
  const initial = name[0]?.toUpperCase() ?? '?';

  return (
    <Link to={`/guru/${guru.id}`} className="brand-card block overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            loading="lazy"
            width={48}
            height={48}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-medium text-lg flex-shrink-0 select-none">
            {initial}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#202124] text-sm leading-tight truncate">{name}</h3>
          {guru.tagline && (
            <p className="text-xs text-[#5f6368] mt-0.5 line-clamp-2 leading-relaxed">
              {guru.tagline}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <Star
              className={cn(
                'w-3.5 h-3.5',
                guru.ratingCount > 0 ? 'text-[#fbbc04] fill-[#fbbc04]' : 'text-[#bdc1c6]',
              )}
            />
            <span className="text-xs text-[#202124] font-medium">{guru.ratingAvg.toFixed(1)}</span>
            <span className="text-xs text-[#5f6368]">({guru.ratingCount})</span>
          </div>
        </div>
      </div>

      {/* Skills */}
      {guru.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-4">
          {guru.skills.slice(0, 3).map((s) => (
            <span key={s.id} className="brand-pill">
              {s.skillName}
            </span>
          ))}
          {guru.skills.length > 3 && (
            <span className="text-xs text-[#5f6368] px-1 py-0.5">+{guru.skills.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  );
}
