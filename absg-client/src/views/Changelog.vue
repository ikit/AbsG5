<template>
  <div class="container">
    <h1>Absolument G - Version {{ version }}</h1>
    <a
      style="display: block; text-align: center"
      href="https://trello.com/b/LDvwctf7/absg-5"
      target="_blank"
    > Voir la feuille de route </a>


    <h2>
      5.2
    </h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>Album: nouvelle section du site pour la création et le partage d'album photo</li>
      </ul>
      <p>Bug corrigés</p>
      <ul>
        <li>Agenda: problème avec les dates de naissance</li>
      </ul>
    </v-card>

    <h2>
      5.1
    </h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>AGPA Cérémonie en ligne synchronisée entre les différents sites</li>
        <li>AGPA Cérémonie: préchargement et mise en cache</li>
        <li>Forum: création de nouveau sujet de discussion</li>
        <li>Notification: précision des sujets concernés par les nouveaux messages</li>
        <li>Admin: AGPA P2 suppression de photo</li>
        <li>Admin: AGPA monitoring</li>
        <li>AGPA: Clôture de l'édition courante</li>
        <li>AGPA: Graph répartition votes</li>
      </ul>
      <p>Bug corrigés</p>
      <ul>
        <li>AGPA P1: Diaporama</li>
        <li>AGPA P1: Indicateur de chargement lors de la sauvegarde/édition d'une image</li>
        <li>Forum: navigation/chargement d'un sujet à l'autre</li>
        <li>AGPA P3: impossible de voter pour ses propres photos</li>
        <li>AGPA P3: association fixe d'un numéro pour chaque photos (plus d'aléatoire comme en P2)</li>
        <li>AGPA Cérémonie: bug de l'an 2020 :)</li>
      </ul>
    </v-card>

    <h2>
      5.0
    </h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>Procédure de réinitialise du mot de passe automatique pour les comptes sans mot de passe.</li>
        <li>Mise en place des notifications</li>
        <li>Forum: création de nouveau sujet de discussion</li>
      </ul>
      <p>Bug corrigés</p>
      <ul>
        <li>Problème de connection pour les identifiants avec accent</li>
        <li>Forum: Suppression dernier message d'un sujet sur le forum</li>
      </ul>
    </v-card>

    <h2>
      Beta - octobre 2020
    </h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>Déploiement de l'application</li>
        <li>Notification présence des membres en ligne</li>
      </ul>
      <p>Bug corrigés</p>
      <ul>
        <li>Stabilisation de l'application</li>
        <li>Impossible de sortir de l'écran d'authentification</li>
        <li>Limite d'upload des fichiers montée à 200Mo</li>
      </ul>
    </v-card>

    <h2>Alpha 10 - septembre 2020</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>AGPA: Phase 3 - Vote des photos</li>
        <li>AGPA: Phase 4 - Dépouillement des votes</li>
      </ul>
    </v-card>

    <h2>Alpha 9 - août 2020</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>AGPA: Phase 2 - Vérification des photos</li>
      </ul>
      <p>Bug corrigés</p>
      <ul>
        <li>Admin: email + récupération/changement de mot de passe</li>
      </ul>
    </v-card>

    <h2>Alpha 8 - juillet 2020</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>AGPA: Phase 1 - Enregistrement des photos</li>
      </ul>
    </v-card>

    <h2>Alpha 7 - juin 2020</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>Calendrier: Calendrier des événements de la famille sur la page d'accueil</li>
        <li>Calendrier: Ajout, édition, suppression d'événement</li>
        <li>Calendrier: Sélection du mois/année directement via formulaire</li>
        <li>Menu utilisateur: mise à jours de la position GPS</li>
      </ul>
      <p>Bug corrigés</p>
      <ul>
        <li>DevOps Nginx: Correction du routage dynamique (accès direct lors d'un F5 par exemple)</li>
        <li>PassaG: utilisateurs affichés plusieurs fois par créneau</li>
        <li>Calendrier: mise à jour du titre en fonction du mois sélectionné</li>
      </ul>
    </v-card>

    <h2>Alpha 6 - mai 2020</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>Menu principal responsive</li>
        <li>AGPA: prise en compte de l'évolution des catégories au fils des éditions</li>
        <li>AGPA: refonte du palmarès</li>
        <li>Photos: album automatique - Chronologie - </li>
        <li>Ciations: photo de l'auteur tirée du trombinoscope en fonction de la date </li>
        <li>Forum: Browser/Lecture des Forums/Sujets</li>
        <li>Forum: T.B.Z.</li>
        <li>Forum: Editeur de message (version basique)</li>
        <li>Forum: Possibilité de supprimer un message</li>
        <li>Admin: Paramètrage du site et des AGPA</li>
      </ul>
      <p>Bug corrigés</p>
      <ul>
        <li>Authentification: fin de session, reconnection/déconnection, redirection écran login</li>
        <li>Agenda: fix formulaire d'édition/création des ficher personne et lieux de l'agenda</li>
        <li>Forum: fix id association forum/topic des anciens messages</li>
        <li>AGPA: fix routes</li>
        <li>Forum: fix scrolling automatique dernier message</li>
      </ul>
    </v-card>

    <h2>Alpha 5 - avr 2020</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>Editeur d'image : avec rotation et crop</li>
        <li>Photos: visualisation avec pagination des anciennes images du moment</li>
        <li>Photos: Formulaire enregistrement nouvelle image du moment</li>
        <li>Photos: section "A trier" avec visualisation et formulaire pour annoter les photos</li>
        <li>Agenda: Visualisation (filtrage et pagination) du répertoire des personnes</li>
        <li>Agenda: Ajout/édition d'entrées du répertoire des personnes</li>
        <li>Agenda: Visualisation (filtrage et pagination) du répertoire des lieux</li>
        <li>Agenda: Ajout/édition d'entrées du répertoire des lieux</li>
        <li>Déploiement en ligne de la version alpha (dev.absolumentg.fr) ainsi qu'outils d'admistration de la base de donnée (pgadmin)</li>
        <li>Citations: Refactorisation et mise à jour pour cohérence de l'interface avec le reste du site</li>
      </ul>
      <p>Bug corrigés</p>
      <ul>
        <li>Authentification: fin de session, reconnection/déconnection, redirection écran login</li>
        <li>Agenda: fix formulaire d'édition/création des ficher personne et lieux de l'agenda</li>
      </ul>
    </v-card>

    <h2>Alpha 6 - mars 2020</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>Admin: Interface de paramètrage du site</li>
        <li>Admin: Gestion (création/édition) des utilisateurs</li>
        <li>
          Tagueule: <a
            href="https://avatar.absolumentg.fr"
            target="_blank"
          >Editeur d'avatar</a>
        </li>
      </ul>
    </v-card>

    <h2>Alpha 4 - fev 2020</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>Citations: Création, édition et suppression de citation</li>
        <li>Accueil: affichage dernière "image du moment"</li>
        <li>Mise en place des logs et des notifications system/utilisateurs</li>
      </ul>
    </v-card>

    <h2>Alpha 3 - jan 2020</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>Authentification des utilisateurs</li>
        <li>AGPA: Palmarès</li>
        <li>Citations: Visualisation (avec filtre par auteur et pagination)</li>
        <li>Accueil: PassaG</li>
      </ul>
    </v-card>

    <h2>Alpha 2 - dec 2019</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>AGPA: Cérémonies en ligne, générées automatiquement</li>
      </ul>
    </v-card>

    <h2>Alpha 1 - nov 2019</h2>
    <v-card>
      <p>Fonctionnalités</p>
      <ul>
        <li>AGPA: Réglement</li>
        <li>AGPA: Archives et visualisations des anciennes éditions</li>
      </ul>
    </v-card>

    <h2>Alpha Zéro - jan 2019</h2>
    <v-card>
      <ul>
        <li>
          Initialisation du projet et choix des technologies la technologie VueJs et Vuetify:
          <ul>
            <li>DB: postgreSQL</li>
            <li>Back: NodeJS / Express</li>
            <li>Front: VueJs / Vuetify</li>
          </ul>
        </li>
      </ul>
    </v-card>
  </div>
</template>


<script>
import Vue from 'vue';

export default {
    data: () => ({
        version: ""
    }),
    mounted() {
        // On récupère le numéro de version
        this.version = require("../../package.json").version;
    }
}
</script>


<style lang="scss" scoped>
@import '../themes/global.scss';

h2 {
    color: #fff;
    font-weight: bold;
    font-family: "Comfortaa", sans-serif;
    text-shadow:
        0 1px 0 #ccc, 0 2px 0 #c9c9c9,
        0 3px 0 #bbb, 0 4px 0 #b9b9b9,
        0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1),
        0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3),
        0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25),
        0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15);
    margin-top: 20px;
}
p {
    margin: 0;
}
ul {
    margin-left: 15px;
}
.v-card {
    padding: 15px;
}

</style>
