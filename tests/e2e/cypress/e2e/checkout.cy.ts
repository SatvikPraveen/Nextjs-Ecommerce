// tests/e2e/cypress/e2e/checkout.cy.ts
//
// This app checks out via Stripe's hosted Checkout page (a redirect to
// checkout.stripe.com), not embedded Stripe Elements -- see
// components/checkout/checkout-form.tsx. That means a real payment can't be
// driven end-to-end from this suite; /api/stripe/create-checkout is
// intercepted globally (see support/e2e.ts) and window.location.assign is
// stubbed (see cy.stubStripeRedirect) so tests can assert the app *attempts*
// the handoff correctly instead of actually leaving the app.
//
// Product slugs below come from prisma/seed.ts.

describe('Cart', () => {
  it('adds a product to the cart and surfaces it in the drawer', () => {
    cy.addToCart('iphone-15-pro');
    cy.get('[data-testid="cart-badge"]').should('contain', '1');

    cy.get('[data-testid="cart-button"]').click();
    cy.get('[data-testid="cart-item"]').should('have.length', 1);

    cy.get('[data-testid="checkout-link"]').click();
    cy.url().should('include', '/checkout');
  });

  it('updates quantity and removes items on the cart page', () => {
    cy.addToCart('iphone-15-pro');
    cy.visit('/cart');

    cy.get('[data-testid="quantity-increase"]').click();
    cy.get('[data-testid="quantity-input"]').should('have.value', '2');

    cy.get('[data-testid="quantity-decrease"]').click();
    cy.get('[data-testid="quantity-input"]').should('have.value', '1');

    cy.get('[data-testid="remove-item"]').click();
    cy.get('[data-testid="cart-item"]').should('not.exist');
    cy.get('[data-testid="empty-cart-message"]').should('be.visible');

    // The badge is driven by a 'cart-updated' event (see components/cart-drawer.tsx)
    // so it should also drop back to zero without needing a reload.
    cy.get('[data-testid="cart-badge"]').should('not.exist');
  });
});

describe('Checkout page', () => {
  beforeEach(() => {
    cy.addToCart('iphone-15-pro');
    cy.addToCart('wireless-headphones');
    cy.visit('/cart');
  });

  it('shows the cart summary before checking out', () => {
    cy.get('[data-testid="cart-item"]').should('have.length', 2);
    cy.get('[data-testid="subtotal"]').should('be.visible');
    cy.get('[data-testid="tax-amount"]').should('be.visible');
    cy.get('[data-testid="total-amount"]').should('be.visible');
  });

  it('requires shipping fields before placing an order', () => {
    cy.get('[data-testid="checkout-button"]').click();
    cy.url().should('include', '/checkout');

    cy.get('[data-testid="place-order"]').click();
    cy.get('[data-testid="checkout-error"]').should(
      'contain',
      'Please fill in all required shipping fields.'
    );
  });

  it('completes guest checkout and hands off to Stripe', () => {
    cy.get('[data-testid="checkout-button"]').click();

    cy.get('[data-testid="checkout-summary-item"]').should('have.length', 2);

    // Switch off the default (first) shipping method to prove the choice
    // reaches the request.
    cy.get('[data-testid="shipping-method-standard"]').should('be.checked');
    cy.get('[data-testid="shipping-method-express"]').click();

    cy.stubStripeRedirect();
    cy.submitGuestCheckout({
      email: 'guest@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    });

    // Once window.location.assign() fires, the browser starts navigating
    // away and the checkout page can be torn down before React gets a
    // chance to paint the "redirecting" alert -- so the request payload
    // (below) is what this test relies on, not that transient UI state.
    cy.get('@createCheckoutSession')
      .its('request.body')
      .should('deep.include', { shippingMethod: 'express' })
      .its('customerInfo')
      .should('deep.include', { email: 'guest@example.com', firstName: 'John' });
  });
});

describe('Checkout page - signed in', () => {
  // A guest cart and a signed-in user's cart are separate records (see
  // getCartSession in server/actions/cart.ts -- there's no merge-on-login),
  // so this logs in first and adds to cart afterwards, unlike the guest
  // tests above.
  it('lets a signed-in customer reuse their saved address', () => {
    cy.login('customer@example.com', 'customer123');
    cy.addToCart('iphone-15-pro');
    cy.visit('/checkout');

    cy.get('[data-testid="saved-address"]')
      .should('be.visible')
      .and('contain', '123 Main St');

    cy.stubStripeRedirect();
    cy.get('[data-testid="place-order"]').click();
    cy.wait('@createCheckoutSession');
  });
});

describe('Orders and confirmation', () => {
  it('lists a signed-in customer\'s orders and links to the detail page', () => {
    cy.login('customer@example.com', 'customer123');
    cy.visit('/orders');

    cy.get('[data-testid="order-list-item"]')
      .should('have.length.greaterThan', 0)
      .first()
      .click();

    cy.get('[data-testid="order-details"]').should('be.visible');
  });

  it('renders the order confirmation page for its owner', () => {
    cy.login('customer@example.com', 'customer123');
    cy.visit('/orders');
    cy.get('[data-testid="order-list-item"]').first().click();

    // Wait for the client-side navigation to actually land before reading
    // the URL back out -- otherwise cy.url() can catch the pre-navigation
    // value.
    cy.url()
      .should('match', /\/orders\/[^/]+$/)
      .then(url => {
        cy.visit(`${url}/success`);
      });

    cy.get('[data-testid="order-confirmation"]').should('be.visible');
    cy.get('[data-testid="order-number"]')
      .invoke('text')
      .should('match', /^ORD-\d+$/);
    cy.get('[data-testid="order-total"]').should('be.visible');
    cy.get('[data-testid="shipping-address"]').should('contain', '123 Main St');
    cy.get('[data-testid="order-items"]')
      .children()
      .should('have.length.greaterThan', 0);
    cy.get('[data-testid="email-confirmation"]').should(
      'contain',
      'customer@example.com'
    );

    cy.get('[data-testid="view-all-orders"]').click();
    cy.url().should('include', '/orders');
  });

  it('keeps a guest off the orders list but does not block the confirmation route', () => {
    cy.login('customer@example.com', 'customer123');
    cy.visit('/orders');
    cy.get('[data-testid="order-list-item"]')
      .first()
      .closest('a')
      .invoke('attr', 'href')
      .as('orderHref');

    cy.get('@orderHref').then(href => {
      cy.clearCookies();

      // A guest can reach the confirmation route itself (no forced sign-in --
      // see the isGuestCheckoutConfirmation carve-out in proxy.ts)...
      cy.visit(`${href}/success`, { failOnStatusCode: false });
      cy.get('[data-testid="order-confirmation"]').should('not.exist');
      cy.contains('Demo Project').should('be.visible');

      // ...but without proof of ownership (session id or login) the order
      // itself is not shown, and the plain orders list still requires login.
      cy.visit('/orders');
      cy.url().should('include', '/auth/signin');
    });
  });
});
