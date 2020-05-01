<template>
<div>
    <v-container fluid  grid-list-md style="padding:0">
        <v-data-iterator
            :items="discussion.messages"
            hide-default-footer>

            <template v-slot:header>
                <div class="stickyHeader" >
                    <v-row style="padding: 15px" align="center" justify="center">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    :disabled="isLoading">
                                    <v-icon>fas fa-angle-double-left</v-icon>
                                </v-btn>
                            </template>
                            <span>Revenir un an en arrière</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    :disabled="isLoading">
                                    <v-icon>fa-chevron-left</v-icon>
                                </v-btn>
                            </template>
                            <span>Revenir un mois en arrière</span>
                        </v-tooltip>
                        <span class="grey--text" >
                            Avril 2020
                        </span>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    :disabled="isLoading">
                                    <v-icon>fa-chevron-right</v-icon>
                                </v-btn>
                            </template>
                            <span>Aller au mois suivant</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    :disabled="!isLoading">
                                    <v-icon>fas fa-angle-double-right</v-icon>
                                </v-btn>
                            </template>
                            <span>Aller à l'année suivante</span>
                        </v-tooltip>
                    </v-row>
                </div>
            </template>


            <template v-slot:default="props">
                <vue-splitter :margin="0" defaultPercent="100">
                    <div slot="left-pane">
                        <v-list dense style="background: none">
                        <template v-for="msg in discussion.messages">
                            <v-list-item :key="msg.id">
                                <v-card style="margin: auto; margin-top: 15px; width: 600px; padding: 15px">
                                    <v-list-item-avatar>
                                        <img :src="users[msg.userId].avatar"/>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <div class="citation" v-html="msg.message"></div>
                                    </v-list-item-content>
                                </v-card>
                            </v-list-item>
                        </template>
                        </v-list>
                    </div>
                    <div slot="right-pane">
                        <div style="position: relative; height: calc(100vh-113px)">
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom:100px">
                                <vue-ckeditor
                                    type="classic"
                                    height="300px"
                                    v-model="newMessage"
                                    :editors="editors"
                                    :config="config"
                                    @input="ckInput">
                                </vue-ckeditor>
                            </div>
                            <v-btn style="margin-top: 15px" :disabled="!newMessage">Envoyer ma réponse</v-btn>
                        </div>
                    </div>
                </vue-splitter>
            </template>
        </v-data-iterator>
    </v-container>
</div>
</template>

<script>
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '@ckeditor/ckeditor5-build-classic/build/translations/fr';
import VueCkeditor from 'vue-ckeditor5';
import VueSplitter from "@rmp135/vue-splitter"


export default {
    components: {
        'vue-ckeditor': VueCkeditor.component,
        VueSplitter
    },
    data: () => ({

        newMessage: "",
        editors: {
            classic: ClassicEditor,
        },
        config: {
            language: "fr",
            // plugins: [ Base64UploadAdapter],
            // toolbar: [ 'bold', 'italic', 'link'  ]
        },

        filter: { search: null },
        newDiscussionDialog: false,
        users: {
            2: {
                id: 2,
                avatar: `/img/avatars/002.png`,
                username: 'Olive',
                rootFamily: 'gueudelot',
            },
            13: {
                id: 13,
                avatar: `/img/avatars/013.png`,
                username: 'Poupette',
                rootFamily: 'guyomard'
            },
            15: {
                id: 15,
                avatar: `/img/avatars/015.png`,
                username: 'Sylve',
                rootFamily: 'guibert',
            }
        },
        discussion: { // model: Discussion.js
            title: "T.B.Z.",
            creationDate: new Date(2016, 5, 24),
            endDate: new Date(),
            fromDate: new Date(2019, 11, 1),
            toDate: new Date(),
            messages: [
                {
                    id: 1,
                    userId: 2,
                    message: 'Perso, j\'aime pas trop la syntaxe mais bon... :/',
                    date: new Date(2019, 3, 6, 21, 29),
                },
                {
                    id: 2,
                    userId: 13,
                    message: 'Bonjour les G! Les températures claviculaires font rêver à la blanche neige...',
                    date: new Date(2019, 3, 6, 22, 37),
                },
                {
                    id: 3,
                    userId: 15,
                    message: 'Coté Guibert, il y aura très très certainement des amateurs: on affine et on vous dit "quoi"! ...',
                    date: new Date(2019, 11, 10, 16, 14),
                },
                {
                    id: 4,
                    userId: 2,
                    message: 'Perso, j\'aime pas trop la syntaxe mais bon... :/',
                    date: new Date(2019, 3, 6, 21, 29),
                },
                {
                    id: 5,
                    userId: 13,
                    message: 'Bonjour les G! Les températures claviculaires font rêver à la blanche neige...',
                    date: new Date(2019, 3, 6, 22, 37),
                },
                {
                    id: 6,
                    userId: 15,
                    message: 'Coté Guibert, il y aura très très certainement des amateurs: on affine et on vous dit "quoi"! ...',
                    date: new Date(2019, 11, 10, 16, 14),
                },
                {
                    id: 7,
                    userId: 2,
                    message: 'Perso, j\'aime pas trop la syntaxe mais bon... :/',
                    date: new Date(2019, 3, 6, 21, 29),
                },
                {
                    id: 8,
                    userId: 13,
                    message: 'Bonjour les G! Les températures claviculaires font rêver à la blanche neige...',
                    date: new Date(2019, 3, 6, 22, 37),
                },
                {
                    id: 9,
                    userId: 15,
                    message: 'Coté Guibert, il y aura très très certainement des amateurs: on affine et on vous dit "quoi"! ...',
                    date: new Date(2019, 11, 10, 16, 14),
                }
            ]
        },
        currentUser: {
            id: 2,
            username: 'Olivier'
        }
    }),
    mounted: () => {

    },
    methods: {
        ckInput(newValue, instance, eventInfo, batch) {
            console.log("ckInput", newValue, instance, eventInfo, batch)
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';

.box {
    //margin: 14px;
    background-position: right 10px top 10px;
    padding: 10px;
    //padding-left: 200px;
    min-height: 100%;
}
.tbz {
    background-image: url('/img/tbz.png');
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

.ck-content {
    max-height: 267px;
}
</style>
