<template>
<div>
    <img src="../assets/images/citation-new.png" style="width: 206px; height: 120px; position: absolute; top:-20px; left: 20px;"/>
    <h1>Les citations cultes</h1>
    <v-card style="margin: 14px;">
        <v-form v-model="citationEditor.isValid">
            <v-container>
            <v-layout>
                <v-flex>
                <v-text-field
                    v-model="filter.request"
                    label="Rechercher">
                </v-text-field>
                </v-flex>

                <v-flex>
                <v-select
                    v-model="filter.authorId"
                    :items="authorsList"
                    item-text="label"
                    item-value="id"
                    label="Sélectionner un auteur">
                </v-select>
                </v-flex>

                <v-flex></v-flex>

                <v-flex style="text-align: right;">
                    <v-btn
                        color="accent"
                        style="height: 80%"
                        @click.stop="resetDialog(true)">
                        <v-icon left>fas fa-plus</v-icon>Nouvelle citation
                    </v-btn>
                </v-flex>

            </v-layout>
            </v-container>
        </v-form>
    </v-card>

    <v-card style="margin: 14px;">
    <v-list>
        <template v-for="(item, index) in citations">
            <v-list-tile :key="index" avatar>
                <v-list-tile-avatar>
                    <img :src="item.author.url"/>
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <!-- <b>{{ item.author.label}}</b> -->
                    <span v-html="item.citation"></span>
                </v-list-tile-content>
            </v-list-tile>
        </template>
        </v-list>
    </v-card>


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
                            N'oubliez pas de mettre les guillemets doubles autour de la citation.
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
        total: 0,
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
                this.total = data.total;

                this.isLoading = false;
                console.log(this);
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
                authorAvatar: `./img/avatars/016.png`,
                authorId: 16,
                authorName: this.citationEditor.author,
                citation: this.citationEditor.citation,
            });
            this.resetDialog();
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../assets/global.scss';

h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 40px;
    font-family: "Comfortaa", sans-serif;
    margin: 30px 0 60px 0;
}
</style>
