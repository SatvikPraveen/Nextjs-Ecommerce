// tests/e2e/cypress/support/commands.ts

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      addToCart(productId: string, quantity?: number): Chainable<void>;
      fillCheckoutForm(data: CheckoutFormData): Chainable<void>;
      completeCheckout(data: CompleteCheckoutData): Chainable<void>;
      seedDatabase(): Chainable<void>;
      clearDatabase(): Chainable<void>;
      mockStripe(): Chainable<void>;
      waitForStripe(): Chainable<void>;
    }
  }
}

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
}

interface CompleteCheckoutData extends CheckoutFormData {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

// Authentication Commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/api/auth/signin');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/auth/signin');
    },
    {
      validate: () => {
        cy.request('/api/auth/session').then(({ body }) => {
          expect(body).to.have.property('user');
        });
      },
    }
  );
});

Cypress.Commands.add('logout', () => {
  cy.request('POST', '/api/auth/signout');
});

// Cart Management Commands
Cypress.Commands.add('addToCart', (productId: string, quantity: number = 1) => {
  // Method 1: Via UI (more realistic)
  cy.visit(`/products/${productId}`);
  
  // Set quantity if different from 1
  if (quantity > 1) {
    cy.get('[data-testid="quantity-selector"]').clear().type(quantity.toString());
  }
  
  cy.get('[data-testid="add-to-cart-btn"]').click();
  
  // Wait for cart to update
  cy.get('[data-testid="cart-badge"]').should('exist');
  
  // Alternative Method 2: Via API (faster for setup)
  // cy.request('POST', '/api/cart/add', {
  //   productId,
  //   quantity,
  // });
});

// Form Filling Commands
Cypress.Commands.add('fillCheckoutForm', (data: CheckoutFormData) => {
  cy.get('[data-testid="email"]').clear().type(data.email);
  cy.get('[data-testid="first-name"]').clear().type(data.firstName);
  cy.get('[data-testid="last-name"]').clear().type(data.lastName);
  cy.get('[data-testid="address"]').clear().type(data.address);
  cy.get('[data-testid="city"]').clear().type(data.city);
  cy.get('[data-testid="state"]').select(data.state);
  cy.get('[data-testid="zip"]').clear().type(data.zip);
  
  if (data.phone) {
    cy.get('[data-testid="phone"]').clear().type(data.phone);
  }
});

// Complete Checkout Flow
Cypress.Commands.add('completeCheckout', (data: CompleteCheckoutData) => {
  cy.visit('/cart');
  
  // Start checkout
  cy.get('[data-testid="guest-checkout"]').click();
  
  // Fill shipping form
  cy.fillCheckoutForm(data);
  cy.get('[data-testid="continue-to-payment"]').click();
  
  // Wait for Stripe to load
  cy.waitForStripe();
  
  // Fill payment form
  cy.get('[data-testid="card-number"]').type(data.cardNumber);
  cy.get('[data-testid="card-expiry"]').type(data.cardExpiry);
  cy.get('[data-testid="card-cvc"]').type(data.cardCvc);
  
  // Mock successful payment
  cy.window().then((win) => {
    if (win.Stripe) {
      win.Stripe().confirmCardPayment = cy.stub().resolves({
        paymentIntent: {
          status: 'succeeded',
          id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
        },
      });
    }
  });
  
  // Submit order
  cy.get('[data-testid="place-order"]').click();
  
  // Wait for redirect to confirmation
  cy.url().should('include', '/orders/', { timeout: 10000 });
});

// Database Commands
Cypress.Commands.add('seedDatabase', () => {
  cy.exec('npm run db:seed');
});

Cypress.Commands.add('clearDatabase', () => {
  cy.exec('npm run db:reset');
});

// Stripe Mocking Commands
Cypress.Commands.add('mockStripe', () => {
  cy.window().then((win) => {
    // Mock Stripe global
    win.Stripe = cy.stub().returns({
      elements: cy.stub().returns({
        create: cy.stub().returns({
          mount: cy.stub(),
          unmount: cy.stub(),
          on: cy.stub(),
          update: cy.stub(),
        }),
      }),
      confirmCardPayment: cy.stub().resolves({
        paymentIntent: {
          status: 'succeeded',
          id: 'pi_test_success',
        },
      }),
      createPaymentMethod: cy.stub().resolves({
        paymentMethod: {
          id: 'pm_test_success',
        },
      }),
    });
  });
});

Cypress.Commands.add('waitForStripe', () => {
  cy.window().its('Stripe').should('exist');
  cy.get('[data-testid="card-element"]').should('be.visible');
  
  // Wait a bit for Stripe Elements to fully initialize
  cy.wait(1000);
});

// Custom Assertions
Cypress.Commands.add('shouldHaveValidPrice', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should(($el) => {
    const text = $el.text();
    expect(text).to.match(/^\$\d+(\.\d{2})?$/);
  });
});

// Utility Commands
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Wait for API calls
Cypress.Commands.add('waitForApi', (alias: string, timeout: number = 5000) => {
  cy.wait(alias, { timeout });
});

// Custom drag and drop for sorting
Cypress.Commands.add('dragAndDrop', (dragSelector: string, dropSelector: string) => {
  cy.get(dragSelector).trigger('mousedown', { which: 1 });
  cy.get(dropSelector).trigger('mousemove').trigger('mouseup');
});

// Screenshot with automatic naming
Cypress.Commands.add('screenshotWithName', (name?: string) => {
  const testName = name || Cypress.currentTest.title.replace(/\s+/g, '-').toLowerCase();
  cy.screenshot(testName);
});

// Local Storage manipulation
Cypress.Commands.add('setLocalStorage', (key: string, value: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

Cypress.Commands.add('clearLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

// Cookie management
Cypress.Commands.add('acceptCookies', () => {
  cy.get('[data-testid="cookie-banner"]').then(($banner) => {
    if ($banner.length > 0) {
      cy.get('[data-testid="accept-cookies"]').click();
    }
  });
});

// Mobile-specific commands
Cypress.Commands.add('swipeLeft', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).trigger('touchstart', { touches: [{ clientX: 300, clientY: 100 }] });
  cy.wrap(subject).trigger('touchmove', { touches: [{ clientX: 100, clientY: 100 }] });
  cy.wrap(subject).trigger('touchend');
});

Cypress.Commands.add('swipeRight', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] });
  cy.wrap(subject).trigger('touchmove', { touches: [{ clientX: 300, clientY: 100 }] });
  cy.wrap(subject).trigger('touchend');
});

// Performance monitoring
Cypress.Commands.add('measurePerformance', (name: string) => {
  cy.window().then((win) => {
    win.performance.mark(`${name}-start`);
  });
  
  return {
    end: () => {
      cy.window().then((win) => {
        win.performance.mark(`${name}-end`);
        win.performance.measure(name, `${name}-start`, `${name}-end`);
        
        const measure = win.performance.getEntriesByName(name)[0];
        cy.log(`Performance: ${name} took ${measure.duration}ms`);
      });
    },
  };
});

// A11y testing helper
Cypress.Commands.add('checkA11y', (selector?: string) => {
  const target = selector || null;
  
  cy.injectAxe();
  cy.checkA11y(target, {
    rules: {
      'color-contrast': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'keyboard-navigation': { enabled: true },
    },
  });
});

// Network request interception helpers
Cypress.Commands.add('interceptApi', (method: string, url: string, alias: string) => {
  cy.intercept(method, url).as(alias);
});

Cypress.Commands.add('mockApiResponse', (method: string, url: string, response: any, alias: string) => {
  cy.intercept(method, url, response).as(alias);
});

export {};