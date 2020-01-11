import { Action } from "routing-controllers";
import { getRepository, Equal } from "typeorm";
import { User, LogPassag } from "../entities";
import { authService } from "../services";
import { differenceInHours } from "date-fns";

/**
 * Met à jour les log de passage concernant l'utilisateur
 * @param user l'utilisateur concerné
 */
export async function checkUserPassag(user: User) {
    // On met à jours les stats de passage de l'utilisateur
    if (user) {
        const lastLog = await getRepository(LogPassag)
            .createQueryBuilder("log")
            .where({ userId: Equal(user.id) })
            .orderBy("log.datetime", "DESC")
            .getOne();

        // Si dernier passage noté à plus d'une heure, on en enregistre un autre
        if (!lastLog || differenceInHours(new Date(), new Date(lastLog.datetime)) > 0) {
            const log = new LogPassag();
            log.datetime = new Date();
            log.userId = user.id;
            await getRepository(LogPassag).save(log);
        }
    }
}

/**
 * Middleware permettant d'autoriser l'accès à l'utilisateur
 * Stratégie locale : on vérifie uniquement la présence du token en base
 * 
 * @param action action demandée au sein d'un controller
 * @param roles liste des rôles minimum
 * @returns boolean true is the user is authorized
 */
export async function localAuthorizationChecker(action: Action, roles: string[]) {
    // on récupère le header authorization
    const authorization: string = action.request.headers["authorization"];
    if (!authorization) {
        return false;
    }

    // on récupère le token
    const token = authorization.substring(7);

    // on vérifie que le token existe en base
    const user = await getRepository(User).findOne({
        where: { token: Equal(token) }
    });

    // on vérifie les droits
    const isAuthorized = !!user && authService.checkRoles([], roles);

    return isAuthorized;
}

/**
 * Middleware permettant d'autoriser l'accès à l'utilisateur
 * Stratégie JWT : on vérifie le token JWT présent dans les headers
 *
 * @param action action demandée au sein d'un controller
 * @param roles liste des rôles minimum
 * @returns boolean true is the user is authorized
 */
export async function jwtAuthorizationChecker(action: Action, roles: string[]) {
    // on récupère le header authorization
    const authorization: string = action.request.headers["authorization"];
    if (!authorization) {
        return false;
    }

    // on récupère le token
    const token = authorization.substring(7);

    try {
        // on vérifie que le token est valide
        const user = authService.checkToken(token);

        // on vérifie les droits
        const isAuthorized = !!user && user.id && authService.checkRoles([], roles);

        // On met à jours les stats de passage de l'utilisateur
        checkUserPassag(user);

        return isAuthorized;
    } catch (e) {
        return false;
    }
}

export async function currentUserChecker(action: Action) {
    // on récupère le header authorization
    const authorization: string = action.request.headers["authorization"];
    if (!authorization) {
        return false;
    }

    // on récupère le token
    const token = authorization.substring(7);

    // on récupère le user
    const user = await getRepository(User).findOne({
        where: { token: Equal(token) }
    });

    // On retourne l'utilisateur si il existe
    return user;
}
