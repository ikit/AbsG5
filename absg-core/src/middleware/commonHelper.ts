import * as Jimp from "jimp";
import * as fs from "fs";

/**
 * Supprime tout les caractères spéciaux d'une chaîne de caractère
 * (ne fonctionne qu'avec l'alphabet "latin")
 * @param str la chaine de caractère à "nettoyer"
 */
export function cleanString(str: string): string {
    return str.replace(/[^\w\s]/gi, "");
}

/**
 * Enregistre une image sur le serveur
 * @param file les données de l'image récupérées depuis une requête POST 
 * @param thumbPath Si renseigné: va y enregistrer la vignette 200x200px
 * @param webPath Si renseigné: va y enregistrer l'image optimisé pour affichage plein écran 2000x2000px
 * @param originalPath Si renseigné: va y enregistrer l'image original sans modification
 */
export async function saveImage(file, thumbPath, webPath, originalPath) {
    const img = await Jimp.read(file);
    // create WEB version
    if (webPath) {
        img.scaleToFit(2000, 2000);
        img.quality(85);
        img.write(webPath);
    }
    // create THUMB
    if (thumbPath) {
        img.scaleToFit(200, 200);
        img.quality(85);
        img.write(thumbPath);
    }
    // On déplace dans le répertoire ORIGINAL
    if (originalPath) {
        fs.writeFileSync(originalPath, file);
    }
}
