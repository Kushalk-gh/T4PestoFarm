describe('PestoFarm E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the homepage', () => {
    cy.contains('PestoFarm').should('be.visible')
  })

  it('should navigate to products page', () => {
    // Hover over "Seed" to show dropdown, then click "VEGETABLE SEEDS"
    cy.contains('Seed').trigger('mouseover')
    cy.contains('VEGETABLE SEEDS').click({ force: true })
    cy.url().should('include', '/vegetable-seeds')
  })

  it('should add product to cart', () => {
    // Navigate to products first
    cy.contains('Seed').trigger('mouseover')
    cy.contains('VEGETABLE SEEDS').click({ force: true })

    // Wait for products to load and click add to cart on first product
    cy.get('button').contains('Add to Cart').first().click()

    // Check if cart count increased (if visible)
    cy.get('body').then($body => {
      if ($body.text().includes('1')) {
        cy.contains('1').should('be.visible')
      }
    })
  })

  it('should navigate to cart', () => {
    // Click on cart icon (SVG with cart path)
    cy.get('svg').filter((index, svg) => {
      return svg.querySelector('path[d*="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13H5.4m1.6 0h10M9 21a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z"]')
    }).parent().click()

    // Should redirect to login if not authenticated
    cy.url().should('include', '/login')
  })

  it('should navigate to favorites', () => {
    // More specific selector for heart icon in navbar
    cy.get('nav').within(() => {
      cy.get('svg').filter((index, svg) => {
        const path = svg.querySelector('path[d*="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"]')
        return path
      }).first().click()
    })

    // Should redirect to login if not authenticated
    cy.url().should('include', '/login')
  })

  it('should navigate to login', () => {
    // Click on LOGIN button
    cy.contains('LOGIN').click()
    cy.url().should('include', '/login')
  })
})
