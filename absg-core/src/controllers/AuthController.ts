import { getRepository, Equal } from "typeorm";
import { JsonController, Post, Body, BadRequestError, Delete, CurrentUser, Get } from "routing-controllers";
import { User } from "../entities";
import { authService } from "../services";

@JsonController('/auth')
export class AuthController {

    private userRepo = getRepository(User);

    @Post('/login')
    async login(@Body() payload) {
        // On vérifie qu'on a bien reçu tous les champs nécessaires
        const hasMissingField = !payload || ['username', 'password'].some(field => !payload.hasOwnProperty(field));

        if (hasMissingField) {
            throw new BadRequestError(`A field is missing.`);
        }

        // On recherche l'utilisateur par son email ou par son username
        const userByUsername = await this.userRepo.findOne({ where: { username: Equal(payload.username) }});
        const userByEmail = await this.userRepo.findOne({ where: { email: Equal(payload.username) }});
        const user = userByUsername || userByEmail;

        if (!user) {
            throw new BadRequestError(`Wrong username or password.`);
        }

        // On vérifie le mot de passe envoyé
        try {
            const isPasswordCorrect = await authService.checkPassword(payload.passwordHash, user.passwordHash);
            if (!isPasswordCorrect) {
                throw new BadRequestError(`Wrong username or password.`);
            }

            // On génère puis stocke un token
            user.token = authService.createToken(user);
            this.userRepo.save({
                id: user.id,
                token: user.token
            });

            // On retourne l'utilisateur avec son token
            delete user.passwordHash;
            return user;
        } catch (err) {
            throw new BadRequestError(`Wrong username or password.`);
        }
    }

    @Get('/check')
    check(@CurrentUser() user: User): User {
        return user;
    }

    @Delete('/logout')
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

}
