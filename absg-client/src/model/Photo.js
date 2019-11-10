/**
 * Photo
 */
export class Photo {
    url = "";           // Url vers la photo grand format       (obligatoire)
    thumb = "" ;        // Url vers la vignette de la photo     (obligatoire)
    original = "";      // Url vers l'original                  (peut-être null)
    title = "";         // Le titre donné à la photo            (peut-être null)
    author = "";        // L'auteur de la photo                 (peut être null)
    // Info additionnelles pour les photos albums
    comment = "";       // Un commentaire sur la photo
    date = new Date;    // La date à laquelle à été prise la photo
    location = "";      // L'endroit où a été pris la photo
    albums = [];        // Liste des albums dans lesquels la photo apparaît
    // Infos additionnel pour les photos des AGPA
    rank = 0;           // Le classement de la photo dans sa catégorie
    note = 0;           // La note qu'elle a obtenue
    votes = 0;          // Le nombre de vote qu'elle à obtenue
}
