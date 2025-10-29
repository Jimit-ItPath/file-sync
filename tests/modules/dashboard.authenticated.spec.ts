import { test, expect } from '@playwright/test';
import { TestHelpers, TEST_FILES } from '../utils/test-helpers';

test.describe('Dashboard Module - Authenticated', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/dashboard');
  });

  test('dashboard loads with main elements', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Search files and folders...' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
    await expect(page.getByText('Recent Files')).toBeVisible();
  });

  test('file upload functionality', async ({ page }) => {
    await helpers.uploadFile(TEST_FILES.SMALL_IMAGE);
    await helpers.waitForFileUpload();
    await helpers.expectNotificationVisible('File uploaded successfully');
  });

  test('file search functionality', async ({ page }) => {
    await helpers.searchFiles('test');
    await expect(page.getByText('Search Results')).toBeVisible();
  });

  test('file operations - rename', async ({ page }) => {
    // Assuming first file in grid
    await page.locator('[data-testid="file-item"]').first().hover();
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('menuitem', { name: 'Rename' }).click();
    
    await page.getByRole('textbox', { name: 'File name' }).fill('renamed-file.txt');
    await page.getByRole('button', { name: 'Save' }).click();
    
    await helpers.expectNotificationVisible('File renamed successfully');
  });

  test('file operations - delete', async ({ page }) => {
    await page.locator('[data-testid="file-item"]').first().hover();
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    
    await page.getByRole('button', { name: 'Confirm Delete' }).click();
    await helpers.expectNotificationVisible('File deleted successfully');
  });

  test('file preview modal', async ({ page }) => {
    await page.locator('[data-testid="file-item"]').first().click();
    await expect(page.getByRole('dialog', { name: 'File Preview' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('bulk file operations', async ({ page }) => {
    // Select multiple files
    await page.locator('[data-testid="file-checkbox"]').first().check();
    await page.locator('[data-testid="file-checkbox"]').nth(1).check();
    
    await expect(page.getByText('2 items selected')).toBeVisible();
    await page.getByRole('button', { name: 'Delete Selected' }).click();
    await page.getByRole('button', { name: 'Confirm Delete' }).click();
    
    await helpers.expectNotificationVisible('Files deleted successfully');
  });

  test('view toggle - grid to list', async ({ page }) => {
    await page.getByRole('button', { name: 'List View' }).click();
    await expect(page.locator('[data-testid="file-table"]')).toBeVisible();
    
    await page.getByRole('button', { name: 'Grid View' }).click();
    await expect(page.locator('[data-testid="file-grid"]')).toBeVisible();
  });

  test('filter functionality', async ({ page }) => {
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('checkbox', { name: 'Images' }).check();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    await expect(page.getByText('Showing images only')).toBeVisible();
  });
});