// Log to "user" session
Cypress.Commands.add("login", () => {
    const session = require("../fixtures/session.json");
    cy.request({
        method: "POST",
        url: `${session.api}/auth/login`,
        body: {
            username: session.user,
            password: session.pwd
        }
    }).then(answer => {
        window.localStorage.setItem('user', JSON.stringify(answer.body));
    });
})

// Log to "user" session
Cypress.Commands.add("logout", () => {
    const session = require("../fixtures/session.json");
    const current = window.localStorage.getItem('user');
    window.localStorage.removeItem('user');
    if (current) {
        cy.request({
            method: "GET",
            url: `${session.api}/auth/logout`,
            headers: [ { 'Authorization' : `Bearer ${current.token}`}]
        });
    }
})
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
