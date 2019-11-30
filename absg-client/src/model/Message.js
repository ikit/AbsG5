export class Message {
    id = 0;             // L'identifiant unique du message
    userId = 0;         // L'identifiant de l'utilisateur qui a écrit le message
    message = "";       // Le contenu du message au format html
    date = new Date();  // La date à laquelle le message a été écrit
}
