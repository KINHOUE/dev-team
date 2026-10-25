import type { ReactNode } from 'react';

/** Jeu d'icônes SVG maison — aucune dépendance externe. */
const ICONS: Record<string, ReactNode> = {
  food: (
    <>
      <path d="M7 3v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
      <path d="M9 11v10" />
      <path d="M17 3v18" />
      <path d="M17 3c2.2 0 3.2 1.8 3.2 4S19.2 11 17 11" />
    </>
  ),
  transport: (
    <>
      <path d="M3 13.5 4.8 8A2 2 0 0 1 6.7 6.5h10.6A2 2 0 0 1 19.2 8L21 13.5" />
      <path d="M3 13.5h18v4.5a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-1v-1H6.2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <circle cx="7" cy="16.2" r="0.9" />
      <circle cx="17" cy="16.2" r="0.9" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.6 12 3l9 7.6" />
      <path d="M5.2 9.6V21h13.6V9.6" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  health: (
    <>
      <path d="M12 20.5s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 7 2.3c0 5.3-7 9.6-7 9.6z" />
      <path d="M8.5 12.5h2l1-2 1.5 3.5 1-1.5h1.5" />
    </>
  ),
  fun: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <path d="M8.5 8v8M15.5 8v8" />
      <path d="M6 10.5h1M6 13.5h1M17 10.5h1M17 13.5h1" />
    </>
  ),
  bill: (
    <>
      <path d="M6 3h9l3 3v15l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 11.5h6M9 15h4" />
    </>
  ),
  shopping: (
    <>
      <path d="M6 8h12l-1.2 12H7.2L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4h8l9 9-8 8-9-9z" />
      <circle cx="7.4" cy="7.4" r="1.2" />
    </>
  ),
};

export const ICON_KEYS = Object.keys(ICONS);

interface CategoryIconProps {
  icon: string;
  className?: string;
}

export default function CategoryIcon({ icon, className = 'h-5 w-5' }: CategoryIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[icon] ?? ICONS.tag}
    </svg>
  );
}
