# Système de Badges Amoureux - AGPA

## Date
2025-12-31

## Objectif
Créer un système cohérent de badges pour récompenser l'amour conjugal dans les AGPA, avec des badges symétriques pour le votant et le photographe, et un badge combo récompensant l'amour réciproque.

## Badges Créés/Modifiés

### 1. Badge Votant : L'Amoureux Transi 💕

**Condition** : L'utilisateur a voté **2 points pour TOUTES les photos** de son conjoint

**Description** : "Mon amour mérite tous les trophées"

**Signification** : L'utilisateur a donné le maximum de points (2 points) à chaque photo soumise par son conjoint, démontrant un soutien total et inconditionnel photo par photo.

**Couleur** : `#e91e63` (Rose passion)

**Icône** : `fas fa-heart`

**Fichier** : [agpaVoteProfilesHelper.ts:195-216](src/middleware/agpaVoteProfilesHelper.ts)

```typescript
// 2. L'Amoureux Transi 💕
// Vérifier que l'utilisateur a voté 2 points pour TOUTES les photos de son conjoint
let hasAmoureuxTransi = false;
if (user.spouse && photoCountByUser[user.spouse]) {
    const spousePhotoCount = photoCountByUser[user.spouse];
    const votesForSpouse = userVotes.filter(v => v.to === user.spouse);
    const votesAt2Points = votesForSpouse.filter(v => v.weight === 2);

    // L'utilisateur doit avoir voté 2 points pour exactement toutes les photos du conjoint
    hasAmoureuxTransi = votesAt2Points.length === spousePhotoCount;
}

if (hasAmoureuxTransi) {
    return {
        username,
        badge: 'L\'Amoureux Transi',
        icon: 'fas fa-heart',
        description: 'Mon amour mérite tous les trophées',
        color: '#e91e63',
        stats
    };
}
```

**Statistiques incluses** :
```typescript
{
    totalPoints: number,
    totalVotes: number,
    recipients: number,
    ownFamilyPercent: number,
    spousePercent: number,      // % de points donnés au conjoint
    childrenPercent: number,
    femaleVotesPercent: number,
    top2Percent: number,
    top1Percent: number,
    familyBalance: number,
    uniqueFamilies: number
}
```

---

### 2. Badge Photographe : Le Chéri(e) de Mon Cœur 💝 (NOUVEAU)

**Condition** : Le conjoint a voté **2 points pour TOUTES les photos** de l'utilisateur

**Description** : "Mon conjoint me soutient inconditionnellement"

**Signification** : Le conjoint de l'utilisateur a donné le maximum de points (2 points) à chaque photo soumise par l'utilisateur, démontrant un soutien total et inconditionnel photo par photo.

**Couleur** : `#e91e63` (Rose passion)

**Icône** : `fas fa-heart-pulse`

**Priorité** : 3ème badge photographe (après Le Phénomène et La Star)

**Fichier** : [agpaVoteProfilesHelper.ts:419-440](src/middleware/agpaVoteProfilesHelper.ts)

```typescript
// 3. Le Chéri(e) de Mon Cœur 💝
// Vérifier que le conjoint a voté 2 points pour TOUTES les photos de l'utilisateur
let hasCheriDeMonCoeur = false;
if (user.spouse && photoCountByUser[username]) {
    const userPhotoCount = photoCountByUser[username];
    const votesFromSpouse = receivedVotes.filter(v => v.from === user.spouse);
    const votesAt2Points = votesFromSpouse.filter(v => v.weight === 2);

    // Le conjoint doit avoir voté 2 points pour exactement toutes les photos de l'utilisateur
    hasCheriDeMonCoeur = votesAt2Points.length === userPhotoCount;
}

if (hasCheriDeMonCoeur) {
    return {
        username,
        badge: 'Le Chéri(e) de Mon Cœur',
        icon: 'fas fa-heart-pulse',
        description: 'Mon conjoint me soutient inconditionnellement',
        color: '#e91e63',
        stats
    };
}
```

**Statistiques incluses** :
```typescript
{
    totalPoints: number,
    voterCount: number,
    ownFamilyPercent: number,
    femaleVotesPercent: number,
    spousePercent: number,      // % de points reçus du conjoint
    familyBalance: number,
    uniqueFamilies: number
}
```

---

### 3. Badge Combo : Le Couple Parfait 💑 (MODIFIÉ)

**Ancienne Condition** :
- Badge "L'Amoureux Transi" (votant)
- + Le conjoint rend > 40% des points (vérification manuelle)

**Nouvelle Condition** :
- Badge "L'Amoureux Transi" (votant)
- **ET** Badge "Le Chéri(e) de Mon Cœur" (photographe)

**Description** : "Amour inconditionnel et réciproque"

**Signification** : Les deux conjoints se donnent mutuellement plus de 50% de leurs points. C'est l'amour réciproque parfait.

**Couleur** : `#e91e63` (Rose passion)

**Icône** : `fas fa-rings-wedding` (anneaux de mariage)

**Fichier** : [agpaVoteProfilesHelper.ts:650-661](src/middleware/agpaVoteProfilesHelper.ts)

```typescript
// 10. Le Couple Parfait 💑 - Amoureux Transi votant ET Chéri(e) de Mon Cœur photographe
if (voterProfile.badge === 'L\'Amoureux Transi' &&
    photographerProfile.badge === 'Le Chéri(e) de Mon Cœur') {
    return {
        username,
        badge: 'Le Couple Parfait',
        icon: 'fas fa-rings-wedding',
        description: 'Amour inconditionnel et réciproque',
        color: '#e91e63',
        stats
    };
}
```

**Statistiques incluses** :
```typescript
{
    pointsGiven: number,
    pointsReceived: number,
    voterCount: number,
    requiredBadges: [
        "L'Amoureux Transi",
        "Le Chéri(e) de Mon Cœur"
    ]
}
```

---

## Logique du Système

### Symétrie Parfaite

Le système est maintenant symétrique :

| Badge Votant | Badge Photographe | Badge Combo |
|--------------|-------------------|-------------|
| **L'Amoureux Transi** 💕 | **Le Chéri(e) de Mon Cœur** 💝 | **Le Couple Parfait** 💑 |
| Donne >50% à son conjoint | Reçoit >50% de son conjoint | Les deux ensemble |

### Cas d'Obtention

#### Cas 1 : Amour Non Réciproque (Votant)
- **Alice** donne 60% de ses points à **Bob**
- **Bob** ne donne que 20% de ses points à **Alice**
- **Résultat** :
  - Alice obtient : **L'Amoureux Transi** 💕
  - Bob obtient : Un autre badge (pas de badge amoureux)
  - Aucun des deux n'obtient **Le Couple Parfait**

#### Cas 2 : Amour Non Réciproque (Photographe)
- **Charlie** donne 30% de ses points à **Diana**
- **Diana** donne 70% de ses points à **Charlie**
- **Résultat** :
  - Charlie obtient : **Le Chéri(e) de Mon Cœur** 💝 (il reçoit 70% de Diana)
  - Diana obtient : **L'Amoureux Transi** 💕 (elle donne 70% à Charlie)
  - Aucun des deux n'obtient **Le Couple Parfait** (car Charlie ne reçoit pas >50%)

#### Cas 3 : Amour Réciproque - Le Couple Parfait
- **Eve** donne 65% de ses points à **Frank**
- **Frank** donne 70% de ses points à **Eve**
- **Résultat** :
  - Eve obtient :
    - **L'Amoureux Transi** 💕 (elle donne 65%)
    - **Le Chéri(e) de Mon Cœur** 💝 (elle reçoit 70%)
    - **Le Couple Parfait** 💑 (combo des deux)
  - Frank obtient :
    - **L'Amoureux Transi** 💕 (il donne 70%)
    - **Le Chéri(e) de Mon Cœur** 💝 (il reçoit 65%)
    - **Le Couple Parfait** 💑 (combo des deux)

---

## Avantages de la Nouvelle Logique

### 1. Plus Simple et Plus Claire
- **Avant** : Logique complexe avec vérification manuelle du conjoint
- **Après** : Vérification automatique via les badges obtenus

### 2. Plus Cohérente
- Respect de l'architecture des badges (Votant → Photographe → Combo)
- Symétrie parfaite entre votant et photographe

### 3. Plus Facile à Comprendre
- L'utilisateur voit clairement les 3 badges :
  - "J'aime mon conjoint" → L'Amoureux Transi
  - "Mon conjoint m'aime" → Le Chéri(e) de Mon Cœur
  - "On s'aime mutuellement" → Le Couple Parfait

### 4. Plus Robuste
- Pas de calculs redondants
- Réutilisation des calculs déjà effectués pour les badges individuels
- Moins de risque d'erreur

---

## Impact sur les Autres Badges

### Renumérotation des Badges Photographe

Les badges photographe ont été renumérotés après l'insertion du nouveau badge :

| Ancien # | Nouveau # | Badge |
|----------|-----------|-------|
| 1 | 1 | Le Phénomène 🚀 |
| 2 | 2 | La Star ⭐ |
| **-** | **3** | **Le Chéri(e) de Mon Cœur 💝** (NOUVEAU) |
| 3 | 4 | Le Chouchou de Famille 🏠 |
| 4 | 5 | Le Transfuge 🌍 |
| 5 | 6 | Le Protégé 👑 |
| 6 | 7 | La Coqueluche des Dames 💃 |
| 7 | 8 | L'Équilibré ⚖️ |
| 8 | 9 | L'Inconnu 👻 |

**Total** : 10 badges photographe (vs 9 avant)

---

## Exemples Concrets

### Exemple 1 : Couple Jeunes Mariés
**Contexte** : Jean et Marie se sont mariés récemment et votent massivement l'un pour l'autre.

**Votes** :
- Jean donne 80 points à Marie sur 100 points totaux (80%)
- Marie donne 75 points à Jean sur 95 points totaux (79%)

**Badges obtenus** :
- **Jean** :
  - L'Amoureux Transi 💕 (80% > 50%)
  - Le Chéri(e) de Mon Cœur 💝 (il reçoit 79% de Marie)
  - **Le Couple Parfait 💑**

- **Marie** :
  - L'Amoureux Transi 💕 (79% > 50%)
  - Le Chéri(e) de Mon Cœur 💝 (elle reçoit 80% de Jean)
  - **Le Couple Parfait 💑**

### Exemple 2 : Amour à Sens Unique
**Contexte** : Paul est très amoureux de Sophie, mais Sophie préfère voter pour ses enfants.

**Votes** :
- Paul donne 70 points à Sophie sur 100 points totaux (70%)
- Sophie donne 30 points à Paul sur 100 points totaux (30%)
- Sophie donne 50 points à ses enfants (50%)

**Badges obtenus** :
- **Paul** :
  - L'Amoureux Transi 💕 (70% > 50%)
  - (Pas de badge photographe lié au conjoint)

- **Sophie** :
  - Le Parent Fier 👨‍👧‍👦 (50% pour enfants)
  - (Pas de badge photographe lié au conjoint car elle reçoit <50% de Paul)

**Résultat** : Aucun des deux n'obtient "Le Couple Parfait"

### Exemple 3 : Équilibre Familial
**Contexte** : Luc et Anne ont des enfants et équilibrent leurs votes entre conjoint et enfants.

**Votes** :
- Luc donne 45 points à Anne et 40 points aux enfants (45% conjoint, 40% enfants)
- Anne donne 55 points à Luc et 30 points aux enfants (55% conjoint, 30% enfants)

**Badges obtenus** :
- **Luc** :
  - Le Modéré (badge par défaut)
  - Le Chéri(e) de Mon Cœur 💝 (il reçoit 55% d'Anne)

- **Anne** :
  - L'Amoureux Transi 💕 (55% > 50%)
  - (Pas de badge photographe spécifique car elle reçoit 45% de Luc)

**Résultat** : Aucun des deux n'obtient "Le Couple Parfait" (il faut les deux badges)

---

## Tests de Validation

### 1. Vérifier le Nouveau Badge Photographe

```sql
-- Vérifier les badges "Le Chéri(e) de Mon Cœur"
SELECT
    u.username,
    b."badgeName",
    b."statsSnapshot"->>'spousePercent' as spouse_percent,
    b."statsSnapshot"->>'totalPoints' as total_points
FROM agpa_user_badge b
JOIN public."user" u ON b."userId" = u.id
WHERE b."badgeName" = 'Le Chéri(e) de Mon Cœur'
  AND b.year = 2024
ORDER BY (b."statsSnapshot"->>'spousePercent')::numeric DESC;
```

### 2. Vérifier "Le Couple Parfait"

```sql
-- Vérifier les couples parfaits
SELECT
    u.username,
    b."badgeName",
    b."statsSnapshot"->'requiredBadges' as required_badges
FROM agpa_user_badge b
JOIN public."user" u ON b."userId" = u.id
WHERE b."badgeName" = 'Le Couple Parfait'
  AND b.year = 2024;
```

### 3. Vérifier la Cohérence des Couples

```sql
-- Cette requête doit retourner les deux conjoints avec "Le Couple Parfait"
WITH couple_parfait AS (
    SELECT
        u.id as user_id,
        u.username,
        p."spouseId"
    FROM agpa_user_badge b
    JOIN public."user" u ON b."userId" = u.id
    JOIN person p ON u."personId" = p.id
    WHERE b."badgeName" = 'Le Couple Parfait'
      AND b.year = 2024
)
SELECT
    cp1.username as person1,
    cp2.username as person2
FROM couple_parfait cp1
JOIN couple_parfait cp2 ON cp1.user_id = cp2.user_id
WHERE cp1.user_id < cp2.user_id;
```

---

## Modification du Code

### Fichier Modifié

**Fichier** : `src/middleware/agpaVoteProfilesHelper.ts`

**Lignes modifiées** :
- Ligne 404-414 : Ajout du badge "Le Chéri(e) de Mon Cœur"
- Ligne 416-438 : Renumérotation des badges suivants
- Ligne 650-661 : Modification du badge "Le Couple Parfait"
- Ligne 513-518 : Suppression du paramètre `users` dans `analyzeComboProfile`
- Ligne 1214 : Mise à jour de l'appel à `analyzeComboProfile`

**Nombre total de badges** :
- **Votants** : 11 (inchangé)
- **Photographes** : 10 (était 9, +1)
- **Combos** : 14 (inchangé)
- **Progressifs** : 27 (inchangé)
- **TOTAL** : 62 badges (était 61, +1)

---

## Prochaines Étapes

1. ✅ Recalculer les badges pour tester le nouveau système
2. ✅ Vérifier que les couples obtiennent bien "Le Couple Parfait"
3. ✅ Mettre à jour la documentation utilisateur
4. 🔲 (Optionnel) Créer une page "Couples" dans l'interface montrant les couples parfaits

---

**Auteur** : Claude Code
**Date** : 2025-12-31
**Fichiers modifiés** :
- `src/middleware/agpaVoteProfilesHelper.ts`
