<template>
    <section id="content">
        <div v-bind:class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
            <v-row style="padding: 15px">

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <div class="phase-left-header" v-on="on" @click="help.displayed = true; help.page = 3">
                            <h2>Phase n°4 en cours : Délibération</h2>
                            <p>Phase n°5 Cérémonie - le {{ end }}</p>
                        </div>
                    </template>
                    <span>Besoin d'aide sur la phase actuelle du concours ?</span>
                </v-tooltip>
            </v-row>
            <v-progress-linear
                color="accent"
                indeterminate
                v-if="isLoading"
                style="position: absolute; bottom: -5px; left: 0; right: 0; height: 5px">
            </v-progress-linear>
        </div>

        <v-card style="margin: 24px">
            <v-tabs>
                <v-tab><v-icon>fas fa-vote-yea</v-icon> &nbsp; Votes</v-tab>
                <v-tab><v-icon>fas fa-calculator</v-icon> &nbsp; Notes</v-tab>
                <v-tab><v-icon>fas fa-trophy</v-icon> &nbsp; Palmarès</v-tab>
                <v-tab><v-icon>fas fa-gem</v-icon> &nbsp; Diamant</v-tab>
                <v-tab><v-icon>fas fa-gavel</v-icon> &nbsp; Clôture</v-tab>

                <!-- Vérification des votes -->
                <v-tab-item>
                    <h2>Vérification des votes</h2>

                    <v-simple-table style="text-align: left; font-size: 0.8em; margin: 10px">
                        <template v-slot:default>
                            <thead>
                                <tr style="vertical-align: baseline;">
                                    <template v-for="cat of data.categories">
                                        <th v-if="cat.id > 0 || cat.id === -3" v-bind:key="cat.id">{{ cat.title }}</th>
                                    </template>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="vertical-align: baseline;">
                                    <template v-for="cat of data.categories">
                                        <td v-if="cat.id > 0 || cat.id === -3" v-bind:key="cat.id">
                                            <a  v-for="vote of cat.votes" v-bind:key="vote.user"
                                                @click="displayVotesDetails(vote)"
                                                style="display: block">
                                                <i v-if="vote.valid" class="fas fa-check" style="color: #2e7d32"></i>
                                                <i v-else class="fas fa-exclamation-triangle" style="color: #ff8f00"></i> &nbsp; {{ vote.user }}
                                            </a>
                                        </td>
                                    </template>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-tab-item>

                <!-- Calcul des notes -->
                <v-tab-item>
                    <div class="row" style="margin: 0 10px 0 0;">
                        <h2>Calcul des notes</h2>
                        <v-spacer></v-spacer>
                        <v-text-field
                            v-model="notesFilter.quickFilter"
                            prepend-icon="fas fa-search"
                            label="Rechercher"
                            single-line
                            hide-details
                            style="width: 200px"
                        ></v-text-field>
                        &nbsp;
                        <v-select
                            :items="notesCategories"
                            label="Catégorie"
                            item-text="label"
                            item-value="id"
                            @change="updateNotesList($event)"
                            style="width: 200px"
                        ></v-select>
                    </div>

                    <v-data-table
                        :headers="notesHeaders"
                        :items="notes"
                        :search="notesFilter.quickFilter"
                        :loading="isLoading"
                        loading-text="Récupération des données..."
                    >
                        <template v-slot:item.category="{ item }">
                            {{ data.categories[item.categoryId].title }}
                        </template>

                        <template v-slot:item.author="{ item }">
                            {{ item.username }}
                        </template>

                        <template v-slot:item.photo="{ item }">
                            {{ item.title }} <bre/>({{ item.id }})
                        </template>

                        <template v-slot:item.votes="{ item }">
                            {{ item.votes }} <span style="opacity: 0.5">({{ item.score }} pts)</span>
                        </template>

                        <template v-slot:item.title="{ item }">
                            {{ item.votesTitle }}
                        </template>

                        <template v-slot:item.score="{ item }">
                            {{ item.gScore }}
                        </template>
                    </v-data-table>
                </v-tab-item>

                <!-- Calcul du palmarès -->
                <v-tab-item>
                    <h2>Etablissement du palmarès</h2>
                </v-tab-item>

                <!-- Attribution des AGPA de diamant -->
                <v-tab-item>
                    <h2>Attribution des AGPA de diamant</h2>
                </v-tab-item>

                <!-- Clôture de l'édition des AGPA -->
                <v-tab-item>
                    <h2>Clôture de l'édition</h2>
                </v-tab-item>
            </v-tabs>






        </v-card>




        <div v-if="category && category.categoryId === 0">
            <h2>Résumé de vos votes par catégorie</h2>
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
                <template v-slot:item.votes="{ item }">
                    <span v-if="item.categoryId > 0" v-bind:style="{ color: item.votes >= item.maxVotes / 2.0  && item.votes <= item.maxVotes ? 'green' : 'red'}">
                        {{ item.votes }} / {{ item.maxVotes }}
                    </span>
                    <b v-else>{{ item.votes }} / {{ item.maxVotes }}</b>
                </template>

                <template v-slot:item.tvotes="{ item }">
                    <span v-if="item.categoryId > 0">
                        {{ item.tvotes }}
                    </span>
                    <b v-else v-bind:style="{ color: item.tvotes >= 5  && item.tvotes <= 10 ? 'green' : 'red'}">{{ item.tvotes }} / 10</b>
                </template>
            </v-data-table>
            <h2>Les photos que vous avez sélectionnées pour le meilleur titre</h2>
        </div>
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
        step: 0,
        notesHeaders: [
            { text: 'Catégorie', value: 'category' },
            { text: 'Auteur', value: 'author' },
            { text: 'Photo', value: 'photo' },
            { text: 'Votes', value: 'votes' },
            { text: 'Titre', value: 'title' },
            { text: 'Score Global', value: 'score' }
        ],
        notesFilter: {
            quickfilter: null, // un filtre par recherche de mot clés multichamps: cf construction du champs quickfilter dans mounted()
            categoryId: null, // si on filtre une catégorie en particulier
            pageIndex: 0, // page courante affiché (0 = page 1)
            pageSize: 20, // nombre de usersList affichées par page
        },
        notesCategories: [{ label: "Toutes", id: null }],
        notes: [],
        notesAll: [],
        data: null,
    }),
    computed: { ...mapState([
        'agpaMeta',
        'user'
    ])},
    watch: {
        $route(to, from) {
            this.refresh();
        },
        'agpaMeta': function () {
            this.refresh();
        }
    },
    mounted () {
        this.isAdmin = this.user.roles.find(e => e === "admin") !== null;
        if (this.agpaMeta) {
            this.refresh();
        }
    },
    methods: {
        refresh() {
            this.isLoading = true;
            // Get step
            this.step = Number.parseInt(this.$route.query.step);
            if (!this.step) {
                this.step = 1;
            }

            axios.get(`/api/agpa/p4/${this.step}`).then(response => {
                this.data = parseAxiosResponse(response);
                const categories = Object.values(this.data.categories);
                this.notesCategories = this.notesCategories.concat(categories.filter(c => c.id === -3 || c.id > 0).map(e => ({ label: e.title, id: e.id })));
                this.notesAll = this.data.photos;
                this.updateNotesList();
                console.log(this.data);
                this.isLoading = false;
            });
        },

        displayVotesDetails(data) {
            console.log(data)
        },

        updateNotesList(catId) {
            if (catId) {
                this.notes = this.notesAll.filter(e => e.categoryId === catId);
            } else {
                this.notes = this.notesAll;
            }
            console.log("updateNotesList ", catId,this.notes);

        }
    }
};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
@import '../../themes/agpa.scss';

#content {
    text-align: center;
}

h2, .h2 {
    text-align: left;
    margin: 10px;
    font-weight: normal;
    opacity: 0.5;
}
.h2 {
    display: inline-block;
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
