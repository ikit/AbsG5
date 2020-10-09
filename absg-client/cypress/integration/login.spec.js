
beforeEach(() => {
    cy.visit("localhost:8080/login");
});

describe("Authentification", () => {

    it("Perte d'identifiant", () => {
        cy.contains("J'ai oublié mes identifiants");
        cy.should("have.attr", "href", "/forgotten");
    });

    it("Login obligatoire", () => {
        cy.get("form");
        cy.contains("Se connecter").should('be.disabled');
        cy.get("[data-cy='username']").type("test");
        cy.focused().clear()
        cy.get("form");
        cy.contains("Ce champs est obligatoire");
        cy.contains("Se connecter").should('be.disabled');
    });

    it("Mot de passe obligatoire", () => {
        cy.get("[data-cy='username']").type("test");
        cy.get("[data-cy='password']").type("testpassword");
        cy.focused().clear()
        cy.get("form");
        cy.contains("Ce champs est obligatoire");
        cy.contains("Se connecter").should('be.disabled');
    });

    it("Erreur d'authentification", () => {
        cy.get("[data-cy='username']").type("test");
        cy.get("[data-cy='password']").type("testpassword{enter}");
        cy.contains("Une erreur s'est produite");
        cy.contains("Wrong username or password.");
    });


    it("Authent success", () => {
        cy.get("[data-cy='username']").type("test");
        cy.get("[data-cy='password']").type("testpassword");
        cy.contains("Se connecter").click();
        cy.url().should("eq", "http://localhost:8080/");
    });
});
