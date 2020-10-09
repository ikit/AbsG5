const { it } = require("date-fns/locale");

describe("Absg Home", () => {

    it("Ouverture correcte de la page d'accueil", () => {
        cy.viewport(1920, 1080);
        cy.visit("https://absolumentg.fr");

        // On vérifie que les principaux éléments sont là
        // La bannière
        cy.get("header").contains("Absolument G");

        // Le menu principal
        cy.get(".menu").contains("Citations");
        cy.get(".menu").contains("Photos");
        cy.get(".menu").contains("Forum");
        cy.get(".menu").contains("Agenda");
        cy.get(".menu").contains("Voya G");
        cy.get(".menu").contains("AGPA");
        cy.get(".menu").contains("Config");

        // Le calendrier sur la date du jour

        // La photo du moment (img + titre)

        // Les log de passage
        // Dernières 24h
        // Notre présence indiqué sur la dernière tranche horaire
    })
})
