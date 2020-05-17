<template>
    <v-container fluid v-if="settings">
        <v-expansion-panels style="padding: 10px; max-width: 500px; margin: auto">
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <span><i class="fas fa-bullhorn" style="display: inline-block; width: 40px"></i> Mettre une annonce</span>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <p>
                        <span class="details">
                            Met en avant sur le site une annonce visible par tous.
                            En cliquand sur l'accroche, les utilisateurs verront une popup avec le corps de l'annonce (html autorisé)
                        </span>
                        <v-text-field
                            label="Accroche de l'annonce"
                            v-model="settings.announcementTitle">
                        </v-text-field>
                        <v-textarea
                            label="Corps de l'annonce"
                            v-model="settings.announcementBody"
                            hint="HTML autorisé"
                        ></v-textarea>
                    </p>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>
                    <span><i class="fas fa-star" style="display: inline-block; width: 40px"></i> Edition spéciale des AGPA {{settings.agpaSpecialEdition ? settings.agpaSpecialEdition.year : ''}}</span>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <p>
                        <span class="details">
                            Configurer la catégorie spéciale de l'année en cours.
                        </span>
                        <v-text-field
                            label="Thème de la catégorie spéciale"
                            v-model="settings.agpaSpecialEdition.title">
                        </v-text-field>
                        <v-text-field
                            label="Description"
                            v-model="settings.agpaSpecialEdition.description">
                        </v-text-field>
                    </p>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>
                    <span><i class="far fa-calendar-alt" style="display: inline-block; width: 40px"></i> Durées des phases des AGPA</span>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <p>
                        <span class="details">
                            Configurer les durées en jours des différentes phases. La phase n°1 commence obligatoirement le 1er octobre.
                        </span>
                        <v-text-field
                            :label="`Durée de la phase 1 => Débute le ${this.agpaPhase1Start}`"
                            :rules="agpaPhaseRules"
                            v-model="settings.agpaPhase1Duration"
                            @change="updateAgpaPhasesBoundaries()">
                        </v-text-field>
                        <v-text-field
                            :label="`Durée de la phase 2 => Débute le ${this.agpaPhase2Start}`"
                            :rules="agpaPhaseRules"
                            v-model="settings.agpaPhase2Duration"
                            @change="updateAgpaPhasesBoundaries()">
                        </v-text-field>
                        <v-text-field
                            :label="`Durée de la phase 3 => Débute le ${this.agpaPhase3Start}`"
                            :rules="agpaPhaseRules"
                            v-model="settings.agpaPhase3Duration"
                            @change="updateAgpaPhasesBoundaries()">
                        </v-text-field>
                        <v-text-field
                            :label="`Durée de la phase 4 => Débute le ${this.agpaPhase4Start}`"
                            :rules="agpaPhaseRules"
                            v-model="settings.agpaPhase4Duration"
                            @change="updateAgpaPhasesBoundaries()">
                        </v-text-field>
                    </p>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>
                    <span><i class="fas fa-desktop" style="display: inline-block; width: 40px"></i> Début de la cérémonie</span>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <p>
                        <span class="details">
                            La cérémonie sera accessible et démarrera automatiquement à partir de l'heure indiqué, en nombre de seconde, à partir de minuit une fois la phase 4 terminée.
                        </span>
                        <v-text-field
                            :label="`Heure d'ouverture de la cérémonie => Débute le ${this.agpaPhase5Start}`"
                            v-model="settings.agpaCeremonyStartTime"
                            @change="updateAgpaPhasesBoundaries()">
                        </v-text-field>
                    </p>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>

        <v-btn
            style="margin: 10px auto; display: block;"
            color="accent"
            @click="save()">
            Sauvegarder les paramètres
        </v-btn>

    </v-container>
</template>


<script>
import Vue from 'vue';
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { addDays, addSeconds, format } from 'date-fns';
import { fr } from "date-fns/locale";

export default {
    data: () => ({
    // Settings
        settings: null,

    // Computed
        agpaPhase1Start: "1/10",
        agpaPhase2Start: "15/12",
        agpaPhase3Start: "17/12",
        agpaPhase4Start: "1/10",
        agpaPhase5Start: "1/10",

    // IHM models
        agpaPhaseRules: [
            value => !!value || 'Ce champs est obligatoire',
            value => {
                const pattern = /^[0-9]+$/
                return pattern.test(value) || 'Durée invalide'
            },
            value => (+value > 0 && +value < 201) || 'Doit être compris entre 1 et 200',
        ],
    }),
    mounted() {
        axios.get(`/api/settings`).then(response => {
            this.settings = parseAxiosResponse(response);
            this.updateAgpaPhasesBoundaries();
        }).catch( err => {
            store.commit('onError', err);
        });

    },
    methods: {
        updateAgpaPhasesBoundaries() {
            const p1 = new Date(new Date().getFullYear(), 9, 1) // le 1er octobre à minuit
            const p2 = addDays(p1, this.settings.agpaPhase1Duration);
            const p3 = addDays(p2, this.settings.agpaPhase2Duration);
            const p4 = addDays(p3, this.settings.agpaPhase3Duration);
            let p5 = addDays(p4, this.settings.agpaPhase4Duration);
            p5 = addSeconds(p5, this.settings.agpaCeremonyStartTime);

            this.agpaPhase1Start = format(p1, "dd MMM", {locale: fr});
            this.agpaPhase2Start = format(p2, "dd MMM", {locale: fr});
            this.agpaPhase3Start = format(p3, "dd MMM", {locale: fr});
            this.agpaPhase4Start = format(p4, "dd MMM", {locale: fr});
            this.agpaPhase5Start = format(p5, "dd MMM 'à' H'h'mm", {locale: fr});
        },

        save() {
            axios.post(`/api/settings`, this.settings).then(response => {
                this.settings = parseAxiosResponse(response);
                this.updateAgpaPhasesBoundaries();
            }).catch( err => {
                store.commit('onError', err);
            });
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';

h2 {
    line-height: initial;
    text-align: left;
    margin-bottom: 10px;
    display: inline-block;
    margin-left: 17px;
    font-family: "Comfortaa", sans-serif;

}

p {
    margin-left: 45px;
}



</style>
