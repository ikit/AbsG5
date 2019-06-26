import { getRepository, Equal } from "typeorm";
import { JsonController, Post, Body, BadRequestError } from "routing-controllers";
import { AuthService } from "../services/AuthService";
import { User } from "../entities";

@JsonController('/users')
export class UserController {

    private userRepo = getRepository(User);
    private authService = new AuthService();

    @Post('/')
    async save(@Body() payload: User) {
        // On vérifie qu'on a bien reçu tous les champs nécessaires
        const hasMissingField = !payload || ['name', 'username', 'email', 'password'].some(field => !payload.hasOwnProperty(field));

        if (hasMissingField) {
            throw new BadRequestError(`A field is missing.`);
        }

        // On vérifie que username et email n'existent pas déjà
        const usernameExists = await this.userRepo.findOne({ where: { usernameClean: Equal(payload.usernameClean) }});

        if (usernameExists) {
            throw new BadRequestError(`Username already used.`);
        }

        try {
            // On chiffre le mot de passe
            payload.passwordHash = await this.authService.hashPassword(payload.passwordHash);
            
            // On stock le nouvel utilisateur en base
            return this.userRepo.save(payload);
        } catch (err) {
            throw new Error(`An error occurred when saving the user.`);
        }
    }

}
