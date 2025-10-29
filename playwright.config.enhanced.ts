import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Authenticated user tests
    {
      name: 'authenticated',
      testMatch: /.*\.authenticated\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: 'tests/auth/user-state.json',
        ...devices['Desktop Chrome'],
      },
    },
    
    // Admin authenticated tests
    {
      name: 'admin-authenticated',
      testMatch: /.*\.admin\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: 'tests/auth/admin-state.json',
        ...devices['Desktop Chrome'],
      },
    },
    
    // Public/unauthenticated tests
    {
      name: 'public',
      testMatch: /.*\.public\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Mobile tests
    {
      name: 'mobile',
      testMatch: /.*\.mobile\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});