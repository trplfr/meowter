/**
 * Strip HTML tags from text for defense-in-depth.
 * Frontend (React) escapes by default, this is a backend safety net
 */
export const stripHtml = (text: string): string =>
  text.replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, '')
