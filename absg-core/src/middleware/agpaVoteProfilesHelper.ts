/**
 * Helper pour analyser les profils de votes et attribuer des badges amusants aux photographes
 */

export interface VoteData {
    from: string;
    to: string;
    weight: number;
}

export interface UserData {
    username: string;
    rootFamily: string;
    sex?: string;
    spouse?: string;
    children?: string[];
}

export interface VoterProfile {
    username: string;
    badge: string;
    icon: string;
    description: string;
    color: string;
}

export interface PhotographerProfile {
    username: string;
    badge: string;
    icon: string;
    description: string;
    color: string;
}

export interface ComboProfile {
    username: string;
    badge: string;
    icon: string;
    description: string;
    color: string;
}

export interface SlidingProfile {
    username: string;
    badge: string;
    icon: string;
    description: string;
    color: string;
}

export interface UserProfiles {
    voterProfile: VoterProfile | null;
    photographerProfile: PhotographerProfile | null;
    comboProfile: ComboProfile | null;
}

export interface YearData {
    year: number;
    totalPoints: number;
    golds: number;
    sylvers: number;
    bronzes: number;
    diamonds: number;
    nominated: number;
    podiums: number;
    categories: string[];
    categoriesWithAwards: Record<string, string>; // categoryId -> awardType mapping for progression tracking
}

/**
 * Analyse le profil de votant d'un utilisateur
 * @param username nom de l'utilisateur
 * @param votes tous les votes de l'édition
 * @param users tous les utilisateurs participants
 */
function analyzeVoterProfile(
    username: string,
    votes: VoteData[],
    users: Record<string, UserData>
): VoterProfile | null {
    const userVotes = votes.filter(v => v.from === username);

    if (userVotes.length === 0) return null;

    const user = users[username];
    if (!user) return null;

    // Calculs statistiques
    const totalPoints = userVotes.reduce((sum, v) => sum + v.weight, 0);
    const votesByFamily: Record<string, number> = {};
    const votesByPerson: Record<string, number> = {};
    const recipients = new Set<string>();
    let votesForFemales = 0;

    userVotes.forEach(vote => {
        const recipient = users[vote.to];
        if (recipient) {
            // Par famille
            const family = recipient.rootFamily || 'autre';
            votesByFamily[family] = (votesByFamily[family] || 0) + vote.weight;

            // Par personne
            votesByPerson[vote.to] = (votesByPerson[vote.to] || 0) + vote.weight;
            recipients.add(vote.to);

            // Par sexe
            if (recipient.sex === 'female') {
                votesForFemales += vote.weight;
            }
        }
    });

    // Calcul des pourcentages
    const ownFamilyPercent = (votesByFamily[user.rootFamily] || 0) / totalPoints * 100;
    const spousePercent = user.spouse ? (votesByPerson[user.spouse] || 0) / totalPoints * 100 : 0;
    const childrenPercent = user.children
        ? user.children.reduce((sum, child) => sum + (votesByPerson[child] || 0), 0) / totalPoints * 100
        : 0;
    const femaleVotesPercent = (votesForFemales / totalPoints) * 100;

    // Calcul de la concentration des votes
    const sortedVotes = Object.values(votesByPerson).sort((a, b) => b - a);
    const top2Percent = sortedVotes.slice(0, 2).reduce((sum, v) => sum + v, 0) / totalPoints * 100;
    const top1Percent = (sortedVotes[0] || 0) / totalPoints * 100;

    // Équilibre entre familles
    const familyValues = Object.values(votesByFamily);
    const avgFamily = familyValues.reduce((sum, v) => sum + v, 0) / familyValues.length;
    const variance = familyValues.reduce((sum, v) => sum + Math.pow(v - avgFamily, 2), 0) / familyValues.length;
    const isBalanced = Math.sqrt(variance) / avgFamily < 0.3; // Coefficient de variation < 30%

    // Détermination du profil

    // 1. Le Patriote 🏰
    if (ownFamilyPercent > 70) {
        return {
            username,
            badge: 'Le Patriote',
            icon: 'fas fa-fort-awesome',
            description: 'Ma famille d\'abord !',
            color: '#3f51b5'
        };
    }

    // 2. L'Amoureux Transi 💕
    if (spousePercent > 50) {
        return {
            username,
            badge: 'L\'Amoureux Transi',
            icon: 'fas fa-heart',
            description: 'Mon amour mérite tous les trophées',
            color: '#e91e63'
        };
    }

    // 3. Le Parent Fier 👨‍👧‍👦
    if (childrenPercent > 50) {
        return {
            username,
            badge: 'Le Parent Fier',
            icon: 'fas fa-baby',
            description: 'Ce sont les plus doués, c\'est normal',
            color: '#ff9800'
        };
    }

    // 4. Le Sniper 🎯
    if (top2Percent > 60) {
        return {
            username,
            badge: 'Le Sniper',
            icon: 'fas fa-bullseye',
            description: 'J\'ai mes favoris et je m\'y tiens',
            color: '#f44336'
        };
    }

    // 5. Féministe Convaincu 💪
    if (femaleVotesPercent >= 70 && totalPoints > 20) {
        return {
            username,
            badge: 'Féministe Convaincu',
            icon: 'fas fa-fist-raised',
            description: 'Les femmes d\'abord !',
            color: '#9c27b0'
        };
    }

    // 6. Le Philanthrope 🌈
    if (recipients.size >= 8) {
        return {
            username,
            badge: 'Le Philanthrope',
            icon: 'fas fa-hand-holding-heart',
            description: 'Il y a du talent partout !',
            color: '#9c27b0'
        };
    }

    // 7. L'Anticonformiste 🦄
    if (ownFamilyPercent < 30 && totalPoints > 20) {
        return {
            username,
            badge: 'L\'Anticonformiste',
            icon: 'fas fa-star-of-life',
            description: 'L\'herbe est plus verte ailleurs',
            color: '#00bcd4'
        };
    }

    // 8. Le Diplomate 🤝
    if (isBalanced && recipients.size >= 5) {
        return {
            username,
            badge: 'Le Diplomate',
            icon: 'fas fa-handshake',
            description: 'Un vote pour chacun, équité pour tous',
            color: '#4caf50'
        };
    }

    // 9. Le Radin 🤏
    if (totalPoints < 30) {
        return {
            username,
            badge: 'Le Radin',
            icon: 'fas fa-piggy-bank',
            description: 'Faut le mériter !',
            color: '#795548'
        };
    }

    // 10. Le Mécène 🎁
    if (totalPoints > 100) {
        return {
            username,
            badge: 'Le Mécène',
            icon: 'fas fa-gift',
            description: 'Tout le monde est talentueux !',
            color: '#ffd700'
        };
    }

    // Par défaut - Équilibré
    return {
        username,
        badge: 'Le Modéré',
        icon: 'fas fa-balance-scale',
        description: 'Ni trop, ni trop peu',
        color: '#607d8b'
    };
}

/**
 * Analyse le profil de photographe d'un utilisateur
 * @param username nom de l'utilisateur
 * @param votes tous les votes de l'édition
 * @param users tous les utilisateurs participants
 */
function analyzePhotographerProfile(
    username: string,
    votes: VoteData[],
    users: Record<string, UserData>
): PhotographerProfile | null {
    const receivedVotes = votes.filter(v => v.to === username);

    if (receivedVotes.length === 0) return null;

    const user = users[username];
    if (!user) return null;

    // Calculs statistiques
    const totalPoints = receivedVotes.reduce((sum, v) => sum + v.weight, 0);
    const votesByFamily: Record<string, number> = {};
    const voters = new Set<string>();
    let votesFromFemales = 0;

    receivedVotes.forEach(vote => {
        const voter = users[vote.from];
        if (voter) {
            const family = voter.rootFamily || 'autre';
            votesByFamily[family] = (votesByFamily[family] || 0) + vote.weight;
            voters.add(vote.from);

            // Comptabiliser les votes des femmes
            if (voter.sex === 'female') {
                votesFromFemales += vote.weight;
            }
        }
    });

    const ownFamilyPercent = (votesByFamily[user.rootFamily] || 0) / totalPoints * 100;
    const voterCount = voters.size;
    const femaleVotesPercent = (votesFromFemales / totalPoints) * 100;

    // Détermination du profil

    // 1. Le Phénomène 🚀
    if (totalPoints > 80 && voterCount >= 8) {
        return {
            username,
            badge: 'Le Phénomène',
            icon: 'fas fa-rocket',
            description: 'La légende vivante',
            color: '#ffd700'
        };
    }

    // 2. La Star ⭐
    if (voterCount >= 8) {
        return {
            username,
            badge: 'La Star',
            icon: 'fas fa-star',
            description: 'Tout le monde m\'aime',
            color: '#ff9800'
        };
    }

    // 3. Le Chouchou de Famille 🏠
    if (ownFamilyPercent > 70 && totalPoints > 20) {
        return {
            username,
            badge: 'Le Chouchou de Famille',
            icon: 'fas fa-home',
            description: 'Ma famille croit en moi',
            color: '#3f51b5'
        };
    }

    // 4. Le Transfuge 🌍
    if (ownFamilyPercent < 30 && totalPoints > 30) {
        return {
            username,
            badge: 'Le Transfuge',
            icon: 'fas fa-globe',
            description: 'Je plais aux voisins',
            color: '#00bcd4'
        };
    }

    // 5. Le Protégé 👑
    if (voterCount <= 3 && totalPoints > 30) {
        return {
            username,
            badge: 'Le Protégé',
            icon: 'fas fa-crown',
            description: 'J\'ai mes champions',
            color: '#e91e63'
        };
    }

    // 6. La Coqueluche des Dames 💃
    if (femaleVotesPercent >= 70 && totalPoints > 20) {
        return {
            username,
            badge: 'La Coqueluche des Dames',
            icon: 'fas fa-heart',
            description: 'Apprécié par les femmes',
            color: '#e91e63'
        };
    }

    // 7. L'Équilibré ⚖️
    const familyValues = Object.values(votesByFamily);
    if (familyValues.length >= 3) {
        const avgFamily = familyValues.reduce((sum, v) => sum + v, 0) / familyValues.length;
        const variance = familyValues.reduce((sum, v) => sum + Math.pow(v - avgFamily, 2), 0) / familyValues.length;
        const isBalanced = Math.sqrt(variance) / avgFamily < 0.4;

        if (isBalanced) {
            return {
                username,
                badge: 'L\'Équilibré',
                icon: 'fas fa-balance-scale',
                description: 'Je plais à tout le monde modérément',
                color: '#4caf50'
            };
        }
    }

    // 8. L'Inconnu 👻
    if (totalPoints < 15) {
        return {
            username,
            badge: 'L\'Inconnu',
            icon: 'fas fa-ghost',
            description: 'Qui suis-je ?',
            color: '#9e9e9e'
        };
    }

    // Par défaut - Talent Émergent
    return {
        username,
        badge: 'Le Talent Émergent',
        icon: 'fas fa-seedling',
        description: 'En progression',
        color: '#8bc34a'
    };
}

/**
 * Analyse les combos spéciaux (combinaison des profils votant + photographe)
 * @param username nom de l'utilisateur
 * @param voterProfile profil de votant
 * @param photographerProfile profil de photographe
 * @param votes tous les votes de l'édition
 * @param users tous les utilisateurs participants
 */
function analyzeComboProfile(
    username: string,
    voterProfile: VoterProfile | null,
    photographerProfile: PhotographerProfile | null,
    votes: VoteData[],
    users: Record<string, UserData>
): ComboProfile | null {
    if (!voterProfile || !photographerProfile) return null;

    const userVotes = votes.filter(v => v.from === username);
    const receivedVotes = votes.filter(v => v.to === username);
    const totalGiven = userVotes.reduce((sum, v) => sum + v.weight, 0);
    const totalReceived = receivedVotes.reduce((sum, v) => sum + v.weight, 0);

    // 1. Le Solitaire 🏝️ - Peu de votes donnés ET peu de votes reçus
    if (totalGiven < 20 && totalReceived < 20) {
        return {
            username,
            badge: 'Le Solitaire',
            icon: 'fas fa-island-tropical',
            description: 'Discret en tout point',
            color: '#607d8b'
        };
    }

    // 2. L'Égoïste 😤 - Radin (peu donné) MAIS beaucoup reçu
    if (voterProfile.badge === 'Le Radin' && totalReceived > 50) {
        return {
            username,
            badge: 'L\'Égoïste',
            icon: 'fas fa-user-crown',
            description: 'Je reçois plus que je ne donne',
            color: '#9c27b0'
        };
    }

    // 3. Le Robin des Bois 🏹 - Donne beaucoup MAIS reçoit peu
    if (totalGiven > 80 && totalReceived < 30) {
        return {
            username,
            badge: 'Le Robin des Bois',
            icon: 'fas fa-bow-arrow',
            description: 'Généreux malgré l\'oubli',
            color: '#4caf50'
        };
    }

    // 4. L'Influenceur ⭐ - Star qui vote aussi beaucoup
    if (photographerProfile.badge === 'La Star' && totalGiven > 60) {
        return {
            username,
            badge: 'L\'Influenceur',
            icon: 'fas fa-star-shooting',
            description: 'Populaire et généreux',
            color: '#ff9800'
        };
    }

    // 5. Le Clan 🏰 - Patriote votant ET Chouchou de famille photographe
    if ((voterProfile.badge === 'Le Patriote') &&
        (photographerProfile.badge === 'Le Chouchou de Famille')) {
        return {
            username,
            badge: 'Le Clan',
            icon: 'fas fa-users',
            description: 'Ma famille et moi, c\'est pour la vie',
            color: '#3f51b5'
        };
    }

    // 6. Le Rebelle 🦅 - Anticonformiste votant ET Transfuge photographe
    if ((voterProfile.badge === 'L\'Anticonformiste') &&
        (photographerProfile.badge === 'Le Transfuge')) {
        return {
            username,
            badge: 'Le Rebelle',
            icon: 'fas fa-dragon',
            description: 'Loin de ma famille, dans les deux sens',
            color: '#00bcd4'
        };
    }

    // 7. Le Fan Club 👑 - Sniper votant ET Protégé photographe
    if ((voterProfile.badge === 'Le Sniper') &&
        (photographerProfile.badge === 'Le Protégé')) {
        return {
            username,
            badge: 'Le Fan Club',
            icon: 'fas fa-crown',
            description: 'J\'ai mes favoris et ils me le rendent',
            color: '#e91e63'
        };
    }

    // 8. Le Politique 🎭 - Diplomate votant ET Équilibré photographe
    if ((voterProfile.badge === 'Le Diplomate') &&
        (photographerProfile.badge === 'L\'Équilibré')) {
        return {
            username,
            badge: 'Le Politique',
            icon: 'fas fa-balance-scale-right',
            description: 'Équilibre parfait donné/reçu',
            color: '#4caf50'
        };
    }

    // 9. Le Phénomène Total 🚀 - Mécène votant ET Phénomène photographe
    if ((voterProfile.badge === 'Le Mécène' || totalGiven > 100) &&
        (photographerProfile.badge === 'Le Phénomène')) {
        return {
            username,
            badge: 'Le Phénomène Total',
            icon: 'fas fa-meteor',
            description: 'La légende absolue des AGPA',
            color: '#ffd700'
        };
    }

    // 10. Le Couple Parfait 💑 - Amoureux Transi votant avec réciprocité
    if (voterProfile.badge === 'L\'Amoureux Transi') {
        const user = users[username];
        if (user.spouse) {
            // Vérifier si le conjoint lui rend la pareille
            const spouseVotes = votes.filter(v => v.from === user.spouse && v.to === username);
            const spouseTotal = spouseVotes.reduce((sum, v) => sum + v.weight, 0);
            const spousePercent = totalReceived > 0 ? (spouseTotal / totalReceived * 100) : 0;

            if (spousePercent > 40) {
                return {
                    username,
                    badge: 'Le Couple Parfait',
                    icon: 'fas fa-heart',
                    description: 'L\'amour est réciproque',
                    color: '#e91e63'
                };
            }
        }
    }

    // 11. L'Incompris 😢 - Philanthrope votant MAIS Inconnu photographe
    if ((voterProfile.badge === 'Le Philanthrope') &&
        (photographerProfile.badge === 'L\'Inconnu' || totalReceived < 15)) {
        return {
            username,
            badge: 'L\'Incompris',
            icon: 'fas fa-sad-tear',
            description: 'Je donne à tous mais personne ne me voit',
            color: '#9e9e9e'
        };
    }

    // 12. Le Revenant 👻 - Peu participé mais gros impact
    const userVotesCount = userVotes.length;
    if (userVotesCount < 10 && totalReceived > 40) {
        return {
            username,
            badge: 'Le Revenant',
            icon: 'fas fa-ghost',
            description: 'Peu présent mais marquant',
            color: '#673ab7'
        };
    }

    // 13. La Superstar 🌟 - Ratios exceptionnels dans les deux sens
    const receivedVotesCount = receivedVotes.length;
    if (totalGiven > 70 && totalReceived > 70 && receivedVotesCount > 7) {
        return {
            username,
            badge: 'La Superstar',
            icon: 'fas fa-sparkles',
            description: 'Excellence en tout point',
            color: '#ff6f00'
        };
    }

    // 14. Girl Power 💪💃 - Féministe Convaincu + La Coqueluche des Dames
    if (voterProfile.badge === 'Féministe Convaincu' && photographerProfile.badge === 'La Coqueluche des Dames') {
        return {
            username,
            badge: 'Girl Power',
            icon: 'fas fa-venus',
            description: 'Engagement féministe total',
            color: '#9c27b0'
        };
    }

    return null;
}

/**
 * Analyse l'évolution d'un utilisateur sur les 3 dernières années
 * @param username nom de l'utilisateur
 * @param yearDataList données des 3 dernières années triées par année (du plus ancien au plus récent)
 */
function analyzeSlidingProfile(
    username: string,
    yearDataList: YearData[]
): SlidingProfile[] {
    const badges: SlidingProfile[] = [];

    // Vérifier qu'on a bien 3 années de données
    if (yearDataList.length < 3) return badges;

    const [year1, year2, year3] = yearDataList;

    // 1. L'Alpiniste 🧗 - Bronze → Argent → Or dans la même catégorie sur 3 ans
    // (Ce badge sera ajouté plus bas dans la section PROGRESSION)

    // 2. La Fusée 🚀 - Progression x3 minimum
    if (year1.totalPoints > 0 && year3.totalPoints >= year1.totalPoints * 3) {
        badges.push({
            username,
            badge: 'La Fusée',
            icon: 'fas fa-rocket-launch',
            description: 'Décollage spectaculaire (x3)',
            color: '#ff5722'
        });
    }

    // 3. Le Régulier 🎯 - Performance constante (variance faible)
    const avgPoints = (year1.totalPoints + year2.totalPoints + year3.totalPoints) / 3;
    if (avgPoints >= 30) {
        const variance = [year1, year2, year3]
            .reduce((sum, y) => sum + Math.pow(y.totalPoints - avgPoints, 2), 0) / 3;
        const stdDev = Math.sqrt(variance);
        const coeffVar = stdDev / avgPoints;

        if (coeffVar < 0.15) { // Variation < 15%
            badges.push({
                username,
                badge: 'Le Régulier',
                icon: 'fas fa-chart-line',
                description: 'Performance stable et constante',
                color: '#4caf50'
            });
        }
    }

    // 4. Le Dinosaure 🦕 - Régression continue
    if (year1.totalPoints > year2.totalPoints &&
        year2.totalPoints > year3.totalPoints &&
        year1.totalPoints >= 40) {
        badges.push({
            username,
            badge: 'Le Dinosaure',
            icon: 'fas fa-dragon',
            description: 'Les beaux jours sont derrière',
            color: '#795548'
        });
    }

    // 5. Le Yoyo 🪀 - Alternance haut/bas
    if ((year1.totalPoints > year2.totalPoints && year2.totalPoints < year3.totalPoints &&
         year3.totalPoints > year2.totalPoints * 1.5) ||
        (year1.totalPoints < year2.totalPoints && year2.totalPoints > year3.totalPoints &&
         year2.totalPoints > year1.totalPoints * 1.5)) {
        badges.push({
            username,
            badge: 'Le Yoyo',
            icon: 'fas fa-arrows-up-down',
            description: 'Performance en montagnes russes',
            color: '#ff9800'
        });
    }

    // 6. Badge supprimé (L'Incendie était redondant avec Le Triplé)

    // 7. La Révélation 💫 - 0 points année 1, forte progression
    if (year1.totalPoints === 0 && year2.totalPoints > 20 && year3.totalPoints > year2.totalPoints) {
        badges.push({
            username,
            badge: 'La Révélation',
            icon: 'fas fa-star-shooting',
            description: 'De l\'ombre à la lumière',
            color: '#9c27b0'
        });
    }

    // 8. Le Vétéran 🎖️ - Sur le podium chaque année
    if (year1.podiums > 0 && year2.podiums > 0 && year3.podiums > 0) {
        badges.push({
            username,
            badge: 'Le Vétéran',
            icon: 'fas fa-medal',
            description: 'Sur le podium tous les ans',
            color: '#ff6f00'
        });
    }

    // 9. Le Sniper Temporel 🎯 - Même catégorie gagnée 2-3 fois
    const allCategories = [...year1.categories, ...year2.categories, ...year3.categories];
    const categoryCount: Record<string, number> = {};
    allCategories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const maxCategoryWins = Math.max(...Object.values(categoryCount));
    if (maxCategoryWins >= 2) {
        badges.push({
            username,
            badge: 'Le Sniper Temporel',
            icon: 'fas fa-bullseye',
            description: 'Spécialiste d\'une catégorie',
            color: '#f44336'
        });
    }

    // 10. Le Phoenix 🐦‍🔥 - Chute puis renaissance
    if (year1.totalPoints >= 30 &&
        year2.totalPoints < year1.totalPoints * 0.5 &&
        year3.totalPoints >= year1.totalPoints * 1.2) {
        badges.push({
            username,
            badge: 'Le Phoenix',
            icon: 'fas fa-phoenix-squadron',
            description: 'Renaît de ses cendres',
            color: '#e91e63'
        });
    }

    // 11. Le Tsunami 🌊 - Jamais participé avant, puis 2+ ors
    if (year1.totalPoints === 0 && year2.golds >= 2) {
        badges.push({
            username,
            badge: 'Le Tsunami',
            icon: 'fas fa-water',
            description: 'Arrivée fracassante',
            color: '#00bcd4'
        });
    }

    // 12. Le Fidèle 🤝 - Présent les 3 ans avec 15+ pts/an
    if (year1.totalPoints >= 15 && year2.totalPoints >= 15 && year3.totalPoints >= 15) {
        badges.push({
            username,
            badge: 'Le Fidèle',
            icon: 'fas fa-handshake',
            description: 'Toujours présent, toujours actif',
            color: '#607d8b'
        });
    }

    // 13. Le Podium Addict 🏆 - 5+ podiums sur 3 ans
    const totalPodiums = year1.podiums + year2.podiums + year3.podiums;
    if (totalPodiums >= 5) {
        badges.push({
            username,
            badge: 'Le Podium Addict',
            icon: 'fas fa-trophy',
            description: '5+ podiums sur 3 ans',
            color: '#cddc39'
        });
    }

    // 14. L'Éclair ⚡ - Absent 2 ans, retour en force
    if (year1.totalPoints === 0 &&
        year2.totalPoints === 0 &&
        year3.totalPoints >= 40) {
        badges.push({
            username,
            badge: 'L\'Éclair',
            icon: 'fas fa-bolt',
            description: 'Retour fracassant',
            color: '#ffeb3b'
        });
    }

    // === BADGES DE COLLECTION ===
    // Ces badges vérifient les combinaisons d'awards sur chaque année individuellement

    yearDataList.forEach((year: YearData) => {
        // 15. Le Collectionneur 🎖️ - Exactement 1 Or + 1 Argent + 1 Bronze en 1 édition
        if (year.golds === 1 && year.sylvers === 1 && year.bronzes === 1) {
            badges.push({
                username,
                badge: 'Le Collectionneur',
                icon: 'fas fa-medal',
                description: `Collection complète (${year.year})`,
                color: '#9c27b0'
            });
        }

        // 16. Le Perfectionniste 🏆 - Uniquement des Ors (≥2) sans autre récompense en 1 édition
        if (year.golds >= 2 && year.sylvers === 0 && year.bronzes === 0 && year.diamonds === 0 && year.nominated === 0) {
            badges.push({
                username,
                badge: 'Le Perfectionniste',
                icon: 'fas fa-crown',
                description: `${year.golds} Ors purs (${year.year})`,
                color: '#ffd700'
            });
        }

        // 17. Le Monopole 👑 - Au moins 6 Ors sur les 8 catégories normales en 1 édition
        if (year.golds >= 6) {
            badges.push({
                username,
                badge: 'Le Monopole',
                icon: 'fas fa-chess-king',
                description: `${year.golds} Ors - Quasi monopole (${year.year})`,
                color: '#ff6f00'
            });
        }

        // 18. La Razzia 🎯 - Au moins 1 AGPA dans toutes les catégories d'une édition
        // Note: categories[] contient uniquement les catégories avec un Or
        // Pour une vraie razzia, il faudrait vérifier toutes les catégories
        // On considère que 4+ catégories gagnées = razzia
        if (year.categories.length >= 4) {
            badges.push({
                username,
                badge: 'La Razzia',
                icon: 'fas fa-bullseye',
                description: `${year.categories.length} catégories dominées (${year.year})`,
                color: '#e91e63'
            });
        }

        // === BADGES DE DOMINATION ===
        // 19. Le Triplé 🥇 - 3+ Ors en 1 édition
        if (year.golds >= 3) {
            badges.push({
                username,
                badge: 'Le Triplé',
                icon: 'fas fa-fire',
                description: `${year.golds} Ors (${year.year})`,
                color: '#ff9800'
            });
        }

        // 20. Le Doublé 🥈 - Exactement 2 Argents en 1 édition
        if (year.sylvers === 2) {
            badges.push({
                username,
                badge: 'Le Doublé',
                icon: 'fas fa-gem',
                description: `Double argent (${year.year})`,
                color: '#c0c0c0'
            });
        }

        // 21. Le Balayage Bronze 🥉 - 4+ Bronzes en 1 édition
        if (year.bronzes >= 4) {
            badges.push({
                username,
                badge: 'Le Balayage Bronze',
                icon: 'fas fa-broom',
                description: `${year.bronzes} Bronzes (${year.year})`,
                color: '#cd7f32'
            });
        }

        // 22. L'Arc-en-ciel 🌈 - ≥2 de chaque type (2 Or + 2 Argent + 2 Bronze) en 1 édition
        if (year.golds >= 2 && year.sylvers >= 2 && year.bronzes >= 2) {
            badges.push({
                username,
                badge: 'L\'Arc-en-ciel',
                icon: 'fas fa-rainbow',
                description: `Palette complète (${year.year})`,
                color: '#00bcd4'
            });
        }
    });

    // === BADGES DE PROGRESSION ===
    // Ces badges vérifient la progression sur plusieurs années

    // 23. L'Alpiniste 🧗 - Bronze → Argent → Or dans la même catégorie sur 3 ans
    // Vérifier si une catégorie a progressé bronze->sylver->gold
    const categoryProgression: Record<string, string[]> = {}; // categoryId -> [award1, award2, award3]

    yearDataList.forEach((year: YearData, index: number) => {
        Object.entries(year.categoriesWithAwards).forEach(([categoryId, awardType]) => {
            if (!categoryProgression[categoryId]) {
                categoryProgression[categoryId] = ['', '', ''];
            }
            categoryProgression[categoryId][index] = awardType;
        });
    });

    // Vérifier si une catégorie a la progression bronze -> sylver -> gold
    const hasAlpiniste = Object.values(categoryProgression).some(
        progression => progression[0] === 'bronze' && progression[1] === 'sylver' && progression[2] === 'gold'
    );

    if (hasAlpiniste) {
        badges.push({
            username,
            badge: 'L\'Alpiniste',
            icon: 'fas fa-mountain',
            description: 'Bronze → Argent → Or même catégorie',
            color: '#2196f3'
        });
    }

    // 24. Le Constant 🎖️ - Même nombre d'AGPA (au moins 1) chaque année sur 3 ans
    const awardsCount1 = year1.golds + year1.sylvers + year1.bronzes + year1.diamonds + year1.nominated;
    const awardsCount2 = year2.golds + year2.sylvers + year2.bronzes + year2.diamonds + year2.nominated;
    const awardsCount3 = year3.golds + year3.sylvers + year3.bronzes + year3.diamonds + year3.nominated;

    if (awardsCount1 > 0 && awardsCount1 === awardsCount2 && awardsCount2 === awardsCount3) {
        badges.push({
            username,
            badge: 'Le Constant',
            icon: 'fas fa-check-double',
            description: `${awardsCount1} AGPA chaque année`,
            color: '#4caf50'
        });
    }

    // 25. La Rédemption 🔄 - 0 AGPA année N, puis Or année N+1 dans la même catégorie
    // Vérifier si une catégorie passe de rien à gold
    const hasRedemption = Object.values(categoryProgression).some(
        progression => (progression[0] === '' && progression[1] === 'gold') ||
                      (progression[1] === '' && progression[2] === 'gold')
    );

    if (hasRedemption) {
        badges.push({
            username,
            badge: 'La Rédemption',
            icon: 'fas fa-redo',
            description: 'De rien à Or dans même catégorie',
            color: '#ff5722'
        });
    }

    // === BADGES DE PATTERNS SPÉCIAUX ===
    // Ces badges vérifient des patterns spécifiques sur une année

    yearDataList.forEach((year: YearData) => {
        // 26. La Pyramide 🔺 - 1 Or + 2 Argents + 3 Bronzes
        if (year.golds === 1 && year.sylvers === 2 && year.bronzes === 3) {
            badges.push({
                username,
                badge: 'La Pyramide',
                icon: 'fas fa-caret-up',
                description: `1-2-3 parfait (${year.year})`,
                color: '#607d8b'
            });
        }

        // 27. La Pyramide Inversée 🔻 - 3 Ors + 2 Argents + 1 Bronze
        if (year.golds === 3 && year.sylvers === 2 && year.bronzes === 1) {
            badges.push({
                username,
                badge: 'La Pyramide Inversée',
                icon: 'fas fa-caret-down',
                description: `3-2-1 renversant (${year.year})`,
                color: '#3f51b5'
            });
        }

        // 28. Le Symétrique ⚖️ - Même nombre d'Ors, Argents et Bronzes
        if (year.golds > 0 && year.golds === year.sylvers && year.sylvers === year.bronzes) {
            badges.push({
                username,
                badge: 'Le Symétrique',
                icon: 'fas fa-balance-scale',
                description: `${year.golds}-${year.sylvers}-${year.bronzes} équilibré (${year.year})`,
                color: '#009688'
            });
        }
    });

    return badges;
}

/**
 * Analyse les profils de tous les utilisateurs
 * @param votes liste de tous les votes [from, to, weight]
 * @param users dictionnaire des utilisateurs avec leurs infos (famille, conjoint, enfants)
 */
export function analyzeVoteProfiles(
    votes: Array<[string, string, number]>,
    users: Record<string, UserData>
): Record<string, UserProfiles> {
    const voteData: VoteData[] = votes.map(([from, to, weight]) => ({ from, to, weight }));
    const profiles: Record<string, UserProfiles> = {};

    // Analyser chaque utilisateur
    Object.keys(users).forEach(username => {
        const voterProfile = analyzeVoterProfile(username, voteData, users);
        const photographerProfile = analyzePhotographerProfile(username, voteData, users);
        const comboProfile = analyzeComboProfile(username, voterProfile, photographerProfile, voteData, users);

        profiles[username] = {
            voterProfile,
            photographerProfile,
            comboProfile
        };
    });

    return profiles;
}

/**
 * Analyse les badges d'évolution pour tous les utilisateurs sur 3 ans
 * @param usersYearData dictionnaire des données par utilisateur sur 3 ans
 */
export function analyzeSlidingProfiles(
    usersYearData: Record<string, YearData[]>
): Record<string, SlidingProfile[]> {
    const slidingProfiles: Record<string, SlidingProfile[]> = {};

    Object.keys(usersYearData).forEach(username => {
        slidingProfiles[username] = analyzeSlidingProfile(username, usersYearData[username]);
    });

    return slidingProfiles;
}
