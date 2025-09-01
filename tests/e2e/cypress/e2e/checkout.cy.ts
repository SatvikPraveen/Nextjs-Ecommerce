// tests/e2e/cypress/e2e/checkout.cy.ts

describe('E-commerce Checkout Flow', () => {
  beforeEach(() => {
    // Mock Stripe
    cy.window().then((win) => {
      win.Stripe = cy.stub().returns({
        redirectToCheckout: cy.stub().resolves(),
        elements: cy.stub().returns({
          create: cy.stub().returns({
            mount: cy.stub(),
            on: cy.stub(),
          }),
        }),
      });
    });

    // Visit homepage
    cy.visit('/');
  });

  describe('Product Selection and Cart', () => {
    it('should add product to cart and navigate to checkout', () => {
      // Navigate to a product
      cy.get('[data-testid="product-card"]').first().click();
      
      // Add to cart
      cy.get('[data-testid="add-to-cart-btn"]').click();
      
      // Verify cart notification or badge
      cy.get('[data-testid="cart-badge"]').should('contain', '1');
      
      // Open cart
      cy.get('[data-testid="cart-button"]').click();
      
      // Verify product in cart
      cy.get('[data-testid="cart-item"]').should('have.length', 1);
      
      // Proceed to checkout
      cy.get('[data-testid="checkout-button"]').click();
      
      // Should redirect to checkout page
      cy.url().should('include', '/cart');
    });

    it('should update cart quantities', () => {
      // Add product to cart
      cy.get('[data-testid="product-card"]').first().click();
      cy.get('[data-testid="add-to-cart-btn"]').click();
      
      // Open cart
      cy.get('[data-testid="cart-button"]').click();
      
      // Increase quantity
      cy.get('[data-testid="quantity-increase"]').click();
      cy.get('[data-testid="quantity-input"]').should('have.value', '2');
      
      // Decrease quantity
      cy.get('[data-testid="quantity-decrease"]').click();
      cy.get('[data-testid="quantity-input"]').should('have.value', '1');
      
      // Remove item
      cy.get('[data-testid="remove-item"]').click();
      cy.get('[data-testid="cart-item"]').should('not.exist');
      cy.get('[data-testid="empty-cart-message"]').should('be.visible');
    });
  });

  describe('Checkout Process', () => {
    beforeEach(() => {
      // Setup cart with items
      cy.addToCart('test-product-1', 2);
      cy.addToCart('test-product-2', 1);
      cy.visit('/cart');
    });

    it('should display cart summary correctly', () => {
      // Verify cart items
      cy.get('[data-testid="cart-item"]').should('have.length', 2);
      
      // Verify subtotal
      cy.get('[data-testid="subtotal"]').should('be.visible');
      
      // Verify tax calculation
      cy.get('[data-testid="tax-amount"]').should('be.visible');
      
      // Verify total
      cy.get('[data-testid="total-amount"]').should('be.visible');
    });

    it('should handle guest checkout', () => {
      // Proceed as guest
      cy.get('[data-testid="guest-checkout"]').click();
      
      // Fill shipping information
      cy.get('[data-testid="email"]').type('test@example.com');
      cy.get('[data-testid="first-name"]').type('John');
      cy.get('[data-testid="last-name"]').type('Doe');
      cy.get('[data-testid="address"]').type('123 Main St');
      cy.get('[data-testid="city"]').type('New York');
      cy.get('[data-testid="state"]').select('NY');
      cy.get('[data-testid="zip"]').type('10001');
      
      // Continue to payment
      cy.get('[data-testid="continue-to-payment"]').click();
      
      // Verify we're on payment step
      cy.get('[data-testid="payment-form"]').should('be.visible');
    });

    it('should handle registered user checkout', () => {
      // Login first
      cy.login('user@example.com', 'password123');
      cy.visit('/cart');
      
      // Proceed to checkout (should skip guest form)
      cy.get('[data-testid="checkout-button"]').click();
      
      // Should show saved addresses
      cy.get('[data-testid="saved-address"]').should('be.visible');
      
      // Select default address
      cy.get('[data-testid="use-default-address"]').click();
      
      // Continue to payment
      cy.get('[data-testid="continue-to-payment"]').click();
      
      // Verify payment form
      cy.get('[data-testid="payment-form"]').should('be.visible');
    });
  });

  describe('Payment Processing', () => {
    beforeEach(() => {
      cy.addToCart('test-product-1', 1);
      cy.visit('/cart');
      cy.get('[data-testid="guest-checkout"]').click();
      
      // Fill required fields
      cy.fillCheckoutForm({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
      });
      
      cy.get('[data-testid="continue-to-payment"]').click();
    });

    it('should show payment form', () => {
      // Verify Stripe elements are loaded
      cy.get('[data-testid="card-element"]').should('be.visible');
      cy.get('[data-testid="place-order"]').should('be.disabled');
    });

    it('should validate payment form', () => {
      // Try to submit without card details
      cy.get('[data-testid="place-order"]').click();
      
      // Should show validation error
      cy.get('[data-testid="payment-error"]').should('contain', 'required');
    });

    it('should process successful payment', () => {
      // Mock successful Stripe response
      cy.window().then((win) => {
        win.Stripe().confirmCardPayment = cy.stub().resolves({
          paymentIntent: {
            status: 'succeeded',
          },
        });
      });

      // Fill card details (these are test inputs)
      cy.get('[data-testid="card-number"]').type('4242424242424242');
      cy.get('[data-testid="card-expiry"]').type('12/25');
      cy.get('[data-testid="card-cvc"]').type('123');
      
      // Place order
      cy.get('[data-testid="place-order"]').click();
      
      // Should redirect to success page
      cy.url().should('include', '/orders/');
      cy.get('[data-testid="order-confirmation"]').should('be.visible');
      cy.get('[data-testid="order-number"]').should('be.visible');
    });

    it('should handle payment failure', () => {
      // Mock failed Stripe response
      cy.window().then((win) => {
        win.Stripe().confirmCardPayment = cy.stub().resolves({
          error: {
            message: 'Your card was declined.',
          },
        });
      });

      // Fill card details
      cy.get('[data-testid="card-number"]').type('4000000000000002');
      cy.get('[data-testid="card-expiry"]').type('12/25');
      cy.get('[data-testid="card-cvc"]').type('123');
      
      // Place order
      cy.get('[data-testid="place-order"]').click();
      
      // Should show error message
      cy.get('[data-testid="payment-error"]').should('contain', 'declined');
      
      // Should stay on payment page
      cy.url().should('include', '/cart');
    });
  });

  describe('Order Confirmation', () => {
    it('should display order confirmation details', () => {
      // Complete a successful checkout
      cy.completeCheckout({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        cardNumber: '4242424242424242',
        cardExpiry: '12/25',
        cardCvc: '123',
      });
      
      // Verify order confirmation page
      cy.get('[data-testid="order-confirmation"]').should('be.visible');
      cy.get('[data-testid="order-number"]').should('match', /^ORD-\d+$/);
      cy.get('[data-testid="order-total"]').should('be.visible');
      cy.get('[data-testid="shipping-address"]').should('contain', '123 Main St');
      cy.get('[data-testid="order-items"]').should('have.length.greaterThan', 0);
      
      // Verify email confirmation message
      cy.get('[data-testid="email-confirmation"]').should('contain', 'test@example.com');
    });

    it('should allow order tracking for registered users', () => {
      // Login and complete checkout
      cy.login('user@example.com', 'password123');
      cy.completeCheckout({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        cardNumber: '4242424242424242',
        cardExpiry: '12/25',
        cardCvc: '123',
      });
      
      // Visit orders page
      cy.get('[data-testid="view-all-orders"]').click();
      cy.url().should('include', '/orders');
      
      // Verify order appears in list
      cy.get('[data-testid="order-list-item"]').should('have.length.greaterThan', 0);
      
      // Click on order to view details
      cy.get('[data-testid="order-list-item"]').first().click();
      cy.get('[data-testid="order-details"]').should('be.visible');
    });
  });

  describe('Cart Persistence', () => {
    it('should persist cart across page refreshes', () => {
      // Add items to cart
      cy.addToCart('test-product-1', 2);
      
      // Refresh page
      cy.reload();
      
      // Verify cart still has items
      cy.get('[data-testid="cart-badge"]').should('contain', '2');
    });

    it('should clear cart after successful checkout', () => {
      // Add items and complete checkout
      cy.addToCart('test-product-1', 1);
      cy.completeCheckout({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        cardNumber: '4242424242424242',
        cardExpiry: '12/25',
        cardCvc: '123',
      });
      
      // Verify cart is empty
      cy.visit('/');
      cy.get('[data-testid="cart-badge"]').should('not.exist');
    });
  });

  describe('Responsive Design', () => {
    const viewports = ['iphone-6', 'ipad-2', 'macbook-15'] as const;
    
    viewports.forEach((viewport) => {
      it(`should work correctly on ${viewport}`, () => {
        cy.viewport(viewport);
        
        // Add product to cart
        cy.addToCart('test-product-1', 1);
        cy.visit('/cart');
        
        // Verify checkout button is visible and clickable
        cy.get('[data-testid="checkout-button"]').should('be.visible').click();
        
        // Fill form (adjust for mobile if needed)
        cy.fillCheckoutForm({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
        });
        
        // Verify form works on different screen sizes
        cy.get('[data-testid="continue-to-payment"]').should('be.visible');
      });
    });
  });
});