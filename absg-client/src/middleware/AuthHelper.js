
import axios from 'axios';

/**
 * Vérifie si l'utilisateur est connecté et quels sont ses rôles/autorisation
 *
 */
export function checkAutentication(store ) {
    // Les infos de l'utilisateur authentifié
    let user = localStorage.getItem('user');
    if (user) {
        user = JSON.parse(user);
    }

    // On s'assure que l'utilisateur est bien enregistré dans le store
    logUser(store, user);

    return user;
}

/**
 * Log l'utilisateur dans la session du navigateur
 * @param {*} store
 * @param {*} user
 */
export function logUser(store, user) {
    if (user && user.token) {
        // On sauvegarde les infos sur l'utilisateurs dans le store
        store.commit('setCurrentUser', user);
        // On sauvegarde localement le token de session dans le navigateur
        localStorage.setItem('user', JSON.stringify(user));
        // On indique à axios que désormais chaque requête faites à l'API devra transmettre le token de session dans le header
        axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        return user;
    }
    return null;
}

/**
 * Déconnecte l'utilisateur en supprimant sa session
 */
export function logoutUser(store) {
    // On supprime les infos sur l'utilisateurs dans le store
    store.commit('setCurrentUser', null);
    // On supprime les infos de session dans le navigateur
    localStorage.removeItem('user');
    return null;
}
