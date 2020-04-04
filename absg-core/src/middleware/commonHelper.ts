
/**
 * Supprime tout les caractères spéciaux d'une chaîne de caractère
 * (ne fonctionne qu'avec l'alphabet "latin")
 * @param str la chaine de caractère à "nettoyer"
 */
export function cleanString(str: string): string {
    return str.replace(/[^\w\s]/gi, "");
}
