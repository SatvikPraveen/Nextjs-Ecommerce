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
      addToCart(productSlug: string): Chainable<void>;
      clearCart(): Chainable<void>;

      // Checkout Commands
      fillCheckoutForm(data: CheckoutFormData): Chainable<void>;
      submitGuestCheckout(data: CheckoutFormData): Chainable<void>;
      stubStripeRedirect(): Chainable<void>;
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

// Authentication Commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/auth/signin');
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
  cy.login('customer@example.com', 'customer123');
});

// Cart Management Commands
// The product page only ever adds one unit per click (there's no quantity
// selector there -- see components/add-to-cart.tsx's showQuantitySelector,
// which nothing in the app turns on). Use the cart page's +/- buttons if a
// test needs a specific quantity.
Cypress.Commands.add('addToCart', (productSlug: string) => {
  cy.visit(`/products/${productSlug}`);
  // Related products further down the page render their own AddToCart
  // button with the same test id, so this is only unambiguous by DOM
  // order: the main product's button renders before the related list.
  cy.get('[data-testid="add-to-cart-btn"]').first().click();
  cy.get('[data-testid="cart-badge"]').should('exist');
});

Cypress.Commands.add('clearCart', () => {
  cy.clearCookie('cart-session');
});

// Form Filling Commands
// Field ids match components/checkout/checkout-form.tsx.
Cypress.Commands.add('fillCheckoutForm', (data: CheckoutFormData) => {
  cy.get('[data-testid="checkout-email"]').then($el => {
    if (!$el.prop('disabled')) {
      cy.wrap($el).clear().type(data.email);
    }
  });
  cy.get('[data-testid="checkout-first-name"]').clear().type(data.firstName);
  cy.get('[data-testid="checkout-last-name"]').clear().type(data.lastName);
  cy.get('[data-testid="checkout-address"]').clear().type(data.address);
  cy.get('[data-testid="checkout-city"]').clear().type(data.city);
  cy.get('[data-testid="checkout-state"]').select(data.state);
  cy.get('[data-testid="checkout-zip"]').clear().type(data.zip);

  if (data.phone) {
    cy.get('[data-testid="checkout-phone"]').clear().type(data.phone);
  }
});

Cypress.Commands.add('fillFormByTestId', (data: Record<string, string>) => {
  Object.entries(data).forEach(([testId, value]) => {
    cy.getByTestId(testId).clear().type(value);
  });
});

// This app redirects to Stripe's hosted Checkout page instead of embedding
// Stripe Elements (see components/checkout/checkout-form.tsx), so completing
// a real payment isn't something this suite can drive end-to-end, and the
// "Place Order" button's window.location.assign() call would otherwise send
// the browser to a real external domain. `Location.prototype.assign` can't
// be stubbed directly (browsers make it non-configurable), so this
// intercepts the destination instead -- the app's own redirect-confirmation
// UI (checkout-redirecting / stripe-redirect-link) is asserted on before any
// navigation completes.
Cypress.Commands.add('stubStripeRedirect', () => {
  cy.intercept('GET', 'https://checkout.stripe.com/**', {
    statusCode: 200,
    body: '<html><body>Stubbed Stripe Checkout</body></html>',
    headers: { 'content-type': 'text/html' },
  }).as('stripeRedirect');
});

// Fills the guest checkout form and submits it, up to the point where the
// app hands off to Stripe. Assumes /api/stripe/create-checkout is already
// intercepted (see tests/e2e/cypress/support/e2e.ts) and that
// stubStripeRedirect() has already been called.
Cypress.Commands.add('submitGuestCheckout', (data: CheckoutFormData) => {
  cy.fillCheckoutForm(data);
  cy.get('[data-testid="place-order"]').click();
  cy.wait('@createCheckoutSession');
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
