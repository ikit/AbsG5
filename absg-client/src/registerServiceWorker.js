/* eslint-disable no-console */
import { register } from "register-service-worker";

if (process.env.NODE_ENV === "production") {
    register(`${process.env.BASE_URL}service-worker.js`, {
        mounted () {
            console.debug(
                "App is being served from cache by a service worker.\n" +
                "For more details, visit https://goo.gl/AFskqB");
        },
        registered () {
            console.debug("Service worker has been registered.");
        },
        cached () {
            console.debug("Content has been cached for offline use.");
        },
        updatefound () {
            console.debug("New content is downloading.");
        },
        updated () {
            let confirmationResult = confirm("Une nouvelle version du site est disponible. Voulez-vous recharger la page.")
            if (confirmationResult) registration.waiting.postMessage({action: "skipWaiting"})
        },
        offline () {
            console.debug("No internet connection found. App is running in offline mode.");
        },
        error (error) {
            console.debug("Error during service worker registration:", error);
        }
    });

    // On s'abonne au changement de service worker pour forcer le rechargement de la page
    let refreshing
    navigator.serviceWorker.addEventListener("controllerchange", e => {
        if (refreshing) return
        window.location.reload()
        refreshing = true
    })
}
