import type { ReactNode } from "react";

export type IconName =
  | "calendar"
  | "list"
  | "reorder"
  | "wallet"
  | "chart"
  | "bag"
  | "bookmark"
  | "keyboard"
  | "plane"
  | "pin"
  | "check"
  | "arrow"
  | "clock"
  | "food"
  | "bed";

const paths: Record<IconName, ReactNode> = {
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  reorder: <path d="M7 20V4M3 8l4-4 4 4M17 4v16M13 16l4 4 4-4" />,
  wallet: (
    <>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </>
  ),
  chart: (
    <>
      <path d="M21.2 15.9A10 10 0 1 1 8 2.8" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </>
  ),
  bag: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  bookmark: <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  keyboard: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 15h10" />
    </>
  ),
  plane: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />,
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  food: (
    <>
      <path d="M4 2v7a3 3 0 0 0 6 0V2M7 2v20" />
      <path d="M20 15V2a5 5 0 0 0-4 5v6a2 2 0 0 0 2 2h2Zm0 0v7" />
    </>
  ),
  bed: <path d="M2 5v15M2 9h17a3 3 0 0 1 3 3v8M2 17h20M7 9v8" />,
};

interface IconProps {
  name: IconName;
  size?: number;
}

/** Line icon. Decorative by default: pair it with visible text or an aria-label on its parent. */
export default function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
