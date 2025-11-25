// tests/e2e/cypress/e2e/navigation.cy.ts

describe('Navigation E2E Tests', () => {
  it('should navigate between pages', () => {
    // Start at homepage
    cy.visit('/');

    // Try to find and click a products link
    cy.get('a').then($links => {
      const productLinks = $links
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return href.includes('/products') || href.includes('/search');
        })
        .first();

      if (productLinks.length > 0) {
        cy.wrap(productLinks).click();
        // Verify we navigated somewhere
        cy.url().should('not.equal', Cypress.env('baseUrl') + '/');
      }
    });
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
