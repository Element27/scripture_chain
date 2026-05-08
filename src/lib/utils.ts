export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function formatClosingTime(closesAt: string | null): string {
  if (!closesAt) return "";

  const closeDate = new Date(closesAt);
  const now = new Date();

  if (closeDate <= now) return "Closed";

  const diffMs = closeDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} left`;
  return "Closing soon";
}

export function getFullReference(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number | null
): string {
  if (verseEnd && verseEnd !== verseStart) {
    return `${book} ${chapter}:${verseStart}-${verseEnd}`;
  }
  return `${book} ${chapter}:${verseStart}`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("Clipboard not available"));
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}