/**
 * Service pour les jeux quotidiens de la homepage
 * - Sudoku du jour
 * - Mot mystère Wikipedia
 */

export interface SudokuPuzzle {
    grid: number[][];
    solution: number[][];
    difficulty: "easy" | "medium" | "hard";
    date: string;
}

export interface WikiMysteryGame {
    id: string;
    date: string;
    maskedText: string;
    category: string;
    answer: string;
    answerLength: number;
    firstLetter: string;
    hints: string[];
    url: string;
}

class DailyGamesService {
    /**
     * Génère un nombre pseudo-aléatoire basé sur une graine
     */
    private seededRandom(seed: number): () => number {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    /**
     * Obtient la graine du jour (basée sur la date)
     */
    private getDailySeed(): number {
        const now = new Date();
        return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    }

    /**
     * Génère une grille de Sudoku valide
     */
    private generateSudokuSolution(random: () => number): number[][] {
        const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

        const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
            // Vérifier la ligne
            for (let x = 0; x < 9; x++) {
                if (grid[row][x] === num) return false;
            }
            // Vérifier la colonne
            for (let x = 0; x < 9; x++) {
                if (grid[x][col] === num) return false;
            }
            // Vérifier le carré 3x3
            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (grid[startRow + i][startCol + j] === num) return false;
                }
            }
            return true;
        };

        const solve = (grid: number[][]): boolean => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col] === 0) {
                        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                        // Mélanger les nombres pour plus de variété
                        for (let i = nums.length - 1; i > 0; i--) {
                            const j = Math.floor(random() * (i + 1));
                            [nums[i], nums[j]] = [nums[j], nums[i]];
                        }
                        for (const num of nums) {
                            if (isValid(grid, row, col, num)) {
                                grid[row][col] = num;
                                if (solve(grid)) return true;
                                grid[row][col] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };

        solve(grid);
        return grid;
    }

    /**
     * Retire des cases de la solution pour créer le puzzle
     */
    private createPuzzleFromSolution(solution: number[][], random: () => number, difficulty: "easy" | "medium" | "hard"): number[][] {
        const puzzle = solution.map(row => [...row]);

        // Nombre de cases à retirer selon la difficulté
        const cellsToRemove = {
            easy: 35,
            medium: 45,
            hard: 55
        }[difficulty];

        const positions: [number, number][] = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }

        // Mélanger les positions
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Retirer les cases
        for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
            const [row, col] = positions[i];
            puzzle[row][col] = 0;
        }

        return puzzle;
    }

    /**
     * Génère le Sudoku du jour
     */
    public getDailySudoku(): SudokuPuzzle {
        const seed = this.getDailySeed();
        const random = this.seededRandom(seed);
        const today = new Date().toISOString().split("T")[0];

        const solution = this.generateSudokuSolution(random);
        const grid = this.createPuzzleFromSolution(solution, random, "easy");

        return {
            grid,
            solution,
            difficulty: "easy",
            date: today
        };
    }

    /**
     * Récupère un article Wikipedia aléatoire pour le mot mystère
     */
    public async getDailyWikiMystery(): Promise<WikiMysteryGame | null> {
        const seed = this.getDailySeed();
        const random = this.seededRandom(seed);
        const today = new Date().toISOString().split("T")[0];

        try {
            // Liste de catégories intéressantes pour le jeu
            const categories = [
                "Personnalité_française",
                "Monument_historique_en_France",
                "Invention",
                "Ville_de_France",
                "Animal",
                "Plante",
                "Événement_historique",
                "Sport",
                "Instrument_de_musique",
                "Aliment"
            ];

            // Sélectionner une catégorie basée sur le jour
            const categoryIndex = Math.floor(random() * categories.length);
            const selectedCategory = categories[categoryIndex];

            // Récupérer un article aléatoire de Wikipedia
            const searchUrl = `https://fr.wikipedia.org/api/rest_v1/page/random/summary`;
            const response = await fetch(searchUrl, {
                headers: {
                    "User-Agent": "AbsG5/1.0 (family website daily game)",
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                return this.getFallbackWikiMystery(today);
            }

            const data: any = await response.json();

            if (!data.title || !data.extract) {
                return this.getFallbackWikiMystery(today);
            }

            const title = data.title;
            const extract = data.extract;

            // Masquer le titre dans l'extrait
            const maskedText = this.maskWordInText(extract, title);

            // Déterminer la catégorie simplifiée
            const category = this.guessCategory(data.description || "", title);

            // Générer les indices
            const hints = this.generateHints(title, data.description || "", extract);

            return {
                id: `wiki-${today}`,
                date: today,
                maskedText,
                category,
                answer: title,
                answerLength: title.length,
                firstLetter: title.charAt(0).toUpperCase(),
                hints,
                url: data.content_urls?.desktop?.page || `https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`
            };
        } catch (error) {
            console.error("Error fetching Wiki Mystery:", error);
            return this.getFallbackWikiMystery(today);
        }
    }

    /**
     * Masque un mot dans un texte
     */
    private maskWordInText(text: string, word: string): string {
        // Créer une regex pour trouver le mot (insensible à la casse)
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedWord, "gi");
        return text.replace(regex, "???");
    }

    /**
     * Devine la catégorie d'un article
     */
    private guessCategory(description: string, title: string): string {
        const desc = description.toLowerCase();

        if (desc.includes("personnalité") || desc.includes("acteur") || desc.includes("chanteur") ||
            desc.includes("écrivain") || desc.includes("politique") || desc.includes("sportif")) {
            return "Personnalité";
        }
        if (desc.includes("ville") || desc.includes("commune") || desc.includes("pays")) {
            return "Lieu";
        }
        if (desc.includes("animal") || desc.includes("espèce")) {
            return "Animal";
        }
        if (desc.includes("film") || desc.includes("série") || desc.includes("émission")) {
            return "Média";
        }
        if (desc.includes("entreprise") || desc.includes("société") || desc.includes("marque")) {
            return "Entreprise";
        }
        if (desc.includes("monument") || desc.includes("bâtiment") || desc.includes("château")) {
            return "Monument";
        }

        return "Concept";
    }

    /**
     * Génère des indices progressifs
     */
    private generateHints(title: string, description: string, extract: string): string[] {
        const hints: string[] = [];

        // Indice 1: Catégorie (déjà fournie séparément)
        hints.push(`Première lettre : ${title.charAt(0).toUpperCase()}`);

        // Indice 2: Nombre de mots
        const wordCount = title.split(/\s+/).length;
        hints.push(wordCount > 1 ? `Le nom contient ${wordCount} mots` : "C'est un seul mot");

        // Indice 3: Dernière lettre
        hints.push(`Dernière lettre : ${title.charAt(title.length - 1).toUpperCase()}`);

        // Indice 4: Description courte si disponible
        if (description && description.length > 5) {
            hints.push(description.charAt(0).toUpperCase() + description.slice(1));
        } else {
            hints.push(`${title.length} caractères au total`);
        }

        return hints;
    }

    /**
     * Données de secours pour le mot mystère
     */
    private getFallbackWikiMystery(date: string): WikiMysteryGame {
        const fallbackArticles = [
            {
                title: "Tour Eiffel",
                extract: "La ??? est une tour de fer puddlé de 330 mètres de hauteur située à Paris, construite par Gustave Eiffel pour l'Exposition universelle de 1889.",
                category: "Monument",
                description: "Monument parisien emblématique"
            },
            {
                title: "Croissant",
                extract: "Le ??? est une viennoiserie à base de pâte feuilletée levée, caractérisée par sa forme de lune en croissant.",
                category: "Aliment",
                description: "Viennoiserie française"
            },
            {
                title: "Victor Hugo",
                extract: "??? est un poète, dramaturge, écrivain et homme politique français du XIXe siècle, auteur des Misérables et de Notre-Dame de Paris.",
                category: "Personnalité",
                description: "Écrivain français du XIXe siècle"
            },
            {
                title: "Marseille",
                extract: "??? est une ville du sud-est de la France, chef-lieu de la région Provence-Alpes-Côte d'Azur et préfecture du département des Bouches-du-Rhône.",
                category: "Lieu",
                description: "Grande ville du sud de la France"
            },
            {
                title: "Piano",
                extract: "Le ??? est un instrument de musique polyphonique, à clavier, de la famille des cordes frappées.",
                category: "Concept",
                description: "Instrument de musique à clavier"
            }
        ];

        // Sélectionner basé sur la date
        const seed = parseInt(date.replace(/-/g, ""));
        const index = seed % fallbackArticles.length;
        const article = fallbackArticles[index];

        return {
            id: `wiki-${date}`,
            date,
            maskedText: article.extract,
            category: article.category,
            answer: article.title,
            answerLength: article.title.length,
            firstLetter: article.title.charAt(0).toUpperCase(),
            hints: this.generateHints(article.title, article.description, article.extract),
            url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(article.title)}`
        };
    }

    /**
     * Vérifie une réponse pour le mot mystère
     */
    public checkWikiMysteryAnswer(guess: string, answer: string): { correct: boolean; similarity: number } {
        const normalizedGuess = guess.toLowerCase().trim();
        const normalizedAnswer = answer.toLowerCase().trim();

        if (normalizedGuess === normalizedAnswer) {
            return { correct: true, similarity: 100 };
        }

        // Calculer une similarité simple (pour donner un indice si proche)
        const similarity = this.calculateSimilarity(normalizedGuess, normalizedAnswer);

        return { correct: false, similarity };
    }

    /**
     * Calcule la similarité entre deux chaînes (distance de Levenshtein normalisée)
     */
    private calculateSimilarity(s1: string, s2: string): number {
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;

        if (longer.length === 0) return 100;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return Math.round((1 - editDistance / longer.length) * 100);
    }

    /**
     * Distance de Levenshtein
     */
    private levenshteinDistance(s1: string, s2: string): number {
        const costs: number[] = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }
}

export const dailyGamesService = new DailyGamesService();
