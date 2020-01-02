

export class Discussion {
    title = "";             // Le titre de la discussion
    creationDate = null;    // La date à laquelle le premier message a été posté
    endDate = null;         // La date du dernier message de la discussion
    fromDate = null;        // La date à partir de laquelle les messages ont été récupéré
    toDate = null;          // La date jusqu'à laquelle les messages ont été récupéré
    messages = [];          // La liste des messages (du plus vieux au plus récent)
}
