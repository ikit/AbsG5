<template>
    <div class="container">

        <h1>Absolument G - V6 alpha</h1>
        <a style="display: block; text-align: center" href="https://trello.com/b/LDvwctf7/absg-5" target="_blank"> Voir la feuille de route </a>

        <h2>Alpha 6 - mar 2020</h2>
        <v-card>
            <p>Evolutions</p>
            <ul>
                <li>AGPA: prise en compte de l'évolution des catégories au fils des éditions</li>
            </ul>
            <p>Bug corrigés</p>
            <ul>
                <li>Authentification: fin de session, reconnection/déconnection, redirection écran login</li>
                <li>Agenda: fix formulaire d'édition/création des ficher personne et lieux de l'agenda</li>
            </ul>
        </v-card>



        <h2>Alpha 5 - avr 2020</h2>
        <v-card>
            <p>Evolutions</p>
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
            <p>Evolutions</p>
            <ul>
                <li>Admin: Interface de paramètrage du site</li>
                <li>Admin: Gestion (création/édition) des utilisateurs</li>
                <li>Tagueule: <a href="https://avatar.absolumentg.fr" target="_blank">Editeur d'avatar</a></li>
            </ul>
        </v-card>

        <h2>Alpha 4 - fev 2020</h2>
        <v-card>
            <p>Evolutions</p>
            <ul>
                <li>Citations: Création, édition et suppression de citation</li>
                <li>Accueil: affichage dernière "image du moment"</li>
                <li>Mise en place des logs et des notifications system/utilisateurs</li>
            </ul>
        </v-card>

        <h2>Alpha 3 - jan 2020</h2>
        <v-card>
        <p>Evolutions</p>
            <ul>
                <li>Authentification des utilisateurs</li>
                <li>AGPA: Palmarès</li>
                <li>Citations: Visualisation (avec filtre par auteur et pagination)</li>
                <li>Accueil: PassaG</li>
            </ul>
        </v-card>

        <h2>Alpha 2 - dec 2019</h2>
        <v-card>
            <p>Evolutions</p>
            <ul>
                <li>AGPA: Cérémonies en ligne, générées automatiquement</li>
            </ul>
        </v-card>

        <h2>Alpha 1 - nov 2019</h2>
        <v-card>
            <p>Evolutions</p>
            <ul>
                <li>AGPA: Réglement</li>
                <li>AGPA: Archives et visualisations des anciennes éditions</li>
            </ul>
        </v-card>

        <h2>Alpha Zéro - jan 2019</h2>
        <v-card>
            <ul>
                <li>Initialisation du projet et choix des technologies la technologie VueJs et Vuetify:
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
    data: () => ({})
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
