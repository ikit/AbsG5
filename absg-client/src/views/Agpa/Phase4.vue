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

                <!-- Vérification des votes -->
                <v-tab-item>
                    <h2>Vérification des votes</h2>

                    <v-simple-table style="text-align: left; font-size: 0.8em; margin: 10px">
                        <template v-slot:default>
                            <thead>
                                <tr style="vertical-align: baseline;">
                                    <th>Juré</th>
                                    <th v-for="catId of votesCategories" v-bind:key="catId">{{ data.categories[catId].title }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="vUser of votes" v-bind:key="vUser.id">
                                    <template >
                                        <td>{{ vUser.username }} <span style="opacity: 0.5">- {{ vUser.age }} ans</span></td>
                                        <td v-for="(cat, idx) of vUser.votes" v-bind:key="idx">
                                            <a v-if="cat" @click="displayVotesDetails(cat)" style="display: block">
                                                <i v-if="cat.valid" class="fas fa-check" style="color: #2e7d32"></i>
                                                <i v-else class="fas fa-exclamation-triangle" style="color: #ff8f00"></i>
                                                &nbsp; {{ cat.votes.length }}
                                            </a>
                                        </td>
                                    </template>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-tab-item>

                <!-- Notes des photos -->
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
                        :custom-filter="notesSearchMethod"
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
                            {{ item.votes }} <span style="opacity: 0.5">({{ item.score }} pts)</span><br/>
                            <span style="color: red;">{{ item.formerStats.votes }} <span style="opacity: 0.5">({{ item.formerStats.score }} pts)</span></span>
                        </template>

                        <template v-slot:item.title="{ item }">
                            {{ item.votesTitle }}<br/>
                            <span style="color: red;">{{ item.formerStats.votesTitle }}</span>
                        </template>

                        <template v-slot:item.score="{ item }">
                            {{ item.gscore }}<br/>
                            <span style="color: red;">{{ item.formerStats.gscore }}</span>
                        </template>

                        <template v-slot:item.awards="{ item }">

                            <template v-if="item.awards">
                                <span v-for="a of item.awards" v-bind:key="a.categoryId">
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <i v-if="a.award === 5" v-on="on" class="fas fa-circle" style="color: #c3f1ff"></i>
                                            <i v-if="a.award === 4" v-on="on" class="fas fa-circle" style="color: #c68b00"></i>
                                            <i v-if="a.award === 3" v-on="on" class="fas fa-circle" style="color: #9b9b9b"></i>
                                            <i v-if="a.award === 2" v-on="on" class="fas fa-circle" style="color: #964c31"></i>
                                            <i v-if="a.award === 1" v-on="on" class="far fa-circle"></i>
                                            <i v-if="a.award === 0" v-on="on" class="far fa-smile"></i>
                                        </template>
                                        {{ data.categories[a.categoryId].title }}
                                 </v-tooltip>
                                </span>
                            </template>
                        </template>
                    </v-data-table>
                </v-tab-item>

                <!-- Palmarès -->
                <v-tab-item>
                    <h2>Etablissement du palmarès</h2>
                    <v-data-table
                        :headers="palmaresHeaders"
                        :items="palmares"
                        :search="palmaresFilter.quickFilter"
                        :loading="isLoading"
                        :custom-filter="palmaresSearchMethod"
                        loading-text="Récupération des données..."
                        no-data-text="Aucun palmarès disponible."
                        no-results-text="Aucune personne trouvée."
                    >
                        <template v-slot:item.photographe="{ item }">
                            <img :src="item.url" style="height: 40px; margin-right: 15px; vertical-align: middle"/>
                            <span style="font-size: 1.2em">{{ item.username }}</span>
                        </template>

                        <template v-slot:item.awards="{ item }">
                            <template v-if="item.rewards.diamond">
                                <i class="fas fa-circle" style="color: #c3f1ff"></i> {{ item.rewards.diamond }}
                            </template>
                            <template v-if="item.rewards.gold">
                                <i class="fas fa-circle" style="color: #c68b00"></i> {{ item.rewards.gold }}
                            </template>
                            <template v-if="item.rewards.sylver">
                                <i class="fas fa-circle" style="color: #9b9b9b"></i> {{ item.rewards.sylver }}
                            </template>
                            <template v-if="item.rewards.bronze">
                                <i class="fas fa-circle" style="color: #964c31"></i> {{ item.rewards.bronze }}
                            </template>
                            <template v-if="item.rewards.nominated">
                                <i class="far fa-circle"></i> {{ item.rewards.nominated }}
                            </template>
                            <template v-if="item.rewards.honor">
                                <i class="far fa-smile"></i> {{ item.rewards.honor }}
                            </template>
                        </template>

                        <template v-slot:item.scoreOf8="{ item }">
                            <span style="font-weight: bold">{{ item.scoreOf8 }} </span> <template v-if="item.scoreOf8 > 1">pts</template><template v-else>pt</template>
                        </template>

                        <template v-slot:item.average="{ item }">
                            <span>{{ item.average }} </span> <template v-if="item.average > 1">pts</template><template v-else>pt</template>
                        </template>

                        <template v-slot:item.lower="{ item }">
                            <span>{{ item.lower }} </span> <template v-if="item.lower > 1">pts</template><template v-else>pt</template>
                        </template>

                        <template v-slot:item.score="{ item }">
                            <span style="font-weight: bold">{{ item.palmares }} </span> <template v-if="item.palmares > 1">pts</template><template v-else>pt</template>
                        </template>

                        <template v-slot:item.formerPalmares="{ item }">
                            <span>{{ item.formerPalmares }} </span> <template v-if="item.formerPalmares > 1">pts</template><template v-else>pt</template>
                        </template>

                        <template v-slot:item.newPalmares="{ item }">
                            <span>{{ item.formerPalmares + item.palmares }} </span> <template v-if="item.formerPalmares + item.palmares > 1">pts</template><template v-else>pt</template>
                        </template>

                    </v-data-table>
                </v-tab-item>
            </v-tabs>
        </v-card>


        <!-- Détails votes -->
        <v-dialog v-model="voteDetails.displayed" width="800px">
            <v-card v-if="voteDetails.vote">
                <v-card-title class="grey lighten-4">
                    Votes {{ voteDetails.vote.username }}, catégorie {{ voteDetails.vote.categoryTitle }}
                </v-card-title>
                <p style="opacity: 0.5; padding: 0 24px">
                    Le tableau de gauche montre tout les votes du juré pour la catégorie concerné.
                    Les informations à droite permettent de controler la validité de ces votes pour le calcule des notes ensuite.
                </p>
                <div style="display: flex; margin: 0 24px">
                    <div style="flex: 1 1 auto">
                        <v-simple-table dense style="text-align: left; font-size: 0.8em; margin: 10px">
                            <template v-slot:default>
                                <thead>
                                    <tr style="vertical-align: baseline;">
                                        <th>Photo</th>
                                        <th>Vote</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="vote of voteDetails.vote.votes" v-bind:key="vote.id">
                                        <td>{{ vote.photoId }} - {{ vote.title }}<br/>
                                            <span style="opacity: 0.5">uId: {{ vote.pUserId }} | catId: {{ vote.pCategoryId }} | year: {{ vote.pYear }}</span>
                                        </td>
                                        <td>
                                            <i v-if="voteDetails.vote.categoryId === -3" class="fas fa-feather-alt"></i>
                                            <i v-else class="fas fa-star">{{ vote.score }}</i>
                                            </td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </div>

                    <div style="flex: 1 1 auto;">
                        <b>Catégorie:</b><ul>
                            <li>Titre: {{ voteDetails.vote.categoryTitle }} </li>
                            <li>Id: {{ voteDetails.vote.categoryId }} </li>
                            <li>Max votes: {{ voteDetails.vote.maxVote }} </li>
                        </ul>

                        <b>Juré:</b><ul>
                            <li>Nom: {{voteDetails.vote.username}} </li>
                            <li>Id: {{ voteDetails.vote.userId }} </li>
                            <li>Age: {{ voteDetails.vote.age }} </li>
                        </ul>

                        <b>Erreurs détectées:</b><ul>
                            <li>authorError: {{voteDetails.vote.errors.authorError }} </li>
                            <li>categoryError: {{voteDetails.vote.errors.categoryError }} </li>
                            <li>childError: {{voteDetails.vote.errors.childError }} </li>
                            <li>scoreError: {{voteDetails.vote.errors.scoreError }} </li>
                            <li>votesNumberError: {{voteDetails.vote.errors.votesNumberError }} </li>
                            <li>yearError: {{voteDetails.vote.errors.yearError }} </li>
                        </ul>
                    </div>
                </div>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="voteDetails.displayed = false">Fermer</v-btn>
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

        votes: [],
        votesCategories: [],
        voteDetails: {
            displayed: false,
            vote: null
        },

        notesHeaders: [
            { text: 'Catégorie', value: 'category' },
            { text: 'Auteur', value: 'author' },
            { text: 'Photo', value: 'photo' },
            { text: 'Votes', value: 'votes' },
            { text: 'Titre', value: 'title' },
            { text: 'Score Global', value: 'score' },
            { text: 'AGPA', value: 'awards' }
        ],
        notesFilter: {
            quickfilter: null, // un filtre par recherche de mot clés multichamps: cf construction du champs quickfilter dans mounted()
            categoryId: null, // si on filtre une catégorie en particulier
        },
        notesCategories: [{ label: "Toutes", id: null }],
        notes: [],
        notesAll: [],

        palmaresHeaders: [
            { text: 'Photographe', value: 'photographe' },
            { text: 'Récompenses', value: 'awards' },
            { text: '8 meilleurs photos', value: 'scoreOf8' },
            { text: 'Moyenne des photos', value: 'average' },
            { text: 'Moins bonne photo', value: 'lower' },
            { text: 'Score', value: 'score' },
            { text: 'Palmarès précédant', value: 'formerPalmares' },
            { text: 'Nouveau Palmarès', value: 'newPalmares' },
        ],
        palmaresFilter: {
            quickfilter: null, // un filtre par recherche de mot clés multichamps: cf construction du champs quickfilter dans mounted()
            categoryId: null, // si on filtre une catégorie en particulier
        },
        palmares: [],

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

            axios.get(`/api/agpa/p4`).then(response => {
                this.data = parseAxiosResponse(response);
                console.log(this.data);
                const categories = Object.values(this.data.categories);

                // On reformate les votes pour les présenter sous forme de tableau "users x catégories"
                const votes = {};
                this.votesCategories = [...this.data.categoriesOrders, -3];
                for (const catIdx in this.data.categories) {
                    const cat = this.data.categories[catIdx];
                    if (cat.id !== -3 && cat.id < 0) continue;

                    for (const userIdx in cat.votes) {
                        const user = cat.votes[userIdx];
                        if (!votes[user.userId]) {
                            votes[user.userId] = {
                                id: user.userId,
                                username: user.username,
                                age: user.age,
                                votes: Array(this.votesCategories.length).fill(null, 0, this.votesCategories.length)
                            };
                        }
                        user.categoryId = cat.id;
                        user.categoryTitle = cat.title;
                        user.maxVote = cat.maxVotePhoto;
                        votes[user.userId].votes[this.votesCategories.findIndex(id => id === cat.id)] = user;
                    }
                }
                this.votes = votes;

                // On reformate les notes
                this.notesCategories = this.notesCategories.concat(categories.filter(c => c.id === -3 || c.id > 0).map(e => ({ label: e.title, id: e.id })));
                this.notesAll = this.data.photosOrder.map(id => this.data.photos[id]);
                this.updateNotesList();

                // On reformate le palmares par catégories
                this.palmares = Object.values(this.data.users).map( u => ({
                    ...u,
                    ...getPeopleAvatar(u),
                    average: Math.round(u.average),
                    rewards: this.reformatAward(u.awards)
                })).sort((a, b) => this.data.usersOrder.findIndex(e => e === a.id) - this.data.usersOrder.findIndex(e => e === b.id));
                this.isLoading = false;
            }).catch( err => {
                store.commit("onError", err);
            });
        },

        reformatAward(awards) {
            const rewards = {
                diamond: 0,
                gold: 0,
                sylver: 0,
                bronze: 0,
                nominated: 0,
                honor: 0
            };
            if (Array.isArray(awards)) {
                awards.forEach(a => {
                    switch(a.award) {
                        case "diamond":
                            rewards.diamond += 1;
                            break;
                        case "gold":
                            rewards.gold += 1;
                            break;
                        case "sylver":
                            rewards.sylver += 1;
                            break;
                        case "bronze":
                            rewards.bronze += 1;
                            break;
                        case "nominated":
                            rewards.nominated += 1;
                            break;
                        case "honor":
                            rewards.honor += 1;
                            break;
                    }
                });
            }
            return rewards;
        },


        displayVotesDetails(data) {
            this.voteDetails.vote = data;
            this.voteDetails.displayed = true;
            console.log(data);
        },

        updateNotesList(catId) {
            if (catId) {
                this.notes = this.notesAll.filter(e => e.categoryId === catId);
            } else {
                this.notes = this.notesAll;
            }
        },

        closeEdition() {
            this.isLoading = true;

            axios.get(`/api/agpa/p4/close`).then(response => {
                this.closed = parseAxiosResponse(response);
                console.log(data);
                this.isLoading = false;
            }).catch( err => {
                store.commit("onError", err);
            });
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
