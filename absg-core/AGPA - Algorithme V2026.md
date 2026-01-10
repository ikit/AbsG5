# AGPA - Algorithme V2026

## Principe

L'algorithme V2026 calcule le score de chaque photo en **moyennant les classements obtenus auprès de chaque famille**. Cela garantit une équité entre les trois familles, indépendamment de leur taille.

---

## Étapes de calcul

### Étape 1 : Agrégation des votes par famille

Pour chaque photo, on calcule :
- **Nombre de votes** reçus de chaque famille (Gueudelot, Guibert, Guyomard)
- **Nombre de points** reçus de chaque famille (somme des scores 1 ou 2)

```
Photo P :
  - votesGueudelot = 5,  pointsGueudelot = 8
  - votesGuibert = 3,    pointsGuibert = 5
  - votesGuyomard = 4,   pointsGuyomard = 7
```

### Étape 2 : Classement par famille et par catégorie

Pour chaque catégorie, on classe les photos selon les points de chaque famille :

```
Catégorie "Portrait" - Classement Gueudelot :
  Photo A : 12 pts → Rang 1
  Photo B : 12 pts → Rang 1 (ex-aequo)
  Photo C : 10 pts → Rang 3 (pas rang 2 !)
  Photo D : 8 pts  → Rang 4
```

**Règle des ex-aequo** : Si N photos sont à égalité au rang R, la photo suivante a le rang R+N.

### Étape 3 : Calcul du rang moyen

Pour chaque photo, on calcule la **moyenne des rangs** obtenus auprès des 3 familles :

```
Photo A :
  - Rang Gueudelot = 2
  - Rang Guibert = 1
  - Rang Guyomard = 3
  - Rang moyen = (2 + 1 + 3) / 3 = 2.0
```

### Étape 4 : Conversion en score 0-100

Le rang moyen est converti en pourcentage :
- **100** = meilleure photo (rang moyen le plus bas)
- **0** = dernière photo (rang moyen le plus haut)

```
Score = 100 × (rangMax - rangMoyen) / (rangMax - rangMin)
```

Où :
- `rangMin` = rang moyen minimal de la catégorie (meilleure photo)
- `rangMax` = rang moyen maximal de la catégorie (pire photo)

**Exemple** :
```
Catégorie avec 10 photos :
  - Photo A : rang moyen = 1.5 → Score = 100
  - Photo B : rang moyen = 5.0 → Score = 58
  - Photo C : rang moyen = 9.0 → Score = 0
```

---

## Cas particuliers

### Famille sans vote pour une catégorie

Si une famille n'a pas voté dans une catégorie :
- **Option A** : Ignorer cette famille pour le calcul (moyenne sur 2 familles)
- **Option B** : Attribuer le rang médian à toutes les photos

**Recommandation** : Option A (ignorer la famille absente)

### Règle de vote

Seul l'**auteur** ne peut pas voter pour ses propres photos. Les membres d'une même famille peuvent voter les uns pour les autres.

Exemple : Si Jean Gueudelot a posté une photo, les autres Gueudelot peuvent voter pour cette photo, mais pas Jean lui-même.

### Égalité de rang moyen (règles de départage)

Si deux photos ont le même rang moyen, on départage par :
1. Avantage à la photo qui a un titre
2. Avantage à la photo dont la catégorie a le plus de photos
3. Avantage à la photo qui a reçu le plus de votes
4. Avantage à la photo dont l'auteur a le plus petit palmarès sur les 3 éditions précédentes
5. Tirage au sort

---

## Stockage des données

### Dans AgpaPhoto.scoreDetails.v2026

```typescript
{
    v2026: {
        // Votes et points par famille
        gueudelot: { votes: number; points: number; rank: number; };
        guibert: { votes: number; points: number; rank: number; };
        guyomard: { votes: number; points: number; rank: number; };

        // Résultat
        avgRank: number;        // Rang moyen des 3 familles
        rankMin: number;        // Meilleur rang moyen de la catégorie
        rankMax: number;        // Pire rang moyen de la catégorie
        rankInCategory: number; // Classement dans la catégorie (1 = 1er)

        calculatedAt: string;
    }
}
```

### Dans AgpaPhoto.scoreV2026

Le score final (0-100) est stocké dans `scoreV2026`.

---

## Comparaison V2010 vs V2026

| Aspect | V2010 | V2026 |
|--------|-------|-------|
| **Principe** | Score absolu normalisé | Moyenne des rangs par famille |
| **Échelle** | ~0 à ~50000 | 0 à 100 |
| **Équité familles** | Non (famille nombreuse avantage) | Oui (1 famille = 1 voix) |
| **Granularité** | Fine (entiers grands) | Plus grossière (0-100) |
| **Transparence** | Formule complexe | Intuitive |

---

## Exemple complet

### Données d'entrée

Catégorie "Portrait" avec 4 photos :

| Photo | Auteur | Pts Gueudelot | Pts Guibert | Pts Guyomard |
|-------|--------|---------------|-------------|--------------|
| A | Guibert | 8 | 4 | 6 |
| B | Guyomard | 10 | 7 | 5 |
| C | Gueudelot | 6 | 5 | 8 |
| D | Gueudelot | 4 | 9 | 4 |

### Calcul des rangs par famille

**Gueudelot** (toutes les photos) :
- B : 10 pts → Rang 1
- A : 8 pts → Rang 2
- C : 6 pts → Rang 3
- D : 4 pts → Rang 4

**Guibert** (toutes les photos) :
- D : 9 pts → Rang 1
- B : 7 pts → Rang 2
- C : 5 pts → Rang 3
- A : 4 pts → Rang 4

**Guyomard** (toutes les photos) :
- C : 8 pts → Rang 1
- A : 6 pts → Rang 2
- B : 5 pts → Rang 3
- D : 4 pts → Rang 4

### Calcul du rang moyen

| Photo | Rang Gueudelot | Rang Guibert | Rang Guyomard | Rang moyen |
|-------|----------------|--------------|---------------|------------|
| A | 2 | 4 | 2 | 2.67 |
| B | 1 | 2 | 3 | 2.00 |
| C | 3 | 3 | 1 | 2.33 |
| D | 4 | 1 | 4 | 3.00 |

### Conversion en score 0-100

- Rang min = 2.00 (Photo B)
- Rang max = 3.00 (Photo D)

```
Score = 100 × (rangMax - rangMoyen) / (rangMax - rangMin)
```

| Photo | Rang moyen | Calcul | Score V2026 |
|-------|------------|--------|-------------|
| B | 2.00 | 100 × (3.00 - 2.00) / 1.00 | 100 |
| C | 2.33 | 100 × (3.00 - 2.33) / 1.00 | 67 |
| A | 2.67 | 100 × (3.00 - 2.67) / 1.00 | 33 |
| D | 3.00 | 100 × (3.00 - 3.00) / 1.00 | 0 |

**Classement final** : B (100) > C (67) > A (33) > D (0)

---

## Implémentation

Voir `absg-core/src/middleware/agpaAlgorithms/AgpaAlgorithmV2026.ts`

---

*Document créé le 2026-01-10*
