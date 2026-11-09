/**
 * Lightweight index of guide pages for client code (the results view links
 * to a comparison when the top two matches have one). Kept separate from
 * src/content/* so the full guide text never ships in the quiz bundle.
 * A unit test checks this list matches src/content/compare.ts.
 */
export const COMPARISON_PAIRS: [a: string, b: string, slug: string][] = [
  ["ubuntu", "linux-mint", "ubuntu-vs-linux-mint"],
  ["debian", "ubuntu", "debian-vs-ubuntu"],
  ["pop-os", "ubuntu", "pop-os-vs-ubuntu"],
  ["linux-mint", "zorin-os", "linux-mint-vs-zorin-os"],
  ["arch-linux", "endeavour", "arch-linux-vs-endeavouros"],
  ["arch-linux", "manjaro", "arch-linux-vs-manjaro"],
  ["manjaro", "endeavour", "manjaro-vs-endeavouros"],
  ["fedora", "arch-linux", "fedora-vs-arch-linux"],
  ["fedora", "debian", "fedora-vs-debian"],
  ["cachyos", "endeavour", "cachyos-vs-endeavouros"],
];

export function findComparisonSlug(x: string, y: string): string | undefined {
  return COMPARISON_PAIRS.find(([a, b]) => (a === x && b === y) || (a === y && b === x))?.[2];
}
