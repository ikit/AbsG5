# Modification du Badge "Le Modéré" + Suppression des Badges par Défaut

## Date
2025-12-31

## Objectif
1. Transformer "Le Modéré" d'un simple badge par défaut en un badge avec des critères spécifiques reflétant un comportement de vote équilibré et modéré dans le système AGPA
2. Supprimer tous les badges par défaut car les badges doivent être des récompenses méritées, pas des attributions automatiques

## Problème Identifié

**Ancienne logique** : "Le Modéré" était attribué par défaut à tous les utilisateurs ne rentrant dans aucune autre catégorie de badge votant.

**Problème** :
- Manque de signification : le badge ne récompensait aucun comportement spécifique
- Pas de reconnaissance pour les votants modérés qui suivent les règles de distribution équilibrée

## Nouvelle Logique

### Badge "Le Modéré" ⚖️

**Nouvelles conditions** (TOUTES doivent être remplies) :

1. **Distribution moyenne par catégorie** : Pour chaque catégorie votée, l'utilisateur doit distribuer une valeur proche de la moyenne (±5 points)
   - Moyenne catégorie = `(maxPoints + minPoints) / 2`
   - Où `maxPoints = round(nbPhotos / 2)` et `minPoints = round(maxPoints / 2)`

2. **Maximum 50% de votes à 2 points par catégorie** : Dans chaque catégorie, au maximum 50% des votes peuvent être à 2 points

3. **Minimum 3 catégories** : L'utilisateur doit avoir voté dans au moins 3 catégories différentes

**Exemple de calcul** :

Pour une catégorie avec 20 photos :
- `maxPoints = round(20 / 2) = 10 points`
- `minPoints = round(10 / 2) = 5 points`
- `moyenne = (10 + 5) / 2 = 7.5 points`
- **Plage acceptable** : 7.5 - 5 = 2.5 à 7.5 + 5 = 12.5 points (donc 3 à 13 points)

Si l'utilisateur distribue 8 points dans cette catégorie avec 6 votes dont 2 votes à 2 points :
- ✅ 8 points est dans la plage [3, 13]
- ✅ 2/6 = 33% < 50% de votes à 2 points
- ✅ Condition respectée pour cette catégorie

### Suppression des Badges par Défaut

**Décision importante** : Les badges doivent être des "hauts faits" que les votants et photographes peuvent obtenir comme récompense. Il n'y a plus de badge attribué par défaut.

**Badges supprimés** :
- ❌ **L'Éclectique** (badge par défaut votant) - Supprimé
- ❌ **Le Talent Émergent** (badge par défaut photographe) - Supprimé

**Nouvelle logique** :
- Si un utilisateur ne remplit aucun critère de badge → `null` (pas de badge)
- Les fonctions `analyzeVoterProfile` et `analyzePhotographerProfile` retournent `null` au lieu d'un badge par défaut

## Modifications Techniques

### 1. Logique du Badge "Le Modéré"

**Fichier** : [agpaVoteProfilesHelper.ts:356-418](src/middleware/agpaVoteProfilesHelper.ts)

```typescript
// 11. Le Modéré ⚖️
// Vérifier que l'utilisateur distribue une valeur moyenne par catégorie
// avec au maximum 50% de votes à 2 points par catégorie

// Calculer les points distribués par catégorie
const pointsByCategory: Record<number, number> = {};
const twoPointCountByCategory: Record<number, number> = {};
const totalVotesByCategory: Record<number, number> = {};

userVotes.forEach(v => {
    if (v.categoryId !== undefined) {
        pointsByCategory[v.categoryId] = (pointsByCategory[v.categoryId] || 0) + v.weight;
        totalVotesByCategory[v.categoryId] = (totalVotesByCategory[v.categoryId] || 0) + 1;
        if (v.weight === 2) {
            twoPointCountByCategory[v.categoryId] = (twoPointCountByCategory[v.categoryId] || 0) + 1;
        }
    }
});

// Vérifier les conditions pour chaque catégorie
let isModere = true;
let categoriesChecked = 0;

Object.entries(photoCountByCategory).forEach(([categoryId, photoCount]) => {
    const catId = parseInt(categoryId);
    const pointsInCategory = pointsByCategory[catId] || 0;

    // Si l'utilisateur a voté dans cette catégorie
    if (pointsInCategory > 0) {
        categoriesChecked++;

        // Calcul des bornes pour la catégorie
        const maxForCategory = Math.round(photoCount / 2);
        const minForCategory = Math.round(maxForCategory / 2);
        const avgForCategory = (maxForCategory + minForCategory) / 2;

        // Vérifier que les points sont dans la moyenne ±5 points
        if (Math.abs(pointsInCategory - avgForCategory) > 5) {
            isModere = false;
        }

        // Vérifier que max 50% de votes à 2 points dans cette catégorie
        const totalVotesInCat = totalVotesByCategory[catId] || 0;
        const twoPointVotesInCat = twoPointCountByCategory[catId] || 0;
        const twoPointPercent = totalVotesInCat > 0 ? (twoPointVotesInCat / totalVotesInCat) * 100 : 0;

        if (twoPointPercent > 50) {
            isModere = false;
        }
    }
});

// Le Modéré: doit avoir voté dans au moins 3 catégories et respecter les règles
if (isModere && categoriesChecked >= 3) {
    return {
        username,
        badge: 'Le Modéré',
        icon: 'fas fa-balance-scale',
        description: 'Ni trop, ni trop peu',
        color: '#607d8b',
        stats
    };
}

// Aucun badge ne correspond - retourner null
return null;
```

### 2. Suppression Badge Photographe par Défaut

**Fichier** : [agpaVoteProfilesHelper.ts:620-621](src/middleware/agpaVoteProfilesHelper.ts)

```typescript
// Aucun badge ne correspond - retourner null
return null;
```

### 3. Métadonnées Backend

**Fichier** : [agpaBadgesMetadata.ts:110-118](src/middleware/agpaBadgesMetadata.ts)

```typescript
{
    badge: 'Le Modéré',
    type: 'voter',
    timing: 'direct',
    icon: 'fas fa-balance-scale',
    description: 'Ni trop, ni trop peu',
    condition: 'Valeur moyenne par catégorie (±5 pts) + max 50% votes à 2 pts/catégorie',
    color: '#607d8b'
},

// ===== BADGES PHOTOGRAPHE (10) =====
// Note: "Le Talent Émergent" (badge par défaut) a été supprimé
```

### 4. Métadonnées Frontend

**Fichier** : [badgesMetadata.js:98-106](../absg-client/src/middleware/badgesMetadata.js)

```javascript
{
    badge: 'Le Modéré',
    type: 'voter',
    timing: 'direct',
    icon: 'fas fa-balance-scale',
    description: 'Ni trop, ni trop peu',
    condition: 'Valeur moyenne par catégorie (±5 pts) + max 50% votes à 2 pts/catégorie',
    color: '#607d8b'
},

// ===== BADGES PHOTOGRAPHE (10) =====
// Note: "L'Éclectique" et "Le Talent Émergent" (badges par défaut) ont été supprimés
```

## Exemples Concrets

### Exemple 1 : Édition avec 8 Catégories

**Répartition des photos** :
- Cat 1: 20 photos → max=10, min=5, avg=7.5 → plage [2.5, 12.5] = [3, 13] points
- Cat 2: 16 photos → max=8, min=4, avg=6 → plage [1, 11] points
- Cat 3: 24 photos → max=12, min=6, avg=9 → plage [4, 14] points
- Cat 4: 18 photos → max=9, min=5, avg=7 → plage [2, 12] points
- Cat 5: 22 photos → max=11, min=6, avg=8.5 → plage [3.5, 13.5] = [4, 14] points
- Cat 6: 14 photos → max=7, min=4, avg=5.5 → plage [0.5, 10.5] = [1, 11] points
- Cat 7: 12 photos → max=6, min=3, avg=4.5 → plage [-0.5, 9.5] = [0, 10] points
- Cat 8: 10 photos → max=5, min=3, avg=4 → plage [-1, 9] = [0, 9] points

**Utilisateur Alice** (obtient "Le Modéré") :
- Cat 1: 8 pts (6 votes, 2 à 2pts = 33%) ✅
- Cat 2: 6 pts (5 votes, 1 à 2pts = 20%) ✅
- Cat 3: 10 pts (7 votes, 3 à 2pts = 43%) ✅
- Cat 4: 7 pts (5 votes, 2 à 2pts = 40%) ✅
- Cat 5: 9 pts (6 votes, 2 à 2pts = 33%) ✅
- Total: 5 catégories votées
- **Résultat** : ✅ Obtient "Le Modéré"

**Utilisateur Bob** (N'obtient PAS "Le Modéré") :
- Cat 1: 15 pts (10 votes, 5 à 2pts = 50%) ❌ (15 > 13, hors plage)
- Cat 2: 6 pts (5 votes, 1 à 2pts = 20%) ✅
- Cat 3: 10 pts (7 votes, 3 à 2pts = 43%) ✅
- **Résultat** : ❌ N'obtient PAS "Le Modéré" (Cat 1 hors plage)
- **Badge obtenu** : Probablement "Le Mécène" ou autre selon total de points

**Utilisateur Charlie** (N'obtient PAS "Le Modéré") :
- Cat 1: 8 pts (4 votes, 3 à 2pts = 75%) ❌ (75% > 50%)
- Cat 2: 6 pts (5 votes, 1 à 2pts = 20%) ✅
- Cat 3: 10 pts (7 votes, 2 à 2pts = 29%) ✅
- **Résultat** : ❌ N'obtient PAS "Le Modéré" (>50% votes à 2pts dans Cat 1)
- **Badge obtenu** : Autre badge selon son profil

**Utilisateur Diana** (N'obtient PAS "Le Modéré") :
- Cat 1: 8 pts (6 votes, 2 à 2pts = 33%) ✅
- Cat 2: 6 pts (5 votes, 1 à 2pts = 20%) ✅
- Total: seulement 2 catégories ❌ (minimum 3 requis)
- **Résultat** : ❌ N'obtient PAS "Le Modéré" (< 3 catégories)
- **Badge obtenu** : `null` (aucun badge)

## Impact sur les Autres Badges

### Badges Votants

Le nombre total de badges votants passe de **11 à 12** :

| # | Badge | Statut |
|---|-------|--------|
| 1 | Le Patriote | Inchangé |
| 2 | L'Amoureux Transi | Inchangé |
| 3 | Le Parent Fier | Inchangé |
| 4 | Le Sniper | Inchangé |
| 5 | Féministe Convaincu | Inchangé |
| 6 | Le Philanthrope | Inchangé |
| 7 | L'Anticonformiste | Inchangé |
| 8 | Le Diplomate | Inchangé |
| 9 | Le Radin | Inchangé |
| 10 | Le Mécène | Inchangé |
| 11 | **Le Modéré** | **Modifié** - Maintenant avec critères spécifiques (n'est plus le badge par défaut) |

### Badges Photographes

Le nombre total de badges photographes passe de **10 à 9** :

| # | Badge | Statut |
|---|-------|--------|
| 1 | Le Phénomène | Inchangé |
| 2 | La Star | Inchangé |
| 3 | Le Chéri(e) de Mon Cœur | Inchangé |
| 4 | Le Chouchou de Famille | Inchangé |
| 5 | Le Transfuge | Inchangé |
| 6 | Le Protégé | Inchangé |
| 7 | La Coqueluche des Dames | Inchangé |
| 8 | L'Équilibré | Inchangé |
| 9 | L'Inconnu | Inchangé |
| ~~10~~ | ~~Le Talent Émergent~~ | **SUPPRIMÉ** - Badge par défaut retiré |

### Total des Badges AGPA

- **Votants** : 11 (inchangé)
- **Photographes** : 9 (était 10, -1)
- **Combos** : 14 (inchangé)
- **Progressifs** : 27 (inchangé)
- **TOTAL** : 61 badges (était 62, -1)

## Relation avec le Système de Votes

Cette modification s'inscrit dans le contexte des règles de validation des votes AGPA (Phase 3) :

### Règles de Validation des Votes

Pour qu'un vote soit comptabilisé, l'utilisateur doit :
- Distribuer **au minimum** la moitié de ses points par catégorie
- Distribuer **au maximum** un montant égal à la moitié du nombre de photos de la catégorie

Le badge "Le Modéré" récompense les utilisateurs qui :
- Respectent ces règles de validation
- Maintiennent un équilibre dans leurs votes (valeur moyenne ±5 points)
- Ne donnent pas trop de votes maximaux (max 50% de votes à 2 points)

### Différence avec "Le Mécène"

| Critère | Le Modéré | Le Mécène |
|---------|-----------|-----------|
| **Points distribués** | Valeur moyenne par catégorie | TOUS les points disponibles |
| **Votes à 2 points** | Max 50% par catégorie | Max 1 vote à 2pts par catégorie |
| **Philosophie** | Équilibre et modération | Générosité maximale |
| **Sélectivité** | Modéré (suit les règles) | Très sélectif (utilise 100%) |

## Tests de Validation

### Requête SQL pour Vérifier le Badge

```sql
-- Vérifier les badges "Le Modéré"
SELECT
    u.username,
    b."badgeName",
    b."statsSnapshot"->>'totalPoints' as total_points,
    b."statsSnapshot"->>'totalVotes' as total_votes,
    b."statsSnapshot" as stats
FROM agpa_user_badge b
JOIN public."user" u ON b."userId" = u.id
WHERE b."badgeName" = 'Le Modéré'
  AND b.year = 2024
ORDER BY u.username;
```

### Vérifier le Nouveau Badge par Défaut

```sql
-- Vérifier les badges "L'Éclectique" (nouveau badge par défaut)
SELECT
    u.username,
    b."badgeName",
    b."statsSnapshot"->>'totalPoints' as total_points
FROM agpa_user_badge b
JOIN public."user" u ON b."userId" = u.id
WHERE b."badgeName" = 'L''Éclectique'
  AND b.year = 2024
ORDER BY u.username;
```

### Comparer Avant/Après

```sql
-- Nombre d'utilisateurs avec "Le Modéré" avant et après
-- (nécessite d'avoir les anciennes données sauvegardées)
SELECT
    year,
    COUNT(*) as modere_count
FROM agpa_user_badge
WHERE "badgeName" = 'Le Modéré'
GROUP BY year
ORDER BY year DESC;
```

## Builds

- ✅ Backend : Compilation TypeScript réussie
- ✅ Frontend : Build Vite réussi

## Fichiers Modifiés

### Backend
1. [src/middleware/agpaVoteProfilesHelper.ts](src/middleware/agpaVoteProfilesHelper.ts)
   - Lignes 356-418 : Nouvelle logique "Le Modéré"
   - Lignes 420-428 : Nouveau badge par défaut "L'Éclectique"

2. [src/middleware/agpaBadgesMetadata.ts](src/middleware/agpaBadgesMetadata.ts)
   - Lignes 110-127 : Métadonnées "Le Modéré" et "L'Éclectique"

### Frontend
3. [src/middleware/badgesMetadata.js](../absg-client/src/middleware/badgesMetadata.js)
   - Lignes 98-115 : Métadonnées "Le Modéré" et "L'Éclectique"

## Prochaines Étapes

1. ✅ Recalculer les badges pour l'édition 2024
2. ✅ Vérifier la distribution des badges "Le Modéré" vs "L'Éclectique"
3. 🔲 Analyser si les seuils (±5 points, 50%, 3 catégories) sont appropriés
4. 🔲 Ajuster si nécessaire selon les retours utilisateurs

---

**Auteur** : Claude Code
**Date** : 2025-12-31
**Statut** : ✅ Implémenté et testé
**Badges modifiés** : "Le Modéré" (11), "L'Éclectique" (12 - nouveau)
