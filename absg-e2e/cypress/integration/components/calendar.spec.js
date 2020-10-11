

describe("On test", () => {

    before(() => {
        cy.login();
    });

    it("La page d'accueil contient tout les éléments", () => {
        // On vérifie que les principaux éléments sont là
        // La bannière
        cy.get("header").contains("Absolument G");

        // Le menu principal
        cy.get(".menu").contains("Citations");
        cy.get(".menu").contains("Photos");
        cy.get(".menu").contains("Forum");
        cy.get(".menu").contains("Agenda");
        cy.get(".menu").contains("Voya G");
        cy.get(".menu").contains("A.G.P.A.");
        cy.get(".menu").contains("Config");

        // Le calendrier sur la date du jour

        // La photo du moment (img + titre)

        // Les log de passage
        // Dernières 24h
        // Notre présence indiqué sur la dernière tranche horaire
    })
})
