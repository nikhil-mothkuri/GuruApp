import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'brand-card bg-white border border-[#e2e8f0] rounded-3xl shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
      {...props}
    />
  );
}
