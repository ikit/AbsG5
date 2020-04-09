<template>
<div>
    <v-container fluid grid-list-xl>
        <v-data-iterator
                :items="discussion.messages"
                hide-default-footer>

                <template v-slot:header>
                    <v-toolbar class="mb-1">
                        des outils du genre: imprimer, exporter, statistiques ?
                    </v-toolbar>
                </template>


                <template v-slot:default="props">
                        <v-list dense>
                        <template v-for="msg in discussion.messages">
                            <v-list-item :key="msg.id">
                                <v-card style="margin-top: 15px; max-width: 500px;">
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
                </template>

                <template v-slot:footer>
                    Répondre
                </template>
            </v-data-iterator>
    </v-container>
</div>
</template>

<script>
export default {
    data: () => ({
        query: '',
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
                }
            ]
        },
        currentUser: {
            id: 2,
            username: 'Olivier'
        }
    }),
    methods: {

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
}
.tbz {
    background-image: url('/img/tbz.png');
}
// .blabla {
//     background-image: url('/img/forum-new.png');
// }
// .archives {
//     background-image: url('/img/forum-archives.png');
// }

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
