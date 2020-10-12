


describe("Menu principale de l'application", () => {

    beforeEach(() => {
        cy.login();
    });

    it("Affichage 1920x1080", () => {
        cy.viewport(1920, 1080);
        cy.visit(`${session.url}`);
        cy.get("[data-cy='menu']").should('exist');
        cy.get(".menu").contains("Citations");
        cy.get(".menu").contains("Photos");
        cy.get(".menu").contains("Forum");
        cy.get(".menu").contains("Agenda");
        cy.get(".menu").contains("Voya G");
        cy.get(".menu").contains("A.G.P.A.");
        cy.get(".menu").contains("Config");

        // TODO: check menu actions
    });

    it("Affichage 800x600", () => {
        cy.viewport(800, 600);
        cy.get("[data-cy='menu']").should('not.exist');
        cy.get("[data-cy='menuButton']").should('exist').click();
        cy.get("[data-cy='menuDrawer']").should('exist');

        // TODO: check menu actions
    });
})
