import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description, className, ...props }: Props) {
  return (
    <div className={cn('brand-card p-6 flex flex-col gap-4 text-center', className)} {...props}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef6ff] text-2xl">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
      <p className="text-sm text-[#475569] leading-relaxed">{description}</p>
    </div>
  );
}
