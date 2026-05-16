import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle, className, ...props }: Props) {
  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      <h2 className="text-2xl md:text-3xl font-semibold text-[#111827]">{title}</h2>
      {subtitle ? (
        <p className="text-sm md:text-base text-[#475569] max-w-2xl mx-auto">{subtitle}</p>
      ) : null}
    </div>
  );
}
