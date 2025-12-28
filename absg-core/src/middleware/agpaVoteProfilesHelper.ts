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

export interface UserProfiles {
    voterProfile: VoterProfile | null;
    photographerProfile: PhotographerProfile | null;
    comboProfile: ComboProfile | null;
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
