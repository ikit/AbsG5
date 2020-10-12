

describe("Renouvellement de mot de passe", () => {

    it("Email obligatoire", () => {
        const session = require("../fixtures/session.json");
        cy.visit(`${session.url}/forgotten`);
        cy.get("[data-cy='forgotten-button']").should('be.disabled');
        cy.get("[data-cy='forgotten-email']").type("t").clear();
        cy.contains("L'e-mail est obligatoire");
    });

    it("L'email doit être valide", () => {
        cy.get("[data-cy='forgotten-email']").clear().type("toto");
        cy.contains("Cette adresse email n'est pas valide");
    });

    it("L'email doit exister", () => {
        cy.get("[data-cy='forgotten-email']").clear().type("toto@absg.fr");
        cy.get("[data-cy='forgotten-button']").should('not.be.disabled').click();
        cy.contains("Email inconnu");
        cy.contains("OK").click();
    });

    it("Merci !", () => {
        cy.get("[data-cy='forgotten-email']").clear().type("zaffa@absg.fr");
        cy.get("[data-cy='forgotten-button']").click();
        cy.contains("Merci");
        cy.contains("Pensez à regarder dans vos SPAMS");
    });
});
