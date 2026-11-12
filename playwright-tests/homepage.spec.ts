import { test, expect } from '@playwright/test';

test('homepage displays the expected title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('HSSEQ Cards');
});
