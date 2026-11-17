/** Projects as the dashboard sees them, plus the same input rules the server checks. */

export interface Project {
  key: string;
  name: string;
  prefix: string;
  active: boolean;
  /** Feedback items it has now. */
  reports: number;
}

export const KEY_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;
export const PREFIX_PATTERN = /^[A-Z][A-Z0-9]{0,4}$/;
export const NAME_MAX = 80;

export const canManageProjects = (role: string | null) => role === 'owner' || role === 'admin';

/** "My Shop" → "my-shop". A suggestion only; people can type their own. */
export function suggestKey(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 40)
    .replace(/-+$/, '');
}

/**
 * "Shop" → "SH", "My Shop" → "MS", avoiding prefixes already taken (adds 2, 3…).
 * A suggestion only; people can type their own.
 */
export function suggestPrefix(name: string, taken: readonly string[] = []): string {
  const words = name.normalize('NFKD').replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  const letters = words.length > 1 ? words.map((w) => w[0]).join('').slice(0, 3) : (words[0] ?? '').slice(0, 2);
  const base = letters.toUpperCase().replace(/^[^A-Z]+/, '');
  if (!base) return '';
  let candidate = base;
  for (let n = 2; taken.includes(candidate) && n < 100; n++) candidate = `${base}${n}`.slice(0, 5);
  return candidate;
}
