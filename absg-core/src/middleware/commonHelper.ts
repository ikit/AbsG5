import * as Jimp from "jimp";
import * as fs from "fs";
import * as path from "path";
import * as nodemailer from "nodemailer";
import { logger } from "./logger";

/**
 * Async sleep method
 */
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Supprime tout les caractères spéciaux d'une chaîne de caractère
 * (ne fonctionne qu'avec l'alphabet "latin")
 * @param str la chaine de caractère à "nettoyer"
 */
export function cleanString(str: string): string {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // supprime les accents et caractères spéciaux
        .toLowerCase() // met tout en minuscule
        .trim(); // supprime les espaces superflux en début et fin de chaine
}

/**
 * Décode une chaine de caractère contenant les informations d'une image encodé en base64
 * @param dataString
 */
export function decodeBase64Image(dataString) {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches.length !== 3) {
        throw new Error("Invalid input string");
    }

    return {
        type: matches[1],
        buffer: new Buffer(matches[2], "base64")
    };
}

/**
 * Enregistre une image sur le serveur
 * @param file les données de l'image récupérées depuis une requête POST
 * @param thumbPath Si renseigné: va y enregistrer la vignette 200x200px
 * @param webPath Si renseigné: va y enregistrer l'image optimisé pour affichage plein écran (1080p) 2000x2000px
 * @param originalPath Si renseigné: va y enregistrer l'image original sans modification
 */
export async function saveImage(file, thumbPath, webPath, originalPath) {
    const img = await Jimp.read(file);
    // create WEB version
    if (webPath) {
        img.scaleToFit(2000, 2000); // 4K
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

/**
 * Envoie un email
 * @param subject l'objet du mail
 * @param text le corps du mail
 * @param to la liste des destinatire (email séparés par des )
 * @param from l'adresse utilisé pour envoyer le mail
 */
export function sendEmail(subject: string, text: string, to, from = "system@absolumentg.fr") {
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const email = {
        from,
        to,
        subject,
        text
    };
    transport.sendMail(email, function(err, info) {
        if (err) {
            logger.error("Erreur lors de l'envoie d'email", err);
        } else {
            logger.info("Email envoyé", info);
        }
    });
}

/**
 * Mélange un tableau de valeur
 * @param arr le tableau à mélanger
 */
export function shuffleArray(arr: any[]) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

/**
 * Retourne la taille en octet dans un format lisible pour un humain
 * @param fileSizeInBytes taille exprimée en octets
 * @returns taille exprimé de façon lible (par exemple "187.4 Mo")
 */
export function readableFileSize(fileSizeInBytes) {
    let i = -1;
    const byteUnits = [" Ko", " Mo", " Go", " To", " Po", " Eo", " Zo", " Yo"];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

/**
 * Dresse l'arborescence du contenu à l'endroit indiqué
 * @param localPath le dossier local où lister le contenu
 */
export function fetchFolder(localPath) {
    const res = [];
    const files = fs.readdirSync(localPath);
    for (const f of files) {
        const filepath = path.resolve(localPath, f);
        const infos = fs.statSync(filepath);
        if (infos.isDirectory()) {
            res.push({
                name: f,
                type: "folder",
                content: fetchFolder(filepath)
            });
        } else {
            res.push({
                name: path.basename(f, path.extname(filepath)),
                type: path.extname(filepath),
                size: readableFileSize(fs.statSync(filepath).size)
            });
        }
    }

    return res;
}
