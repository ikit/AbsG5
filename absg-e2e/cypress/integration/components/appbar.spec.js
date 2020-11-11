import axios from "axios";

describe("Barre principale de l'application", () => {

    beforeEach(() => {
        cy.login();
    });

    // it("Affichage 1920x1080", () => {
    //     const session = require("../../fixtures/session.json");
    //     cy.viewport(1920, 1080);
    //     cy.visit(`${session.url}`);
    //     cy.get("header").should('exist');
    //     cy.get("[data-cy='title']").should('exist');
    //     cy.get("[data-cy='menuButton']").should('not.exist');
    //     cy.get("[data-cy='citation']").should('exist');
    //     cy.get("[data-cy='notifications']").should('exist');
    //     cy.get("[data-cy='online']").should('exist');
    //     cy.get("[data-cy='user']").should('exist');
    // });

    it("Indicateur utilisateur en ligne", () => {
        const session = require("../../fixtures/session.json");
        cy.visit(`${session.url}`);

        // On s'assure que l'IHM est bien chargé avant de démarrer le scénario
        cy.get("header").should("exist");

        // Deconnection de tous les membres
        cy.request({ url: `${session.api}/test/user-online-indicator/1` });
        cy.get("[data-cy=online]").should("not.exist");

        // Connexion d'un deuxième utilisateur A
        cy.request({  url: `${session.api}/test/user-online-indicator/2` });
        cy.get("[data-cy=online]>img").should("have.attr", "src").should("include", "038.png");

        // Connexion d'un troisième utilisateur B
        cy.request({  url: `${session.api}/test/user-online-indicator/3` });
        cy.request({  url: `${session.api}/test/user-online-indicator/3` });
        cy.get("[data-cy=online]>img").eq(0).should("have.attr", "src").should("include", "038.png");
        cy.get("[data-cy=online]>img").eq(1).should("have.attr", "src").should("include", "031.png");

        // Action de l'utilisateur A
        cy.request({  url: `${session.api}/test/user-online-indicator/4` });
        cy.request({  url: `${session.api}/test/user-online-indicator/4` });
        cy.get("[data-cy=online]>img").eq(0).should("have.attr", "src").should("include", "031.png");
        cy.get("[data-cy=online]>img").eq(1).should("have.attr", "src").should("include", "038.png");
    });

    // it("Affichage 800x600", () => {
    //     cy.viewport(800, 600);
    //     cy.get("header").should('exist');
    //     cy.get("[data-cy='title']").should('not.exist');
    //     cy.get("[data-cy='menuButton']").should('exist');
    //     cy.get("[data-cy='citation']").should('not.exist');;
    //     cy.get("[data-cy='notifications']").should('exist');
    //     cy.get("[data-cy='online']").should('exist');
    //     cy.get("[data-cy='user']").should('exist');
    // });



})
