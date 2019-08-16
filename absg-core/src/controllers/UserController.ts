import { getRepository, Equal } from "typeorm";
import { JsonController, Post, Body, BadRequestError, Get } from "routing-controllers";
import { User } from "../entities";


import { authService, citationService, immtService } from "../services";
import { success } from "../middleware/jsonHelper";

@JsonController('/users')
export class UserController {

    private userRepo = getRepository(User);
    

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
            payload.passwordHash = await authService.hashPassword(payload.passwordHash);
            
            // On stock le nouvel utilisateur en base
            return this.userRepo.save(payload);
        } catch (err) {
            throw new Error(`An error occurred when saving the user.`);
        }
    }


    /**
     * Récupère l'ensemble des informations de la page d'accueil:
     *  - Une citation aléatoire
     *  - La dernière image du moment
     *  - Les événements du mois en cours
     *  - L'historique des passages de la journée
     *  - Les dernières notifications non lues 
     */
    @Get('/welcom')
    async welcom() {
        console.log("welcome !")
        const result = {
            immt: await immtService.last(),
            citation: await citationService.random(),
            events: [],
            passag: [],
            logs: [],
            user: {}
        }

        return success(result);
    }

}
