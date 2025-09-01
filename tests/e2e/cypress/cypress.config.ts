// tests/e2e/cypress/cypress.config.ts

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base configuration
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/e2e/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/cypress/support/e2e.ts',
    fixturesFolder: 'tests/e2e/cypress/fixtures',
    screenshotsFolder: 'tests/e2e/cypress/screenshots',
    videosFolder: 'tests/e2e/cypress/videos',

    // Test execution settings
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Test retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Video and screenshot settings
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,

    // Browser settings
    chromeWebSecurity: false,
    modifyObstructiveThirdPartyCode: true,

    // Setup Node events
    setupNodeEvents(on, config) {
      // Code coverage plugin
      require('@cypress/code-coverage/task')(on, config);

      // Custom tasks
      on('task', {
        // Database seeding task
        seedDatabase() {
          return new Promise((resolve) => {
            // Execute database seeding script
            const { spawn } = require('child_process');
            const seed = spawn('npm', ['run', 'db:seed'], { stdio: 'inherit' });
            
            seed.on('close', (code) => {
              if (code === 0) {
                resolve('Database seeded successfully');
              } else {
                resolve('Database seeding failed');
              }
            });
          });
        },

        // Database cleanup task
        clearDatabase() {
          return new Promise((resolve) => {
            const { spawn } = require('child_process');
            const reset = spawn('npm', ['run', 'db:reset'], { stdio: 'inherit' });
            
            reset.on('close', (code) => {
              if (code === 0) {
                resolve('Database cleared successfully');
              } else {
                resolve('Database clearing failed');
              }
            });
          });
        },

        // Log messages to console
        log(message: string) {
          console.log(message);
          return null;
        },

        // Generate test data
        generateTestData(type: string) {
          const testData = {
            user: {
              email: `test-${Date.now()}@example.com`,
              firstName: 'Test',
              lastName: 'User',
              password: 'password123',
            },
            product: {
              id: `test-product-${Date.now()}`,
              name: 'Test Product',
              price: 29.99,
              description: 'A test product',
            },
            order: {
              id: `ORD-${Date.now()}`,
              total: 39.99,
              status: 'pending',
            },
          };

          return testData[type as keyof typeof testData] || null;
        },

        // File operations
        readFile(filePath: string) {
          const fs = require('fs');
          try {
            return fs.readFileSync(filePath, 'utf8');
          } catch (error) {
            return null;
          }
        },

        writeFile(filePath: string, content: string) {
          const fs = require('fs');
          try {
            fs.writeFileSync(filePath, content, 'utf8');
            return 'File written successfully';
          } catch (error) {
            return `Failed to write file: ${error.message}`;
          }
        },

        // Environment variable access
        getEnvVar(name: string) {
          return process.env[name] || null;
        },
      });

      // Plugin configurations
      on('before:browser:launch', (browser, launchOptions) => {
        // Chrome-specific flags
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
        }

        // Firefox-specific preferences
        if (browser.name === 'firefox') {
          launchOptions.preferences['security.tls.insecure_fallback_hosts'] = 'localhost';
          launchOptions.preferences['network.cookie.sameSite.laxByDefault'] = false;
        }

        return launchOptions;
      });

      // Handle file preprocessing
      on('file:preprocessor', require('@cypress/webpack-preprocessor')({
        webpackOptions: {
          resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
          },
          module: {
            rules: [
              {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
        },
      }));

      // Environment-specific configuration
      const environment = config.env.ENVIRONMENT || 'development';
      
      const environments = {
        development: {
          baseUrl: 'http://localhost:3000',
          apiUrl: 'http://localhost:3000/api',
        },
        staging: {
          baseUrl: 'https://staging.example.com',
          apiUrl: 'https://staging.example.com/api',
        },
        production: {
          baseUrl: 'https://example.com',
          apiUrl: 'https://example.com/api',
        },
      };

      if (environments[environment as keyof typeof environments]) {
        config.baseUrl = environments[environment as keyof typeof environments].baseUrl;
        config.env.apiUrl = environments[environment as keyof typeof environments].apiUrl;
      }

      return config;
    },
  },

  // Component testing configuration
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'components/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'tests/component/support/component-index.html',
    supportFile: 'tests/component/support/component.ts',
  },

  // Environment variables
  env: {
    // Test environment settings
    ENVIRONMENT: 'development',
    SEED_DATABASE: true,
    CLEANUP_DATABASE: true,

    // API endpoints
    API_URL: 'http://localhost:3000/api',
    
    // Test user credentials
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD: 'admin123',
    USER_EMAIL: 'user@example.com',
    USER_PASSWORD: 'user123',

    // Stripe test keys
    STRIPE_PUBLISHABLE_KEY: 'pk_test_51234567890',
    STRIPE_SECRET_KEY: 'sk_test_51234567890',

    // Feature flags
    ENABLE_A11Y_TESTS: true,
    ENABLE_PERFORMANCE_TESTS: true,
    ENABLE_VISUAL_REGRESSION: false,

    // Test data
    TEST_PRODUCT_ID: 'test-product-1',
    TEST_CATEGORY_SLUG: 'electronics',
  },

  // Experimental features
  experimentalStudio: true,
  experimentalMemoryManagement: true,
  experimentalOriginDependencies: true,

  // Performance and resource management
  numTestsKeptInMemory: 5,
  watchForFileChanges: true,
  
  // Network configuration
  hosts: {
    '*.example.com': '127.0.0.1',
  },

  // User agent override
  userAgent: 'CypressTest/1.0 (E2E Testing)',

  // Global excludes
  excludeSpecPattern: [
    '**/__tests__/**/*',
    '**/node_modules/**/*',
  ],

  // Slow test threshold
  slowTestThreshold: 10000,

  // Default browser
  browser: 'chrome',

  // Include shadow DOM
  includeShadowDom: true,

  // Animation settings (disable for consistent testing)
  animationDistanceThreshold: 20,
  waitForAnimations: true,

  // Keyboard and mouse settings
  scrollBehavior: 'center',
  keystrokeDelay: 0,
  mouseClickDelay: 0,

  // Reporter configuration for CI/CD
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'tests/e2e/cypress/reporter.config.json',
  },
});