<template>
    <section id="content">
        <div v-bind:class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
            <v-row style="padding: 15px">

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <div class="phase-left-header" v-on="on" @click="help.displayed = true; help.page = 2">
                            <h2>Phase n°2 en cours</h2>
                            <p>Validation des photos</p>
                        </div>
                    </template>
                    <span>Besoin d'aide sur la phase actuelle du concours ?</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon small
                            v-on="on"
                            :disabled="isLoading"
                            @click="gotoNextCat(-1)"
                            style="margin-top: 3px;">
                            <v-icon>fas fa-chevron-left</v-icon>
                        </v-btn>
                    </template>
                    <span>Catégorie précédente</span>
                </v-tooltip>

                <v-menu offset-y v-if="agpaMeta && category">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn dark v-bind="attrs" v-on="on" text class="grey--text">
                            {{ agpaMeta.categories[category.categoryId].title }}
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item
                            v-for="catIdx in agpaMeta.categoriesOrders"
                            :key="catIdx"
                            @click="gotoCat(agpaMeta.categories[catIdx].categoryId)"
                        >
                            <v-list-item-title>{{ agpaMeta.categories[catIdx].title }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon small
                            v-on="on"
                            :disabled="isLoading"
                            @click="gotoNextCat(1)"
                            style="margin-top: 3px;">
                            <v-icon>fas fa-chevron-right</v-icon>
                        </v-btn>
                    </template>
                    <span>Catégorie suivante</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }" v-on="on">
                        <div class="phase-right-header" @click="help.displayed = true; help.page = 3">
                            <h2>Prochaine phase: Votes</h2>
                            <p>A partir du {{ end }}</p>
                        </div>
                    </template>
                    <span>Besoin d'aide sur le déroulement du concours ?</span>
                </v-tooltip>
            </v-row>
            <v-progress-linear
                color="accent"
                indeterminate
                v-if="isLoading"
                style="position: absolute; bottom: -5px; left: 0; right: 0; height: 5px">
            </v-progress-linear>
        </div>
        <v-container fluid>
            <v-layout row wrap>
                <v-flex v-for="(photo, index) in photosGalery" :key="photo.id" style="min-width: 250px; width: 15%; margin: 15px">
                    <div>
                        <div style="width: 250px; height: 250px; margin: auto;">
                            <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                                <img class="thumb" :src="photo.thumb" @click="photosGalleryDisplay(index)"/>
                            </div>
                        </div>
                        <div style="">

                        </div>
                        <v-card class="card" style="margin-bottom: 50px" >
                            <div class="thumb-title" style="text-align: center">
                                {{ photo.title }}
                            </div>
                            <div style="position: absolute; bottom: -17px; left: 0; right: 0; height: 30px;">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn
                                            icon small
                                            v-on="on"
                                            :disabled="isLoading"
                                            @click="displayPhotoDiscussion(photo)"
                                            style="opacity: 1; background: #fff">
                                            <v-icon
                                                v-if="photo.error && photo.error.status !== 'accepted'"
                                                v-bind:style="{ color: photo.error.status === 'refused' ? '#d32f2f' : '#ff8f00' }">fas fa-exclamation-circle</v-icon>
                                            <v-icon v-else>fas fa-question-circle</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Discussion sur la photo</span>
                                </v-tooltip>
                            </div>
                        </v-card>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>

        <!-- Aide -->
        <v-dialog v-model="help.displayed" width="800px">
            <v-card>
                <v-card-title class="grey lighten-4">
                    Aide sur le déroulement du concours
                </v-card-title>
                <Help :selectedTab="help.page"></Help>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="help.displayed = false">Fermer</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Photo discussion -->
        <v-dialog v-model="photoDiscussion.displayed" width="800px">
            <v-card v-if="photoDiscussion.photo">
                <v-card-title class="grey lighten-4">
                    Commentaires sur la photo
                    <v-spacer></v-spacer>
                    <template v-if="!isAdmin">
                        <span v-if="photoDiscussion.status === 'accepted'" style="color: #2e7d32">Statut: Acceptée</span>
                        <span v-if="photoDiscussion.status === 'checking'" style="color: #ff8f00">Statut: En cours de vérification</span>
                        <span v-if="photoDiscussion.status === 'refused'" style="color: #d32f2f">Statut: Refusée</span>
                    </template>
                    <template v-else>
                        <span v-if="photoDiscussion.status === 'accepted'" style="color: #2e7d32">Statut: </span>
                        <span v-if="photoDiscussion.status === 'checking'" style="color: #ff8f00">Statut: </span>
                        <span v-if="photoDiscussion.status === 'refused'" style="color: #d32f2f">Statut: </span>
                        <v-select
                            :items="status"
                            :value="photoDiscussion.status"
                            item-text="text"
                            item-value="value"
                            @change="updatePhotoStatus($event)"
                            solo
                            style="height: 50px; margin-left: 10px; width: 150px;"
                        ></v-select>
                    </template>
                </v-card-title>
                <p style="opacity: 0.5; padding: 0 24px">
                    Utilisez ce formulaire pour signaler un photo ne respectant pas le réglement de sa catégorie, ou bien pour
                    poser des questions à l'organisation si vous avez des doutes.
                </p>
                <div style="display: flex; margin: 0 24px">
                    <div style="flex: 1 1 auto">
                        <div style="text-align: center; margin-top: 10px">
                            <img :src="photoDiscussion.photo.thumb" style="margin:auto" class="thumb" />
                            <p style="margin: 10px;"> {{ photoDiscussion.photo.title }}</p>
                        </div>
                    </div>

                    <div style="flex: 1 1 auto;">

                        <p>Discussion:</p>
                        <p v-if="photoDiscussion.discussion" v-html="photoDiscussion.discussion"></p>
                        <v-text-field
                            label="Votre commentaire"
                            v-model="photoDiscussion.comment"
                            @keydown.enter="addCommentaryPhoto()">
                        </v-text-field>
                    </div>
                </div>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="photoDiscussion.displayed = false">Fermer</v-btn>
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
import ImageEditor from '../../components/ImageEditor.vue';
import store from '../../store';
import Help from './components/Help';

export default {
    components: {
        Help
    },
    store,
    data: () => ({
        isLoading: true,
        isAdmin: false,
        status: [
            { value: 'accepted', text: 'Acceptée' },
            { value: 'checking', text: 'En cours de vérification' },
            { value: 'refused', text: 'Refusée' }],
        current: null,
        year: 0,
        categories: [],
        category: null,
        photosGalery: [],
        start: format(new Date(2020, 11, 19), "dd MMM 'à' HH'h'mm", {locale: fr}),
        end: format(new Date(2020, 11, 20), "dd MMM 'à' HH'h'mm", {locale: fr}),
        help: {
            displayed: false,
            page: 0
        },
        photoDiscussion: {
            displayed: false,
            photo: null,
            status: "accepted",
            discussion: "",
            comment: "",
        }
    }),
    computed: { ...mapState([
        'agpaMeta',
        'user'
    ])},
    watch: {
        $route(to, from) {
            this.initView();
        },
        'agpaMeta': function () {
            this.initView();
        }
    },
    mounted () {
        if (this.agpaMeta) {
            this.initView();
            this.isAdmin = this.user.roles.find(e => e === "admin") !== null;
        }
    },
    methods: {
        initView() {
            // Reset photos list
            this.isLoading = true;
            this.photosGalery = [];
            this.photosGalleryIndex = 0;
            this.catId = Number.parseInt(this.$route.query.catId);
            if (!this.catId) {
                this.catId = this.agpaMeta.categoriesOrders[0];
            }
            if (this.categories.length === 0) {
                this.categories = [-1, ...this.agpaMeta.categoriesOrders];
            }

            axios.get(`/api/agpa/p2`).then(response => {
                this.current = parseAxiosResponse(response);
                if (this.current) {
                    this.category = this.current.categories.find(c => c.categoryId === this.catId);
                    console.log("cat", this.category)
                    for (let photo of this.category.photos) {
                        this.photosGalery.push(photo);
                    }
                    store.commit('photosGalleryReset', this.photosGalery);
                }
                this.isLoading = false;
            }).catch( err => {
                store.commit("onError", err);
            });
        },
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },
        photosGalleryHide() {
            store.commit('photosGalleryHide');
        },
        gotoNextCat(step) {
            let catIdx = this.agpaMeta.categoriesOrders.indexOf(this.category.categoryId);
            catIdx += step + this.agpaMeta.categoriesOrders.length;
            catIdx %= this.agpaMeta.categoriesOrders.length;
            this.gotoCat(this.agpaMeta.categoriesOrders[catIdx]);
        },
        gotoCat(catId) {
            this.$router.replace({path: `/agpa/edition?catId=${catId}`});
        },
        displayPhotoDiscussion(photo) {
            this.photoDiscussion.displayed = true;
            this.photoDiscussion.comment = "";
            if (!photo.error) {
                this.photoDiscussion.status = "accepted";
                this.photoDiscussion.discussion = "";
            } else {
                this.photoDiscussion.status = photo.error.status;
                this.photoDiscussion.discussion = photo.error.messages.map(e => e.msg).join("<br/>");
            }
            this.photoDiscussion.photo = photo;
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
            const formData = new FormData();
            formData.append("error", JSON.stringify(error));
            formData.append("id", photoId);

            // On envoie tout au serveur pour qu'il enregistre la nouvelle image du moment
            axios.post(`/api/agpa/photo`, formData, {
                headers: { "Content-Type" : "multipart/form-data" }
            })
            .then(response => {
                const updatedPhoto = parseAxiosResponse(response);
                const idx = this.photosGalery.findIndex(p => p.id === updatedPhoto.id);
                if (idx) {
                    this.photosGalery[idx].error = updatedPhoto.error;
                }
                this.photoDiscussion.displayed = false;
            })
            .catch(err => {
                store.commit("onError", err);
            });
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
