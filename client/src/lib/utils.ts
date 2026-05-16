import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOCALE_MAP: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };

export function formatDate(date: string | Date, lang = 'en') {
  return new Date(date).toLocaleDateString(LOCALE_MAP[lang] ?? 'en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date, lang = 'en') {
  return new Date(date).toLocaleString(LOCALE_MAP[lang] ?? 'en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Legacy constant kept for non-i18n fallback; prefer t('days.N') in components.
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
