/** Client-side cookie helpers. Only used by the mock auth adapter. */
export function setCookie(name: string, value: string, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function hasCookie(name: string) {
  return document.cookie.split("; ").some((c) => c.startsWith(`${name}=`));
}
