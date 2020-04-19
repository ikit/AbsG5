/**
 * Photo
 */
export class Photo {
    url = "";           // Url vers la photo grand format       (obligatoire)
    thumb = "" ;        // Url vers la vignette de la photo     (obligatoire)
    original = "";      // Url vers l'original                  (peut-être null)
    title = "";         // Le titre donné à la photo            (peut-être null)
    author = "";        // L'auteur de la photo                 (peut être null)
    // Metada
    comment = "";       // Un commentaire sur la photo
    date = "";          // La date à laquelle à été prise la photo
    persons = [];       // Les nom/prénoms des principales personnes présentent sur la photo
    place = "";         // L'endroit où a été pris la photo
    gps = ""            // Les coordonnées GPS
    // Infos additionnel pour les photos des AGPA
    rank = 0;           // Le classement de la photo dans sa catégorie
    note = 0;           // La note qu'elle a obtenue
    votes = 0;          // Le nombre de vote qu'elle à obtenue

}
