import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // await page.goto('http://localhost:5000/');
  await page.goto('https://allcloudhub.project-demo.info/');
  await expect(
    page.getByRole('heading', { name: 'One Platform.' })
  ).toBeVisible();
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Sign In' })
    .click();
  await page.getByRole('button', { name: 'Continue with Email' }).click();
  await expect(
    page.getByRole('heading', { name: 'Sign in to your account' })
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page
    .getByRole('textbox', { name: 'Email address' })
    .fill('johndoe12341@yopmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Test@12');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Invalid email or password')).toBeVisible();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Test@123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('img').first()).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'Search files and folders...' })
  ).toBeVisible();
});
