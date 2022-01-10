<template>
  <section id="content">
    <div :class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
      <v-row style="padding: 15px">
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-icon
              left
              style="margin-top:-10px; font-size: 30px"
            >
              far fa-question-circle
            </v-icon>
            <div
              class="phase-left-header"
              v-on="on"
              @click="help.displayed = true; help.page = 3"
            >
              <h2>Phase n°3 en cours : Votes</h2>
              <p>Phase n°4 Délibération - à partir du {{ end }}</p>
            </div>
          </template>
          <span>Besoin d'aide sur la phase actuelle du concours ?</span>
        </v-tooltip>

        <v-spacer />

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              small
              :disabled="isLoading"
              style="margin-top: 3px;"
              v-on="on"
              @click="gotoNextCat(-1)"
            >
              <v-icon>fas fa-chevron-left</v-icon>
            </v-btn>
          </template>
          <span>Catégorie précédente</span>
        </v-tooltip>

        <v-menu
          v-if="category"
          offset-y
        >
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              text
              class="grey--text"
              v-on="on"
            >
              {{ category.title }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="cat in categories"
              :key="cat.categoryId"
              @click="gotoCat(cat.categoryId)"
            >
              <v-list-item-title>{{ cat.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              small
              :disabled="isLoading"
              style="margin-top: 3px;"
              v-on="on"
              @click="gotoNextCat(1)"
            >
              <v-icon>fas fa-chevron-right</v-icon>
            </v-btn>
          </template>
          <span>Catégorie suivante</span>
        </v-tooltip>

        <v-spacer />

        <v-tooltip bottom>
          <template
            #activator="{ on }"
            v-on="on"
          >
            <div
              class="phase-right-header"
              @click="help.displayed = true; help.page = 4"
            >
              <h2>Vos votes</h2>
              <p v-if="category && category.categoryId > 0">
                <span :style="{ color: totalVotes >= category.maxVotes / 2.0 && totalVotes <= category.maxVotes ? 'green' : 'red'}">
                  {{ totalVotes }} / {{ category.maxVotes }}
                  <i class="fas fa-star" />
                </span>
                                &nbsp;
                <span :style="{ color: totalTitleVotes >= 5 && totalTitleVotes <= 10 ? 'green' : 'red' }">
                  {{ totalTitleVotes }} / 10
                  <i class="fas fa-feather-alt" />
                </span>
              </p>
            </div>
          </template>
          <span>Besoin d'aide sur le déroulement du concours ?</span>
        </v-tooltip>
      </v-row>
      <v-progress-linear
        v-if="isLoading"
        color="accent"
        indeterminate
        style="position: absolute; bottom: -5px; left: 0; right: 0; height: 5px"
      />
    </div>


    <div v-if="category && category.categoryId === 0">
      <h2 class="section">
        Résumé de vos votes par catégorie
      </h2>
      <v-data-table
        :headers="headers"
        :items="resume"
        :loading="waitingScreen"
        disable-filtering
        disable-sort
        hide-default-footer
        loading-text="Mise à jours des données"
        style="margin: 25px"
        @click:row="gotoCat($event.categoryId)"
      >
        <template #[`item.votes`]="{ item }">
          <span
            v-if="item.categoryId > 0"
            :style="{ color: item.votes >= item.maxVotes / 2.0 && item.votes <= item.maxVotes ? 'green' : 'red'}"
          >
            {{ item.votes }} / {{ item.maxVotes }}
          </span>
          <b v-else>{{ item.votes }} / {{ item.maxVotes }}</b>
        </template>

        <template #[`item.tvotes`]="{ item }">
          <span v-if="item.categoryId > 0">
            {{ item.tvotes }}
          </span>
          <b
            v-else
            :style="{ color: item.tvotes >= 5 && item.tvotes <= 10 ? 'green' : 'red'}"
          >{{ item.tvotes }} / 10</b>
        </template>
      </v-data-table>
      <h2 class="section">
        Les photos que vous avez sélectionnées pour le meilleur titre
      </h2>
    </div>

    <v-container fluid>
      <v-layout
        row
        wrap
      >
        <v-flex
          v-for="(photo, index) in photosGalery"
          :key="photo.id"
          style="min-width: 250px; width: 15%; margin: 15px"
        >
          <div>
            <div style="width: 250px; height: 250px; margin: auto;">
              <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                <img
                  class="thumb"
                  :src="photo.thumb"
                  @click="photosGalleryDisplay(index)"
                >
              </div>
            </div>
            <v-card
              class="card"
              style="margin-bottom: 50px"
            >
              <div
                class="thumb-title"
                style="text-align: center"
              >
                {{ photo.title }}
              </div>
              <div style="position: absolute; bottom: -17px; left: 0; right: 0; height: 30px;">
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn
                      v-if="photo.enableVotes"
                      icon
                      small
                      :disabled="isLoading"
                      style="opacity: 1; background: #fff"
                      v-on="on"
                      @click="vote(photo, 1)"
                    >
                      <v-icon :style="{ color: photo.userVote > 0 ? '#ecce00' : '' }">
                        fas fa-star
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ photo.userVote != 1 ? "Mettre 1 étoile sur cette photo" : "Annuler le vote 1 étoile pour cette photo" }}</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn
                      v-if="photo.enableVotes"
                      icon
                      small
                      :disabled="isLoading"
                      style="opacity: 1; background: #fff"
                      v-on="on"
                      @click="vote(photo, 2)"
                    >
                      <v-icon :style="{ color: photo.userVote > 1 ? '#ecce00' : '' }">
                        fas fa-star
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ photo.userVote != 2 ? "Mettre 2 étoiles sur cette photo" : "Annuler le vote 2 étoiles pour cette photo" }}</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn
                      v-if="photo.enableVotes"
                      icon
                      small
                      :disabled="isLoading"
                      style="opacity: 1; background: #fff"
                      v-on="on"
                      @click="vote(photo, -3)"
                    >
                      <v-icon :style="{ color: photo.titleVote > 0 ? '#ecce00' : '' }">
                        fas fa-feather-alt
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ photo.titleVote == 0 ? "Sélectionner la photo pour le meilleur titre" : "Retirer la photo de votre sélection pour le meilleur titre" }}</span>
                </v-tooltip>
              </div>
            </v-card>
          </div>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- Aide -->
    <v-dialog
      v-model="help.displayed"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          Aide sur le déroulement du concours
        </v-card-title>
        <Help :selected-tab="help.page" />
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="help.displayed = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>


<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import PhotoWidget from './components/PhotoWidget';
import store from '../../store';
import Help from './components/Help';

export default {
    components: {
        Help
    },
    store,
    data: () => ({
        isLoading: true,
        waitingScreen: false,
        isAdmin: false,
        headers: [
            { text: 'Catégorie', value: 'title' },
            { text: 'Étoiles', value: 'votes' },
            { text: 'Titre', value: 'tvotes' },
            { text: 'Statut', value: 'status' }
        ],
        year: 0,
        totalVotes: 0,
        totalTitleVotes: 0,
        userVotesOk: true,
        resume: [],
        categories: [], // la liste des données pour chaques catégories
        category: null, // les données de la catégorie affichée
        votes: null, // les votes de l'utilisateur (sur l'ensemble de l'édition)
        photosGalery: [],
        start: format(new Date(2020, 11, 20), "dd MMM 'à' HH'h'mm", {locale: fr}),
        end: format(new Date(2020, 11, 23), "dd MMM 'à' HH'h'mm", {locale: fr}),
        help: {
            displayed: false,
            page: 0
        }
    }),
    computed: { ...mapState([
        'agpaMeta',
        'user'
    ])},
    watch: {
        $route(to, from) {
            this.refreshCategory();
            this.refreshVotes();
        },
        'agpaMeta': function () {
            this.initView();
        }
    },
    mounted () {
        this.isAdmin = this.user.roles.find(e => e === "admin") !== null;
        if (this.agpaMeta) {
            this.initView();
        } else {
            store.dispatch('initAGPA');
        }
    },
    methods: {
        initView() {
            this.isLoading = true;

            // Fin de la phase 3
            this.end = format(new Date(this.agpaMeta.boudaries[2].endDate), "dd MMM 'à' HH'h'mm", {locale: fr});

            axios.get(`/api/agpa/p3`).then(response => {
                const data = parseAxiosResponse(response);
                this.categories = [
                    { categoryId: 0, title: "Résumé", order: 0 },
                    ...data.categories.map(e => ({
                        ...e,
                        title: this.agpaMeta.categories[e.categoryId].title,
                        order: this.agpaMeta.categoriesOrders.findIndex( catId => e.categoryId == catId)
                    }))
                ].sort((a, b) => a.order - b.order);
                this.votes = data.votes;
                this.refreshCategory();
                this.refreshVotes();
                this.isLoading = false;
            }).catch( err => {
                store.commit("onError", err);
            });
        },

        refreshCategory() {
            // Reset photos list
            this.photosGalery = [];
            this.photosGalleryIndex = 0;
            // Get category to display
            this.catId = Number.parseInt(this.$route.query.catId);
            if (!this.catId) {
                this.catId = this.categories[0].categoryId;
            }
            // Affichage de la catégorie demandée
            this.category = this.categories.find(c => c.categoryId === this.catId);
            if (this.catId > 0) {
                // pour les catégories "normales", on affiche les photos
                for (let photo of this.category.photos) {
                    this.photosGalery.push(photo);
                }
            } else {
                // pour le résumé, on affiche les photos sélectionné pour le meilleur titre
                const photos = [];
                for (const v of this.votes.votes) {
                    // On cherche la catégorie/photos impacté par le vote
                    if (v.categoryId === -3) {
                        for (const cat of this.categories) {
                            if (cat.categoryId === 0) continue;
                            const photo = cat.photos.find(p => p.id === v.photoId);
                            if (photo) {
                                this.photosGalery.push(photo);
                            }
                        }
                    }
                }
            }
            store.commit('photosGalleryReset', this.photosGalery);
        },
        refreshVotes(votes = null) {
            if (votes) {
                this.votes = votes;
            }

            this.totalVotes = 0;
            this.totalTitleVotes = this.votes.totalTitleVotes;

            // Maj votes des photos de la galerie
            for (let idx = 0; idx < this.photosGalery.length; idx++) {
                const p = this.photosGalery[idx];
                let uv = 0;
                let tv = 0;

                const t = this.votes.votes.filter(e => p.id === e.photoId);
                for (const v of t) {
                    if (v.categoryId === -3) {
                        tv = 1;
                    } else {
                        uv = v.score;
                    }
                }

                p.titleVote = tv;
                p.userVote = uv;
                this.totalVotes += uv;
            }

            // On reset les stats
            for (const c of this.categories) {
                if (c.categoryId === 0) continue;
                c.votes = 0;
                c.tvotes = 0;
            }

            // On calcules les stats des votes pour chaques catégories
            for (const v of this.votes.votes) {
                // On cherche la catégorie/photos impacté par le vote
                if (v.categoryId === -3) {
                    const idx = this.categories.findIndex(c => c.categoryId > 0 && c.photos.find(p => p.id === v.photoId))
                    this.categories[idx].tvotes += 1;
                } else {
                    const idx = this.categories.findIndex(c => c.categoryId === v.categoryId);
                    this.categories[idx].votes += v.score;
                }
            }

            // On calcul le résumé
            this.resume = [
                ... this.categories.filter(e => e.categoryId > 0).map(e => ({
                    categoryId: e.categoryId,
                    title: e.title,
                    votes: e.votes,
                    maxVotes: e.maxVotes,
                    tvotes: e.tvotes,
                    maxTitle: "-",
                    status: this.getStatus(e.votes, e.maxVotes)
                }))
            ]

            this.resume.push({
                categoryId: 0,
                title: "Total",
                votes: this.resume.reduce((sum, c) => sum + c.votes, 0),
                maxVotes: this.resume.reduce((sum, c) => sum + c.maxVotes, 0),
                tvotes: this.resume.reduce((sum, c) => sum + c.tvotes, 0),
                maxTitle: 10,
                status: ""
            });


            this.waitingScreen = false;
        },

        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },
        photosGalleryHide() {
            store.commit('photosGalleryHide');
        },
        gotoNextCat(step) {
            let catIdx = this.categories.findIndex( e => e.categoryId == this.category.categoryId);
            catIdx += step + this.categories.length;
            catIdx %= this.categories.length;
            this.gotoCat(this.categories[catIdx].categoryId);
        },
        gotoCat(catId) {
            this.$router.replace({path: `/agpa/edition?catId=${catId}`});
        },
        vote(photo, vote) {
            if (!this.waitingScreen) {
                this.waitingScreen = true;
                axios.get(`/api/agpa/vote/${photo.id}/${vote}`).then(response => {
                    this.refreshVotes(parseAxiosResponse(response));
                    this.refreshCategory();
                }).catch( err => {
                    store.commit("onError", err);
                });
            }

        },
        getStatus(votes, maxVotes) {
            if (votes === 0) {
                return "";
            }
            if (votes < maxVotes / 2.0) {
                return "Pas assez d'étoiles attribuées";
            }
            if (votes > maxVotes) {
                return "Trop d'étoiles attribuées";
            }
            return "OK";
        },
        addCommentaryPhoto() {
            if (this.photoDiscussion.photo.error) {
                this.photoDiscussion.photo.error.messages.push({ id: this.user.id, msg: this.photoDiscussion.comment });
            } else {
                this.photoDiscussion.photo.error = {
                    status: "checking",
                    messages: [{ id: this.user.id, msg: this.photoDiscussion.comment }]
                }
            }
            this.savePhotoApiCall(this.photoDiscussion.photo.id, this.photoDiscussion.photo.error);
        },
        updatePhotoStatus(status) {
            if (this.photoDiscussion.photo.error) {
                this.photoDiscussion.photo.error.status = status;
            } else {
                this.photoDiscussion.photo.error = {
                    status: status,
                    messages: []
                }
            }
            this.savePhotoApiCall(this.photoDiscussion.photo.id, this.photoDiscussion.photo.error);
        },
        savePhotoApiCall(photoId, error) {
            // const formData = new FormData();
            // formData.append("error", JSON.stringify(error));
            // formData.append("id", photoId);

            // // On envoie tout au serveur pour qu'il enregistre la nouvelle image du moment
            // axios.post(`/api/agpa/photo`, formData, {
            //     headers: { "Content-Type" : "multipart/form-data" }
            // })
            // .then(response => {
            //     const updatedPhoto = parseAxiosResponse(response);
            //     const idx = this.photosGalery.findIndex(p => p.id === updatedPhoto.id);
            //     if (idx) {
            //         this.photosGalery[idx].error = updatedPhoto.error;
            //     }
            //     this.photoDiscussion.displayed = false;
            // })
            // .catch(err => {
            //     store.commit("onError", err);
            // });
        },

    }
};
</script>



<style lang="scss" scoped>
@import '../../themes/global.scss';
@import '../../themes/agpa.scss';

#content {
    text-align: center;
}

h2.section {
    text-align: left;
    font-weight: bold;
    color: #37474f;
    text-shadow: 0 1px #aaa;
    font-size: 25px;
    font-family: "Comfortaa", sans-serif;
    margin: 30px 0 -20px 25px;
}

.phase-left-header {
    margin: -5px 0 -10px 0;
    cursor: pointer;

    h2 {
        font-size: 20px;
        line-height: 20px;
        text-align: left;
    }
    p {
        text-align: left;
        font-size: 15px;
        line-height: 20px;
        opacity: 0.5;
        margin: 0;
    }
}
.phase-right-header {
    margin: -5px 0 -10px 0;
    opacity: 0.5;
    cursor: pointer;

    h2 {
        font-size: 20px;
        line-height: 20px;
        text-align: right;
    }
    p {
        text-align: right;
        font-size: 15px;
        line-height: 20px;
        margin: 0;
    }
}

.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}
</style>
