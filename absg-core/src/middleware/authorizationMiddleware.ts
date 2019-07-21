import { Action } from "routing-controllers";
import { getRepository, Equal } from "typeorm";
import { User } from "../entities";
import { authService } from "../services";


/**
 * Middleware permettant d'autoriser l'accès à l'utilisateur
 * Stratégie locale : on vérifie uniquement la présence du token en base
 * 
 * @param action action demandée au sein d'un controller
 * @param roles liste des rôles minimum
 * @example 
    // dans un controller:

    @JsonController('/missions')
    export class MissionController {

        // tout le monde à accès à cette action, aucune autorisation necessaire
        @Get('/')
        @Authorized()
        all() {
            return this.missionRepo.find();
        }

        // tous les utilisateurs authentifiés ont accès à cette action
        @Get('/')
        @Authorized()
        all() {
            return this.missionRepo.find();
        }

        // seuls les utilisateurs authentifiés ayant le rôle 'administrator' ont accès
        @Get('/')
        @Authorized(['administrator'])
        all() {
            return this.missionRepo.find();
        }

        ...
    }
 * @returns boolean true is the user is authorized
 */
export async function localAuthorizationChecker(action: Action, roles: string[]) {
    // on récupère le header authorization
    const authorization: string = action.request.headers['authorization'];
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
    const authorization: string = action.request.headers['authorization'];
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
    
        return isAuthorized;
    } catch (e) {
        return false;
    }
}

export async function currentUserChecker(action: Action) {
    // on récupère le header authorization
    const authorization: string = action.request.headers['authorization'];
    if (!authorization) {
        return false;
    }

    // on récupère le token
    const token = authorization.substring(7);

    // on vérifie que le token existe en base
    return await getRepository(User).findOne({
        where: { token: Equal(token) }
    });
}
