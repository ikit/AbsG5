import { getRepository } from "typeorm";
import { JsonController, Post, Body, BadRequestError, Delete, CurrentUser, Get, Authorized } from "routing-controllers";
import { User } from "../entities";
import { logger } from "../middleware/logger";
import { cleanString } from "../middleware/commonHelper";
import { checkPassword, createToken } from "../middleware";
import { userService } from "../services";

@JsonController("/auth")
export class AuthController {
    private userRepo = getRepository(User);

    @Post("/login")
    async login(@Body() payload) {
        // On vérifie qu'on a bien reçu tous les champs nécessaires
        const hasMissingField = !payload || ["username", "password"].some(field => !payload.hasOwnProperty(field));

        if (hasMissingField) {
            throw new BadRequestError(`Vous devez fournir un identifiant et un mot de passe pour vous authentifier.`);
        }

        // On recherche l'utilisateur par son email ou par son username
        let user = await this.userRepo.query(
            `SELECT * FROM "user" WHERE "usernameClean" = $1 AND "isActive" = TRUE LIMIT 1`,
            [cleanString(payload.username)]
        );

        user = user[0];
        if (!user) {
            logger.warning(`Tentative de connection avec identifiant inconnu: ${payload.username}`);
            throw new BadRequestError(`Mauvais identifiant ou mot de passe`);
        }

        // On vérifie le mot de passe envoyé
        try {
            const isPasswordCorrect = await checkPassword(payload.password, user.passwordHash);

            if (!isPasswordCorrect) {
                logger.warning(`Tentative de connection avec identifiant inconnu: ${payload.username}`);
                throw new BadRequestError(`Mauvais identifiant ou mot de passe`);
            }

            // On génère puis stocke un token
            user.token = createToken(user);
            this.userRepo.save({
                id: user.id,
                token: user.token
            });

            // On retourne l'utilisateur avec son token
            delete user.passwordHash;
            logger.info(`Connection de l'utilisateur ${user.username}`);
            return user;
        } catch (err) {
            logger.warning(`Tentative de connection: ${err.message}`);
            throw err;
        }
    }

    @Get("/check")
    check(@CurrentUser() user: User): User {
        return user;
    }

    @Authorized()
    @Delete("/logout")
    async logout(@CurrentUser() user) {
        if (!user) {
            return { success: false };
        }

        await this.userRepo.save({
            id: user.id,
            token: null
        });

        return { success: true };
    }

    @Post("/ask-new-pwd")
    newPwd(@Body() body: any) {
        return userService.resetPassword(body.email);
    }
}
