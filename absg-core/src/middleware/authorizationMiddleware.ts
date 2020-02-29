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
        const sql = `SELECT l.*, u.username
            FROM log_passag l
            INNER JOIN "user" u ON u.id = l."userId" 
            WHERE l."userId" = ${user.id}
            ORDER BY l.datetime DESC
            LIMIT 1`;
        // On récupère les données, on ne conserve que les 5 meilleures photos par catégories
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
            lastDate.setMinutes(0);
            if (differenceInHours(new Date(), lastDate) > 0) {
                await getRepository(LogPassag).save(log);
            }
        }
    }
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
    const user = await getRepository(User).findOne({
        where: { token: Equal(token) }
    });

    // On met à jours les stats de passage de l'utilisateur
    await checkUserPassag(user);

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
        checkUserPassag(user);

        return isAuthorized;
    } catch (e) {
        return false;
    }
}

export async function currentUserChecker(action: Action) {
    // on retourn le user si il est défini dans le header
    return await getUserFromHeader(action.request);;
}
