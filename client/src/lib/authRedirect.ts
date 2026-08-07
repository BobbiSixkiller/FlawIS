export function googleOAuthHref(redirectUrl?: string) {
  if (!redirectUrl) return "/google/oauth";

  const query = new URLSearchParams({ url: redirectUrl });
  return `/google/oauth?${query.toString()}`;
}
