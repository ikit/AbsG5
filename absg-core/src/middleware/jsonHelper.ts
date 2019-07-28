

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
 * @param ex 
 */
export function issue(msg: string, ex: Error): any {
    if (ex) {
        return { success: false, msg: msg, details: `${ex.name}: ${ex.message}`, stack: ex.stack };
    }
    
    return { success: false, msg: msg };
}
