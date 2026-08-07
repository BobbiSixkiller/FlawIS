export type TenantSubdomain = 'courses' | 'flawis';

const STAGING_SUFFIX = '-staging';

export function resolveTenantHostname(
  hostname: string,
  tenant: TenantSubdomain,
) {
  const [currentSubdomain, ...domainParts] = hostname.split('.');
  if (domainParts.length === 0) return hostname;

  const environmentSuffix = currentSubdomain.endsWith(STAGING_SUFFIX)
    ? STAGING_SUFFIX
    : '';

  return [tenant + environmentSuffix, ...domainParts].join('.');
}

export function resolveTenantOrigin(
  hostname: string,
  tenant: TenantSubdomain,
  nodeEnv = process.env.NODE_ENV,
) {
  if (nodeEnv === 'development') return 'http://localhost:3000';
  return `https://${resolveTenantHostname(hostname, tenant)}`;
}
