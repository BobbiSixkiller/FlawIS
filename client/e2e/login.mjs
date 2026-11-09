import { chromium } from '@playwright/test';
import { chmodSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { authFile, baseURL } from './environment.mjs';

const browser = await chromium.launch({ headless: false });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseURL}/en/login`);
  console.log('Sign into staging in the browser window. No password is saved by this script.');
  const deadline = Date.now() + 5 * 60_000;
  while (Date.now() < deadline) {
    if (!browser.isConnected()) throw new Error('Browser closed before a staging session was saved.');
    const cookies = await context.cookies(baseURL);
    if (cookies.some(cookie => cookie.name === 'accessToken' && cookie.value)) {
      mkdirSync(dirname(authFile), { recursive: true, mode: 0o700 });
      await context.storageState({ path: authFile });
      chmodSync(authFile, 0o600);
      console.log('Saved staging browser session. Run npm run test:browser.');
      break;
    }
    await delay(500);
  }
  if (Date.now() >= deadline) throw new Error('Login timed out; run npm run test:browser:login again.');
} finally {
  await browser.close();
}
