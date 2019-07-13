

/**
 * Formate la réponse de l'api en cas de succès
 *
 * @return la réponse sucès au format json
 */
export function success(payload: any): any 
{
    return { success: true, data: payload };
}

/**
 * Formate la réponse de l'api en cas de
 * @param msg 
 * @param details 
 */
export function error(msg: string, details: string): any {
    return { success: false, msg: msg, details: details };
}
