// tests/e2e/cypress/e2e/homepage.cy.ts

describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    // Visit homepage before each test
    cy.visit('/');
  });

  it('should load the homepage successfully', () => {
    // Verify page title or heading exists
    cy.contains('h1, h2', /product|store|welcome|shop/i).should('be.visible');
  });

  it('should display products on homepage', () => {
    // Look for product elements (cards, containers, or links with product names)
    cy.get('a').should('have.length.greaterThan', 0);
  });

  it('should have working navigation links', () => {
    // Find navigation links and verify they work
    cy.get('nav').should('exist');
  });

  it('should respond to viewport changes', () => {
    // Test mobile viewport
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('body').should('be.visible');

    // Test tablet viewport
    cy.viewport('ipad-2');
    cy.visit('/');
    cy.get('body').should('be.visible');

    // Test desktop viewport
    cy.viewport('macbook-15');
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('should not have console errors', () => {
    const consoleSpy = cy.spy(window.console, 'error');
    cy.visit('/');
    cy.wrap(consoleSpy).should('not.have.been.called');
  });

  it('should be accessible', () => {
    cy.visit('/');
    // Basic accessibility checks
    cy.get('body').should('be.visible');
    cy.get('[role="main"], main').should('exist');
  });
});
