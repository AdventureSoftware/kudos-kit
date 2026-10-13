
export const MIN_PASSWORD = 10;
export const MAX_PASSWORD = 128;

export function newPasswordError(form: FormData, ids = { password: 'password', confirm: 'confirm' }): string | null {
  const password = String(form.get(ids.password) ?? '');
  if (password.length < MIN_PASSWORD) return `The password needs at least ${MIN_PASSWORD} characters.`;
  if (password.length > MAX_PASSWORD) return `The password can have at most ${MAX_PASSWORD} characters.`;
  if (password !== form.get(ids.confirm)) return 'The two passwords do not match.';
  return null;
}
