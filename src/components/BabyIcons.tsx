import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

export const BabyIcon: React.FC<IconProps> = ({ name, className = "w-16 h-16" }) => {
  switch (name) {
    case 'onesie':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" className={className}>
          <path d="M22 8h20l4 10-8 4v30a3 3 0 0 1-3 3H29a3 3 0 0 1-3-3V22l-8-4 4-10Z" />
          <path d="M22 8c2 4 4 6 10 6s8-2 10-6" />
          <circle cx="32" cy="30" r="1.5" fill="currentColor" />
          <circle cx="32" cy="38" r="1.5" fill="currentColor" />
          <path d="M27 48h10" strokeDasharray="2 2" />
        </svg>
      );
    case 'swaddle':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="32" cy="18" r="7" />
          <path d="M14 28c0 15 4 28 18 28s18-13 18-28" />
          <path d="M14 28c6-4 30-4 36 0" />
          <path d="M20 35l12 10 12-10" strokeDasharray="3 3" />
          <path d="M29 17a3 3 0 0 0 6 0" />
        </svg>
      );
    case 'hat':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 40c0-15 9-26 20-26s20 11 20 26" />
          <path d="M10 40h44" />
          <path d="M10 44h44" strokeWidth="1.5" />
          <circle cx="32" cy="11" r="3.5" fill="currentColor" fillOpacity="0.2" />
          <path d="M20 30c6-3 18-3 24 0" strokeDasharray="2 2" />
        </svg>
      );
    case 'socks':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M26 8v24l-12 10c-3 2-2 8 3 8h20a5 5 0 0 0 5-5V8Z" />
          <path d="M26 16h16" />
          <path d="M26 22h16" strokeDasharray="2 2" />
          <path d="M18 42c4 4 10 3 14-2" />
        </svg>
      );
    case 'romper':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M20 10h24l3 9-7 4v8l6 18a3 3 0 0 1-3 4h-8l-3-10-3 10h-8a3 3 0 0 1-3-4l6-18v-8l-7-4 3-9Z" />
          <path d="M24 10c1 4 4 5 8 5s7-1 8-5" />
          <circle cx="32" cy="24" r="1.5" fill="currentColor" />
          <circle cx="32" cy="30" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'pajama':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M22 8h20l4 10-8 4v6l6 20a3 3 0 0 1-3 4h-6l-3-12-3 12h-6a3 3 0 0 1-3-4l6-20v-6l-8-4 4-10Z" />
          <circle cx="32" cy="26" r="1.4" fill="currentColor" />
          <circle cx="32" cy="33" r="1.4" fill="currentColor" />
          <circle cx="32" cy="40" r="1.4" fill="currentColor" />
          <path d="M22 8c2 3 5 4 10 4s8-1 10-4" />
        </svg>
      );
    case 'blanket':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="12" y="14" width="40" height="36" rx="6" />
          <path d="M12 26h40" strokeDasharray="3 3" />
          <path d="M12 38h40" strokeDasharray="3 3" />
          <path d="M25 14v36" strokeDasharray="3 3" />
          <path d="M39 14v36" strokeDasharray="3 3" />
          <circle cx="32" cy="32" r="3" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
    case 'bib':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M20 12c-4 6-6 16 0 26 5 8 16 12 24 0 6-10 4-20 0-26" />
          <path d="M24 12c3 4 5 6 8 6s5-2 8-6" />
          <path d="M32 26v10" strokeDasharray="2 2" />
          <circle cx="32" cy="31" r="2.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
          <path d="M12 3v13m0 0l-4-4m4 4l4-4" />
        </svg>
      );
  }
};
