<template>
<div class="home" style="margin-top: 58px;">
    <h1>L'agenda de la famille</h1>
    <v-card style="margin: 14px;">
        <img src="../assets/images/citation-new.png" style="width: 206px; height: 120px; position: absolute; top:-85px; left: 20px;"/>
        <v-form v-model="citationEditor.isValid">
            <v-container>
            <v-layout>
                <v-flex sm12 md6>
                <v-text-field
                    v-model="query"
                    label="Rechercher">
                </v-text-field>
                </v-flex>


                <v-flex sm12 md3></v-flex>

                <v-flex sm12 md3 style="text-align: right;">
                    <v-menu offset-y :close-on-content-click="false" style="margin-top: 10px;">
                        <v-btn flat
                            color="primary"
                            slot="activator">
                            <v-icon left>fas fa-th-list</v-icon>Colonnes
                        </v-btn>
                        <v-list>
                            <v-list-tile
                                v-for="(column, index) in columns"
                                :key="index">
                                <v-list-tile-action>
                                    <v-checkbox v-model="column.selected" :disabled="column.disabled"></v-checkbox>
                                </v-list-tile-action>
                                <v-list-tile-title>{{ column.text }}</v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </v-flex>

                <v-flex sm12 md3 style="text-align: right;">
                    <v-btn
                        style="margin-top: 15px;"
                        color="accent"
                        @click.stop="resetDialog(true)">
                        <v-icon left>fas fa-plus</v-icon>Nouvelle entrée
                    </v-btn>
                </v-flex>

            </v-layout>
            </v-container>
        </v-form>
    </v-card>
    <v-card style="margin: 14px;">
        <v-data-table
        :headers="columns"
        :items="entries"
        :loading="true"
        class="elevation-1">
            <v-progress-linear slot="progress" color="accent" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
                <td>{{ props.item.lastname }}</td>
                <td class="text-xs-right">{{ props.item.firstname }}</td>
                <td class="text-xs-right">{{ props.item.firstname2 }}</td>
                <td class="text-xs-right">{{ props.item.age }}</td>
                <td class="text-xs-right">{{ props.item.home }}</td>
                <td class="text-xs-right">{{ props.item.job }}</td>
                <td class="text-xs-right">{{ props.item.phone }}</td>
                <td class="text-xs-right">{{ props.item.email }}</td>
                <td class="text-xs-right">{{ props.item.root }}</td>
                <td class="justify-center layout px-0">
                    <v-icon
                        small
                        class="mr-2"
                        @click="editItem(props.item)">
                        fas fa-edit
                    </v-icon>
                    <v-icon
                        small
                        @click="deleteItem(props.item)">
                        fas fa-trash
                    </v-icon>
                </td>
            </template>
        </v-data-table>
    </v-card>


    <v-dialog v-model="citationEditor.open" width="80%">
    <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
        Nouvelle entrée
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
export default  {
    data: () => ({
        citationEditor: {
            open: false,
            citationId: null,
            citation: null,
            author: null,
            isValid: true,
        },
        query: "",
        entries: [
            {
                photo: 'http://absolumentg.fr/assets/img/avatars/005.png',
                lastname: 'Gueudelot',
                firstname: 'Annie',
                firstname2: 'Audette Andrée',
                age: '72 ans ( Née le 4 / 5 / 1946 )',
                home: 'Villons',
                job: null,
                phone: '',
                email: 'annie@absg.fr',
                root: 'gueudelot',
            },
            {
                photo: 'http://absolumentg.fr/assets/img/avatars/005.png',
                lastname: 'Gueudelot',
                firstname: 'Annie',
                firstname2: 'Audette Andrée',
                age: '72 ans ( Née le 4 / 5 / 1946 )',
                home: 'Villons',
                job: null,
                phone: '',
                email: 'annie@absg.fr',
                root: 'gueudelot',
            },
            {
                photo: 'http://absolumentg.fr/assets/img/avatars/005.png',
                lastname: 'Gueudelot',
                firstname: 'Annie',
                firstname2: 'Audette Andrée',
                age: '72 ans ( Née le 4 / 5 / 1946 )',
                home: 'Villons',
                job: null,
                phone: '',
                email: 'annie@absg.fr',
                root: 'gueudelot',
            },
            {
                photo: 'http://absolumentg.fr/assets/img/avatars/005.png',
                lastname: 'Gueudelot',
                firstname: 'Annie',
                firstname2: 'Audette Andrée',
                age: '72 ans ( Née le 4 / 5 / 1946 )',
                home: 'Villons',
                job: null,
                phone: '',
                email: 'annie@absg.fr',
                root: 'gueudelot',
            },
            {
                photo: 'http://absolumentg.fr/assets/img/avatars/005.png',
                lastname: 'Gueudelot',
                firstname: 'Annie',
                firstname2: 'Audette Andrée',
                age: '72 ans ( Née le 4 / 5 / 1946 )',
                home: 'Villons',
                job: null,
                phone: '',
                email: 'annie@absg.fr',
                root: 'gueudelot',
            },
            {
                photo: 'http://absolumentg.fr/assets/img/avatars/005.png',
                lastname: 'Gueudelot',
                firstname: 'Annie',
                firstname2: 'Audette Andrée',
                age: '72 ans ( Née le 4 / 5 / 1946 )',
                home: 'Villons',
                job: null,
                phone: '',
                email: 'annie@absg.fr',
                root: 'gueudelot',
            },],
        columns: [
            {
                text: 'Nom', value: 'lastname', align: 'left', selected: true, disabled: true,
            },
            {
                text: 'Prénom', value: 'firstname', align: 'left', selected: true, disabled: true,
            },
            {
                text: 'Prénoms secondaires', align: 'left', value: 'firsname2', selected: true, disabled: false,
            },
            {
                text: 'Age', value: 'age', align: 'left', selected: true, disabled: false,
            },
            {
                text: 'Adresse', value: 'home', align: 'left', selected: true, disabled: false,
            },
            {
                text: 'Emploi', value: 'job', align: 'left', selected: false, disabled: false,
            },
            {
                text: 'Phone', value: 'phone', align: 'left', selected: true, disabled: false,
            },
            {
                text: 'Email', value: 'email', align: 'left', selected: true, disabled: false,
            },
            {
                text: 'Maison mère', value: 'root', selected: false, enabled: false, align: 'left',
            },
            { text: 'Actions', value: 'name', sortable: false }
        ]
    }),
    methods: {
        resetDialog (open = false) {
            this.citationEditor.open = open;
            this.citationEditor.citationId = null;
            this.citationEditor.citation = null;
            this.citationEditor.author = null;
        },
        saveCitation: function () {
            this.citations.push({
                authorAvatar: 'http://absolumentg.fr/assets/img/avatars/016.png',
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
    margin: 20px 0 60px 0;
}
</style>
