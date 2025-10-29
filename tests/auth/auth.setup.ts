import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from '../utils/test-helpers';

const authFile = 'tests/auth/user-state.json';
const adminAuthFile = 'tests/auth/admin-state.json';

setup('authenticate user', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'Continue with Email' }).click();
  
  await page.getByRole('textbox', { name: 'Email address' }).fill(TEST_USERS.VALID_USER.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USERS.VALID_USER.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  
  await expect(page.getByRole('textbox', { name: 'Search files and folders...' })).toBeVisible();
  
  await page.context().storageState({ path: authFile });
});

setup('authenticate admin', async ({ page }) => {
  await page.goto('/admin');
  
  await page.getByRole('textbox', { name: 'Email address' }).fill(TEST_USERS.ADMIN_USER.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USERS.ADMIN_USER.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  
  await expect(page.getByText('Admin Dashboard')).toBeVisible();
  
  await page.context().storageState({ path: adminAuthFile });
});