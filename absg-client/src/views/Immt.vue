<template>
<div class="home" style="margin-top: 50px;">
    <h1>Les images du moment</h1>
    <v-card style="margin: 14px;">
        <img src="../assets/images/immt-new.png" style="width: 206px; height: 120px; position: absolute; top:-85px; left: 20px;"/>
        <v-form v-model="immtEditor.isValid">
            <v-container>
            <v-layout>
                <v-flex sm12 md3>
                <v-text-field
                    v-model="query"
                    label="Rechercher">
                </v-text-field>
                </v-flex>

                <v-flex sm12 md3>
                <v-select
                    :items="posters"
                    label="Sélectionner un posteur">
                </v-select>
                </v-flex>

                <v-flex sm12 md3></v-flex>
                
                <v-flex sm12 md3 style="text-align: right;">
                    <v-btn 
                        color="accent"
                        style="height: 80%"
                        @click.stop="resetDialog(true)">
                        <v-icon left>fas fa-plus</v-icon>Nouvelle image
                    </v-btn>
                </v-flex>
            </v-layout>
            </v-container>
        </v-form>
    </v-card>
    <v-card style="margin: 14px;">
        <v-subheader>2019</v-subheader>
        <v-container fluid grid-list-sm>
        <v-layout row wrap>
            <v-flex v-for="i in 15" :key="i" xs2>
            <img :src="`https://randomuser.me/api/portraits/men/${i + 20}.jpg`" class="image" alt="lorem" width="100%" height="100%">
            </v-flex>
        </v-layout>
        </v-container>
        <v-subheader>2018</v-subheader>
        <v-container fluid grid-list-sm>
        <v-layout row wrap>
            <v-flex v-for="i in 27" :key="i" xs2>
            <img :src="`https://randomuser.me/api/portraits/women/${i + 5}.jpg`" class="image" alt="lorem" width="100%" height="100%">
            </v-flex>
        </v-layout>
        </v-container>
        <v-footer class="mt-5"></v-footer>
    </v-card>

    <v-dialog v-model="immtEditor.open" width="800px">
    <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
        Nouvelle image du moment
        </v-card-title>
        <v-container grid-list-sm class="pa-4">
            <ImageInput/>
        </v-container>
        <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat color="primary" @click="resetDialog()">Annuler</v-btn>
        <v-btn color="accent" @click="saveImmt()">Enregistrer</v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
</div>
</template>



<script>

export default  {
    data: () => ({
        immtEditor: {
            open: false,
            image: null,
            title: null,
            isValid: true,
        },
        query: "",
        posters: ['Olivier', 'Jocelyne', 'Denis', 'Alain', 'Annie']
    }),
    methods: {
        resetDialog(open = false) {
            this.immtEditor.open = open;
            this.immtEditor.image = null;
            this.immtEditor.title = null;
        },
        saveImmt: function() {
            // TODO
            this.resetDialog();
        }
    }
}
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
