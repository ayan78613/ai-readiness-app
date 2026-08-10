// Anonymous-mode identity: an opaque per-browser token stored in localStorage,
// so a returning employee can still see their own history without a real name.
const STORAGE_KEY = 'kestra_anon_token';

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return 'anon-' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getAnonToken(): string {
  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = randomToken();
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
}
