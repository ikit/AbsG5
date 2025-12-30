import { AgpaUserBadge, BadgeType, BadgeTiming, User } from "../entities";
import { getRepository } from "../middleware/database";
import { agpaService } from "./AgpaService";
import { logger } from "../middleware/logger";

/**
 * Service dédié à la gestion et au calcul des badges AGPA
 */
class AgpaBadgeService {
    private get badgeRepo() {
        return getRepository(AgpaUserBadge);
    }

    private get userRepo() {
        return getRepository(User);
    }

    /**
     * Recalcule tous les badges pour une année donnée
     * Supprime les badges existants pour cette année et recalcule pour tous les utilisateurs
     * @param year l'année pour laquelle recalculer les badges
     * @returns statistiques du calcul (nombre de badges créés, utilisateurs traités, etc.)
     */
    async computeBadgesForYear(year: number) {
        logger.info(`[AgpaBadgeService] Début du calcul des badges pour l'année ${year}`);

        const startTime = Date.now();
        let deletedCount = 0;
        let createdCount = 0;
        let processedUsers = 0;
        const errors: string[] = [];

        try {
            // Étape 1: Supprimer tous les badges existants pour cette année
            logger.info(`[AgpaBadgeService] Suppression des badges existants pour ${year}...`);
            const deleteResult = await this.badgeRepo
                .createQueryBuilder()
                .delete()
                .where("year = :year", { year })
                .execute();

            deletedCount = deleteResult.affected || 0;
            logger.info(`[AgpaBadgeService] ${deletedCount} badges supprimés`);

            // Étape 2: Récupérer tous les utilisateurs actifs
            const users = await this.userRepo.find();
            logger.info(`[AgpaBadgeService] ${users.length} utilisateurs à traiter`);

            // Étape 3: Récupérer les profils de vote pour l'année
            const voteProfiles = await agpaService.getVoteProfiles(year);

            if (!voteProfiles) {
                logger.warning(`[AgpaBadgeService] Aucun profil de vote trouvé pour ${year}`);
                return {
                    success: true,
                    year,
                    deletedCount,
                    createdCount: 0,
                    processedUsers: 0,
                    duration: Date.now() - startTime,
                    errors,
                    message: "Aucun profil de vote disponible pour cette année"
                };
            }

            // Étape 4: Pour chaque utilisateur, créer les badges obtenus
            for (const user of users) {
                try {
                    const userProfiles = voteProfiles[user.id];

                    if (!userProfiles) {
                        continue; // L'utilisateur n'a pas participé cette année
                    }

                    processedUsers++;

                    // Badge Votant
                    if (userProfiles.voterProfile) {
                        await this.createBadge(
                            user,
                            year,
                            userProfiles.voterProfile.badge,
                            BadgeType.voter,
                            BadgeTiming.direct,
                            userProfiles.voterProfile
                        );
                        createdCount++;
                    }

                    // Badge Photographe
                    if (userProfiles.photographerProfile) {
                        await this.createBadge(
                            user,
                            year,
                            userProfiles.photographerProfile.badge,
                            BadgeType.photographer,
                            BadgeTiming.direct,
                            userProfiles.photographerProfile
                        );
                        createdCount++;
                    }

                    // Badge Combo
                    if (userProfiles.comboProfile) {
                        await this.createBadge(
                            user,
                            year,
                            userProfiles.comboProfile.badge,
                            BadgeType.combo,
                            BadgeTiming.direct,
                            userProfiles.comboProfile
                        );
                        createdCount++;
                    }
                } catch (error) {
                    const errorMsg = `Erreur lors du traitement de l'utilisateur ${user.id} (${user.username}): ${error.message}`;
                    logger.error(`[AgpaBadgeService] ${errorMsg}`);
                    errors.push(errorMsg);
                }
            }

            // Étape 5: Calculer et stocker les badges progressifs (fenêtre glissante de 3 ans)
            if (year >= 2008) { // On a besoin d'au moins 3 ans de données
                try {
                    logger.info(`[AgpaBadgeService] Calcul des badges progressifs pour la fenêtre se terminant en ${year}...`);
                    const slidingBadges = await agpaService.getSlidingBadges(year);

                    if (slidingBadges) {
                        for (const userId in slidingBadges) {
                            const user = users.find(u => u.id === parseInt(userId));
                            if (!user) continue;

                            const userBadges = slidingBadges[userId];
                            for (const badge of userBadges) {
                                try {
                                    await this.createBadge(
                                        user,
                                        year,
                                        badge.badge,
                                        BadgeType.combo,
                                        BadgeTiming.progressive,
                                        badge
                                    );
                                    createdCount++;
                                } catch (error) {
                                    const errorMsg = `Erreur badge progressif ${badge.badge} pour user ${userId}: ${error.message}`;
                                    logger.error(`[AgpaBadgeService] ${errorMsg}`);
                                    errors.push(errorMsg);
                                }
                            }
                        }
                    }
                } catch (error) {
                    const errorMsg = `Erreur lors du calcul des badges progressifs: ${error.message}`;
                    logger.error(`[AgpaBadgeService] ${errorMsg}`);
                    errors.push(errorMsg);
                }
            }

            const duration = Date.now() - startTime;
            logger.info(`[AgpaBadgeService] Calcul terminé en ${duration}ms: ${createdCount} badges créés pour ${processedUsers} utilisateurs`);

            return {
                success: true,
                year,
                deletedCount,
                createdCount,
                processedUsers,
                duration,
                errors,
                message: `${createdCount} badges créés avec succès pour ${processedUsers} utilisateurs`
            };

        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error(`[AgpaBadgeService] Erreur fatale: ${error.message}`);

            return {
                success: false,
                year,
                deletedCount,
                createdCount,
                processedUsers,
                duration,
                errors: [...errors, error.message],
                message: `Erreur lors du calcul des badges: ${error.message}`
            };
        }
    }

    /**
     * Crée un badge pour un utilisateur
     * @param user l'utilisateur
     * @param year l'année
     * @param badgeName le nom du badge
     * @param badgeType le type de badge
     * @param badgeTiming le timing du badge
     * @param statsSnapshot les statistiques ayant permis l'obtention du badge
     */
    private async createBadge(
        user: User,
        year: number,
        badgeName: string,
        badgeType: BadgeType,
        badgeTiming: BadgeTiming,
        statsSnapshot: any
    ): Promise<AgpaUserBadge> {
        const badge = new AgpaUserBadge();
        badge.user = user;
        badge.year = year;
        badge.badgeName = badgeName;
        badge.badgeType = badgeType;
        badge.badgeTiming = badgeTiming;
        badge.isActive = true;
        badge.statsSnapshot = statsSnapshot;

        return await this.badgeRepo.save(badge);
    }

    /**
     * Récupère tous les badges d'un utilisateur pour une année donnée
     * @param userId l'identifiant de l'utilisateur
     * @param year l'année (optionnel, toutes les années si non spécifié)
     */
    async getBadgesForUser(userId: number, year?: number) {
        const query = this.badgeRepo
            .createQueryBuilder("badge")
            .leftJoinAndSelect("badge.user", "user")
            .where("user.id = :userId", { userId });

        if (year) {
            query.andWhere("badge.year = :year", { year });
        }

        return await query
            .orderBy("badge.year", "DESC")
            .addOrderBy("badge.badgeType", "ASC")
            .getMany();
    }

    /**
     * Récupère l'historique complet des badges d'un utilisateur
     * @param userId l'identifiant de l'utilisateur
     */
    async getBadgeHistory(userId: number) {
        const badges = await this.getBadgesForUser(userId);

        // Organiser les badges par nom
        const badgeHistory: Record<string, {
            badge: string;
            years: number[];
            isActive: boolean;
            everObtained: boolean;
            type: 'voter' | 'photographer' | 'combo';
            timing: 'direct' | 'progressive';
        }> = {};

        for (const badge of badges) {
            if (!badgeHistory[badge.badgeName]) {
                badgeHistory[badge.badgeName] = {
                    badge: badge.badgeName,
                    years: [],
                    isActive: false,
                    everObtained: false,
                    type: badge.badgeType,
                    timing: badge.badgeTiming
                };
            }

            badgeHistory[badge.badgeName].years.push(badge.year);
            badgeHistory[badge.badgeName].everObtained = true;

            if (badge.isActive) {
                badgeHistory[badge.badgeName].isActive = true;
            }
        }

        return {
            badgeHistory,
            totalBadges: badges.length,
            uniqueBadges: Object.keys(badgeHistory).length
        };
    }
}

export const agpaBadgeService = new AgpaBadgeService();
