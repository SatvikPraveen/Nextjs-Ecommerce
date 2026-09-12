// tests/e2e/cypress/e2e/navigation.cy.ts

describe('Navigation E2E Tests', () => {
  it('should navigate between pages', () => {
    // Start at homepage
    cy.visit('/');

    // Click a products/search link. Query and click in one chain (rather
    // than capturing a jQuery reference and clicking it separately) so
    // Cypress re-finds the live element right before clicking -- the
    // homepage briefly remounts its header on load (see the hydration-
    // mismatch note in support/e2e.ts), which can detach an earlier
    // snapshot out from under a two-step click.
    cy.get('a[href*="/products"], a[href*="/search"]').first().click();

    // Verify we navigated somewhere
    cy.url().should('not.equal', `${Cypress.config('baseUrl')}/`);
  });

  it('should have a functional header', () => {
    cy.visit('/');

    // Check for header element
    cy.get('header, [role="banner"]').should('exist');
  });

  it('should have a functional footer', () => {
    cy.visit('/');

    // Scroll to bottom to load footer if lazy-loaded
    cy.scrollTo('bottom');

    // Check for footer element
    cy.get('footer, [role="contentinfo"]').should('exist');
  });

  it('should handle 404 pages gracefully', () => {
    cy.visit('/nonexistent-page', { failOnStatusCode: false });

    // Should still have main content
    cy.get('body').should('be.visible');
  });
});
