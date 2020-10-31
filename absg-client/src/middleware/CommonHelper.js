export const MODULES = [
    { id:"absg", icon: 'fas fa-info', name: 'System', url: null, roles: ["member"] },
    { id:"citations", icon: 'fas fa-quote-left', name: 'Citations', url: '/citations', roles: ["member"] },
    { id:"photos", icon: 'fas fa-image', name: 'Photos', url: '/photos', roles: ["member"] },
    { id:"forum", icon: 'fas fa-comment', name: 'Forum', url: '/forum', roles: ["member"] },
    { id:"agenda", icon: 'fas fa-address-book', name: 'Agenda', url: '/agenda', roles: ["member"] },
    { id:"event", icon: 'fas fa-calendar-alt', name: 'Calendrier', url: null, roles: ["member"] },
    { id:"voyag", icon: 'fas fa-map-marked-alt', name: 'Voya G', url: '/voyag', roles: ["member"] },
    { id:"agpa", icon: 'fas fa-camera', name: 'A.G.P.A.', url: '/agpa', roles: ["member"] },
    // { id:"gcloud", icon: 'fas fa-folder-open', name: 'G-Cloud', url: '/gcloud', roles: ["member"] },
    { id:"admin", icon: 'fas fa-cog', name: 'Config', url: '/admin', roles: ["member"]  }];

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
        return null;
    }

    return response.data
}

/**
 * Analyse la réponse retourné par le websocket, afin de gérer les cas d'erreur
 * et retourne le message décodé si tout se passe bien
 * @param {any} message
 */
export function parseWsMessage(message) {
    try {
        return JSON.parse(message.data);
    } catch (err) {
        throw new Error("Problème de communication temps réel", err);
    }
}


/**
 * Analyse les informations fourni et retourne l'url de l'image à utiliser pour l'avatar, ainsi
 * qu'un label à utiliser comme nom (qui correspond à l'information la plus pertinente parmis
 * le nom, le prénom et le surnom de la personne)
 * @param {any} peopleData
 */
export function getPeopleAvatar(peopleData) {
    const id = peopleData.userId ? peopleData.userId : peopleData.id;
    let username = peopleData.username ? peopleData.username : null;
    const idAsStr = `${id}`;
    return {
        id,
        url: `/files/avatars/${idAsStr.padStart(3, '0')}.png`,
        label: username ? username : peopleData.surname ? peopleData.surname : peopleData.firstname
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

/**
 * Retourne les informations concernant un module
 * @param string moduleName l'identifiant du module
 */
export function getModuleInfo(moduleName) {
    return MODULES.find(e => e.id === moduleName);
}
