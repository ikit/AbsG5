# Intégration des Relations Familiales dans les Badges AGPA

## Date
2025-12-31

## Objectif
Activer les badges AGPA qui dépendent des relations familiales (conjoint/enfants) en utilisant les données de la table `person`.

## Modifications Apportées

### 1. Entité Person ([Person.ts](src/entities/Person.ts))

Ajout de trois relations familiales auto-référencées :

```typescript
// Relations familiales
@Column({ nullable: true, comment: "ID du conjoint (référence à Person)" })
spouseId: number;

@ManyToOne(() => Person, { nullable: true })
@JoinColumn({ name: "spouseId" })
spouse: Person;

@Column({ nullable: true, comment: "ID de la mère (référence à Person)" })
motherId: number;

@ManyToOne(() => Person, { nullable: true })
@JoinColumn({ name: "motherId" })
mother: Person;

@Column({ nullable: true, comment: "ID du père (référence à Person)" })
fatherId: number;

@ManyToOne(() => Person, { nullable: true })
@JoinColumn({ name: "fatherId" })
father: Person;
```

**Note**: Les colonnes sont nullable pour permettre des données incomplètes.

### 2. Service AGPA ([AgpaService.ts:627-681](src/services/AgpaService.ts))

Modification de la fonction `getVoteProfiles()` pour charger et résoudre les relations familiales :

#### Requête SQL enrichie
La requête charge maintenant les IDs des relations familiales :
```sql
SELECT
    u.id,
    u.username,
    u."rootFamily",
    u."personId",
    p.sex,
    p."spouseId",
    p."motherId",
    p."fatherId"
FROM public."user" u
LEFT JOIN person p ON u."personId" = p.id
```

#### Résolution des Relations
1. **Mapping personId → userId** : Création d'un dictionnaire pour convertir les personId en userId
2. **Spouse** : Résolution du conjoint via `personToUser[spouseId]`
3. **Children** : Recherche des personnes dont `motherId` ou `fatherId` correspond au `personId` de l'utilisateur

#### Code de résolution
```typescript
// Construire un mapping personId -> userId
const personToUser: Record<number, string> = {};
usersData.forEach((u: any) => {
    if (u.personId) {
        personToUser[u.personId] = u.id.toString();
    }
});

// Pour chaque utilisateur
usersData.forEach((u: any) => {
    // Résoudre le spouse
    const spouseUserId = u.spouseId ? personToUser[u.spouseId] : undefined;

    // Résoudre les children
    const children: string[] = [];
    if (u.personId) {
        usersData.forEach((other: any) => {
            if (other.motherId === u.personId || other.fatherId === u.personId) {
                children.push(other.id.toString());
            }
        });
    }

    users[userId] = {
        username: u.username,
        rootFamily: u.rootFamily || 'autre',
        sex: u.sex || 'undefined',
        spouse: spouseUserId,
        children: children.length > 0 ? children : undefined
    };
});
```

## Badges Impactés

### Badges Votant (utilisant spouse/children)

#### 1. L'Amoureux Transi 💕
- **Condition** : `spousePercent > 50%`
- **Description** : "Mon amour mérite tous les trophées"
- **Calcul** : Pourcentage des points donnés au conjoint

#### 2. Le Parent Fier 👨‍👧‍👦
- **Condition** : `childrenPercent > 50%`
- **Description** : "Ce sont les plus doués, c'est normal"
- **Calcul** : Pourcentage des points donnés aux enfants (somme de tous les enfants)

### Badges Combo (utilisant spouse)

#### 3. Le Couple Parfait 💑
- **Condition** : Badge "L'Amoureux Transi" + réciprocité du conjoint > 40%
- **Description** : "L'amour est réciproque"
- **Calcul** :
  - L'utilisateur a le badge "L'Amoureux Transi"
  - Le conjoint lui donne > 40% de ses points en retour

### Badges Photographe (utilisant spouse)

Le `spousePercent` est également calculé pour le profil photographe pour déterminer le pourcentage de points reçus du conjoint.

## Impact Technique

### Base de Données
- Les colonnes `spouseId`, `motherId`, `fatherId` doivent être renseignées dans la table `person`
- Si `synchronize: true` en développement, les colonnes sont automatiquement créées
- En production, une migration TypeORM devrait être générée

### Performance
- **Une requête SQL supplémentaire** : Non, les relations sont chargées en une seule requête avec LEFT JOIN
- **Complexité** : O(n²) pour la résolution des enfants (boucle imbriquée sur usersData)
- **Impact** : Négligeable car le nombre d'utilisateurs participant à une édition AGPA est faible (< 100)

## Tests de Validation

### 1. Vérifier les Données Familiales

```sql
-- Voir les relations familiales renseignées
SELECT
    p.id,
    p.firstname,
    p.lastname,
    spouse.firstname as spouse_name,
    mother.firstname as mother_name,
    father.firstname as father_name
FROM person p
LEFT JOIN person spouse ON p."spouseId" = spouse.id
LEFT JOIN person mother ON p."motherId" = mother.id
LEFT JOIN person father ON p."fatherId" = father.id
WHERE p."spouseId" IS NOT NULL
   OR p."motherId" IS NOT NULL
   OR p."fatherId" IS NOT NULL;
```

### 2. Tester le Calcul des Badges

```bash
# Recalculer les badges pour une année
POST /api/agpa/compute-badges/2024

# Vérifier les badges attribués
GET /api/agpa/badges-history/42
```

### 3. Vérifier les Stats dans la BD

```sql
-- Voir les statsSnapshot des badges qui utilisent spouse/children
SELECT
    u.username,
    b."badgeName",
    b."statsSnapshot"
FROM agpa_user_badge b
JOIN public."user" u ON b."userId" = u.id
WHERE b."badgeName" IN ('L''Amoureux Transi', 'Le Parent Fier', 'Le Couple Parfait')
  AND b.year = 2024;
```

Les `statsSnapshot` doivent contenir `spousePercent` et `childrenPercent` avec des valeurs > 0.

## Exemple de Données Attendues

### Input (UserData avec relations)
```typescript
{
    "42": {
        username: "john.doe",
        rootFamily: "gueudelot",
        sex: "male",
        spouse: "43",           // ✅ userId du conjoint
        children: ["44", "45"]  // ✅ userId des enfants
    }
}
```

### Output (Badge avec stats)
```json
{
    "badgeName": "L'Amoureux Transi",
    "statsSnapshot": {
        "totalPoints": 85,
        "spousePercent": 55.3,      // ✅ > 50% → badge obtenu
        "childrenPercent": 12.1,
        "totalVotes": 42,
        "recipients": 8,
        "ownFamilyPercent": 73.5,
        "femaleVotesPercent": 45.3,
        "top2Percent": 55.8,
        "top1Percent": 38.2,
        "familyBalance": 12.4,
        "uniqueFamilies": 3
    }
}
```

## Prochaines Étapes

### Immédiat
1. ✅ Renseigner les données familiales dans la table `person`
2. ✅ Tester le calcul des badges sur une édition
3. ✅ Vérifier que les 3 badges fonctionnent correctement

### Futur (Optionnel)
1. Créer une interface d'administration pour gérer les relations familiales
2. Ajouter des validations (ex: un conjoint doit avoir la réciprocité)
3. Générer un arbre généalogique à partir des données
4. Ajouter d'autres badges utilisant les relations familiales

## Notes Techniques

### Pourquoi personId et non userId ?
- La table `person` stocke les informations biographiques (indépendantes du compte utilisateur)
- La table `user` lie une personne à un compte (un utilisateur peut ne pas avoir de compte)
- Les relations familiales se font au niveau `person` pour rester cohérentes même si le compte change

### Gestion des Cas Limites
- **Spouse non participant** : Si le conjoint n'a pas participé à l'édition, `spouse` sera `undefined` → `spousePercent = 0`
- **Children non participants** : Les enfants non participants ne seront pas dans `children` → pas comptabilisés
- **Données manquantes** : Si `spouseId`/`motherId`/`fatherId` sont null → relations non résolues

---

**Auteur** : Claude Code
**Date** : 2025-12-31
**Fichiers modifiés** :
- `src/entities/Person.ts`
- `src/services/AgpaService.ts`
