/**
 * Service pour les jeux quotidiens de la homepage
 * - Sudoku du jour
 * - Mot mystère Wikipedia
 */

import { AppDataSource } from "../data-source";
import { DailyGameScore } from "../entities";

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
     * @param offset - Décalage pour obtenir un article différent (bouton renew)
     */
    public async getDailyWikiMystery(offset: number = 0): Promise<WikiMysteryGame | null> {
        const today = new Date().toISOString().split("T")[0];

        try {
            // Récupérer un article aléatoire de Wikipedia
            const searchUrl = `https://fr.wikipedia.org/api/rest_v1/page/random/summary`;
            const response = await fetch(searchUrl, {
                headers: {
                    "User-Agent": "AbsG5/1.0 (family website daily game)",
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                console.error("Wiki Mystery: Wikipedia API returned error", response.status);
                return null;
            }

            const data: any = await response.json();

            if (!data.title || !data.extract) {
                console.error("Wiki Mystery: Invalid data from Wikipedia API");
                return null;
            }

            const title = data.title;
            const extract = data.extract;

            // Masquer le titre dans l'extrait
            const maskResult = this.maskWordInText(extract, title);

            // Vérifier que le masquage a fonctionné - si non, réessayer avec un autre article
            if (!maskResult.success) {
                console.warn(`Wiki Mystery: Could not mask "${title}" in extract, retrying...`);
                return null;
            }

            // Extraire le titre principal (sans parenthèses) pour les indices
            const mainTitle = title.replace(/\s*\([^)]*\)\s*/g, "").trim();

            // Déterminer la catégorie simplifiée
            const category = this.guessCategory(data.description || "", title);

            // Générer les indices
            const hints = this.generateHints(title, data.description || "", extract);

            return {
                id: `wiki-${today}-${offset}`,
                date: today,
                maskedText: maskResult.text,
                category,
                answer: mainTitle,
                answerLength: mainTitle.length,
                firstLetter: mainTitle.charAt(0).toUpperCase(),
                hints,
                url: data.content_urls?.desktop?.page || `https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`
            };
        } catch (error) {
            console.error("Error fetching Wiki Mystery:", error);
            return null;
        }
    }

    /**
     * Masque un mot dans un texte
     * Gère les titres avec parenthèses: "Paris (Texas)" -> masque "Paris"
     */
    private maskWordInText(text: string, word: string): { text: string; success: boolean } {
        let maskedText = text;
        let replacements = 0;

        // Extraire le titre principal (avant les parenthèses)
        const mainTitle = word.replace(/\s*\([^)]*\)\s*/g, "").trim();

        // Liste des variantes à masquer (du plus spécifique au plus général)
        const variants: string[] = [];

        // 1. Le titre complet
        variants.push(word);

        // 2. Le titre principal sans parenthèses (si différent)
        if (mainTitle && mainTitle !== word) {
            variants.push(mainTitle);
        }

        // 3. Pour les noms composés avec tiret, essayer aussi les parties
        // Ex: "Mont-Saint-Michel" -> on garde tel quel, c'est un nom propre

        // 4. Pour les titres avec articles "Le", "La", "Les", "L'"
        const withoutArticle = word.replace(/^(Le |La |Les |L')/i, "").trim();
        if (withoutArticle && withoutArticle !== word) {
            variants.push(withoutArticle);
        }

        // Masquer chaque variante
        for (const variant of variants) {
            if (!variant || variant.length < 2) continue;

            const escapedWord = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escapedWord, "gi");

            const newText = maskedText.replace(regex, (match) => {
                replacements++;
                return "???";
            });
            maskedText = newText;
        }

        // Vérifier qu'au moins un remplacement a été fait
        return {
            text: maskedText,
            success: replacements > 0
        };
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

        // Utiliser le titre principal sans parenthèses pour les indices
        const mainTitle = title.replace(/\s*\([^)]*\)\s*/g, "").trim();

        // Indice 1: Première lettre
        hints.push(`Première lettre : ${mainTitle.charAt(0).toUpperCase()}`);

        // Indice 2: Nombre de mots
        const wordCount = mainTitle.split(/\s+/).length;
        hints.push(wordCount > 1 ? `Le nom contient ${wordCount} mots` : "C'est un seul mot");

        // Indice 3: Dernière lettre
        hints.push(`Dernière lettre : ${mainTitle.charAt(mainTitle.length - 1).toUpperCase()}`);

        // Indice 4: Description courte si disponible
        if (description && description.length > 5) {
            hints.push(description.charAt(0).toUpperCase() + description.slice(1));
        } else {
            hints.push(`${mainTitle.length} caractères au total`);
        }

        return hints;
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

    /**
     * Repository pour les scores
     */
    private get scoreRepo() {
        return AppDataSource.getRepository(DailyGameScore);
    }

    /**
     * Enregistre la complétion d'un jeu
     */
    public async recordGameCompletion(
        userId: number,
        gameType: "sudoku" | "wiki_mystery",
        attempts: number = 1,
        hintsUsed: number = 0
    ): Promise<DailyGameScore> {
        const today = new Date().toISOString().split("T")[0];

        // Vérifier si un score existe déjà pour ce jour
        let score = await this.scoreRepo.findOne({
            where: { userId, gameType, date: today }
        });

        if (score) {
            // Mettre à jour si pas encore complété
            if (!score.completed) {
                score.completed = true;
                score.attempts = attempts;
                score.hintsUsed = hintsUsed;
                score.completedAt = new Date();
                await this.scoreRepo.save(score);
            }
        } else {
            // Créer un nouveau score
            score = new DailyGameScore();
            score.userId = userId;
            score.gameType = gameType;
            score.date = today;
            score.completed = true;
            score.attempts = attempts;
            score.hintsUsed = hintsUsed;
            score.completedAt = new Date();
            await this.scoreRepo.save(score);
        }

        return score;
    }

    /**
     * Récupère les stats d'un utilisateur
     */
    public async getUserStats(userId: number): Promise<{
        sudoku: { total: number; thisWeek: number; thisMonth: number };
        wikiMystery: { total: number; thisWeek: number; thisMonth: number };
    }> {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const scores = await this.scoreRepo.find({
            where: { userId, completed: true }
        });

        const sudokuScores = scores.filter(s => s.gameType === "sudoku");
        const wikiScores = scores.filter(s => s.gameType === "wiki_mystery");

        return {
            sudoku: {
                total: sudokuScores.length,
                thisWeek: sudokuScores.filter(s => s.date >= weekAgo).length,
                thisMonth: sudokuScores.filter(s => s.date >= monthAgo).length
            },
            wikiMystery: {
                total: wikiScores.length,
                thisWeek: wikiScores.filter(s => s.date >= weekAgo).length,
                thisMonth: wikiScores.filter(s => s.date >= monthAgo).length
            }
        };
    }

    /**
     * Récupère le classement familial
     */
    public async getFamilyRanking(): Promise<{
        ranking: Array<{
            rank: number;
            userId: number;
            username: string;
            rootFamily: string;
            sudokuCount: number;
            wikiMysteryCount: number;
            totalScore: number;
        }>;
    }> {
        // Requête SQL pour obtenir le classement avec les infos utilisateur
        const result = await this.scoreRepo.query(`
            SELECT
                u.id as "userId",
                u.username,
                u."rootFamily" as "rootFamily",
                COALESCE(SUM(CASE WHEN dgs.game_type = 'sudoku' AND dgs.completed = true THEN 1 ELSE 0 END), 0) as "sudokuCount",
                COALESCE(SUM(CASE WHEN dgs.game_type = 'wiki_mystery' AND dgs.completed = true THEN 1 ELSE 0 END), 0) as "wikiMysteryCount",
                COALESCE(SUM(CASE WHEN dgs.completed = true THEN 1 ELSE 0 END), 0) as "totalScore"
            FROM "user" u
            LEFT JOIN daily_game_score dgs ON dgs.user_id = u.id
            WHERE u."isActive" = true
            GROUP BY u.id, u.username, u."rootFamily"
            HAVING COALESCE(SUM(CASE WHEN dgs.completed = true THEN 1 ELSE 0 END), 0) > 0
            ORDER BY "totalScore" DESC, "sudokuCount" DESC, "wikiMysteryCount" DESC
            LIMIT 10
        `);

        return {
            ranking: result.map((row: any, index: number) => ({
                rank: index + 1,
                userId: row.userId,
                username: row.username,
                rootFamily: row.rootFamily || "Inconnu",
                sudokuCount: parseInt(row.sudokuCount) || 0,
                wikiMysteryCount: parseInt(row.wikiMysteryCount) || 0,
                totalScore: parseInt(row.totalScore) || 0
            }))
        };
    }

    /**
     * Récupère les stats et classement pour le widget
     */
    public async getGameStats(userId: number): Promise<{
        userStats: {
            sudoku: { total: number; thisWeek: number; thisMonth: number };
            wikiMystery: { total: number; thisWeek: number; thisMonth: number };
        };
        ranking: Array<{
            rank: number;
            userId: number;
            username: string;
            rootFamily: string;
            sudokuCount: number;
            wikiMysteryCount: number;
            totalScore: number;
        }>;
    }> {
        const [userStats, familyRanking] = await Promise.all([
            this.getUserStats(userId),
            this.getFamilyRanking()
        ]);

        return {
            userStats,
            ranking: familyRanking.ranking
        };
    }
}

export const dailyGamesService = new DailyGamesService();
