# AGPA - Algorithme de Calcul du Palmarès

## Vue d'ensemble

Ce document décrit en détail l'algorithme de calcul et d'établissement du palmarès des AGPA (Absolument G Photos Awards), le concours photo annuel de la communauté Absolument G.

**Dernière mise à jour** : 2026-01-10

---

## Table des matières

1. [Modèle de Données](#1-modèle-de-données)
2. [Règles Principales du Concours](#2-règles-principales-du-concours)
3. [Algorithme de Calcul des Notes](#3-algorithme-de-calcul-des-notes)
4. [Attribution des Récompenses](#4-attribution-des-récompenses)
5. [Calcul du Palmarès](#5-calcul-du-palmarès)
6. [Départage des Ex-Aequo](#6-départage-des-ex-aequo)
7. [Palmarès Glissant](#7-palmarès-glissant)
8. [Flux de Données Complet](#8-flux-de-données-complet)

---

## 1. Modèle de Données

### 1.1 Entités Principales

#### AgpaPhoto
Représente une photo soumise au concours.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | number | Identifiant unique |
| `userId` | number | ID de l'auteur |
| `categoryId` | number | ID de la catégorie |
| `year` | number | Année de l'édition |
| `filename` | string | Nom du fichier |
| `title` | string | Titre de la photo |
| `ranking` | number | Classement (null avant dépouillement) |
| `number` | number | Numéro de la photo |
| `votes` | number | Nombre de votes reçus (étoiles) |
| `votesTitle` | number | Nombre de votes reçus (plumes) |
| `score` | number | Score brut (somme des points) |
| `gscore` | number | Score homogénéisé (note G) |
| `error` | json | Erreur disqualifiante (null si valide) |

#### AgpaVote
Représente un vote d'un juré pour une photo.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | number | Identifiant unique |
| `year` | number | Année de l'édition |
| `categoryId` | number | ID de la catégorie |
| `userId` | number | ID du votant |
| `photoId` | number | ID de la photo votée |
| `score` | number | Note attribuée (1 ou 2 étoiles, 0 pour plume) |

#### AgpaAward
Représente une récompense attribuée.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | number | Identifiant unique |
| `year` | number | Année d'attribution |
| `categoryId` | number | ID de la catégorie |
| `userId` | number | ID du lauréat |
| `award` | enum | Type: `honor`, `nominated`, `bronze`, `sylver`, `gold`, `diamond` |
| `photoId` | number | ID de la photo récompensée |

#### AgpaCategory
Définit les catégories du concours.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | number | Identifiant (1-8 pour catégories simples, négatifs pour spéciales) |
| `title` | string | Nom de la catégorie |
| `order` | number | Ordre d'affichage |
| `description` | string | Description de la catégorie |
| `color` | string | Couleur associée |

### 1.2 Catégories

#### Catégories Simples (ID > 0)
| ID | Catégorie | Description |
|----|-----------|-------------|
| 1 | Portrait | Photos mettant en évidence un personnage unique de plus de 12 ans |
| 2 | Groupe et événement | Photos de groupes avec minimum 2 individus |
| 3 | Enfant | Portraits ou photos de groupe d'enfants de 12 ans ou moins |
| 4 | Nature | Sujets ou phénomènes naturels |
| 5 | Grand angle | Paysages et panoramas |
| 6 | Manus Hominum | Emprunte de l'Homme (villes, monuments, etc.) |
| 7 | Spéciale | Thème annuel choisi par les participants |
| 8 | Autre regard | Photos humoristiques, artistiques, décalées |

#### Catégories Spéciales (ID < 0)
| ID | Catégorie | Description |
|----|-----------|-------------|
| -1 | Meilleur photographe | Récompense le photographe global |
| -2 | Meilleure photographie | Meilleure photo toutes catégories |
| -3 | Meilleur titre | Photo avec le meilleur titre (depuis 2011) |

---

## 2. Règles Principales du Concours

### 2.1 Participation

- Ouvert à tous les membres du forum Absolument G
- Maximum **2 photos par catégorie** par participant
- Photos prises par le candidat durant l'année (décembre N-1 accepté)

### 2.2 Votes

- **Étoiles** : 1 ou 2 points par photo (catégories simples)
- **Plumes** : Vote pour le meilleur titre (5 à 10 votes par juré)
- Interdit de voter pour ses propres photos
- Âge minimum **12 ans** pour que les votes soient comptés

### 2.3 Contraintes de Vote par Catégorie

Pour chaque catégorie, un juré doit distribuer un nombre de points dans une plage définie :

```
maxVotePhoto = round(nombrePhotos / 2)
minVotePhoto = round(maxVotePhoto / 2)
```

Si le total des points distribués n'est pas dans `[minVotePhoto, maxVotePhoto]`, les votes de ce juré pour cette catégorie sont **invalidés**.

### 2.4 Barème des Points Palmarès

| Récompense | Points |
|------------|--------|
| AGPA de Diamant | 5 |
| AGPA d'Or | 4 |
| AGPA d'Argent | 3 |
| AGPA de Bronze | 2 |
| Nominé | 1 |
| AGPA d'Honneur | 0 |

---

## 3. Algorithme de Calcul des Notes

### 3.1 Étape 1 : Vérification des Votes (`p4CheckVotes`)

Pour chaque catégorie et chaque juré :

1. **Validation individuelle de chaque vote** :
   - Score entre 0 et 2
   - Pas de vote pour ses propres photos
   - Catégorie du vote = catégorie de la photo
   - Année du vote = année de la photo

2. **Validation du juré** :
   - Âge ≥ 12 ans
   - Total points dans `[minVotePhoto, maxVotePhoto]`

3. **Décision** : Un juré est valide si TOUTES les conditions sont respectées

### 3.2 Étape 2 : Calcul des Notes (`p4ComputeNotes`)

#### Phase 1 : Agrégation des votes

Pour chaque photo :
```
votes = nombre de jurés valides ayant voté pour la photo
score = somme des points attribués par les jurés valides
```

Pour chaque catégorie :
```
judgesNumber = nombre de jurés valides
scoresSum = total des points distribués dans la catégorie
votesSum = total des votes distribués dans la catégorie
```

#### Phase 2 : Calcul de la Note G (score homogénéisé)

La note G permet de comparer des photos de catégories différentes.

**Formule** :
```
Note G = NotePts + NoteVts

NotePts = (PtsPhoto × NbPhotos / PtsCatégorie) × 10^7/1001
NoteVts = (VtsPhoto × NbPhotos / VtsCatégorie) × 10^4/1001
```

**En code** :
```typescript
const scoreCoef = 9990.00999001;  // 10000000 / 1001
const votesCoef = 9.99000999001;  // 10000 / 1001

const scoreNote = photo.score * (cat.totalPhotos / cat.scoresSum) * scoreCoef;
const votesScore = photo.votes * (cat.totalPhotos / cat.votesSum) * votesCoef;
gscore = Math.round(scoreNote + votesScore);
```

**Propriétés** :
- Score moyen par catégorie = **10 000 points**
- `NotePts` (coefficient fort) est déterminante
- `NoteVts` départage les égalités sur `NotePts`
- Favorise les photos des grandes catégories

---

## 4. Attribution des Récompenses

### 4.1 Catégories Simples (`p4AgpaAttribution`)

Pour chaque catégorie (ID > 0), les photos sont triées par Note G décroissante :

| Position | Récompense |
|----------|------------|
| 1ère | AGPA d'Or |
| 2ème | AGPA d'Argent |
| 3ème | AGPA de Bronze |
| 4ème | Nominé |

**Cas spécial du Double Or** :
Si les 2 premières photos :
- Ont le même auteur
- Ont le même score

Alors :
- 1ère et 2ème → AGPA d'Or
- 3ème → AGPA d'Argent
- 4ème → AGPA de Bronze

### 4.2 Meilleur Titre (catégorie -3)

Photos triées par nombre de plumes décroissant :
- 4 premiers → nominés avec Or, Argent, Bronze, Nominé

### 4.3 Meilleure Photographie (catégorie -2)

Toutes les photos de l'édition triées par Note G :
- 4 premières → récompensées comme catégorie simple

### 4.4 Meilleur Photographe (catégorie -1)

**Calcul du score par photographe** :
```
scoreOf8 = somme des Notes G des 8 meilleures photos
           (8 = nombre de catégories)
```

Si un photographe a moins de 8 photos, toutes sont comptées.

Photographes triés par `scoreOf8` décroissant :
- 1er → AGPA d'Or du meilleur photographe
- 2ème → AGPA d'Argent
- 3ème → AGPA de Bronze

### 4.5 AGPA de Diamant (`p4DiamondAttribution`)

L'AGPA d'Or peut être transformé en AGPA de Diamant dans ces cas :

#### Catégorie Simple
```
gscore(1ère) > 2 × gscore(2ème) ET gscore(1ère) ≥ 50 000
```

#### Meilleur Titre
```
plumes(1ère) > 2 × plumes(2ème)
```

#### Meilleure Photo
```
photo est Diamant de sa catégorie
ET votes = (nombre de jurés - 1)  // vote quasi-unanime
```

#### Meilleur Photographe
```
(auteur des 3 meilleures photos ET top4.score ≥ 100 000)
OU palmarès édition ≥ 33 points
```

### 4.6 AGPA d'Honneur (`p4HonorAttribution`)

Attribué aux enfants de moins de 12 ans qui :
- Ont participé (soumis des photos)
- N'ont remporté aucune autre récompense

L'AGPA d'Honneur ne donne **aucun point** au palmarès.

---

## 5. Calcul du Palmarès

### 5.1 Structure du Palmarès (`AgpaPalmares`)

Pour chaque utilisateur :

```typescript
{
  userId: number,
  username: string,
  rootFamily: string,        // Famille d'appartenance
  from: number,              // Année de début (période)
  to: number,                // Année de fin (période)

  awards: {
    total: number,           // Total récompenses (hors nominé/honneur)
    diamond: number,
    gold: number,
    sylver: number,
    bronze: number,
    nominated: number,
    honor: number
  },

  totalPoints: number,       // Score palmarès

  statsByCategories: [{
    id: number,
    title: string,
    stats: [nominated, bronze, sylver, gold, diamond, totalAgpa, totalPoints]
  }],

  statsByYears: [{
    year: number,
    stats: [honor, nominated, bronze, sylver, gold, diamond, totalAgpa, totalPoints]
  }],

  participation: {
    total: number,           // Nombre d'éditions
    first: number,           // Première participation
    last: number             // Dernière participation
  },

  bestCat: object,           // Meilleure catégorie
  bestYear: object           // Meilleure année
}
```

### 5.2 Algorithme de Construction (`palmaresData`)

```
1. Récupérer tous les awards de la période [from, to]

2. Pour chaque award :
   a. Créer ou récupérer l'entrée palmarès de l'utilisateur
   b. Ajouter les points selon le barème
   c. Mettre à jour les statistiques par catégorie
   d. Mettre à jour les statistiques par année

3. Trier par totalPoints décroissant

4. Ajouter les données de participation (nombre d'éditions, première/dernière)
```

### 5.3 Requête SQL Principale

```sql
SELECT a.year, a.award, a."photoId", a."categoryId",
       c.title as "catTitle", c.order, c.color,
       p.title, p.filename,
       a."userId", u.username, u."rootFamily"
FROM agpa_award a
INNER JOIN agpa_category c ON a."categoryId" = c.id
INNER JOIN public."user" u ON a."userId" = u.id
INNER JOIN person up ON u."personId" = up.id
LEFT JOIN agpa_photo p ON a."photoId" = p.id
ORDER BY a."categoryId" ASC, a.year ASC
```

---

## 6. Départage des Ex-Aequo

### 6.1 Photos (même catégorie)

Critères appliqués dans l'ordre :

1. **Note G** : Plus grande = meilleure
2. **Titre** : Photo titrée > non titrée
3. **Taille catégorie** : Plus grande catégorie = avantage
4. **Année** : Plus récente = avantage
5. **Palmarès antérieur** : Plus faible = avantage
6. **Tirage au sort**

```typescript
function sortPhotos(aId, bId) {
    // 1. Note G décroissante
    let res = b.gscore - a.gscore;
    if (res != 0) return res;

    // 2. Présence de titre
    res = (b.title != "" ? 1 : 0) - (a.title != "" ? 1 : 0);
    if (res != 0) return res;

    // 3. Taille de catégorie
    res = ctx.categories[b.categoryId].photosNumber -
          ctx.categories[a.categoryId].photosNumber;
    if (res != 0) return res;

    // 4. Année
    res = b.year - a.year;
    if (res != 0) return res;

    // 5. Palmarès antérieur (plus faible = avantage)
    res = ctx.users[a.userId].formerPalmares -
          ctx.users[b.userId].formerPalmares;
    if (res != 0) return res;

    // 6. Tirage au sort
    return Math.random() > 0.5 ? 1 : -1;
}
```

### 6.2 Photographes

Critères appliqués dans l'ordre :

1. **Score des 8 meilleures photos** : Plus grand = meilleur
2. **Moyenne des photos** : Plus grande = avantage
3. **Note de la pire photo** : Plus grande = avantage
4. **Palmarès édition courante** : Plus grand = avantage
5. **Palmarès antérieur** : Plus faible = avantage
6. **Tirage au sort**

### 6.3 Titres

Critères appliqués dans l'ordre :

1. **Nombre de plumes** : Plus grand = meilleur
2. **Note G** : Plus grande = avantage
3. **Palmarès édition courante** : Plus faible = avantage
4. **Palmarès antérieur** : Plus faible = avantage
5. **Tirage au sort**

---

## 7. Palmarès Glissant

### 7.1 Concept

Le palmarès glissant représente les performances sur les **3 dernières éditions** terminées. Il permet de :
- Identifier les photographes actuellement les plus performants
- Attribuer des badges basés sur la progression récente
- Calculer des statistiques de tendance

### 7.2 Calcul

```typescript
// Déterminer la période
const maxYear = getMaxArchiveEdition();  // Dernière édition terminée
const yearFrom = maxYear - 2;            // 3 ans en arrière
const yearTo = maxYear;

// Calculer le palmarès sur cette période
const slidingPalmares = await palmaresData(yearFrom, yearTo);
```

### 7.3 Variation de Rang

La variation de rang indique la progression ou régression d'un photographe par rapport à l'année précédente :

```
rankChange = rang(année N-1) - rang(année N)
```

- `rankChange > 0` : Progression (gagne des places)
- `rankChange < 0` : Régression (perd des places)
- `rankChange = 0` : Stable

---

## 8. Flux de Données Complet

### 8.1 Pipeline de Traitement

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 3: VOTES                                │
│  Utilisateurs votent (étoiles + plumes)                         │
│  → Stockage dans agpa_vote                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 4: DÉPOUILLEMENT                          │
├─────────────────────────────────────────────────────────────────┤
│  1. p4CheckVotes()                                              │
│     - Valide chaque vote                                        │
│     - Vérifie contraintes jurés                                 │
│     - Marque votes valides/invalides                            │
├─────────────────────────────────────────────────────────────────┤
│  2. p4ComputeNotes()                                            │
│     - Agrège votes valides par photo                            │
│     - Calcule Note G (score homogénéisé)                        │
│     - Trie photos par Note G                                    │
├─────────────────────────────────────────────────────────────────┤
│  3. p4AgpaAttribution()                                         │
│     - Attribue Or/Argent/Bronze/Nominé par catégorie           │
│     - Calcule scores photographes                               │
│     - Attribue récompenses catégories spéciales                 │
├─────────────────────────────────────────────────────────────────┤
│  4. p4DiamondAttribution()                                      │
│     - Transforme Or en Diamant si conditions remplies           │
│     - Recalcule palmarès avec Diamants                          │
├─────────────────────────────────────────────────────────────────┤
│  5. p4HonorAttribution()                                        │
│     - Attribue AGPA d'Honneur aux enfants < 12 ans              │
│     - Sans récompense standard                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STOCKAGE                                      │
│  - Awards → agpa_award                                          │
│  - Scores → agpa_photo (votes, score, gscore)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONSULTATION                                  │
├─────────────────────────────────────────────────────────────────┤
│  palmaresData(from, to)                                         │
│  - Agrège awards sur période                                    │
│  - Calcule points par utilisateur                               │
│  - Trie par totalPoints                                         │
│  - Retourne classement complet                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 APIs Disponibles

| Endpoint | Description |
|----------|-------------|
| `GET /api/agpa/palmares` | Palmarès global (toutes éditions) |
| `GET /api/agpa/palmares/sliding?yearFrom=X&yearTo=Y` | Palmarès période spécifique |
| `GET /api/agpa/archives/:year` | Données d'une édition |
| `GET /api/agpa/archives/:year/:catId` | Résultats d'une catégorie |

---

## Annexes

### A. Fichiers Sources Clés

| Fichier | Rôle |
|---------|------|
| `agpaAlgorithmsHelper.ts` | Algorithmes de calcul (p4*) |
| `agpaPalmaresHelper.ts` | Construction du palmarès |
| `AgpaPalmares.ts` | Modèle de données palmarès |
| `AgpaPhoto.ts` | Entité photo |
| `AgpaVote.ts` | Entité vote |
| `AgpaAward.ts` | Entité récompense |

### B. Constantes Importantes

```typescript
// Coefficients pour Note G
const scoreCoef = 9990.00999001;  // 10^7/1001
const votesCoef = 9.99000999001;  // 10^4/1001

// Seuils Diamant
const DIAMOND_PHOTO_MIN_SCORE = 50000;
const DIAMOND_PHOTOGRAPHER_MIN_SCORE = 100000;
const DIAMOND_PHOTOGRAPHER_MIN_PALMARES = 33;

// Âge minimum juré
const MIN_JUDGE_AGE = 12;
```

### C. Historique des Évolutions

| Année | Modification |
|-------|--------------|
| 2006 | Création du concours |
| 2008 | Introduction de la Note G |
| 2011 | Ajout catégorie Meilleur Titre |
| 2012 | Ajout catégories Enfants et Spéciale |
| 2019 | Points pour les nominés (1 pt), application rétroactive |

---

*Document généré le 2026-01-10*
