<template>
<div>
    <img
        v-if="$vuetify.breakpoint.mdAndUp"
        src="/img/citation-new.png"
        style="width: 206px; height: 120px; position: absolute; left: 20px;"/>
    <h1>Les citations cultes</h1>

    <div v-if="citations && citations.length > 0">
        <v-container fluid  grid-list-md>
            <v-data-iterator
                :items="citations"
                :items-per-page="filter.pageSize"
                :page="filter.pageIndex"
                :search="filter.request"
                hide-default-footer>

                <template v-slot:header>
                    <v-toolbar class="mb-1">
                        <v-text-field
                            v-model="filter.request"
                            prepend-inner-icon="fa-search"
                            label="Rechercher"
                            style="margin-top: 25px;">
                        </v-text-field>

                        <template v-if="$vuetify.breakpoint.mdAndUp">
                            <v-spacer></v-spacer>
                            <v-select
                                v-model="filter.authorId"
                                :items="authorsList"
                                item-text="label"
                                item-value="id"
                                prepend-inner-icon="fa-user"
                                label="Filtrer par auteur"
                            style="margin-top: 25px;">
                            </v-select>
                            <!-- <v-select
                                v-model="sortBy"
                                flat
                                hide-details
                                :items="authors"
                                prepend-inner-icon="fa-user"
                                label="Filtrer par auteur">
                            </v-select> -->
                        </template>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="accent"
                            @click.stop="resetDialog(true)">
                            <v-icon left>fas fa-plus</v-icon>
                            <span v-if="$vuetify.breakpoint.mdAndUp">Nouvelle citation</span>
                        </v-btn>
                    </v-toolbar>
                </template>


                <template v-slot:default="props">
                    <v-card style="margin-top: 15px">
                        <v-list dense>
                        <template v-for="item in citations">
                            <v-list-item :key="item.id">
                                <v-list-item-avatar>
                                    <img :src="item.author.url"/>
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    <b class="author">{{ item.author.label}}</b>
                                    <div class="citation" v-html="item.citation"></div>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                        </v-list>
                    </v-card>
                </template>

                <template v-slot:footer>
                    <v-row class="mt-2" style="margin: 0 5px" align="center" justify="center">
                        <span class="grey--text">{{ totalCitations }} citations. Citations par page</span>
                        <v-menu offset-y>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    text
                                    color="primary"
                                    class="ml-2"
                                    v-on="on">
                                        {{ filter.pageSize }}
                                    <v-icon>fa-angle-down</v-icon>
                                </v-btn>
                            </template>
                                <v-list>
                                <v-list-item
                                    v-for="(number, index) in [10, 20, 50]"
                                    :key="index"
                                    @click="updateCitationsPerPage(number)">
                                    <v-list-item-title>{{ number }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <v-spacer></v-spacer>

                        <span class="mr-4 grey--text" >
                            Page {{ filter.pageIndex +1}} / {{ totalPages }}
                        </span>
                        <v-btn
                            fab small
                            dark
                            color="accent"
                            class="mr-1"
                            @click="formerPage">
                            <v-icon>fa-chevron-left</v-icon>
                        </v-btn>
                        <v-btn
                            fab small
                            dark
                            color="accent"
                            class="ml-1"
                            @click="nextPage"
                        >
                            <v-icon>fa-chevron-right</v-icon>
                        </v-btn>
                    </v-row>
                </template>
            </v-data-iterator>
        </v-container>
    </div>

    <div v-if="!citations || citations.length == 0"
        style="text-align:center;">
        <p style="margin: 70px auto">Aucune citation n'a encore été enregistrée... soyez le premier !</p>
        <v-btn
            color="accent"
            @click.stop="resetDialog(true)">
            <v-icon left>fas fa-plus</v-icon>
            <span v-if="$vuetify.breakpoint.mdAndUp">Nouvelle citation</span>
        </v-btn>
    </div>


    <v-dialog v-model="citationEditor.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
            Nouvelle citation
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
                <v-flex xs12>
                    <v-text-field
                        prepend-icon="fas fa-user"
                        placeholder="Autheur de la citation"
                        v-model="citationEditor.author">
                    </v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-text-field
                        prepend-icon="fas fa-quote-left"
                        placeholder="La citation"
                        v-model="citationEditor.citation">
                    </v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-card>
                        <div style="position: relative;">

                            <v-icon style="position: absolute; top: 18px; left: 22px;">fas fa-info</v-icon>
                            <p style="margin-left: 50px; padding: 10px; font-style: italic">
                                Si vous ajoutez des précisions à la citation, merci de les mettre entre double parenthèses: "La citation" ((ma précision)).
                            </p>
                        </div>
                    </v-card>

                </v-flex>
            </v-layout>
            </v-container>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="resetDialog()">Annuler</v-btn>
            <v-btn color="accent" @click="saveCitation()">Enregistrer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>



<script>
import axios from 'axios';
import { parseAxiosResponse, getPeopleAvatar } from '../middleware/CommonHelper';

export default {
    data: () => ({
        isLoading: false,
        authors: null,
        authorsList: [],
        totalCitations: 0,
        totalPages: 0,
        citations: [],
        filter: {
            request: "",
            authorId: null,
            pageIndex: 0,
            pageSize: 20,
        },
        citationEditor: {
            open: false,
            citationId: null,
            citation: null,
            author: null,
            isValid: true,
        },
    }),
    mounted () {
        if (!this.authors) {
            // Il faut initialiser la vue
            this.isLoading = true;
            axios.get(`/api/citations/init`).then(response => {
                const data = parseAxiosResponse(response);
                this.authorsList = [];
                this.authors = {};
                for (const a of data.authors) {
                    const aData = getPeopleAvatar(a);
                    this.authorsList.push(aData);
                    this.authors[aData.id] = aData;
                }
                this.citations = data.citations.map(i => ({
                    id: i.id,
                    citation: i.citation,
                    author: this.authors[i.authorId]
                }));
                this.totalCitations = data.total;

                this.isLoading = false;
                console.log(this);
            }).catch( err => {
                console.log("ERR", JSON.stringify(err));
                return this.$router.replace({path: `/login`});
            });
        }
    },
    methods: {
        resetDialog (open = false) {
            this.citationEditor.open = open;
            this.citationEditor.citationId = null;
            this.citationEditor.citation = null;
            this.citationEditor.author = null;
        },
        saveCitation: function () {
            this.citations.push({
                authorAvatar: `/img/avatars/016.png`,
                authorId: 16,
                authorName: this.citationEditor.author,
                citation: this.citationEditor.citation,
            });
            this.resetDialog();
        },
        formerPage() {
            console.log("page précédente");
        },
        nextPage() {
            console.log("page suivante");
        },
        updateCitationsPerPage(count) {
            console.log("updateCitationsPerPage");
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';

.citation ::v-deep .note  {
    color: #999!important;
}
</style>
