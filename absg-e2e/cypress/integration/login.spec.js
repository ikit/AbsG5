describe("Authentification", () => {

    it("Perte d'identifiant", () => {
        const session = require("../fixtures/session.json");
        cy.visit(`${session.url}/login`);
        cy.contains("J'ai oublié mes identifiants");
        cy.should("have.attr", "href", "/forgotten");
    });

    it("Login obligatoire", () => {
        cy.get("form");
        cy.contains("Se connecter").should('be.disabled');
        cy.get("[data-cy='username']").type("t").clear();
        cy.contains("Ce champs est obligatoire");
        cy.contains("Se connecter").should('be.disabled');
    });

    it("Mot de passe obligatoire", () => {
        cy.get("[data-cy='username']").clear().type("test");
        cy.get("[data-cy='password']").type("t").clear();
        cy.contains("Ce champs est obligatoire");
        cy.contains("Se connecter").should('be.disabled');
    });

    it("Erreur d'authentification", () => {
        const session = require("../fixtures/session.json");
        cy.get("[data-cy='password']").clear().type("testpassword");
        cy.contains("Se connecter").click();
        cy.contains("Une erreur s'est produite");
        cy.contains("Mauvais identifiant");
        cy.contains("OK").click();
        cy.get("[data-cy='username']").clear().type(session.user);
        cy.contains("Se connecter").click();
        cy.contains("Mauvais mot de passe");
        cy.contains("OK").click();
    });


    it("Authent success", () => {
        const session = require("../fixtures/session.json");
        cy.get("[data-cy='username']").clear().type(session.user);
        cy.get("[data-cy='password']").clear().type(session.pwd);
        cy.contains("Se connecter").click();
        cy.url().should("eq", `${session.url}/`);
    });
});
