/**
 * Métadonnées des badges AGPA
 * Définit les propriétés de chaque badge: type (direct/progressif), prérequis pour les combos, etc.
 */

export const BADGES_METADATA = [
    // ===== BADGES VOTANT (11) =====
    {
        badge: 'Le Patriote',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-flag',
        description: 'Vote principalement pour sa famille',
        condition: '> 70% des votes pour sa famille',
        color: '#3f51b5'
    },
    {
        badge: 'L\'Amoureux Transi',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-heart',
        description: 'Vote beaucoup pour son/sa conjoint(e)',
        condition: '> 50% des votes pour son conjoint',
        color: '#e91e63'
    },
    {
        badge: 'Le Parent Fier',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-baby',
        description: 'Vote beaucoup pour ses enfants',
        condition: '> 50% des votes pour ses enfants',
        color: '#ff9800'
    },
    {
        badge: 'Le Sniper',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-bullseye',
        description: 'J\'ai mes favoris et je m\'y tiens',
        condition: '> 60% des votes sur 2 personnes max',
        color: '#f44336'
    },
    {
        badge: 'Féministe Convaincu',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-fist-raised',
        description: 'Les femmes d\'abord !',
        condition: '≥ 70% des votes pour des femmes + > 20 pts',
        color: '#9c27b0'
    },
    {
        badge: 'Le Philanthrope',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-hand-holding-heart',
        description: 'Il y a du talent partout !',
        condition: '≥ 8 personnes différentes ont reçu des votes',
        color: '#9c27b0'
    },
    {
        badge: 'L\'Anticonformiste',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-star-of-life',
        description: 'L\'herbe est plus verte ailleurs',
        condition: '< 30% des votes pour sa famille + > 20 pts',
        color: '#00bcd4'
    },
    {
        badge: 'Le Diplomate',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-handshake',
        description: 'Un vote pour chacun, équité pour tous',
        condition: 'Votes équilibrés entre familles + ≥ 5 personnes',
        color: '#4caf50'
    },
    {
        badge: 'Le Radin',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-piggy-bank',
        description: 'Faut le mériter !',
        condition: '< 30 points distribués au total',
        color: '#795548'
    },
    {
        badge: 'Le Mécène',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-gift',
        description: 'Tout le monde est talentueux !',
        condition: '> 100 points distribués au total',
        color: '#ffd700'
    },
    {
        badge: 'Le Modéré',
        type: 'voter',
        timing: 'direct',
        icon: 'fas fa-check',
        description: 'Ni trop, ni trop peu',
        condition: 'Badge par défaut (équilibré)',
        color: '#607d8b'
    },

    // ===== BADGES PHOTOGRAPHE (9) =====
    {
        badge: 'Le Phénomène',
        type: 'photographer',
        timing: 'direct',
        icon: 'fas fa-rocket',
        description: 'Populaire et reconnu',
        condition: '> 80 points reçus + ≥ 8 votants',
        color: '#ff6f00'
    },
    {
        badge: 'La Star',
        type: 'photographer',
        timing: 'direct',
        icon: 'fas fa-star',
        description: 'Très apprécié par beaucoup',
        condition: '≥ 8 votants différents',
        color: '#ffd700'
    },
    {
        badge: 'Le Chouchou de Famille',
        type: 'photographer',
        timing: 'direct',
        icon: 'fas fa-home',
        description: 'Très apprécié par sa famille',
        condition: '> 70% des votes de sa famille + > 20 pts',
        color: '#3f51b5'
    },
    {
        badge: 'Le Transfuge',
        type: 'photographer',
        timing: 'direct',
        icon: 'fas fa-exchange-alt',
        description: 'Apprécié hors de sa famille',
        condition: '< 30% des votes de sa famille + > 30 pts',
        color: '#00bcd4'
    },
    {
        badge: 'Le Protégé',
        type: 'photographer',
        timing: 'direct',
        icon: 'fas fa-crown',
        description: 'J\'ai mes champions',
        condition: '≤ 3 votants + > 30 points reçus',
        color: '#e91e63'
    },
    {
        badge: 'La Coqueluche des Dames',
        type: 'photographer',
        timing: 'direct',
        icon: 'fas fa-heart',
        description: 'Apprécié par les femmes',
        condition: '≥ 70% des votes de femmes + > 20 pts',
        color: '#e91e63'
    },
    {
        badge: 'L\'Équilibré',
        type: 'photographer',
        timing: 'direct',
        icon: 'fas fa-balance-scale',
        description: 'Je plais à tout le monde modérément',
        condition: 'Votes équilibrés entre ≥ 3 familles',
        color: '#4caf50'
    },
    {
        badge: 'L\'Inconnu',
        type: 'photographer',
        timing: 'direct',
        icon: 'fas fa-ghost',
        description: 'Qui suis-je ?',
        condition: '< 15 points reçus au total',
        color: '#9e9e9e'
    },
    {
        badge: 'Le Talent Émergent',
        type: 'photographer',
        timing: 'direct',
        icon: 'fas fa-seedling',
        description: 'En progression',
        condition: 'Badge par défaut',
        color: '#8bc34a'
    },

    // ===== BADGES COMBO - Directs (14) =====
    {
        badge: 'Le Solitaire',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-island-tropical',
        description: 'Discret en tout point',
        condition: '< 20 pts donnés + < 20 pts reçus',
        color: '#607d8b'
    },
    {
        badge: 'L\'Égoïste',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-user-crown',
        description: 'Je reçois plus que je ne donne',
        condition: 'Badge "Le Radin" + > 50 pts reçus',
        color: '#9c27b0',
        requires: ['Le Radin']
    },
    {
        badge: 'Le Robin des Bois',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-bow-arrow',
        description: 'Généreux malgré l\'oubli',
        condition: '> 80 pts donnés + < 30 pts reçus',
        color: '#4caf50'
    },
    {
        badge: 'L\'Influenceur',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-star-shooting',
        description: 'Populaire et généreux',
        condition: 'Badge "La Star" + > 60 pts donnés',
        color: '#ff9800',
        requires: ['La Star']
    },
    {
        badge: 'Le Clan',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-users',
        description: 'Ma famille et moi, c\'est pour la vie',
        condition: 'Badges "Le Patriote" + "Chouchou de Famille"',
        color: '#3f51b5',
        requires: ['Le Patriote', 'Le Chouchou de Famille']
    },
    {
        badge: 'Le Rebelle',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-dragon',
        description: 'Loin de ma famille, dans les deux sens',
        condition: 'Badges "L\'Anticonformiste" + "Le Transfuge"',
        color: '#00bcd4',
        requires: ['L\'Anticonformiste', 'Le Transfuge']
    },
    {
        badge: 'Le Fan Club',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-crown',
        description: 'J\'ai mes favoris et ils me le rendent',
        condition: 'Badges "Le Sniper" + "Le Protégé"',
        color: '#e91e63',
        requires: ['Le Sniper', 'Le Protégé']
    },
    {
        badge: 'Le Politique',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-balance-scale-right',
        description: 'Équilibre parfait donné/reçu',
        condition: 'Badges "Le Diplomate" + "L\'Équilibré"',
        color: '#4caf50',
        requires: ['Le Diplomate', 'L\'Équilibré']
    },
    {
        badge: 'Le Phénomène Total',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-meteor',
        description: 'La légende absolue des AGPA',
        condition: '> 100 pts donnés + Badge "Le Phénomène"',
        color: '#ffd700',
        requires: ['Le Phénomène']
    },
    {
        badge: 'Le Couple Parfait',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-heart',
        description: 'L\'amour est réciproque',
        condition: 'Badge "Amoureux Transi" + > 40% pts reçus du conjoint',
        color: '#e91e63',
        requires: ['L\'Amoureux Transi']
    },
    {
        badge: 'L\'Incompris',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-sad-tear',
        description: 'Je donne à tous mais personne ne me voit',
        condition: 'Badge "Le Philanthrope" + (Badge "L\'Inconnu" ou < 15 pts reçus)',
        color: '#9e9e9e',
        requires: ['Le Philanthrope']
    },
    {
        badge: 'Le Revenant',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-ghost',
        description: 'Peu présent mais marquant',
        condition: '< 10 votes donnés + > 40 pts reçus',
        color: '#673ab7'
    },
    {
        badge: 'La Superstar',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-sparkles',
        description: 'Excellence en tout point',
        condition: '> 70 pts donnés + > 70 pts reçus + > 7 votants',
        color: '#ff6f00'
    },
    {
        badge: 'Girl Power',
        type: 'combo',
        timing: 'direct',
        icon: 'fas fa-venus',
        description: 'Engagement féministe total',
        condition: 'Badges "Féministe Convaincu" + "Coqueluche des Dames"',
        color: '#9c27b0',
        requires: ['Féministe Convaincu', 'La Coqueluche des Dames']
    },

    // ===== BADGES COMBO - Progressifs (27 badges basés sur 3 ans) =====
    {
        badge: 'La Fusée',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-rocket-launch',
        description: 'Décollage spectaculaire',
        condition: 'Progression x3 minimum sur 3 ans',
        color: '#ff5722'
    },
    {
        badge: 'Le Régulier',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-chart-line',
        description: 'Performance stable et constante',
        condition: 'Variance < 15% avec moyenne ≥ 30 pts/an',
        color: '#4caf50'
    },
    {
        badge: 'Le Dinosaure',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-dragon',
        description: 'Les beaux jours sont derrière',
        condition: 'Régression continue sur 3 ans (départ ≥ 40 pts)',
        color: '#795548'
    },
    {
        badge: 'Le Yoyo',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-arrows-up-down',
        description: 'Performance en montagnes russes',
        condition: 'Alternance haut/bas avec écarts > 50%',
        color: '#ff9800'
    },
    {
        badge: 'La Révélation',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-star-shooting',
        description: 'De l\'ombre à la lumière',
        condition: '0 pts année 1 + progression forte années 2-3',
        color: '#9c27b0'
    },
    {
        badge: 'Le Vétéran',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-medal',
        description: 'Sur le podium tous les ans',
        condition: 'Au moins 1 podium chaque année sur 3 ans',
        color: '#ff6f00'
    },
    {
        badge: 'Le Sniper Temporel',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-bullseye',
        description: 'Spécialiste d\'une catégorie',
        condition: 'Même catégorie gagnée 2-3 fois sur 3 ans',
        color: '#f44336'
    },
    {
        badge: 'Le Phoenix',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-phoenix-squadron',
        description: 'Renaît de ses cendres',
        condition: 'Chute > 50% puis remontée > 120% de l\'année 1',
        color: '#e91e63'
    },
    {
        badge: 'Le Tsunami',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-water',
        description: 'Arrivée fracassante',
        condition: '0 pts année 1 + ≥ 2 ors année 2',
        color: '#00bcd4'
    },
    {
        badge: 'Le Fidèle',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-handshake',
        description: 'Toujours présent, toujours actif',
        condition: '≥ 15 pts par an sur les 3 années',
        color: '#607d8b'
    },
    {
        badge: 'Le Podium Addict',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-trophy',
        description: '5+ podiums sur 3 ans',
        condition: '≥ 5 podiums cumulés sur 3 ans',
        color: '#cddc39'
    },
    {
        badge: 'L\'Éclair',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-bolt',
        description: 'Retour fracassant',
        condition: '0 pts années 1-2 + ≥ 40 pts année 3',
        color: '#ffeb3b'
    },
    {
        badge: 'Le Collectionneur',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-medal',
        description: 'Collection complète',
        condition: 'Exactement 1 Or + 1 Argent + 1 Bronze en 1 édition',
        color: '#9c27b0'
    },
    {
        badge: 'Le Perfectionniste',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-crown',
        description: 'Ors purs',
        condition: 'Uniquement des Ors (≥2) sans autre récompense en 1 édition',
        color: '#ffd700'
    },
    {
        badge: 'Le Monopole',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-chess-king',
        description: 'Quasi monopole',
        condition: '≥6 Ors sur les 8 catégories en 1 édition',
        color: '#ff6f00'
    },
    {
        badge: 'La Razzia',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-bullseye',
        description: 'Catégories dominées',
        condition: '4+ catégories gagnées en 1 édition',
        color: '#e91e63'
    },
    {
        badge: 'Le Triplé',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-fire',
        description: 'Triple or',
        condition: '3+ Ors en 1 édition',
        color: '#ff9800'
    },
    {
        badge: 'Le Doublé',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-gem',
        description: 'Double argent',
        condition: 'Exactement 2 Argents en 1 édition',
        color: '#c0c0c0'
    },
    {
        badge: 'Le Balayage Bronze',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-broom',
        description: 'Collection de bronze',
        condition: '4+ Bronzes en 1 édition',
        color: '#cd7f32'
    },
    {
        badge: 'L\'Arc-en-ciel',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-rainbow',
        description: 'Palette complète',
        condition: '≥2 de chaque type (Or + Argent + Bronze) en 1 édition',
        color: '#00bcd4'
    },
    {
        badge: 'L\'Alpiniste',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-mountain',
        description: 'Progression parfaite',
        condition: 'Bronze → Argent → Or dans la même catégorie sur 3 ans',
        color: '#2196f3'
    },
    {
        badge: 'Le Constant',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-check-double',
        description: 'Régularité exemplaire',
        condition: 'Même nombre d\'AGPA (≥1) chaque année sur 3 ans',
        color: '#4caf50'
    },
    {
        badge: 'La Rédemption',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-redo',
        description: 'Retour victorieux',
        condition: '0 AGPA année N, puis Or année N+1 dans la même catégorie',
        color: '#ff5722'
    },
    {
        badge: 'La Pyramide',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-caret-up',
        description: 'Pattern parfait',
        condition: '1 Or + 2 Argents + 3 Bronzes en 1 édition',
        color: '#607d8b'
    },
    {
        badge: 'La Pyramide Inversée',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-caret-down',
        description: 'Pattern renversant',
        condition: '3 Ors + 2 Argents + 1 Bronze en 1 édition',
        color: '#3f51b5'
    },
    {
        badge: 'Le Symétrique',
        type: 'combo',
        timing: 'progressive',
        icon: 'fas fa-balance-scale',
        description: 'Équilibre parfait',
        condition: 'Même nombre d\'Ors, Argents et Bronzes en 1 édition',
        color: '#009688'
    }
];

/**
 * Récupère les métadonnées d'un badge par son nom
 */
export function getBadgeMetadata(badgeName) {
    return BADGES_METADATA.find(b => b.badge === badgeName);
}

/**
 * Récupère tous les badges d'un type donné
 */
export function getBadgesByType(type) {
    return BADGES_METADATA.filter(b => b.type === type);
}

/**
 * Récupère tous les badges directs ou progressifs
 */
export function getBadgesByTiming(timing) {
    return BADGES_METADATA.filter(b => b.timing === timing);
}
