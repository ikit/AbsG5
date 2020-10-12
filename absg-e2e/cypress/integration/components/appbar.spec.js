


describe("Barre principale de l'application", () => {

    beforeEach(() => {
        cy.login();
    });

    it("Affichage 1920x1080", () => {
        const session = require("../../fixtures/session.json");
        cy.viewport(1920, 1080);
        cy.visit(`${session.url}`);
        cy.get("header").should('exist');
        cy.get("[data-cy='title']").should('exist');
        cy.get("[data-cy='menuButton']").should('not.exist');
        cy.get("[data-cy='citation']").should('exist');
        cy.get("[data-cy='notifications']").should('exist');
        cy.get("[data-cy='online']").should('exist');
        cy.get("[data-cy='user']").should('exist');
    });

    it("Affichage 800x600", () => {
        cy.viewport(800, 600);
        cy.get("header").should('exist');
        cy.get("[data-cy='title']").should('not.exist');
        cy.get("[data-cy='menuButton']").should('exist');
        cy.get("[data-cy='citation']").should('not.exist');;
        cy.get("[data-cy='notifications']").should('exist');
        cy.get("[data-cy='online']").should('exist');
        cy.get("[data-cy='user']").should('exist');
    });
})
