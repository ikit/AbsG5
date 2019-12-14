
/**
 * Analyse la réponse retourné par axios, afin de traiter les cas d'erreur
 * et retourne la réponse du server quand tout se passe bien; null sinon
 * @param {any} response
 */
export function parseAxiosResponse(response) {
    if (!response) {
        return null;
    }

    console.log('parseAxiosResponse', response);
    if (response.status !== 200) {
        // http error
        console.log('NETWORK ERROR', response);
        return null;
    }

    response = response.data;
    // Check Absg error
    if (!response.success) {
        // Absg server error
        console.log('ABSG ERROR', response);
        return null;
    }

    return response.data
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
