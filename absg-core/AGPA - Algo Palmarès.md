# AGPA - Algorithme de Calcul des Badges

## 📊 Statistiques à Calculer par Utilisateur

Ce document liste l'ensemble des statistiques nécessaires pour déterminer l'attribution des **61 badges AGPA** (11 votant + 9 photographe + 14 combo directs + 27 combo progressifs).

---

## I. STATISTIQUES DE VOTE (Badges Votant - 11 badges)

### A. Distribution des votes

1. **Total de points distribués**
   - Pour Le Radin (<30), Le Mécène (>100), Le Modéré (par défaut)

2. **Nombre de votes donnés**
   - Pour Le Revenant (<10)

### B. Analyse par destinataire

3. **Nombre de personnes différentes ayant reçu des votes**
   - Pour Le Philanthrope (≥8), Le Sniper (≤2)

4. **Pourcentage de votes concentrés sur les 2 personnes principales**
   - Pour Le Sniper (>60%)

### C. Analyse familiale des votes donnés

5. **Pourcentage de votes pour sa propre famille**
   - Pour Le Patriote (>70%), L'Anticonformiste (<30%)

6. **Pourcentage de votes pour son/sa conjoint(e)**
   - Pour L'Amoureux Transi (>50%)

7. **Pourcentage de votes pour ses enfants**
   - Pour Le Parent Fier (>50%)

### D. Analyse genre des votes donnés

8. **Pourcentage de votes pour des femmes**
   - Pour Féministe Convaincu (≥70% + >20pts)

### E. Équilibre inter-familles

9. **Nombre de familles différentes ayant reçu des votes**
   - Pour Le Diplomate (≥5)

10. **Répartition équilibrée entre familles**
    - Variance faible pour Le Diplomate

---

## II. STATISTIQUES DE RÉCEPTION (Badges Photographe - 9 badges)

### A. Points et votes reçus

11. **Total de points reçus**
    - Pour Le Phénomène (>80), L'Inconnu (<15), Le Protégé (>30)

12. **Nombre de votants différents**
    - Pour La Star (≥8), Le Phénomène (≥8), Le Protégé (≤3)

### B. Origine familiale des votes reçus

13. **Pourcentage de votes reçus de sa propre famille**
    - Pour Chouchou de Famille (>70% + >20pts), Le Transfuge (<30% + >30pts)

14. **Nombre de familles différentes ayant voté**
    - Pour L'Équilibré (≥3 familles)

15. **Répartition équilibrée entre familles**
    - Variance pour L'Équilibré

### C. Origine genre des votes reçus

16. **Pourcentage de votes reçus de femmes**
    - Pour Coqueluche des Dames (≥70% + >20pts)

### D. Analyse du conjoint

17. **Pourcentage de points reçus du conjoint**
    - Pour Le Couple Parfait (>40%)

---

## III. STATISTIQUES COMBO DIRECTS (14 badges)

### A. Ratios donnés/reçus

18. **Ratio points donnés vs reçus**
    - Le Solitaire: <20 pts donnés + <20 pts reçus
    - Le Robin des Bois: >80 pts donnés + <30 pts reçus
    - La Superstar: >70 pts donnés + >70 pts reçus + >7 votants

### B. Vérification des badges requis (requires)

19. **Badges votant obtenus** (pour vérifier les prérequis)

20. **Badges photographe obtenus** (pour vérifier les prérequis)

#### Badges combo avec prérequis:

- **L'Égoïste**: Badge "Le Radin" + >50 pts reçus
- **L'Influenceur**: Badge "La Star" + >60 pts donnés
- **Le Clan**: Badges "Le Patriote" + "Chouchou de Famille"
- **Le Rebelle**: Badges "L'Anticonformiste" + "Le Transfuge"
- **Le Fan Club**: Badges "Le Sniper" + "Le Protégé"
- **Le Politique**: Badges "Le Diplomate" + "L'Équilibré"
- **Le Phénomène Total**: >100 pts donnés + Badge "Le Phénomène"
- **Le Couple Parfait**: Badge "Amoureux Transi" + >40% pts reçus du conjoint
- **L'Incompris**: Badge "Le Philanthrope" + (Badge "L'Inconnu" ou <15 pts reçus)
- **Girl Power**: Badges "Féministe Convaincu" + "Coqueluche des Dames"

---

## IV. STATISTIQUES PROGRESSIVES SUR 3 ANS (27 badges)

### A. Évolution des points totaux

21. **Points reçus par année** (années N, N-1, N-2)

22. **Progression/régression en pourcentage**
    - **La Fusée**: Progression x3 minimum
    - **Le Dinosaure**: Régression continue (départ ≥40 pts)
    - **Le Yoyo**: Alternance haut/bas avec écarts >50%
    - **La Révélation**: 0 pts année 1 + progression forte
    - **Le Phoenix**: Chute >50% puis remontée >120%
    - **L'Éclair**: 0 pts années 1-2 + ≥40 pts année 3

23. **Variance des points**
    - Pour Le Régulier: variance <15% avec moyenne ≥30 pts/an

### B. Podiums et récompenses par an

24. **Nombre de podiums par année** (Or, Argent, Bronze)
    - **Le Vétéran**: ≥1 podium chaque année sur 3 ans
    - **Le Podium Addict**: ≥5 podiums cumulés sur 3 ans

25. **Nombre d'Ors par année**
    - **Le Tsunami**: 0 pts année 1 + ≥2 ors année 2
    - **Le Triplé**: 3+ Ors en 1 édition
    - **Le Perfectionniste**: Uniquement des Ors (≥2) en 1 édition
    - **Le Monopole**: ≥6 Ors sur 8 catégories en 1 édition

26. **Nombre d'Argents par année**
    - **Le Doublé**: Exactement 2 Argents en 1 édition

27. **Nombre de Bronzes par année**
    - **Le Balayage Bronze**: 4+ Bronzes en 1 édition

28. **Composition des récompenses par édition**
    - **Le Collectionneur**: 1 Or + 1 Argent + 1 Bronze en 1 édition
    - **L'Arc-en-ciel**: ≥2 de chaque type en 1 édition
    - **La Pyramide**: 1 Or + 2 Argents + 3 Bronzes en 1 édition
    - **La Pyramide Inversée**: 3 Ors + 2 Argents + 1 Bronze en 1 édition
    - **Le Symétrique**: Même nombre d'Ors, Argents et Bronzes en 1 édition

### C. Analyse par catégorie

29. **Catégories gagnées (Or) par année**
    - **Le Sniper Temporel**: Même catégorie gagnée 2-3 fois sur 3 ans
    - **La Razzia**: 4+ catégories gagnées en 1 édition

30. **Évolution dans une même catégorie**
    - **L'Alpiniste**: Bronze → Argent → Or dans la même catégorie sur 3 ans
    - **La Rédemption**: 0 AGPA année N, puis Or année N+1 dans la même catégorie

### D. Régularité

31. **Points minimum par année**
    - Pour Le Fidèle: ≥15 pts/an sur 3 ans

32. **Nombre d'AGPA par année**
    - Pour Le Constant: même nombre ≥1 chaque année

---

## 📋 Structure de Données Nécessaire

### Pour CHAQUE ANNÉE (sliding window de 3 ans):

```json
{
  "userId": number,
  "year": number,

  // VOTES DONNÉS
  "votesGiven": {
    "totalPoints": number,
    "totalVotes": number,
    "byRecipient": [
      {
        "recipientId": number,
        "recipientGender": "M|F",
        "recipientFamily": string,
        "recipientRelation": "spouse|child|parent|other",
        "points": number,
        "votes": number
      }
    ]
  },

  // VOTES REÇUS
  "votesReceived": {
    "totalPoints": number,
    "uniqueVoters": number,
    "byVoter": [
      {
        "voterId": number,
        "voterGender": "M|F",
        "voterFamily": string,
        "voterRelation": "spouse|child|parent|other",
        "points": number
      }
    ]
  },

  // RÉCOMPENSES AGPA
  "awards": {
    "totalAwards": number,
    "byCategory": [
      {
        "categoryId": number,
        "categoryName": string,
        "award": "gold|silver|bronze|nominated",
        "points": number
      }
    ],
    "gold": number,
    "silver": number,
    "bronze": number,
    "nominated": number
  }
}
```

### Métadonnées utilisateur (une fois):

```json
{
  "userId": number,
  "gender": "M|F",
  "family": "Gueudelot|Guibert|Guyomard|Autre",
  "spouseId": number | null,
  "childrenIds": number[]
}
```

---

## 🎯 Résumé

**Total: 32 statistiques principales à calculer**

Ces statistiques permettent de déterminer les **61 badges** au total:
- ✅ **11 badges votant**
- ✅ **9 badges photographe**
- ✅ **14 badges combo directs**
- ✅ **27 badges combo progressifs**

---

## 🔄 Algorithme de Calcul

### Étape 1: Collecte des données brutes
Pour chaque utilisateur et chaque année de la fenêtre glissante (3 dernières éditions):
1. Récupérer tous les votes donnés avec détails (destinataire, points, famille, genre, relation)
2. Récupérer tous les votes reçus avec détails (votant, points, famille, genre, relation)
3. Récupérer toutes les récompenses AGPA obtenues (catégorie, type de récompense)

### Étape 2: Calcul des statistiques annuelles
Pour chaque année, calculer les 32 statistiques listées ci-dessus.

### Étape 3: Détermination des badges par type

#### A. Badges Votant (année en cours)
- Calculer les statistiques 1-10
- Appliquer les règles de chaque badge
- Attribuer le badge correspondant (1 seul badge votant par an)
- Badge par défaut: "Le Modéré"

#### B. Badges Photographe (année en cours)
- Calculer les statistiques 11-17
- Appliquer les règles de chaque badge
- Attribuer le badge correspondant (1 seul badge photographe par an)
- Badge par défaut: "Le Talent Émergent"

#### C. Badges Combo Directs (année en cours)
- Calculer les statistiques 18-20
- Vérifier les prérequis (badges votant et photographe obtenus)
- Appliquer les règles de chaque badge
- Attribuer TOUS les badges correspondants (plusieurs badges combo possibles)

#### D. Badges Combo Progressifs (fenêtre de 3 ans)
- Calculer les statistiques 21-32 sur les 3 années
- Analyser les tendances et évolutions
- Appliquer les règles de chaque badge
- Attribuer TOUS les badges correspondants (plusieurs badges combo progressifs possibles)

### Étape 4: Agrégation
Retourner pour l'utilisateur:
- Badge votant de l'année en cours
- Badge photographe de l'année en cours
- Liste de tous les badges combo directs obtenus
- Liste de tous les badges combo progressifs obtenus
- Historique des badges par année

---

## 📊 Tables de Base de Données Nécessaires

### Tables existantes utilisées:
- `user` - Informations utilisateur (genre, famille, relations)
- `agpa_vote` - Votes donnés (votant, photo votée, points)
- `agpa_photo` - Photos soumises (auteur, catégorie)
- `agpa_award` - Récompenses obtenues (photo, type d'award, catégorie)

### Nouvelle table à créer:
```sql
CREATE TABLE agpa_user_badge (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id),
    year INTEGER NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_type VARCHAR(20) NOT NULL, -- 'voter', 'photographer', 'combo'
    badge_timing VARCHAR(20) NOT NULL, -- 'direct', 'progressive'
    is_active BOOLEAN DEFAULT true,
    computed_at TIMESTAMP DEFAULT NOW(),

    -- Statistiques ayant permis l'obtention du badge (pour debug/transparence)
    stats_snapshot JSONB,

    UNIQUE(user_id, year, badge_name)
);

CREATE INDEX idx_agpa_user_badge_user_year ON agpa_user_badge(user_id, year);
CREATE INDEX idx_agpa_user_badge_type ON agpa_user_badge(badge_type, badge_timing);
```

---

## 🚀 API Endpoints à Créer

### 1. Calcul des badges pour un utilisateur
```typescript
GET /api/agpa/badges-history/:userId
// Retourne l'historique complet des badges pour l'utilisateur
```

### 2. Calcul des badges pour tous les utilisateurs (admin)
```typescript
POST /api/agpa/compute-badges/:year
// Recalcule tous les badges pour l'année donnée
```

### 3. Récupération des badges de la fenêtre glissante
```typescript
GET /api/agpa/my-badges-sliding
// Retourne les badges de l'utilisateur connecté pour les 3 dernières éditions
```

---

## ⚠️ Points d'Attention

### Performances
- Le calcul des 32 statistiques pour tous les utilisateurs et toutes les années peut être coûteux
- Envisager un système de cache/pré-calcul
- Recalculer uniquement lors de changements (nouveaux votes, nouvelles récompenses)

### Cohérence
- Les badges combo avec prérequis doivent être calculés APRÈS les badges votant/photographe
- Les badges progressifs nécessitent les données des 3 dernières années complètes

### Évolutivité
- Stocker les statistiques utilisées dans `stats_snapshot` permet de:
  - Debugger l'attribution des badges
  - Expliquer à l'utilisateur pourquoi il a obtenu tel badge
  - Permettre des ajustements futurs sans recalcul complet

---

*Document généré le 2025-12-30*
