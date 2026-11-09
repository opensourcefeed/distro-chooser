/**
 * Renders the tiny inline syntax used in guide content to safe HTML:
 * **bold** and [label](url). Everything else is escaped. Only https:// and
 * site-relative (/…) URLs are allowed; external links get rel="noopener".
 */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function renderInline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    const href = url.replace(/&amp;/g, "&");
    if (!/^(https:\/\/|\/)/.test(href)) return label;
    const external = href.startsWith("https://") && !href.startsWith("https://www.opensourcefeed.org");
    return `<a href="${escapeHtml(href)}"${external ? ' rel="noopener"' : ""} class="font-medium text-accent underline underline-offset-4 hover:no-underline">${label}</a>`;
  });
  return out;
}

/** Plain text with the inline syntax stripped, for word counts and JSON-LD. */
export function toPlainText(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function countWords(text: string): number {
  return toPlainText(text).split(/\s+/).filter(Boolean).length;
}
