export function googleOAuthHref(redirectUrl?: string) {
  if (!redirectUrl) return "/google/oauth";

  const query = new URLSearchParams({ url: redirectUrl });
  return `/google/oauth?${query.toString()}`;
}

export function logoutHref(redirectUrl?: string) {
  if (!redirectUrl) return "/logout";

  const query = new URLSearchParams({ url: redirectUrl });
  return `/logout?${query.toString()}`;
}
