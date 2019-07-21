import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities';

class AuthService {

    private SECRET = 'EyVgkGdxM58b>A6df&vrb+X4<Sk,Z[UJ';
    private EXPIRES_IN = 60 * 60;
    
    /**
     * Chiffre un mot de passe
     * 
     * @param password le mot de passe en clair
     */
    async hashPassword(password: string) {
        return await bcrypt.hash(password, 10);
    }

    /**
     * Retourne true si le mot de passe est correct
     * 
     * @param cleanPassword le mot de passe en clair
     * @param encryptedPassword le mot de passe chiffré
     */
    async checkPassword(cleanPassword: string, encryptedPassword: string) {
        return await bcrypt.compare(cleanPassword, encryptedPassword);
    }

    /**
     * Génère un token
     * 
     * @param user les données de l'utilisateur
     */
    createToken(user: User): string {
        if (!user) {
            return null;
        }

        const expiresIn = this.EXPIRES_IN;
        const payload = {
            id: user.id,
            username: user.username,
            expiresIn
        };

        return jwt.sign(payload, this.SECRET, { expiresIn });
    }

    /**
     * Vérifie le contenu du token JWT
     * 
     * @param token 
     */
    checkToken(token: string) {
        return jwt.verify(token, this.SECRET);
    }

    /**
     * Vérifie que l'utilisateur dispose bien des rôles necessaires
     * 
     * @param userRoles 
     * @param authorizedRoles 
     */
    checkRoles(userRoles: string[], authorizedRoles: string[]) {
        return !authorizedRoles.length || !authorizedRoles.some(role => !userRoles.includes(role));
    }

}
export const authService = new AuthService();
