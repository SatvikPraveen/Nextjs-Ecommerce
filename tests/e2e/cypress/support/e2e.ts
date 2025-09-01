// tests/e2e/cypress/support/e2e.ts

// Import commands.js using ES2015 syntax:
import './commands';

// Import Cypress plugins
import 'cypress-axe';

// Global configuration and setup
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions from the application
  // This is useful for third-party scripts or non-critical errors
  
  // Don't fail on ResizeObserver errors (common in modern browsers)
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
  
  // Let other errors fail the test
  return true;
});

// Global before hook - runs once before all tests
before(() => {
  // Setup test environment
  cy.log('Setting up test environment');
  
  // Clear any existing data
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Seed database with test data if needed
  if (Cypress.env('SEED_DATABASE')) {
    cy.seedDatabase();
  }
});

// Global beforeEach hook - runs before each test
beforeEach(() => {
  // Mock external services
  cy.mockStripe();
  
  // Mock Stripe script loading
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

  // Mock payment processing endpoints
  cy.intercept('POST', '/api/stripe/create-checkout', {
    statusCode: 200,
    body: { sessionId: 'cs_test_mock_session_id' },
  }).as('createCheckoutSession');

  cy.intercept('POST', '/api/stripe/webhook', {
    statusCode: 200,
    body: { received: true },
  }).as('stripeWebhook');

  // Mock email sending
  cy.intercept('POST', '/api/send-email', {
    statusCode: 200,
    body: { success: true },
  }).as('sendEmail');

  // Mock image uploads
  cy.intercept('POST', '/api/upload', {
    statusCode: 200,
    body: { url: 'https://example.com/test-image.jpg' },
  }).as('uploadImage');

  // Set up common environment variables
  cy.window().then((win) => {
    win.ENV = {
      NODE_ENV: 'test',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock_key',
      NEXT_PUBLIC_APP_URL: Cypress.config().baseUrl,
    };
  });

  // Accept cookies if banner appears
  cy.acceptCookies();
});

// Global afterEach hook - runs after each test
afterEach(() => {
  // Capture screenshot on failure
  if (Cypress.currentTest.state === 'failed') {
    const testName = Cypress.currentTest.title.replace(/\s+/g, '-').toLowerCase();
    cy.screenshot(`failed-${testName}`);
  }

  // Log performance metrics if available
  cy.window().then((win) => {
    if (win.performance && win.performance.getEntriesByType) {
      const navigationEntries = win.performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        cy.log(`Page load time: ${Math.round(nav.loadEventEnd - nav.fetchStart)}ms`);
      }
    }
  });
});

// Global after hook - runs once after all tests
after(() => {
  // Cleanup test environment
  cy.log('Cleaning up test environment');
  
  if (Cypress.env('CLEANUP_DATABASE')) {
    cy.clearDatabase();
  }
});

// Custom Cypress configuration
Cypress.on('window:before:load', (win) => {
  // Mock APIs that might not be available in test environment
  win.navigator.geolocation = {
    getCurrentPosition: cy.stub().callsFake((success) => {
      return success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      });
    }),
  };

  // Mock IntersectionObserver if not available
  if (!win.IntersectionObserver) {
    win.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // Mock ResizeObserver if not available
  if (!win.ResizeObserver) {
    win.ResizeObserver = class ResizeObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

// Add custom viewport sizes for responsive testing
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667); // iPhone 6/7/8
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024); // iPad
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720); // Desktop
});

// Add data attributes helper for better element selection
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('findByTestId', { prevSubject: true }, (subject, testId: string) => {
  return cy.wrap(subject).find(`[data-testid="${testId}"]`);
});

// Add custom wait conditions
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'document');
  cy.document().should('have.property', 'readyState', 'complete');
});

Cypress.Commands.add('waitForReact', () => {
  cy.window().should('have.property', 'React');
});

// Add accessibility testing shortcuts
Cypress.Commands.add('testA11y', (selector?: string) => {
  cy.injectAxe();
  cy.checkA11y(selector, {
    rules: {
      'color-contrast': { enabled: false }, // Disable color contrast for development
    },
  });
});

// Add performance testing helpers
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then((win) => {
    cy.wrap(win.performance.timing.loadEventEnd - win.performance.timing.navigationStart)
      .should('be.lessThan', 3000); // Page should load in less than 3 seconds
  });
});

// Add network simulation
Cypress.Commands.add('simulateSlowNetwork', () => {
  cy.intercept('**/*', (req) => {
    req.reply((res) => {
      // Delay response by 2 seconds to simulate slow network
      return new Promise((resolve) => {
        setTimeout(() => resolve(res.send()), 2000);
      });
    });
  });
});

// Add authentication helpers
Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@example.com', 'admin123');
});

Cypress.Commands.add('loginAsUser', () => {
  cy.login('user@example.com', 'user123');
});

// Add cart helpers
Cypress.Commands.add('clearCart', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('cart');
  });
  cy.reload();
});

// Add form helpers
Cypress.Commands.add('fillFormByTestId', (data: Record<string, string>) => {
  Object.entries(data).forEach(([testId, value]) => {
    cy.getByTestId(testId).clear().type(value);
  });
});

// Add debug helpers
Cypress.Commands.add('debugState', () => {
  cy.window().then((win) => {
    cy.log('Local Storage:', win.localStorage);
    cy.log('Session Storage:', win.sessionStorage);
    cy.log('Cookies:', document.cookie);
  });
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