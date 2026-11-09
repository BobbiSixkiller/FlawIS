import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const envFile = fileURLToPath(new URL('../.env.e2e.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

export const baseURL = process.env.E2E_BASE_URL || 'https://flawis-staging.flaw.uniba.sk';
const target = new URL(baseURL);
if (target.origin !== baseURL || target.hostname !== 'flawis-staging.flaw.uniba.sk' || target.protocol !== 'https:') {
  throw new Error('Browser smoke tests target https://flawis-staging.flaw.uniba.sk only; production is not a test target.');
}
export const authFile = fileURLToPath(new URL('../playwright/.auth/staging.json', import.meta.url));
export const conferenceSlug = process.env.E2E_CONFERENCE_SLUG;
if (conferenceSlug && !/^[a-zA-Z0-9_-]+$/.test(conferenceSlug)) throw new Error('E2E_CONFERENCE_SLUG must be a URL slug.');
