import { getInitials, getTileStyle } from "../lib/distro-mark";

const SIZES = {
  sm: "w-9 h-9 text-sm rounded-lg",
  md: "w-12 h-12 text-base rounded-xl",
  lg: "w-16 h-16 text-xl rounded-2xl",
} as const;

/** Two-letter monogram tile used in place of a distro logo. */
export default function DistroMark({ id, name, size = "md" }: { id: string; name: string; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden="true"
      style={getTileStyle(id) as React.CSSProperties}
      className={`
        ${SIZES[size]} shrink-0 inline-flex items-center justify-center font-display font-semibold tracking-tight
        bg-[hsl(var(--tile-h)_55%_92%)] text-[hsl(var(--tile-h)_55%_24%)] ring-1 ring-inset ring-[hsl(var(--tile-h)_40%_80%)]
        dark:bg-[hsl(var(--tile-h)_35%_20%)] dark:text-[hsl(var(--tile-h)_60%_82%)] dark:ring-[hsl(var(--tile-h)_30%_32%)]
      `}
    >
      {getInitials(name)}
    </span>
  );
}
