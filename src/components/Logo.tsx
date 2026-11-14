interface LogoMarkProps {
  size?: number;
}

/** A paper plane leaving a dashed trail inside a postage stamp. Decorative. */
export function LogoMark({ size = 34 }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#c4412a" />
      <rect
        x="5"
        y="5"
        width="30"
        height="30"
        rx="4"
        fill="none"
        stroke="#fffdf7"
        strokeWidth="1.5"
        strokeDasharray="2 2.5"
      />
      <path
        d="M10 27c4-1 6-4 9-5"
        fill="none"
        stroke="#fffdf7"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="1 3"
      />
      <path d="M31 11 14 18l6 2.5 2.5 6.5L31 11Z" fill="#fffdf7" />
      <path d="M20 20.5 31 11" stroke="#c4412a" strokeWidth="1.2" />
    </svg>
  );
}

/** Logo mark plus wordmark. */
export default function Logo() {
  return (
    <>
      <LogoMark />
      <span className="logo-word">
        Travel <em>Planner</em>
      </span>
    </>
  );
}
