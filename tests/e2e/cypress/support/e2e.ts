// tests/e2e/cypress/support/e2e.ts

// Import commands.js using ES2015 syntax:
import './commands';

// Import Cypress plugins
import 'cypress-axe';

// Global configuration and setup
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail on ResizeObserver errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }

  // Don't fail on Stripe errors during testing
  if (err.message.includes('Stripe')) {
    return false;
  }

  // Don't fail on network errors during development
  if (err.message.includes('Loading chunk') || err.message.includes('fetch')) {
    return false;
  }

  return true;
});

// Global before hook - runs once before all tests
before(() => {
  cy.log('Setting up test environment');

  cy.clearLocalStorage();
  cy.clearCookies();

  if (Cypress.env('SEED_DATABASE')) {
    cy.seedDatabase();
  }
});

// Global beforeEach hook - runs before each test
beforeEach(() => {
  cy.mockStripe();

  cy.intercept('GET', 'https://js.stripe.com/v3/', {
    statusCode: 200,
    body: `
      window.Stripe = function() {
        return {
          elements: function() {
            return {
              create: function() {
                return {
                  mount: function() {},
                  on: function() {},
                  update: function() {}
                };
              }
            };
          },
          confirmCardPayment: function() {
            return Promise.resolve({
              paymentIntent: { status: 'succeeded' }
            });
          }
        };
      };
    `,
    headers: { 'content-type': 'application/javascript' },
  });

  cy.intercept('POST', '/api/stripe/create-checkout', {
    statusCode: 200,
    body: { sessionId: 'cs_test_mock_session_id' },
  }).as('createCheckoutSession');

  cy.intercept('POST', '/api/stripe/webhook', {
    statusCode: 200,
    body: { received: true },
  }).as('stripeWebhook');

  cy.intercept('POST', '/api/send-email', {
    statusCode: 200,
    body: { success: true },
  }).as('sendEmail');

  cy.intercept('POST', '/api/upload', {
    statusCode: 200,
    body: { url: 'https://example.com/test-image.jpg' },
  }).as('uploadImage');

  cy.window().then(win => {
    win.ENV = {
      NODE_ENV: 'test',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock_key',
      NEXT_PUBLIC_APP_URL: Cypress.config().baseUrl,
    };
  });
});

// Global afterEach hook - runs after each test
afterEach(() => {
  // Skip screenshot logic to avoid API issues
  cy.window().then(win => {
    if (win.performance && win.performance.getEntriesByType) {
      const navigationEntries = win.performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        cy.log(
          `Page load time: ${Math.round(nav.loadEventEnd - nav.fetchStart)}ms`
        );
      }
    }
  });
});

// Global after hook - runs once after all tests
after(() => {
  cy.log('Cleaning up test environment');

  if (Cypress.env('CLEANUP_DATABASE')) {
    cy.clearDatabase();
  }
});

// Custom Cypress configuration
Cypress.on('window:before:load', win => {
  // @ts-ignore - Override geolocation for testing
  win.navigator.geolocation = {
    getCurrentPosition: cy.stub().callsFake(success => {
      return success({
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });
    }),
  };

  // @ts-ignore - Mock IntersectionObserver if not available
  if (!win.IntersectionObserver) {
    // @ts-ignore
    win.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // @ts-ignore - Mock ResizeObserver if not available
  if (!win.ResizeObserver) {
    // @ts-ignore
    win.ResizeObserver = class ResizeObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

// Configuration for different environments
const config = {
  development: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },
  staging: {
    baseUrl: 'https://staging.example.com',
    timeout: 15000,
  },
  production: {
    baseUrl: 'https://example.com',
    timeout: 20000,
  },
};

const environment = Cypress.env('ENVIRONMENT') || 'development';
const envConfig = config[environment as keyof typeof config];

if (envConfig) {
  Cypress.config('baseUrl', envConfig.baseUrl);
  Cypress.config('defaultCommandTimeout', envConfig.timeout);
}
