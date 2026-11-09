/**
 * Monogram tiles stand in for distro logos. Official logos are trademarks
 * with their own usage rules, so until each one is cleared (see TODO LF-6)
 * every distro gets a consistent two-letter tile instead.
 */

// Hues chosen to sit well next to the brand teal in light and dark mode.
const TILE_HUES = [174, 192, 210, 228, 262, 290, 330, 12, 32, 46, 140, 158];

export function getInitials(name: string): string {
  const words = name
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).replace(/^./, (c) => c.toUpperCase());
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function getTileHue(id: string): number {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TILE_HUES[hash % TILE_HUES.length];
}

/** Inline style for a tile: tinted background, readable foreground. */
export function getTileStyle(id: string): Record<string, string> {
  const hue = getTileHue(id);
  return {
    "--tile-h": String(hue),
  };
}
