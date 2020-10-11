

describe("Authentification", () => {

    before(() => {
        const session = require("../fixtures/session.json");
        cy.logout();
        cy.visit(`${session.url}/login`);
    });


    it("Perte d'identifiant", () => {
        cy.contains("J'ai oublié mes identifiants");
        cy.should("have.attr", "href", "/forgotten");
    });

    it("Login obligatoire", () => {
        cy.get("form");
        cy.contains("Se connecter").should('be.disabled');
        cy.get("[data-cy='username']").type("t");
        cy.focused().clear()
        cy.get("form");
        cy.contains("Ce champs est obligatoire");
        cy.contains("Se connecter").should('be.disabled');
    });

    it("Mot de passe obligatoire", () => {
        cy.get("[data-cy='username']").type("test");
        cy.get("[data-cy='password']").type("t");
        cy.focused().clear()
        cy.get("form");
        cy.contains("Ce champs est obligatoire");
        cy.contains("Se connecter").should('be.disabled');
    });

    it("Erreur d'authentification", () => {
        cy.get("[data-cy='password']").type("testpassword{enter}");
        cy.contains("Une erreur s'est produite");
        cy.contains("Mauvais identifiant ou mot de passe");
        cy.contains("OK").click();
    });


    it("Authent success", () => {
        const session = require("../fixtures/session.json");
        cy.get("[data-cy='username']").type(session.user);
        cy.get("[data-cy='password']").type(session.pwd);
        cy.contains("Se connecter").click();
        cy.url().should("eq", session.url);
    });
});