interface LogoMarkProps {
  size?: number;
}

/** The Travel Planner mark: a route winding from a start point. Decorative, so hidden from screen readers. */
export function LogoMark({ size = 30 }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1dc98c" />
      <path
        d="M9 23c0-6 14-3 14-9a4 4 0 0 0-8 0"
        fill="none"
        stroke="#072e33"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="9" cy="23" r="2.5" fill="#072e33" />
    </svg>
  );
}

/** Logo mark plus wordmark. */
export default function Logo() {
  return (
    <>
      <LogoMark />
      <span>
        Travel Planner
      </span>
    </>
  );
}
