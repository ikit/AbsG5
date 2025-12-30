<template>
  <v-container
    v-if="settings"
    fluid
  >
    <h1 style="text-align: center; margin-bottom: 20px; font-family: 'Comfortaa', sans-serif;">
      <i class="fas fa-cog" style="margin-right: 10px;"></i>
      Configuration du site
    </h1>

    <v-tabs
      v-model="activeTab"
      centered
      color="primary"
      style="margin-bottom: 20px;"
    >
      <v-tab value="general">
        <i class="fas fa-sliders-h" style="margin-right: 8px;"></i>
        Paramètres généraux
      </v-tab>
      <v-tab value="agpa">
        <i class="fas fa-calendar-alt" style="margin-right: 8px;"></i>
        Configuration AGPA
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Onglet Paramètres généraux -->
      <v-window-item value="general">
        <v-expansion-panels style="padding: 10px; max-width: 800px; margin: auto" model-value="0">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <span><i
                class="fas fa-bullhorn"
                style="display: inline-block; width: 40px"
              /> Annonces du site</span>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>
                <span class="details">
                  Met en avant sur le site une annonce visible par tous.
                  En cliquant sur l'accroche, les utilisateurs verront une popup avec le corps de l'annonce (HTML autorisé).
                </span>
                <v-text-field
                  v-model="settings.announcementTitle"
                  label="Accroche de l'annonce"
                  variant="outlined"
                  density="comfortable"
                  style="margin-top: 15px;"
                />
                <v-textarea
                  v-model="settings.announcementBody"
                  label="Corps de l'annonce"
                  hint="HTML autorisé"
                  variant="outlined"
                  density="comfortable"
                  rows="4"
                />
              </p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-window-item>

      <!-- Onglet AGPA -->
      <v-window-item value="agpa">
        <v-expansion-panels style="padding: 10px; max-width: 800px; margin: auto">
          <v-expansion-panel>
        <v-expansion-panel-title>
          <span><i
            class="fas fa-star"
            style="display: inline-block; width: 40px"
          /> Edition spéciale des AGPA {{ settings.agpaSpecialEdition ? settings.agpaSpecialEdition.year : '' }}</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <p>
            <span class="details">
              Configurer la catégorie spéciale de l'année en cours.
            </span>
            <v-text-field
              v-model="settings.agpaSpecialEdition.title"
              label="Thème de la catégorie spéciale"
            />
            <v-text-field
              v-model="settings.agpaSpecialEdition.description"
              label="Description"
            />
          </p>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title>
          <span><i
            class="far fa-calendar-alt"
            style="display: inline-block; width: 40px"
          /> Durées des phases des AGPA</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <p>
            <span class="details">
              Configurer les durées en jours des différentes phases. La phase n°1 commence obligatoirement le 1er octobre.
            </span>
            <v-text-field
              v-model="settings.agpaPhase1Duration"
              :label="`Durée de la phase 1 => Débute le ${agpaPhase1Start}`"
              :rules="agpaPhaseRules"
              @change="updateAgpaPhasesBoundaries()"
            />
            <v-text-field
              v-model="settings.agpaPhase2Duration"
              :label="`Durée de la phase 2 => Débute le ${agpaPhase2Start}`"
              :rules="agpaPhaseRules"
              @change="updateAgpaPhasesBoundaries()"
            />
            <v-text-field
              v-model="settings.agpaPhase3Duration"
              :label="`Durée de la phase 3 => Débute le ${agpaPhase3Start}`"
              :rules="agpaPhaseRules"
              @change="updateAgpaPhasesBoundaries()"
            />
            <v-text-field
              v-model="settings.agpaPhase4Duration"
              :label="`Durée de la phase 4 => Débute le ${agpaPhase4Start}`"
              :rules="agpaPhaseRules"
              @change="updateAgpaPhasesBoundaries()"
            />
          </p>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title>
          <span><i
            class="fas fa-desktop"
            style="display: inline-block; width: 40px"
          /> Début de la cérémonie</span>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <p>
            <span class="details">
              La cérémonie sera accessible et démarrera automatiquement à l'heure indiquée, une fois la phase 4 terminée.
            </span>

            <div style="margin: 20px 0;">
              <div style="font-weight: bold; margin-bottom: 10px; text-align: center; font-size: 1.2em; color: #1976d2;">
                Heure de début : {{ ceremonyHourDisplay }}
              </div>
              <div style="font-size: 0.9em; color: #666; text-align: center; margin-bottom: 15px;">
                La cérémonie débutera le {{ agpaPhase5Start }}
              </div>
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <div style="padding: 0 15px;">
                  <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                    <i class="far fa-clock" style="margin-right: 5px;"></i>
                    Heure : {{ ceremonyHour }}h
                  </label>
                  <v-slider
                    v-model="ceremonyHour"
                    :min="10"
                    :max="23"
                    :step="1"
                    thumb-label
                    color="primary"
                    track-color="grey-lighten-2"
                    @update:model-value="updateCeremonyTime()"
                  >
                    <template #thumb-label="{ modelValue }">
                      {{ modelValue }}h
                    </template>
                  </v-slider>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div style="padding: 0 15px;">
                  <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                    <i class="far fa-clock" style="margin-right: 5px;"></i>
                    Minutes : {{ ceremonyMinute }}min
                  </label>
                  <v-slider
                    v-model="ceremonyMinute"
                    :min="0"
                    :max="55"
                    :step="5"
                    thumb-label
                    color="primary"
                    track-color="grey-lighten-2"
                    @update:model-value="updateCeremonyTime()"
                  >
                    <template #thumb-label="{ modelValue }">
                      {{ modelValue }}min
                    </template>
                  </v-slider>
                </div>
              </v-col>
            </v-row>
          </p>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
      </v-window-item>
    </v-window>

    <v-btn
      style="margin: 20px auto; display: block;"
      color="primary"
      size="large"
      elevation="2"
      @click="save()"
    >
      <i class="fas fa-save" style="margin-right: 8px;"></i>
      Sauvegarder les paramètres
    </v-btn>
  </v-container>
</template>


<script>
import axios from 'axios';
import store from '../../stores/helpers';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { addDays, addSeconds, format } from 'date-fns';
import { fr } from "date-fns/locale";

export default {
    data: () => ({
    // Settings
        settings: null,
        activeTab: 'general', // Onglet par défaut

    // Computed
        agpaPhase1Start: "1/10",
        agpaPhase2Start: "15/12",
        agpaPhase3Start: "17/12",
        agpaPhase4Start: "1/10",
        agpaPhase5Start: "1/10",

    // Ceremony time sliders
        ceremonyHour: 20,
        ceremonyMinute: 0,

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
    computed: {
        ceremonyHourDisplay() {
            const h = String(this.ceremonyHour).padStart(2, '0');
            const m = String(this.ceremonyMinute).padStart(2, '0');
            return `${h}h${m}`;
        }
    },
    mounted() {
        axios.get(`/api/settings`).then(response => {
            this.settings = parseAxiosResponse(response);
            this.initCeremonySliders();
            this.updateAgpaPhasesBoundaries();
        }).catch( err => {
            store.commit('onError', err);
        });

    },
    methods: {
        initCeremonySliders() {
            // Convertir les secondes en heures et minutes
            const totalSeconds = +this.settings.agpaCeremonyStartTime;
            this.ceremonyHour = Math.floor(totalSeconds / 3600);
            this.ceremonyMinute = Math.floor((totalSeconds % 3600) / 60);
        },

        updateCeremonyTime() {
            // Convertir heures et minutes en secondes
            const totalSeconds = (this.ceremonyHour * 3600) + (this.ceremonyMinute * 60);
            this.settings.agpaCeremonyStartTime = totalSeconds;
            this.updateAgpaPhasesBoundaries();
        },

        updateAgpaPhasesBoundaries() {
            // Phase 1 démarre le 1er octobre à minuit
            const p1 = new Date(new Date().getFullYear(), 9, 1, 0, 0, 0);

            // Phase 2 démarre après X1 jours à 1h du matin (fin phase 1)
            let p2 = addDays(p1, +this.settings.agpaPhase1Duration);
            p2 = addSeconds(p2, 3600); // +1 heure

            // Phase 3 démarre après X2 jours à 1h du matin (fin phase 2)
            const p3 = addDays(p2, +this.settings.agpaPhase2Duration);

            // Phase 4 démarre après X3 jours à 1h du matin (fin phase 3)
            const p4 = addDays(p3, +this.settings.agpaPhase3Duration);

            // Phase 5 (cérémonie) démarre après X4 jours à l'heure personnalisée
            let p5 = addDays(p4, +this.settings.agpaPhase4Duration);
            // Retirer 1h (revenir à minuit) puis ajouter l'heure de la cérémonie
            p5 = addSeconds(p5, -3600 + (+this.settings.agpaCeremonyStartTime));

            this.agpaPhase1Start = format(p1, "dd MMM 'à' H'h'mm", {locale: fr});
            this.agpaPhase2Start = format(p2, "dd MMM 'à' H'h'mm", {locale: fr});
            this.agpaPhase3Start = format(p3, "dd MMM 'à' H'h'mm", {locale: fr});
            this.agpaPhase4Start = format(p4, "dd MMM 'à' H'h'mm", {locale: fr});
            this.agpaPhase5Start = format(p5, "dd MMM 'à' H'h'mm", {locale: fr});
        },

        save() {
            axios.post(`/api/settings`, this.settings).then(response => {
                this.settings = parseAxiosResponse(response);
                this.initCeremonySliders();
                this.updateAgpaPhasesBoundaries();
            }).catch( err => {
                store.commit('onError', err);
            });
        }
    }
}
</script>

<style lang="scss" scoped>
@use '../../themes/global.scss' as *;

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
