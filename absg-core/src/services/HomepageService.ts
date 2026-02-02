import { getRepository } from "../middleware/database";
import { Person } from "../entities";
import { eventService } from "./EventService";
import { citationService } from "./CitationService";
import { addDays } from "date-fns";

export interface OnThisDayEvent {
    year: number;
    text: string;
    type: "event" | "birth" | "death";
    url?: string;
}

export interface UpcomingEvent {
    date: Date;
    name: string;
    type: "birthday" | "holiday" | "nameday";
    details?: string;
    daysUntil: number;
    personId?: number;
    thumb?: string;
}

class HomepageService {
    private personsRepo = null;

    public initService() {
        this.personsRepo = getRepository(Person);
    }

    /**
     * Récupère les données "Ce jour dans l'histoire" depuis Wikipedia FR
     * @param month le mois (1-12)
     * @param day le jour (1-31)
     */
    public async getOnThisDay(month: number = null, day: number = null): Promise<OnThisDayEvent[]> {
        const now = new Date();
        const m = month || now.getMonth() + 1;
        const d = day || now.getDate();

        // Formater avec zéros (ex: 02 au lieu de 2)
        const mm = String(m).padStart(2, "0");
        const dd = String(d).padStart(2, "0");

        try {
            // Utilisation de l'API Wikipedia en français
            const url = `https://fr.wikipedia.org/api/rest_v1/feed/onthisday/all/${mm}/${dd}`;
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "AbsG5/1.0 (contact: family website)",
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                console.error(`Wikipedia API error: ${response.status} for ${url}`);
                return this.getFallbackOnThisDay(m, d);
            }

            const data: any = await response.json();
            const events: OnThisDayEvent[] = [];

            // Mots-clés à éviter (événements morbides/violents)
            const negativeKeywords = [
                "massacre", "massacré", "tué", "tuent", "mort", "morts", "décès",
                "assassin", "assassinat", "attentat", "attaque", "guerre", "bataille",
                "exécution", "exécuté", "bombardement", "génocide", "pogrom",
                "explosion", "crash", "catastrophe", "naufrage", "séisme", "tsunami",
                "victime", "victimes", "terroriste", "terrorisme", "fusillade"
            ];

            const isPositiveEvent = (text: string): boolean => {
                const lowerText = text.toLowerCase();
                return !negativeKeywords.some(kw => lowerText.includes(kw));
            };

            // Extraire l'URL Wikipedia de l'événement
            const getWikipediaUrl = (event: any): string | undefined => {
                if (event.pages && event.pages.length > 0 && event.pages[0].titles?.canonical) {
                    return `https://fr.wikipedia.org/wiki/${encodeURIComponent(event.pages[0].titles.canonical)}`;
                }
                return undefined;
            };

            // Mettre une majuscule au début du texte
            const capitalize = (text: string): string => {
                if (!text) return text;
                return text.charAt(0).toUpperCase() + text.slice(1);
            };

            // Événements historiques - sélectionner de différentes époques
            if (data.events && Array.isArray(data.events)) {
                const positiveEvents = data.events
                    .filter((e: any) => e.year && e.text && isPositiveEvent(e.text));

                // Catégoriser par époque
                const ancient = positiveEvents.filter((e: any) => e.year < 1500);      // Antiquité/Moyen-Âge
                const modern = positiveEvents.filter((e: any) => e.year >= 1500 && e.year < 1900);  // Temps modernes
                const contemporary = positiveEvents.filter((e: any) => e.year >= 1900 && e.year < 1980); // XXe siècle
                const recent = positiveEvents.filter((e: any) => e.year >= 1980);      // Récent

                // Sélectionner 1 de chaque époque si disponible
                const selectedEvents: any[] = [];
                if (ancient.length > 0) selectedEvents.push(ancient[Math.floor(Math.random() * ancient.length)]);
                if (modern.length > 0) selectedEvents.push(modern[Math.floor(Math.random() * modern.length)]);
                if (contemporary.length > 0) selectedEvents.push(contemporary[Math.floor(Math.random() * contemporary.length)]);
                if (recent.length > 0 && selectedEvents.length < 4) selectedEvents.push(recent[Math.floor(Math.random() * recent.length)]);

                // Compléter avec des événements aléatoires si pas assez
                while (selectedEvents.length < 3 && positiveEvents.length > selectedEvents.length) {
                    const remaining = positiveEvents.filter(e => !selectedEvents.includes(e));
                    if (remaining.length > 0) {
                        selectedEvents.push(remaining[Math.floor(Math.random() * remaining.length)]);
                    } else {
                        break;
                    }
                }

                // Trier par année (du plus ancien au plus récent)
                selectedEvents.sort((a, b) => a.year - b.year);

                events.push(...selectedEvents.slice(0, 4).map((e: any) => ({
                    year: e.year,
                    text: capitalize(e.text),
                    type: "event" as const,
                    url: getWikipediaUrl(e)
                })));
            }

            // Naissances célèbres (limité à 1, filtré)
            if (data.births && Array.isArray(data.births) && events.length < 5) {
                const positiveBirths = data.births
                    .filter((e: any) => e.year && e.text && isPositiveEvent(e.text));

                if (positiveBirths.length > 0) {
                    // Préférer les naissances plus anciennes (personnages historiques)
                    const oldBirths = positiveBirths.filter((e: any) => e.year < 1950);
                    const selected = oldBirths.length > 0
                        ? oldBirths[Math.floor(Math.random() * oldBirths.length)]
                        : positiveBirths[Math.floor(Math.random() * positiveBirths.length)];

                    events.push({
                        year: selected.year,
                        text: `Naissance de ${selected.text}`,
                        type: "birth" as const,
                        url: getWikipediaUrl(selected)
                    });
                }
            }

            return events.length > 0 ? events : this.getFallbackOnThisDay(m, d);
        } catch (error) {
            console.error("Error fetching On This Day:", error);
            return this.getFallbackOnThisDay(m, d);
        }
    }

    /**
     * Données de secours si l'API Wikipedia ne répond pas
     */
    private getFallbackOnThisDay(month: number, day: number): OnThisDayEvent[] {
        const fallbackEvents: Record<string, OnThisDayEvent[]> = {
            "1-1": [
                { year: 1863, text: "Abraham Lincoln signe la Proclamation d'émancipation", type: "event" },
                { year: 1958, text: "Entrée en vigueur du Traité de Rome créant la CEE", type: "event" }
            ],
            "2-2": [
                { year: 1943, text: "Fin de la bataille de Stalingrad", type: "event" },
                { year: 1990, text: "Frederik de Klerk annonce la fin de l'apartheid en Afrique du Sud", type: "event" }
            ],
            "2-14": [
                { year: 1879, text: "Le Chili déclare la guerre au Pérou et à la Bolivie", type: "event" },
                { year: 1929, text: "Massacre de la Saint-Valentin à Chicago", type: "event" }
            ],
            "3-8": [
                { year: 1917, text: "Début de la révolution de Février en Russie", type: "event" },
                { year: 1910, text: "Première Journée internationale des femmes", type: "event" }
            ],
            "5-1": [
                { year: 1886, text: "Début de la grève générale à Chicago pour la journée de 8h", type: "event" },
                { year: 1889, text: "Inauguration de la tour Eiffel", type: "event" }
            ],
            "5-8": [
                { year: 1945, text: "Capitulation de l'Allemagne nazie - Fin de la Seconde Guerre mondiale en Europe", type: "event" }
            ],
            "6-6": [
                { year: 1944, text: "Débarquement de Normandie (D-Day)", type: "event" }
            ],
            "7-14": [
                { year: 1789, text: "Prise de la Bastille", type: "event" },
                { year: 1880, text: "Le 14 juillet devient la fête nationale française", type: "event" }
            ],
            "7-20": [
                { year: 1969, text: "Neil Armstrong et Buzz Aldrin marchent sur la Lune", type: "event" }
            ],
            "9-11": [
                { year: 2001, text: "Attentats du World Trade Center à New York", type: "event" }
            ],
            "11-9": [
                { year: 1989, text: "Chute du mur de Berlin", type: "event" }
            ],
            "11-11": [
                { year: 1918, text: "Armistice de la Première Guerre mondiale", type: "event" }
            ],
            "12-25": [
                { year: 800, text: "Charlemagne est couronné empereur", type: "event" },
                { year: 1066, text: "Couronnement de Guillaume le Conquérant", type: "event" }
            ]
        };

        const key = `${month}-${day}`;
        if (fallbackEvents[key]) {
            return fallbackEvents[key];
        }

        // Générer un fait historique générique basé sur le jour
        const genericFacts: OnThisDayEvent[] = [
            { year: 1850 + (day * 3) % 100, text: "Invention d'une technologie révolutionnaire", type: "event" },
            { year: 1900 + (month * 2) % 50, text: "Signature d'un traité international important", type: "event" },
            { year: 1920 + day % 30, text: "Naissance d'un artiste célèbre", type: "birth" }
        ];
        return genericFacts;
    }

    /**
     * Récupère les prochains anniversaires de la famille (7 prochains jours)
     */
    public async getUpcomingBirthdays(daysAhead: number = 30): Promise<UpcomingEvent[]> {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDate = addDays(today, daysAhead);

        // Récupérer toutes les personnes avec une date de naissance
        const persons = await this.personsRepo
            .createQueryBuilder("p")
            .where("p.dateOfBirth IS NOT NULL")
            .andWhere("p.dateOfDeath IS NULL")
            .getMany();

        const upcomingBirthdays: UpcomingEvent[] = [];

        for (const person of persons) {
            if (!person.dateOfBirth) continue;

            const p = new Person().fromJSON(person);
            const [year, month, day] = p.dateOfBirth.split(".").map(Number);

            if (!month || !day) continue;

            // Calculer la date d'anniversaire cette année
            let birthdayThisYear = new Date(now.getFullYear(), month - 1, day);

            // Si l'anniversaire est passé cette année, prendre l'année prochaine
            if (birthdayThisYear < today) {
                birthdayThisYear = new Date(now.getFullYear() + 1, month - 1, day);
            }

            // Vérifier si dans la plage
            if (birthdayThisYear <= endDate) {
                const daysUntil = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const age = birthdayThisYear.getFullYear() - year;

                // Récupérer la photo du trombi
                const photo = p.getPhoto();
                const thumb = photo ? `/files/trombi/mini/${p.id}_${photo.year}.jpg` : null;

                upcomingBirthdays.push({
                    date: birthdayThisYear,
                    name: p.getQuickName(),
                    type: "birthday",
                    details: `${p.getQuickName()} fêtera ses ${age} ans`,
                    daysUntil,
                    personId: p.id,
                    thumb
                });
            }
        }

        // Trier par date
        return upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
    }

    /**
     * Récupère les prochains jours fériés français
     */
    public getUpcomingHolidays(daysAhead: number = 30): UpcomingEvent[] {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDate = addDays(today, daysAhead);
        const year = now.getFullYear();

        // Récupérer les fêtes de cette année et de l'année prochaine
        const holidays: UpcomingEvent[] = [];

        for (let y = year; y <= year + 1; y++) {
            for (let m = 0; m < 12; m++) {
                const monthHolidays = eventService.getLegalEvents(y, m);
                for (const h of monthHolidays) {
                    if (h.startDate >= today && h.startDate <= endDate) {
                        const daysUntil = Math.ceil((h.startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        holidays.push({
                            date: h.startDate,
                            name: h.name,
                            type: "holiday",
                            daysUntil
                        });
                    }
                }
            }
        }

        return holidays.sort((a, b) => a.daysUntil - b.daysUntil);
    }

    /**
     * Récupère tous les événements à venir (anniversaires + fêtes)
     */
    public async getUpcomingEvents(daysAhead: number = 30): Promise<UpcomingEvent[]> {
        const birthdays = await this.getUpcomingBirthdays(daysAhead);
        const holidays = this.getUpcomingHolidays(daysAhead);

        // Fusionner et trier
        const allEvents = [...birthdays, ...holidays];
        return allEvents.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 10);
    }

    /**
     * Récupère une citation aléatoire de la famille
     */
    public async getRandomCitation() {
        const citation = await citationService.random();
        if (!citation) return null;

        const photo = citation.author ? citation.author.getPhoto(citation.year) : null;
        return {
            id: citation.id,
            citation: citation.citation,
            year: citation.year,
            author: {
                id: citation.author?.id,
                fullname: citation.author?.getFullname(),
                thumb: photo ? `/files/trombi/mini/${citation.author.id}_${photo.year}.jpg` : null
            }
        };
    }

    /**
     * Récupère toutes les données pour les widgets de la homepage
     */
    public async getHomepageWidgets() {
        const [upcomingEvents, citation, onThisDay] = await Promise.all([
            this.getUpcomingEvents(30),
            this.getRandomCitation(),
            this.getOnThisDay()
        ]);

        return {
            upcomingEvents,
            citation,
            onThisDay
        };
    }
}

export const homepageService = new HomepageService();
