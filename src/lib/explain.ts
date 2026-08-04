/**
 * Generates a human-readable explanation of why a distro was recommended.
 *
 * The function takes the distro name and the list of positively-weighted
 * reasons (from getWhyRecommended) and produces a concise sentence like:
 * "Fedora is recommended because you selected Development, Modern hardware,
 * and Latest software."
 *
 * Long answer labels are abbreviated to short display phrases for readability.
 */

// ── Short label map ───────────────────────────────────────────────────────
// Maps full answer labels (or their leading prefix) to concise display text.
// The map is checked by prefix match so we don't need exact full-label matches.

const SHORT_LABELS: Record<string, string> = {
  "Beginner": "Beginner",
  "Intermediate": "Intermediate",
  "Advanced": "Advanced",
  "Everyday computing": "Everyday use",
  "Development / Programming": "Development",
  "Gaming": "Gaming",
  "Privacy & Security": "Privacy",
  "AI & Machine Learning": "AI/ML",
  "Old Hardware Revival": "Old hardware",
  "Less than 2 years old": "Modern hardware",
  "2–5 years": "Mid-range hardware",
  "5–10 years": "Older hardware",
  "10+ years": "Legacy hardware",
  "Yes": "NVIDIA GPU",
  "No": "No NVIDIA GPU",
  "Not sure": "Unknown GPU",
  "Rock-solid stability": "Stable releases",
  "Cutting-edge": "Latest software",
  "Somewhere in between": "Balanced updates",
  "GNOME": "GNOME desktop",
  "KDE Plasma": "KDE Plasma desktop",
  "XFCE": "XFCE desktop",
  "Cinnamon": "Cinnamon desktop",
  "No preference": "Any desktop",
};

/**
 * Abbreviate a full answer label to a short display phrase.
 */
function abbreviateLabel(label: string): string {
  // Try exact match first
  if (SHORT_LABELS[label]) return SHORT_LABELS[label];

  // Try prefix match (match on the part before " — " or " - ")
  const separatorIndex = label.search(/ — | – | - /);
  if (separatorIndex !== -1) {
    const prefix = label.slice(0, separatorIndex).trim();
    if (SHORT_LABELS[prefix]) return SHORT_LABELS[prefix];
  }

  // Fallback: use the part before any separator, truncated
  const firstPart = label.split(/[—–-]/)[0].trim();
  if (firstPart && firstPart.length < 40) return firstPart;

  // Last resort: truncate
  return label.length > 40 ? label.slice(0, 37) + "..." : label;
}

/**
 * Generate a human-readable explanation sentence.
 *
 * @param distroName - The name of the recommended distro (e.g. "Fedora")
 * @param reasons - Array of { answer, weight } from getWhyRecommended(),
 *                  sorted by weight descending (most impactful first).
 * @returns A sentence like "Fedora is recommended because you selected
 *          Development, Modern hardware, and Latest software."
 */
export function generateExplanation(
  distroName: string,
  reasons: { answer: string; weight: number }[],
): string {
  if (reasons.length === 0) {
    return `${distroName} is a solid choice based on your preferences.`;
  }

  // Sort by weight descending so most impactful reasons come first
  const sorted = [...reasons].sort((a, b) => b.weight - a.weight);

  // Abbreviate each answer label
  const shortLabels = sorted.map((r) => abbreviateLabel(r.answer));

  // Build a comma-separated list with "and" before the last item
  let list: string;
  if (shortLabels.length === 1) {
    list = shortLabels[0];
  } else if (shortLabels.length === 2) {
    list = `${shortLabels[0]} and ${shortLabels[1]}`;
  } else {
    const allButLast = shortLabels.slice(0, -1).join(", ");
    list = `${allButLast}, and ${shortLabels[shortLabels.length - 1]}`;
  }

  return `${distroName} is recommended because you selected ${list}.`;
}