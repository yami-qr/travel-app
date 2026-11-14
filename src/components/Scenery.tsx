import { useId } from "react";

export type SceneVariant = "peaks" | "coast" | "dunes" | "islands";

export interface ScenePalette {
  skyTop: string;
  skyBottom: string;
  sun: string;
  /** Furthest layer: distant mountains or rocks. */
  far: string;
  /** Middle layer: hills, or the water in coast and island scenes. */
  mid: string;
  /** Closest layer: foreground land. */
  near: string;
}

interface SceneryProps {
  variant: SceneVariant;
  palette: ScenePalette;
  className?: string;
}

/**
 * A small illustrated landscape drawn in SVG. It stands in for destination
 * photos, so the app ships no image files. Decorative: hidden from screen readers.
 */
export default function Scenery({ variant, palette, className }: SceneryProps) {
  // useId output contains colons, which are awkward inside url(#...) references.
  const skyId = `sky-${useId().replace(/:/g, "")}`;

  return (
    <svg
      className={className}
      viewBox="0 0 200 150"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.skyTop} />
          <stop offset="1" stopColor={palette.skyBottom} />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill={`url(#${skyId})`} />

      {variant === "peaks" && (
        <>
          <circle cx="128" cy="36" r="15" fill={palette.sun} />
          <path
            d="M0 96 30 58 52 82 86 40 118 86 142 60 172 90 200 66V150H0Z"
            fill={palette.far}
          />
          <path d="M86 40 98 57 90 54 84 60 76 54Z" fill="#fff" opacity="0.75" />
          <path d="M0 112Q40 86 80 106T160 100T200 108V150H0Z" fill={palette.mid} />
          <path d="M0 130Q50 112 100 127T200 122V150H0Z" fill={palette.near} />
        </>
      )}

      {variant === "coast" && (
        <>
          <circle cx="124" cy="62" r="20" fill={palette.sun} />
          <path d="M0 92Q35 66 72 84T140 78T200 86V150H0Z" fill={palette.far} />
          <rect y="98" width="200" height="52" fill={palette.mid} />
          <path
            d="M102 108h44M110 117h30M116 126h18"
            stroke={palette.sun}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path d="M0 150V116Q42 104 88 124Q118 136 146 150Z" fill={palette.near} />
        </>
      )}

      {variant === "dunes" && (
        <>
          <circle cx="68" cy="40" r="17" fill={palette.sun} />
          <path d="M0 100Q50 58 100 92T200 82V150H0Z" fill={palette.far} />
          <path d="M0 118Q60 86 120 112T200 104V150H0Z" fill={palette.mid} />
          <path d="M0 136Q70 110 140 132T200 126V150H0Z" fill={palette.near} />
        </>
      )}

      {variant === "islands" && (
        <>
          <circle cx="104" cy="44" r="14" fill={palette.sun} />
          <rect y="94" width="200" height="56" fill={palette.mid} />
          <path
            d="M14 96Q28 50 46 96ZM58 96Q78 34 98 96ZM118 96Q134 58 150 96ZM158 96Q176 46 194 96Z"
            fill={palette.far}
          />
          <path
            d="M20 104h30M66 106h36M126 104h26"
            stroke={palette.far}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.35"
          />
          <path d="M-10 150V122Q22 96 52 128Q64 142 72 150Z" fill={palette.near} />
        </>
      )}
    </svg>
  );
}
