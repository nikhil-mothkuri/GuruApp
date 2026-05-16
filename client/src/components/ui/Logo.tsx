import { brand } from '@/lib/design';

export function Logo({ showTagline = true }: { showTagline?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-3xl bg-gradient-to-br from-[#F47F2F] to-[#F8C14B] shadow-brand-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 11.5C6 9.845 7.345 8.5 9 8.5C10.655 8.5 12 9.845 12 11.5C12 13.155 10.655 14.5 9 14.5C7.345 14.5 6 13.155 6 11.5Z"
            fill="white"
          />
          <path
            d="M9 2C6.239 2 4 4.239 4 7C4 9.761 6.239 12 9 12C11.761 12 14 9.761 14 7C14 4.239 11.761 2 9 2Z"
            fill="white"
            opacity="0.96"
          />
          <path
            d="M10.5 12.5C10.5 11.12 11.62 10 13 10C14.38 10 15.5 11.12 15.5 12.5V18C15.5 19.381 14.38 20.5 13 20.5C11.62 20.5 10.5 19.381 10.5 18V12.5Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold text-[#111827]">Saksham</span>
          <span className="text-2xl font-semibold text-[#1E3A8A]">Bharat</span>
        </div>
        {showTagline ? <span className="text-sm text-[#475569]">{brand.tagline}</span> : null}
      </div>
    </div>
  );
}
