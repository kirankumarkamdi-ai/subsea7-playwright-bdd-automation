import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { getBaseUrl } from '../support/environment';

const baseURL = getBaseUrl();
const authStatePath = resolve(__dirname, '.auth/user.json');

async function saveAuthenticatedSession(): Promise<void> {
  const browser = await chromium.launch({ headless: false });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(baseURL);
    const terminal = createInterface({ input: stdin, output: stdout });
    try {
      await terminal.question(
        'Complete sign-in and MFA in the browser, then press Enter here to save the session.\n',
      );
    } finally {
      terminal.close();
    }

    await expect(
      page.getByRole('heading', { name: 'Recent Submissions', exact: true }),
      'Sign-in did not return to the application dashboard; the existing auth state was not replaced.',
    ).toBeEnabled({ timeout: 15_000 });

    await mkdir(dirname(authStatePath), { recursive: true });
    await context.storageState({ path: authStatePath });
    console.log(`Authenticated session saved to ${authStatePath}`);
  } finally {
    await browser.close();
  }
}

saveAuthenticatedSession().catch((error: unknown) => {
  console.error('Could not save the authenticated session:', error);
  process.exitCode = 1;
});
