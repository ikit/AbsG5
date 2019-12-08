import { getRepository, Equal } from "typeorm";
import { JsonController, Post, Body, BadRequestError, Delete, CurrentUser, Get } from "routing-controllers";
import { User } from "../entities";
import { authService } from "../services";
import { success } from "../middleware/jsonHelper";

@JsonController('/auth')
export class AuthController {

    private userRepo = getRepository(User);

    @Post('/login')
    async login(@Body() payload) {
        console.log("login", payload)
        // On vérifie qu'on a bien reçu tous les champs nécessaires
        const hasMissingField = !payload || ['username', 'password'].some(field => !payload.hasOwnProperty(field));

        if (hasMissingField) {
            throw new BadRequestError(`A field is missing.`);
        }

        console.log(" > payload ok")
        // On recherche l'utilisateur par son email ou par son username
        const user = await this.userRepo.findOne({ where: { username: Equal(payload.username) }});

        console.log(" > user", user)
        if (!user) {
            throw new BadRequestError(`Wrong username or password.`);
        }

        console.log(" > pwd = ", await authService.hashPassword(payload.password));
        

        // On vérifie le mot de passe envoyé
        try {
            const isPasswordCorrect = await authService.checkPassword(payload.password, user.passwordHash);

            console.log(" > pwd", isPasswordCorrect)
            if (!isPasswordCorrect) {
                throw new BadRequestError(`Wrong username or password.`);
            }

            // On génère puis stocke un token
            user.token = authService.createToken(user);
            this.userRepo.save({
                id: user.id,
                token: user.token
            });

            console.log(" > token", user.token)
            // On retourne l'utilisateur avec son token
            delete user.passwordHash;
            return success(user);
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
