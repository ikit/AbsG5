import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Action } from "routing-controllers";
import { getRepository, Equal } from "typeorm";
import { User, LogPassag, LogSystem } from "../entities";
import { differenceInSeconds } from "date-fns";
import { Mutex } from "async-mutex";
import { websocketService, WSMessageType } from "../services/WebsocketService";
import { getCurrentEdition } from "./agpaCommonHelpers";

const ACTIONS_LABELS = [
    { route: "/agenda/person", label: "Agenda - Répertoire" },
    { route: "/agenda/place", label: "Agenda - Lieux" },
    { route: "/agenda/trombi", label: "Agenda - Trombinoscope" },
    { route: "/agpa/archives", label: "A.G.P.A. - Archives" },
    { route: "/agpa/ceremony", label: "A.G.P.A. - Cérémonie" },
    { route: "/agpa/palmares", label: "A.G.P.A. - Palmarès" },
    { route: "/agpa/p", label: "A.G.P.A. - Edition " + getCurrentEdition() },
    { route: "/agpa/photo", label: "A.G.P.A. - Edition " + getCurrentEdition() },
    { route: "/agpa/vote", label: "A.G.P.A. - Edition " + getCurrentEdition() },
    { route: "/agpa", label: "A.G.P.A." },
    { route: "/citations", label: "Citations" },
    { route: "/event", label: "Calendrier" },
    { route: "/forum/tbz", label: "Forum - T.B.Z." },
    { route: "/forum", label: "Forum" },
    { route: "/immt", label: "Photos - Image du moment" },
    { route: "/homepage", label: "Accueil Absolument G" },
    { route: "/settings", label: "Paramètres" },
    { route: "/photos", label: "Photos" },
    { route: "/voyag", label: "Voya G" }
];

/**
 * Chiffre un mot de passe
 *
 * @param password le mot de passe en clair
 */
export function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

/**
 * Retourne true si le mot de passe est correct
 *
 * @param cleanPassword le mot de passe en clair
 * @param encryptedPassword le mot de passe chiffré
 */
export async function checkPassword(cleanPassword: string, encryptedPassword: string) {
    return await bcrypt.compare(cleanPassword, encryptedPassword);
}

/**
 * Génère un token
 *
 * @param user les données de l'utilisateur
 * @param newPwdSession indique si oui ou non il faut créer une "vrai" session ou bien une session de secour de 10 min pour changer son pwd
 */
export function createToken(user: User, newPwdSession = false): string {
    if (!user) {
        return null;
    }

    const sessionDuration = newPwdSession ? 600000 : +process.env.AUTH_SESSION_DURATION_MS;

    const payload = {
        id: user.id,
        username: user.username,
        rescue: newPwdSession,
        expiresAt: new Date().getTime() + sessionDuration
    };

    return jwt.sign(payload, process.env.AUTH_SESSION_SALT, {
        expiresIn: sessionDuration / 1000
    });
}

/**
 * Vérifie le contenu du token JWT
 *
 * @param token
 */
export function checkToken(token: string) {
    return jwt.verify(token, process.env.AUTH_SESSION_SALT);
}

/**
 * Vérifie que l'utilisateur dispose bien des rôles necessaires
 *
 * @param userRoles
 * @param authorizedRoles
 */
export function checkRoles(userRoles: string[], authorizedRoles: string[]) {
    return !authorizedRoles.length || !authorizedRoles.some(role => !userRoles.includes(role));
}

/**
 * Met à jours les données de l'utilisateur et retourne l'utilisateur modifié
 * @param url la nouvelle activité à mettre à jour
 * @param urser l'utilisateur à modifier
 */
export async function setLastActivity(user: User, url: string) {
    // En fonction de l'url on détermine un label "user friendly"
    let label = ACTIONS_LABELS.find(e => url.indexOf(e.route) > -1) as any;
    label = label ? label.label : null;

    if (!user.activity) {
        user.activity = {
            lastActionLabel: label ? label : "Accueil Absolument G",
            lastAction: url, // lien (route) vers la dernière section du site visité
            lastAnnounce: 0, // dernière date à laquelle on a affiché l'annonce en cours du site à l'utilisateur (pas plus d'une fois par jour)
            unreadNotifications: [] // liste des id des notifications non lues de l'utilisateur
        };
    } else {
        user.activity.lastActio = url;
        user.activity.lastActionLabel = label ? label : "Accueil Absolument G";
        // On récupère toutes les notifications qu'a loupé l'utilisateur depuis la dernière fois
        const notifs = await getRepository(LogSystem).query(
            `
            SELECT id FROM log_system 
            WHERE severity = 'notice' AND "userId" <> $1 AND datetime > $2 
            ORDER BY id DESC
            LIMIT 50`,
            [user.id, user.lastTime]
        );
        // On ajoute ces notifs à la liste de celles qu'il n'a pas encore vu
        user.activity.unreadNotifications = user.activity.unreadNotifications.concat(notifs.map(e => e.id));
        // On ne garde au maximum que les 50 dernières
        user.activity.unreadNotifications.sort((a, b) => b - a);
        user.activity.unreadNotifications.slice(0, 50);
    }

    user.lastTime = new Date();
    await getRepository(User).save(user);
    // On notify tout le monde des utilisateurs actuellement en ligne
    const onlineUsers = await getRepository(LogPassag).query(`
        SELECT id, username, "rootFamily", "lastTime", activity 
        FROM "user" 
        WHERE "lastTime" IS NOT NULL AND  "lastTime" > now() - INTERVAL '10 min'
        ORDER BY "lastTime" ASC`);
    websocketService.broadcast({
        message: WSMessageType.onlineUsers,
        payload: onlineUsers.map(u => ({
            ...u,
            activity: u.activity ? u.activity.lastActionLabel : "-",
            unreadNotifications: u.activity.unreadNotifications
        }))
    });

    return user;
}

/**
 * Met à jour les log de passage concernant l'utilisateur
 * @param user l'utilisateur concerné
 * @param url l'url requêté par l'utilisateur
 */

export const MUTEX_PASSAG = new Mutex();
export async function checkUserPassag(user: User, url: string) {
    const release = await MUTEX_PASSAG.acquire();

    // On utilise mutex pour éviter la création en parallèle de plusieurs log identique lorsque
    // plusieurs requetes sont envoyées en même temps
    try {
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
                const now = new Date();
                if (differenceInSeconds(now, lastDate) > 3600 || now.getHours() != lastDate.getHours()) {
                    await getRepository(LogPassag).save(log);
                }
            }

            // On met à jour l'info dans de l'utilisateur
            setLastActivity(user, url);
        }
    } finally {
        release();
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
        user = checkToken(user.token);

        // on vérifie les droits
        const isAuthorized = !!user && user.id && checkRoles([], roles);

        return isAuthorized;
    } catch (e) {
        return false;
    }
}

export async function currentUserChecker(action: Action) {
    // on retourn le user si il est défini dans le header
    return await getUserFromHeader(action.request);
}
