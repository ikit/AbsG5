# TODO: Implémentation Complète des Statistiques de Badges

## Objectif
Modifier `agpaVoteProfilesHelper.ts` pour retourner toutes les statistiques calculées dans le `statsSnapshot` de chaque badge, permettant ainsi une transparence totale sur les critères d'attribution.

## Problème Actuel
Les fonctions `getVoterProfile()`, `getPhotographerProfile()`, etc. calculent de nombreuses statistiques mais ne retournent que le badge final:

```typescript
// Actuellement
return {
    username,
    badge: 'Le Patriote',
    icon: 'fas fa-fort-awesome',
    description: 'Ma famille d\'abord !',
    color: '#3f51b5'
}
```

Les statistiques calculées (totalPoints, ownFamilyPercent, etc.) sont perdues.

## Solution à Implémenter

### 1. Modifier les Interfaces de Retour

**Fichier**: `absg-core/src/middleware/agpaVoteProfilesHelper.ts`

```typescript
export interface VoterProfile {
    username: string;
    badge: string;
    icon: string;
    description: string;
    color: string;
    // NOUVEAU: Ajouter les stats
    stats: {
        totalPoints: number;
        totalVotes: number;
        recipients: number;
        ownFamilyPercent: number;
        spousePercent?: number;
        childrenPercent?: number;
        femaleVotesPercent: number;
        top2Percent: number;
        top1Percent: number;
        familyBalance: number; // variance
        uniqueFamilies: number;
    };
}

export interface PhotographerProfile {
    username: string;
    badge: string;
    icon: string;
    description: string;
    color: string;
    // NOUVEAU: Ajouter les stats
    stats: {
        totalPoints: number;
        voterCount: number;
        ownFamilyPercent: number;
        femaleVotesPercent: number;
        spousePercent?: number;
        familyBalance: number;
        uniqueFamilies: number;
    };
}

// Pareil pour ComboProfile et SlidingProfile
```

### 2. Modifier les Fonctions de Calcul

**Fonction**: `getVoterProfile(userId, votes, users)`

```typescript
function getVoterProfile(userId: string, votes: VoteData[], users: Record<string, UserData>): VoterProfile | null {
    const user = users[userId];
    const userVotes = votes.filter(v => v.from === userId);

    if (!user || userVotes.length === 0) return null;

    // Calculs statistiques (EXISTANT)
    const totalPoints = userVotes.reduce((sum, v) => sum + v.weight, 0);
    // ... tous les autres calculs ...

    // Déterminer le badge (EXISTANT)
    let badgeName, icon, description, color;
    if (ownFamilyPercent > 70 && totalPoints > 20) {
        badgeName = 'Le Patriote';
        icon = 'fas fa-fort-awesome';
        description = 'Ma famille d\'abord !';
        color = '#3f51b5';
    }
    // ... autres conditions ...

    // NOUVEAU: Retourner badge + stats
    return {
        username: user.username,
        badge: badgeName,
        icon,
        description,
        color,
        stats: {
            totalPoints,
            totalVotes: userVotes.length,
            recipients: recipients.size,
            ownFamilyPercent,
            spousePercent,
            childrenPercent,
            femaleVotesPercent,
            top2Percent,
            top1Percent,
            familyBalance,
            uniqueFamilies: familyCounts.length
        }
    };
}
```

### 3. Utiliser les Stats dans AgpaBadgeService

**Fichier**: `absg-core/src/services/AgpaBadgeService.ts`

```typescript
// Badge Votant
if (userProfiles.voterProfile) {
    await this.createBadge(
        user,
        year,
        userProfiles.voterProfile.badge,
        BadgeType.voter,
        BadgeTiming.direct,
        userProfiles.voterProfile.stats  // ✅ Maintenant disponible !
    );
    createdCount++;
}
```

## Statistiques à Retourner par Type

### Badges Votant (11 badges)
```typescript
{
    totalPoints: number,           // Total de points distribués
    totalVotes: number,            // Nombre de votes donnés
    recipients: number,            // Nombre de personnes différentes
    ownFamilyPercent: number,      // % votes pour sa famille
    spousePercent: number,         // % votes pour conjoint
    childrenPercent: number,       // % votes pour enfants
    femaleVotesPercent: number,    // % votes pour des femmes
    top2Percent: number,           // % concentré sur top 2
    top1Percent: number,           // % concentré sur top 1
    familyBalance: number,         // Variance inter-familles
    uniqueFamilies: number         // Nombre de familles différentes
}
```

### Badges Photographe (9 badges)
```typescript
{
    totalPoints: number,           // Total de points reçus
    voterCount: number,            // Nombre de votants différents
    ownFamilyPercent: number,      // % votes de sa famille
    femaleVotesPercent: number,    // % votes de femmes
    spousePercent: number,         // % points du conjoint
    familyBalance: number,         // Variance inter-familles
    uniqueFamilies: number         // Nombre de familles différentes
}
```

### Badges Combo Direct (14 badges)
```typescript
{
    pointsGiven: number,           // Points donnés
    pointsReceived: number,        // Points reçus
    voterCount: number,            // Nombre de votants
    requiredBadges: string[],      // Badges prérequis obtenus
    conditions: {                  // Conditions spécifiques remplies
        [key: string]: boolean
    }
}
```

### Badges Combo Progressif (27 badges)
```typescript
{
    years: number[],               // Années de la fenêtre (ex: [2023, 2024, 2025])
    pointsByYear: number[],        // Points par année
    progression: number,           // % de progression
    podiumsByYear: number[],       // Podiums par année
    goldsByYear: number[],         // Ors par année
    silversByYear: number[],       // Argents par année
    bronzesByYear: number[],       // Bronzes par année
    conditions: {                  // Conditions spécifiques
        [key: string]: any
    }
}
```

## Bénéfices

1. **Transparence**: L'utilisateur peut voir exactement pourquoi il a obtenu un badge
2. **Debug**: Facilite le diagnostic des problèmes d'attribution
3. **Historique**: Conservation des critères exacts année par année
4. **UI**: Permet d'afficher des explications détaillées dans l'interface

## Exemple d'Utilisation Future

```typescript
// Dans l'API
GET /api/agpa/badges-history/42

// Réponse
{
    "badgeHistory": {
        "Le Patriote": {
            "badge": "Le Patriote",
            "years": [2023, 2024, 2025],
            "isActive": true,
            "lastStats": {
                "year": 2025,
                "totalPoints": 85,
                "ownFamilyPercent": 73.5,
                "uniqueFamilies": 3
            }
        }
    }
}
```

Dans l'UI, on pourrait afficher:
> **Le Patriote** 🏰
>
> Vous avez donné 73.5% de vos 85 points à votre famille.
> Critère: >70% pour la famille + >20 points

## Fichiers à Modifier

1. ✅ **agpaVoteProfilesHelper.ts** - Ajouter `stats` dans les interfaces et retours
2. ✅ **AgpaBadgeService.ts** - Utiliser `profile.stats` au lieu de créer un objet vide
3. ⚠️ **Tests** - Vérifier que les stats sont correctement stockées

## Priorité

**Moyenne** - Le système fonctionne actuellement sans ces stats, mais elles sont importantes pour:
- Expliquer à l'utilisateur pourquoi il a obtenu tel badge
- Permettre des ajustements futurs des critères
- Auditer les attributions de badges

---

*Document créé le 2025-12-30*
