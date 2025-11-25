import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/e2e/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/cypress/support/e2e.ts',
    fixturesFolder: 'tests/e2e/cypress/fixtures',
    screenshotsFolder: 'tests/e2e/cypress/screenshots',
    videosFolder: 'tests/e2e/cypress/videos',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    chromeWebSecurity: false,
    modifyObstructiveCode: true,
    retryOnStatusCodeFailure: false,
    setupNodeEvents(on, config) {
      on('task', {
        log(message: string) {
          console.log(message);
          return null;
        },
      });
      return config;
    },
  },
  env: {
    ENVIRONMENT: 'development',
    API_URL: 'http://localhost:3000/api',
  },
});
