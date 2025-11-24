// tests/e2e/cypress/support/commands.ts

/// <reference types="cypress" />

declare global {
  interface Window {
    Stripe: any;
    ENV: any;
  }

  namespace Cypress {
    interface Chainable {
      // Core Commands
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      loginAsUser(): Chainable<void>;

      // Cart Commands
      addToCart(productId: string, quantity?: number): Chainable<void>;
      clearCart(): Chainable<void>;

      // Checkout Commands
      fillCheckoutForm(data: CheckoutFormData): Chainable<void>;
      completeCheckout(data: CompleteCheckoutData): Chainable<void>;
      fillFormByTestId(data: Record<string, string>): Chainable<void>;

      // Database Commands
      seedDatabase(): Chainable<void>;
      clearDatabase(): Chainable<void>;

      // Stripe Commands
      mockStripe(): Chainable<void>;
      waitForStripe(): Chainable<void>;

      // Utility Commands
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      findByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      // Viewport Commands
      setMobileViewport(): Chainable<void>;
      setTabletViewport(): Chainable<void>;
      setDesktopViewport(): Chainable<void>;

      // Wait Commands
      waitForPageLoad(): Chainable<void>;
      waitForReact(): Chainable<void>;

      // Accessibility Commands
      testA11y(selector?: string): Chainable<void>;

      // Performance Commands
      measurePageLoad(): Chainable<void>;
      simulateSlowNetwork(): Chainable<void>;

      // Debug Commands
      debugState(): Chainable<void>;
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

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@example.com', 'admin123');
});

Cypress.Commands.add('loginAsUser', () => {
  cy.login('user@example.com', 'user123');
});

// Cart Management Commands
Cypress.Commands.add('addToCart', (productId: string, quantity: number = 1) => {
  cy.visit(`/products/${productId}`);

  if (quantity > 1) {
    cy.get('[data-testid="quantity-selector"]')
      .clear()
      .type(quantity.toString());
  }

  cy.get('[data-testid="add-to-cart-btn"]').click();
  cy.get('[data-testid="cart-badge"]').should('exist');
});

Cypress.Commands.add('clearCart', () => {
  cy.window().then(win => {
    win.localStorage.removeItem('cart');
  });
  cy.reload();
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

Cypress.Commands.add('fillFormByTestId', (data: Record<string, string>) => {
  Object.entries(data).forEach(([testId, value]) => {
    cy.getByTestId(testId).clear().type(value);
  });
});

// Complete Checkout Flow
Cypress.Commands.add('completeCheckout', (data: CompleteCheckoutData) => {
  cy.visit('/cart');
  cy.get('[data-testid="guest-checkout"]').click();
  cy.fillCheckoutForm(data);
  cy.get('[data-testid="continue-to-payment"]').click();
  cy.waitForStripe();

  cy.get('[data-testid="card-number"]').type(data.cardNumber);
  cy.get('[data-testid="card-expiry"]').type(data.cardExpiry);
  cy.get('[data-testid="card-cvc"]').type(data.cardCvc);

  cy.window().then(win => {
    if (win.Stripe) {
      win.Stripe().confirmCardPayment = cy.stub().resolves({
        paymentIntent: {
          status: 'succeeded',
          id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
        },
      });
    }
  });

  cy.get('[data-testid="place-order"]').click();
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
  cy.window().then(win => {
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
  cy.wait(1000);
});

// Utility Commands
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add(
  'findByTestId',
  { prevSubject: true },
  (subject: JQuery<HTMLElement>, testId: string) => {
    return cy.wrap(subject).find(`[data-testid="${testId}"]`);
  }
);

// Viewport Commands
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667);
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024);
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720);
});

// Wait Commands
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'document');
  cy.document().should('have.property', 'readyState', 'complete');
});

Cypress.Commands.add('waitForReact', () => {
  cy.window().should('have.property', 'React');
});

// Accessibility Commands
Cypress.Commands.add('testA11y', (selector?: string) => {
  const target = selector || null;
  // @ts-ignore - injectAxe is added by cypress-axe plugin
  cy.injectAxe();
  // @ts-ignore - checkA11y is added by cypress-axe plugin
  cy.checkA11y(target, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });
});

// Performance Commands
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then(win => {
    const timing = win.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    cy.wrap(loadTime).should('be.lessThan', 3000);
  });
});

Cypress.Commands.add('simulateSlowNetwork', () => {
  cy.intercept('**/*', req => {
    req.reply(res => {
      return new Promise(resolve => {
        setTimeout(() => resolve(res.send()), 2000);
      });
    });
  });
});

// Debug Commands
Cypress.Commands.add('debugState', () => {
  cy.window().then(win => {
    cy.log('Local Storage:', JSON.stringify(win.localStorage));
    cy.log('Session Storage:', JSON.stringify(win.sessionStorage));
    cy.log('Cookies:', document.cookie);
  });
});

export {};
