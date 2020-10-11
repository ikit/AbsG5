

describe("Calendrier", () => {

    before(() => {
        cy.login();
    });

    it("Affichage 1920x1080", () => {
        cy.viewport(1920, 1080);
        cy.get("[data-cy='calendar']").should('exist');

        // TODO: check menu actions
    });

    it("Affichage 800x600", () => {
        cy.viewport(800, 600);
        cy.get("[data-cy='calendar']").should('exist');
        cy.get("[data-cy='menuButton']").should('exist').click();
        cy.get("[data-cy='menuDrawer']").should('exist');

        // TODO: check menu actions
    });
})
