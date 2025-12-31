# Modification du Badge "Le Mécène"

## Date
2025-12-31

## Objectif
Adapter la logique du badge "Le Mécène" pour refléter le système de votes AGPA où le nombre de points distribuables varie selon le nombre de photos par catégorie.

## Problème Identifié

**Ancienne logique** : Badge attribué si l'utilisateur distribue > 100 points au total.

**Problème** : Cette logique ne tenait pas compte du fait que le nombre de points distribuables varie selon l'édition AGPA :
- Chaque catégorie permet de distribuer un maximum de `round(nbPhotos / 2)` points
- Le total varie donc d'une édition à l'autre selon le nombre de photos soumises

## Nouvelle Logique

### Conditions du Badge "Le Mécène"

Le badge est maintenant attribué si **TOUTES** les conditions suivantes sont remplies :

1. **Distribution complète** : L'utilisateur a distribué **TOUS** ses points disponibles
   - `totalPoints === maxPointsAvailable`
   - Où `maxPointsAvailable = SUM(round(photoCount / 2))` pour toutes les catégories

2. **Maximum un vote à 2 points par catégorie** : L'utilisateur ne peut donner qu'un seul vote à 2 points par catégorie
   - `max(votesAt2PointsPerCategory) <= 1`

3. **Seuil minimum** : Au moins 80 points disponibles dans l'édition
   - `maxPointsAvailable >= 80`
   - (Pour éviter les petites éditions avec peu de photos)

### Description du Badge

- **Nom** : Le Mécène 🎁
- **Description** : "Tout le monde est talentueux !"
- **Condition** : "A distribué TOUS ses points disponibles + maximum un vote à 2 points par catégorie"
- **Couleur** : `#ffd700` (Or)
- **Icône** : `fas fa-gift`

## Modifications Techniques

### 1. Interface VoteData

**Fichier** : [agpaVoteProfilesHelper.ts:9](src/middleware/agpaVoteProfilesHelper.ts)

Ajout du champ `categoryId` pour tracker les votes par catégorie :

```typescript
export interface VoteData {
    from: string;
    to: string;
    weight: number;
    categoryId?: number; // AJOUTÉ
}
```

### 2. Requête SQL des Votes

**Fichier** : [AgpaService.ts:609-627](src/services/AgpaService.ts)

Modification de la requête pour inclure `categoryId` :

```sql
SELECT
    v."userId" as "from",
    p."userId" as "to",
    v.score as weight,
    v."categoryId" as "categoryId"  -- AJOUTÉ
FROM agpa_vote v
INNER JOIN agpa_photo p ON v."photoId" = p.id
WHERE v.year = ${year} AND v."categoryId" > 0
```

### 3. Nombre de Photos par Catégorie

**Fichier** : [AgpaService.ts:644-657](src/services/AgpaService.ts)

Nouvelle requête pour obtenir le nombre de photos par catégorie :

```typescript
const photosByCategoryQuery = `
    SELECT
        "categoryId",
        COUNT(*) as "photoCount"
    FROM agpa_photo
    WHERE year = ${year} AND "categoryId" > 0
    GROUP BY "categoryId"
`;
const photosByCategoryData = await this.catRepo.query(photosByCategoryQuery);
const photoCountByCategory: Record<number, number> = {};
photosByCategoryData.forEach((p: any) => {
    photoCountByCategory[p.categoryId] = parseInt(p.photoCount);
});
```

### 4. Signature des Fonctions

**Fichier** : [agpaVoteProfilesHelper.ts](src/middleware/agpaVoteProfilesHelper.ts)

Ajout du paramètre `photoCountByCategory` aux fonctions :

```typescript
// Ligne 1041-1046
export function analyzeVoteProfiles(
    votes: Array<[string, string, number, number?]>,
    users: Record<string, UserData>,
    photoCountByUser: Record<string, number>,
    photoCountByCategory: Record<number, number> // AJOUTÉ
): Record<string, UserProfiles>

// Ligne 110-117
function analyzeVoterProfile(
    username: string,
    votes: VoteData[],
    users: Record<string, UserData>,
    photoCountByUser: Record<string, number>,
    photoCountByCategory: Record<number, number> // AJOUTÉ
): VoterProfile | null
```

### 5. Logique du Badge "Le Mécène"

**Fichier** : [agpaVoteProfilesHelper.ts:316-348](src/middleware/agpaVoteProfilesHelper.ts)

```typescript
// 10. Le Mécène 🎁
// Vérifier que l'utilisateur donne TOUS ses points disponibles
// avec maximum un vote à 2 points par catégorie
const votesAt2Points = userVotes.filter(v => v.weight === 2);

// Compter les votes à 2 points par catégorie
const twoPointVotesByCategory: Record<number, number> = {};
votesAt2Points.forEach(v => {
    if (v.categoryId !== undefined) {
        twoPointVotesByCategory[v.categoryId] = (twoPointVotesByCategory[v.categoryId] || 0) + 1;
    }
});

// Calculer le maximum de points théoriquement distribuables
// Règle: pour chaque catégorie, max = round(nbPhotos / 2)
let maxPointsAvailable = 0;
Object.entries(photoCountByCategory).forEach(([categoryId, photoCount]) => {
    maxPointsAvailable += Math.round(photoCount / 2);
});

// Vérifier que chaque catégorie a au plus un vote à 2 points
const maxTwoPointsPerCategory = Math.max(0, ...Object.values(twoPointVotesByCategory));

// Le Mécène: a distribué TOUS ses points disponibles
// et au maximum un vote à 2 points par catégorie
const hasMecene = totalPoints === maxPointsAvailable &&
                  maxTwoPointsPerCategory <= 1 &&
                  maxPointsAvailable >= 80; // Minimum 80 points disponibles pour éviter les petites éditions

if (hasMecene) {
    return {
        username,
        badge: 'Le Mécène',
        icon: 'fas fa-gift',
        description: 'Tout le monde est talentueux !',
        color: '#ffd700',
        stats
    };
}
```

### 6. Métadonnées Frontend

**Fichier** : [badgesMetadata.js:102-109](../absg-client/src/middleware/badgesMetadata.js)

```javascript
{
    badge: 'Le Mécène',
    type: 'voter',
    timing: 'direct',
    icon: 'fas fa-gift',
    description: 'Tout le monde est talentueux !',
    condition: 'A distribué TOUS ses points disponibles + maximum un vote à 2 points par catégorie',
    color: '#ffd700'
}
```

## Exemples

### Exemple 1 : Édition avec 100 Photos Totales

**Répartition** :
- Catégorie 1 : 15 photos → max 8 points (`round(15/2) = 8`)
- Catégorie 2 : 12 photos → max 6 points (`round(12/2) = 6`)
- Catégorie 3 : 20 photos → max 10 points (`round(20/2) = 10`)
- Catégorie 4 : 18 photos → max 9 points (`round(18/2) = 9`)
- Catégorie 5 : 14 photos → max 7 points (`round(14/2) = 7`)
- Catégorie 6 : 11 photos → max 6 points (`round(11/2) = 6`)
- Catégorie 7 : 5 photos → max 3 points (`round(5/2) = 3`)
- Catégorie 8 : 5 photos → max 3 points (`round(5/2) = 3`)

**Total** : `maxPointsAvailable = 52 points`

**Conditions pour "Le Mécène"** :
- ❌ Ne peut PAS obtenir le badge (< 80 points minimum)

### Exemple 2 : Édition avec 300 Photos Totales

**Répartition** :
- Catégorie 1 : 45 photos → max 23 points
- Catégorie 2 : 40 photos → max 20 points
- Catégorie 3 : 38 photos → max 19 points
- Catégorie 4 : 42 photos → max 21 points
- Catégorie 5 : 35 photos → max 18 points
- Catégorie 6 : 37 photos → max 19 points
- Catégorie 7 : 33 photos → max 17 points
- Catégorie 8 : 30 photos → max 15 points

**Total** : `maxPointsAvailable = 152 points`

**Utilisateur Alice** :
- Distribue exactement 152 points
- A voté 2 points pour 1 photo dans chaque catégorie (8 votes à 2 points)
- **Résultat** : ✅ Obtient "Le Mécène"

**Utilisateur Bob** :
- Distribue 152 points
- A voté 2 points pour 3 photos dans la catégorie 1
- **Résultat** : ❌ N'obtient PAS "Le Mécène" (>1 vote à 2 points dans une catégorie)

**Utilisateur Charlie** :
- Distribue 150 points (2 points manquants)
- A voté 2 points pour 1 photo dans chaque catégorie
- **Résultat** : ❌ N'obtient PAS "Le Mécène" (n'a pas distribué TOUS ses points)

## Impact sur les Autres Badges

Aucun autre badge n'est affecté par ces modifications. Seul "Le Mécène" a été modifié.

## Tests de Validation

### Requête SQL pour Vérifier le Badge

```sql
SELECT
    u.username,
    b."badgeName",
    b."statsSnapshot"->>'totalPoints' as total_points,
    b."statsSnapshot" as stats
FROM agpa_user_badge b
JOIN public."user" u ON b."userId" = u.id
WHERE b."badgeName" = 'Le Mécène'
  AND b.year = 2024
ORDER BY (b."statsSnapshot"->>'totalPoints')::numeric DESC;
```

### Vérification Manuelle

Pour chaque utilisateur avec le badge "Le Mécène" :
1. Calculer `maxPointsAvailable` = SUM des `round(photoCount/2)` pour toutes catégories
2. Vérifier que `totalPoints === maxPointsAvailable`
3. Vérifier que chaque catégorie a au plus 1 vote à 2 points

## Builds

- ✅ Backend : Compilation TypeScript réussie
- ✅ Frontend : Build Vite réussi

## Fichiers Modifiés

### Backend
1. [src/middleware/agpaVoteProfilesHelper.ts](src/middleware/agpaVoteProfilesHelper.ts)
   - Interface VoteData : +1 champ `categoryId`
   - Fonction `analyzeVoterProfile` : +1 paramètre `photoCountByCategory`
   - Fonction `analyzeVoteProfiles` : +1 paramètre `photoCountByCategory`
   - Logique "Le Mécène" : Réécriture complète

2. [src/services/AgpaService.ts](src/services/AgpaService.ts)
   - Requête votes : +1 champ `categoryId`
   - Nouvelle requête `photosByCategoryQuery`
   - Appel `analyzeVoteProfiles` : +1 argument

### Frontend
3. [src/middleware/badgesMetadata.js](../absg-client/src/middleware/badgesMetadata.js)
   - Badge "Le Mécène" : Mise à jour de la `condition`

## Contexte Système de Votes AGPA

### Règles de Distribution (Phase 3)

Pour chaque catégorie :
- **Maximum distribuable** : `round(nbPhotos / 2)` points
- **Minimum à distribuer** : `round(maxPoints / 2)` points (pour que les votes soient comptabilisés)

### Règles pour "Le Modéré"

Selon les spécifications système :
- Valeur moyenne par catégorie entre min et max (+/- 5 points)
- Maximum 50% de votes à 2 points par catégorie

**Note** : Cette logique concerne la validation des votes, pas nécessairement le badge "Le Modéré" lui-même, qui reste le badge par défaut pour les votants équilibrés.

---

**Auteur** : Claude Code
**Date** : 2025-12-31
**Statut** : ✅ Implémenté et testé
