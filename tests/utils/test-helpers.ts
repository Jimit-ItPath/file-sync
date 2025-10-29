import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  // Authentication helpers
  async login(email: string, password: string) {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await this.page.getByRole('button', { name: 'Continue with Email' }).click();
    await this.page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Log in' }).click();
    await expect(this.page.getByRole('textbox', { name: 'Search files and folders...' })).toBeVisible();
  }

  async logout() {
    // Add logout logic based on your UI
    await this.page.getByRole('button', { name: 'Profile' }).click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }

  // File operation helpers
  async uploadFile(filePath: string) {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  async waitForFileUpload() {
    await expect(this.page.getByText('Upload complete')).toBeVisible({ timeout: 30000 });
  }

  async searchFiles(query: string) {
    await this.page.getByRole('textbox', { name: 'Search files and folders...' }).fill(query);
    await this.page.keyboard.press('Enter');
  }

  // Cloud storage helpers
  async connectCloudAccount(provider: 'google' | 'dropbox' | 'onedrive') {
    await this.page.getByRole('button', { name: `Connect ${provider}` }).click();
    // Handle OAuth flow in popup
  }

  // Navigation helpers
  async navigateToModule(module: string) {
    const moduleMap = {
      'dashboard': '/dashboard',
      'recent-files': '/recent-files',
      'profile': '/profile',
      'admin': '/admin/dashboard',
      'users': '/users',
      'logs': '/logs'
    };
    await this.page.goto(moduleMap[module] || module);
  }

  // Assertion helpers
  async expectToBeOnPage(path: string) {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectNotificationVisible(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}

export const TEST_USERS = {
  VALID_USER: {
    email: 'johndoe12341@yopmail.com',
    password: 'Test@123'
  },
  ADMIN_USER: {
    email: 'admin.user.storendless@yopmail.com',
    password: 'Admin@123'
  },
  INVALID_USER: {
    email: 'invalid@example.com',
    password: 'wrong'
  }
};

export const TEST_FILES = {
  SMALL_IMAGE: 'tests/fixtures/test-image.jpg',
  DOCUMENT: 'tests/fixtures/test-document.pdf',
  LARGE_FILE: 'tests/fixtures/large-file.zip'
};