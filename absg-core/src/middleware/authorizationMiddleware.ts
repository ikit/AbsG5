import { Action } from "routing-controllers";
import { getRepository, Equal } from "typeorm";
import { User, LogPassag } from "../entities";
import { authService } from "../services";
import { differenceInSeconds } from "date-fns";

/**
 * Met à jour les log de passage concernant l'utilisateur
 * @param user l'utilisateur concerné
 * @param url l'url requêté par l'utilisateur
 */
export async function checkUserPassag(user: User, url: string) {
    // On met à jours les stats de passage de l'utilisateur
    if (user) {
        const sql = `SELECT l.*, u.username
            FROM log_passag l
            INNER JOIN "user" u ON u.id = l."userId" 
            WHERE l."userId" = ${user.id}
            ORDER BY l.datetime DESC
            LIMIT 1`;
        // On récupère le dernier passage de l'utilisateur
        let lastLog = await getRepository(LogPassag).query(sql);
        lastLog = lastLog.length > 0 ? lastLog[0] : null;

        // Si dernier passage noté à plus d'une heure, on en enregistre un autre
        const log = new LogPassag();
        log.datetime = new Date();
        log.userId = user.id;
        if (!lastLog) {
            await getRepository(LogPassag).save(log);
        } else {
            const lastDate = new Date(lastLog.datetime);
            if (differenceInSeconds(new Date(), lastDate) > 3600) {
                await getRepository(LogPassag).save(log);
            }
        }

        // On met à jour l'info dans de l'utilisateur
        user.lastActivity = { date: new Date(), url };
        await getRepository(User).save(user);
    }
    return user;
}

export async function getUserFromHeader(request) {
    // on récupère le header authorization
    const authorization: string = request.headers["authorization"];
    if (!authorization) {
        return null;
    }

    // on récupère le token
    const token = authorization.substring(7);

    // on vérifie que le token existe en base
    let user = await getRepository(User).findOne({
        where: { token: Equal(token) }
    });

    // On met à jours les stats de passage de l'utilisateur
    user = await checkUserPassag(user, request.url);

    return user;
}

/**
 * Stratégie JWT : on vérifie le token JWT présent dans les headers et est valide
 *
 * @param action action demandée au sein d'un controller
 * @param roles liste des rôles minimum
 * @returns boolean true is the user is authorized
 */
export async function jwtAuthorizationChecker(action: Action, roles: string[]) {
    // on récupère le user si il est défini dans le header
    let user = await getUserFromHeader(action.request);

    try {
        // on vérifie que le token est valide
        user = authService.checkToken(user.token);

        // on vérifie les droits
        const isAuthorized = !!user && user.id && authService.checkRoles([], roles);

        // On met à jours les stats de passage de l'utilisateur
        checkUserPassag(user, action.request.url);

        return isAuthorized;
    } catch (e) {
        return false;
    }
}

export async function currentUserChecker(action: Action) {
    // on retourn le user si il est défini dans le header
    return await getUserFromHeader(action.request);;
}
