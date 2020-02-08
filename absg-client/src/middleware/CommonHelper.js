
import axios from 'axios';

/**
 * Analyse la réponse retourné par axios, afin de traiter les cas d'erreur
 * et retourne la réponse du server quand tout se passe bien; null sinon
 * @param {any} response
 */
export function parseAxiosResponse(response) {
    if (!response) {
        return null;
    }

    if (response.status !== 200) {
        console.log('NETWORK ERROR', response);
        return null;
    }

    // console.log('parseAxiosResponse', response);
    return response.data
}

/**
 * Vérifie si l'utilisateur est connecté et quels sont ses rôles/autorisation
 *
 */
export function checkAutentication(store, ) {
    // Les infos de l'utilisateur authentifié
    let user = localStorage.getItem('user');
    if (user) {
        user = JSON.parse(user);
    }

    // On s'assure que le header d'authent est correctement paramétré
    if (user && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        store.commit('login', user);
    }

    return user;
}


/**
 * Analyse les informations fourni et retourne l'url de l'image à utiliser pour l'avatar, ainsi
 * qu'un label à utiliser comme nom (qui correspond à l'information la plus pertinente parmis
 * le nom, le prénom et le surnom de la personne)
 * @param {any} peopleData
 */
export function getPeopleAvatar(peopleData) {
    const idAsStr = `${peopleData.id}`;
    return {
        id: peopleData.id,
        url: `http://absolumentg.fr/assets/img/avatars/${idAsStr.padStart(3, '0')}.png`,
        label: peopleData.surname ? peopleData.surname : peopleData.firstname
    };
}


export function padNumber(value, size) {
    value = value.toString();
    return value.length >= size ? value :  new Array(size - value.length + 1).join('0') + value;
}


/**
 * Retire les accents et les majuscules de la chaine de caratère
 * @param {string} value la chaine de caractère à nettoyer
 */
export function cleanString(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
