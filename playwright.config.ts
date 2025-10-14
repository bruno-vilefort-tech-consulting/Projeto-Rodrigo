import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração Playwright para ChatIA Flow
 *
 * - Testes E2E completos
 * - Visual Regression Testing
 * - Socket.IO real-time validation
 * - Multi-browser testing (Chromium, Firefox, WebKit)
 */

export default defineConfig({
  testDir: './tests/e2e',

  // Timeout por teste (2 minutos)
  timeout: 120000,

  // Expect timeout (30 segundos para assertions)
  expect: {
    timeout: 30000,
    // Configuração para toHaveScreenshot
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2
    }
  },

  // Configuração de execução
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Repórter
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list']
  ],

  // Configuração compartilhada
  use: {
    // Base URL da aplicação
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Traçar apenas em falhas
    trace: 'on-first-retry',

    // Screenshot em falhas
    screenshot: 'only-on-failure',

    // Video em falhas
    video: 'retain-on-failure',

    // Timeout de ação (10 segundos)
    actionTimeout: 10000,

    // Timeout de navegação (30 segundos)
    navigationTimeout: 30000,
  },

  // Projetos (browsers)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Mobile testing (opcional)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web Server (iniciar automaticamente durante testes)
  webServer: [
    {
      command: 'cd backend && npm run dev:server',
      url: 'http://localhost:8080/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'cd frontend && npm start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
    }
  ],
});
