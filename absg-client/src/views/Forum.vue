<template>
<div class="home" style="margin-top: 58px;">
    <h1>Forum {{ $route.params.id }} Blabla ! </h1>
    <v-container fluid grid-list-xl>
        <v-layout row wrap>
            <v-flex xs12>
                <v-card>
                    Discussions > Blabla

                    <v-btn
                        color="accent"
                        @click.stop="newDiscussion()">
                        <v-icon left>fas fa-plus</v-icon>Nouvelle discussion
                    </v-btn>
                </v-card>
            </v-flex>
            <v-flex xs12>
                <v-card>
                    <v-data-table
                    :headers="columns"
                    :items="entries"
                    :loading="true"
                    class="elevation-1">
                        <v-progress-linear slot="progress" color="accent" indeterminate></v-progress-linear>
                        <template slot="items" slot-scope="props">
                            <td>{{ props.item.topic }}</td>
                            <td>Le {{ props.item.creation }} par {{ props.item.creator }}</td>
                            <td>Le {{ props.item.lastMessage }} par {{ props.item.lastAuthor }}</td>
                            <td>{{ props.item.messages }}</td>
                        </template>
                    </v-data-table>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>

    <v-dialog v-model="newDiscussionDialog" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
            Créez une nouvelle discussion dans Blabla
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
                <v-flex xs12 align-center justify-space-between>
                <v-layout align-center>
                    <v-avatar size="40px" class="mr-3">
                    <img
                        src="//ssl.gstatic.com/s2/oz/images/sge/grey_silhouette.png"
                        alt="">
                    </v-avatar>
                    <v-text-field placeholder="Name"></v-text-field>
                </v-layout>
                </v-flex>
                <v-flex xs6>
                <v-text-field
                    prepend-icon="business"
                    placeholder="Company">
                </v-text-field>
                </v-flex>
                <v-flex xs6>
                <v-text-field
                    placeholder="Job title">
                </v-text-field>
                </v-flex>
                <v-flex xs12>
                <v-text-field
                    prepend-icon="mail"
                    placeholder="Email">
                </v-text-field>
                </v-flex>
                <v-flex xs12>
                <v-text-field
                    type="tel"
                    prepend-icon="phone"
                    placeholder="(000) 000 - 0000"
                    mask="phone">
                </v-text-field>
                </v-flex>
                <v-flex xs12>
                <v-text-field
                    prepend-icon="notes"
                    placeholder="Notes">
                </v-text-field>
                </v-flex>
            </v-layout>
            </v-container>
            <v-card-actions>
            <v-btn text color="primary">Supprimer toutes les notifications</v-btn>
            <v-spacer></v-spacer>
            <v-btn text @click="dialog=false">Fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</div>
</template>

<script>
export default {
    data: () => ({
        query: '',
        entries: [
            {
                topicId: 1140,
                topic: 'Absolument 4G',
                creation: '21 avr 2014 à 20h31',
                creator: 'Olive',
                messages: 65,
                lastMessage: '31 jan 2018 à 19h16',
                lastAuthor: 'Manouel',
            },
            {
                topicId: 1330,
                topic: 'AGPA 2018',
                creation: '15 jul 2018 à 22h04',
                creator: 'Olive',
                messages: 36,
                lastMessage: '6 mar 2018 à 21h19',
                lastAuthor: 'Olive',
            },
            {
                topicId: 1332,
                topic: 'Lanslevillard 2019!',
                creation: '7 aou 2018 à 16h03',
                creator: 'Poupette',
                messages: 20,
                lastMessage: '15 nov 2018 à 23h46',
                lastAuthor: 'Manouel',
            },
            {
                topicId: 1326,
                topic: '7 et 8 juillet: fêtons les vacances !',
                creation: '21 avr 2014 à 20h31',
                creator: 'Bébé Ma\'anne',
                messages: 32,
                lastMessage: '31 Jan 2018 à 19h16',
                lastAuthor: 'Poupette',
            },
            {
                topicId: 1316,
                topic: 'Lanslevillard 2018',
                creation: '21 avr 2014 à 20h31',
                creator: 'Fannette',
                messages: 18,
                lastMessage: '31 Jan 2018 à 19h16',
                lastAuthor: 'Sylve',
            },
            {
                topicId: 1320,
                topic: 'Malaucène 2018',
                creation: '21 avr 2014 à 20h31',
                creator: 'Fannette',
                messages: 3,
                lastMessage: '31 Jan 2018 à 19h16',
                lastAuthor: 'Poupette',
            },],
        columns: [
            {
                text: 'Sujet', value: 'topic', align: 'left', selected: true, disabled: true,
            },
            {
                text: 'Créé', value: 'creation', align: 'left', selected: true, disabled: true,
            },
            {
                text: 'Dernier message', value: 'lastmessage', align: 'left', selected: true, disabled: false,
            },
            {
                text: 'Messages', value: 'messages', align: 'left', selected: true, disabled: false,
            }
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
@import '../themes/global.scss';

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
    margin: 20px 0 20px 0;
}

.box {
    //margin: 14px;
    background-position: right 10px top 10px;
    padding: 10px;
    //padding-left: 200px;
}
.tbz {
    background-image: url('../assets/images/tbz.png');
}
.blabla {
    background-image: url('../assets/images/forum-new.png');
}
.archives {
    background-image: url('../assets/images/forum-archives.png');
}

h2 {
    display: inline-block;
    font-size: 1.5em;
    font-weight: bold;
    text-align: left;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-family: "Comfortaa", sans-serif;
}
h2 a {
    text-decoration: none;
}

.notif {
    background-color: $accent;
    color: #fff;
    font-size: 0.8em;
    padding: 2px 10px;
    border-radius: 25px;
}

.date {
    color: #000;
}
.gueudelot {
    color: $group1;
}
.guibert {
    color: $group2;
}
.guyomard {
    color: $group3;
}

</style>
