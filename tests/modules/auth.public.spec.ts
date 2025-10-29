import { test, expect } from '@playwright/test';
import { TestHelpers, TEST_USERS } from '../utils/test-helpers';

test.describe('Authentication Module - Public', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'One Platform.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('login flow - valid credentials', async ({ page }) => {
    await helpers.login(TEST_USERS.VALID_USER.email, TEST_USERS.VALID_USER.password);
    await helpers.expectToBeOnPage('/dashboard');
  });

  test('login flow - invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    
    await page.getByRole('textbox', { name: 'Email address' }).fill(TEST_USERS.INVALID_USER.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USERS.INVALID_USER.password);
    await page.getByRole('button', { name: 'Log in' }).click();
    
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('register flow', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    
    // Fill registration form
    await page.getByRole('textbox', { name: 'First Name' }).fill('Test');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('User');
    await page.getByRole('textbox', { name: 'Email' }).fill('newuser@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Test@123');
    
    // Accept terms
    await page.getByRole('checkbox', { name: 'I agree to Terms' }).check();
    await page.getByRole('checkbox', { name: 'I agree to Privacy Policy' }).check();
    
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    await expect(page.getByText('Verification email sent')).toBeVisible();
  });

  test('forgot password flow', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_USERS.VALID_USER.email);
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    
    await expect(page.getByText('Reset link sent')).toBeVisible();
  });

  test('social login buttons present', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Facebook' })).toBeVisible();
  });
});