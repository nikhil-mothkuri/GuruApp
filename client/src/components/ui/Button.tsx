import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const variantClasses = {
  primary: 'bg-[#1E3A8A] text-white hover:bg-[#152f67] focus-visible:ring-[#F47F2F]',
  secondary: 'bg-[#F47F2F] text-white hover:bg-[#d76a28] focus-visible:ring-[#1E3A8A]',
  ghost: 'bg-white text-[#111827] hover:bg-[#f8fafc] border border-[#e2e8f0] focus-visible:ring-[#1E3A8A]',
};

export function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed shadow-sm',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
