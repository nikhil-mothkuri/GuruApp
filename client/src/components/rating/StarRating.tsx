import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

export function StarRating({ value, onChange, readonly = false, size = 'md' }: Props) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            'transition-colors',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
          )}
        >
          <Star
            className={cn(
              sizes[size],
              star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
            )}
          />
        </button>
      ))}
    </div>
  );
}
