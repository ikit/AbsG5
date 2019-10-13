<template>
<div class="home">
    <img
        v-if="$vuetify.breakpoint.mdAndUp"
        src="../assets/images/forum-new.png"
        style="height: 120px; position: absolute; left: 10px;"/>
    <h1>Les discussions</h1>

    <v-container fluid grid-list-xl>
        <v-layout row wrap>
            <v-flex xs12>
                <v-card class="box tbz">
                    <v-tooltip right>
                        <template v-slot:activator="{ on }">
                            <h2 v-on="on">
                                <a href="discussions/forum/1">T.B.Z.</a>
                            </h2>
                        </template>
                        <span>Accéder à l'ensemble des discussions T.B.Z.</span>
                    </v-tooltip>

                    <v-list two-line style="background: none;">
                        <template v-for="(item, index) in tbz.lastActivities">

                            <v-list-item
                                :key="item.title"
                                avatar
                                @click="">
                            <v-list-item-avatar>
                                <img :src="item.user.avatar">
                            </v-list-item-avatar>

                            <v-list-item-content>
                                <v-list-item-title>{{ item.title }}
                                    <span v-if="item.notifications > 0" class="notif"> {{ item.notifications }}</span>
                                </v-list-item-title>
                                <v-list-item-sub-title>
                                    <span :class="item.user.rootFamilly">{{ item.user.username }}</span> <span class="date"> le {{ item.date }}:</span> {{ item.message }}
                                </v-list-item-sub-title>
                            </v-list-item-content>
                            </v-list-item>
                            <v-divider v-if="index != 2" :key="index" inset="true"></v-divider>
                        </template>
                    </v-list>
                </v-card>
            </v-flex>
            <v-flex xs12>
                <v-card class="box blabla">
                    <v-tooltip right>
                        <template v-slot:activator="{ on }">
                            <h2 v-on="on">
                                <a href="discussions/forum/2">Blabla !</a>
                            </h2>
                        </template>
                        <span>Accéder à l'ensemble des discussions Blabla</span>
                    </v-tooltip>
                    <v-list two-line style="background: none;">
                        <template v-for="(item, index) in blabla.lastActivities">

                            <v-list-item
                                :key="item.title"
                                avatar
                                @click="">
                            <v-list-item-avatar>
                                <img :src="item.user.avatar">
                            </v-list-item-avatar>

                            <v-list-item-content>
                                <v-list-item-title>{{ item.title }}
                                    <span v-if="item.notifications > 0" class="notif"> {{ item.notifications }}</span>
                                </v-list-item-title>
                                <v-list-item-sub-title>
                                    <span :class="item.user.rootFamilly">{{ item.user.username }}</span> <span class="date"> le {{ item.date }}:</span> {{ item.message }}
                                </v-list-item-sub-title>
                            </v-list-item-content>
                            </v-list-item>
                            <v-divider v-if="index != 2" :key="index" inset="true"></v-divider>
                        </template>
                    </v-list>
                </v-card>
            </v-flex>
        </v-layout>

        <v-layout row wrap>
            <v-flex sm12 md4>
                <v-card class="box stats">
                    <h2>Statistiques</h2>
                    <div class="row">
                        <div class="column">
                            <span>13 465</span> messages
                        </div>
                        <div class="column">
                            <span>7 935</span> sujets
                        </div>
                        <div class="column">
                            <span>1,3</span> messages/jour
                        </div>
                    </div>
                </v-card>
            </v-flex>
            <!-- <v-flex sm12 md8>
                <v-card class="box archives" style="height: 114px;">
                    <h2>Arhives du forum</h2>
                    <div class="row">
                        <span>Consultez, ou recherchez parmi les vieux message</span>
                    </div>
                </v-card>
            </v-flex> -->
            <v-flex sm12 md8 style="text-align: right;">
                <v-btn
                    color="accent"
                    @click.stop="resetDialog(true)">
                    <v-icon left>fas fa-archive</v-icon>Voir les archives
                </v-btn>
                <v-btn
                    color="accent"
                    @click.stop="newDiscussion()">
                    <v-icon left>fas fa-plus</v-icon>Nouvelle discussion
                </v-btn>
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
        newDiscussionDialog: false,
        tbz: {
            lastActivities: [
                {
                    user: {
                        id: 2,
                        avatar: `./img/avatars/002.png`,
                        username: 'Olive',
                        rootFamilly: 'gueudelot',
                    },
                    title: 'Nouvelles de Mars',
                    message: 'Perso, j\'aime pas trop la syntaxe mais bon... :/',
                    date: '6 Mar 2019 à 21h29',
                    notifications: 2,
                },
                {
                    user: {
                        id: 13,
                        avatar: `./img/avatars/013.png`,
                        username: 'Poupette',
                        rootFamilly: 'guyomard',
                    },
                    title: 'Nouvelles de Février',
                    message: 'Bonjour les G! Les températures claviculaires font rêver à la blanche neige...',
                    date: '15 Nov 2018 à 23h46',
                    notifications: 0,
                },
                {
                    user: {
                        id: 15,
                        avatar: `./img/avatars/015.png`,
                        username: 'Sylve',
                        rootFamilly: 'guibert',
                    },
                    title: 'Nouvelles de Janvier',
                    message: 'Coté Guibert, il y aura très très certainement des amateurs: on affine et on vous dit "quoi"! ...',
                    date: '31 Jan 2018 à 9h49',
                    notifications: 0,
                },
            ]
        },
        blabla: {
            totalTopics: 889,
            totalMessages: 13538,
            lastActivities: [
                {
                    user: {
                        id: 2,
                        avatar: `./img/avatars/002.png`,
                        username: 'Olive',
                        rootFamilly: 'gueudelot',
                    },
                    title: 'AGPA 2019',
                    message: 'Perso, j\'aime pas trop la syntaxe mais bon... :/',
                    date: '6 Mar 2019 à 21h29',
                    notifications: 1,
                },
                {
                    user: {
                        id: 13,
                        avatar: `./img/avatars/013.png`,
                        username: 'Poupette',
                        rootFamilly: 'guyomard',
                    },
                    title: 'Lanslevillard 2019',
                    message: 'Bonjour les G! Les températures claviculaires font rêver à la blanche neige.',
                    date: '15 Nov 2018 à 23h46',
                    notifications: 1,
                },
                {
                    user: {
                        id: 15,
                        avatar: `./img/avatars/015.png`,
                        username: 'Sylve',
                        rootFamilly: 'guibert',
                    },
                    title: 'Malaucène 2018',
                    message: 'Coté Guibert, il y aura très très certainement des amateurs: on affine et on vous dit "quoi"!',
                    date: '31 Jan 2018 à 9h49',
                    notifications: 0,
                },
            ]
        },
        currentUser: {
            id: 2,
            username: 'Olivier'
        }
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

.box {
    //margin: 14px;
    background-position: right 10px top 10px;
    padding: 10px;
    //padding-left: 200px;
}
.tbz {
    background-image: url('../assets/images/tbz.png');
}
// .blabla {
//     background-image: url('../assets/images/forum-new.png');
// }
// .archives {
//     background-image: url('../assets/images/forum-archives.png');
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
