<template>
<div class="home" style="margin-top: 58px;">
    <h1>Les forums</h1>
        <v-container fluid grid-list-xl>
            <v-layout row wrap>
                <v-flex xs12>
                    <v-card class="box tbz">
                        <h2>T.B.Z.</h2>
                        <v-list two-line style="background: none;">
                            <template v-for="(item, index) in tbz.lastActivities">

                                <v-list-tile
                                    :key="item.title"
                                    avatar
                                    @click="">
                                <v-list-tile-avatar>
                                    <img :src="item.user.avatar">
                                </v-list-tile-avatar>

                                <v-list-tile-content>
                                    <v-list-tile-title>{{ item.title }}
                                        <span v-if="item.notifications > 0" class="notif"> {{ item.notifications }}</span>
                                    </v-list-tile-title>
                                    <v-list-tile-sub-title>
                                        <span :class="item.user.rootFamilly">{{ item.user.username }}</span> <span class="date"> le {{ item.date }}:</span> {{ item.message }}
                                    </v-list-tile-sub-title>
                                </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="index != 2" :key="index" inset="true"></v-divider>
                            </template>
                        </v-list>
                    </v-card>
                </v-flex>
                <v-flex xs12>
                    <v-card class="box blabla">
                        <h2>Blabla !</h2>
                        <v-list two-line style="background: none;">
                            <template v-for="(item, index) in blabla.lastActivities">

                                <v-list-tile
                                    :key="item.title"
                                    avatar
                                    @click="">
                                <v-list-tile-avatar>
                                    <img :src="item.user.avatar">
                                </v-list-tile-avatar>

                                <v-list-tile-content>
                                    <v-list-tile-title>{{ item.title }}
                                        <span v-if="item.notifications > 0" class="notif"> {{ item.notifications }}</span>
                                    </v-list-tile-title>
                                    <v-list-tile-sub-title>
                                        <span :class="item.user.rootFamilly">{{ item.user.username }}</span> <span class="date"> le {{ item.date }}:</span> {{ item.message }}
                                    </v-list-tile-sub-title>
                                </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="index != 2" :key="index" inset="true"></v-divider>
                            </template>
                        </v-list>
                    </v-card>
                </v-flex>
            </v-layout>

            <v-layout row wrap>
                <v-flex sm12 md6>
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
                <v-flex sm12 md6>
                    <v-card class="box archives">
                        <h2>Arhives du forum</h2>
                        <div class="row">
                            <span>Message au hasard :</span>
                            <div class="column">
                                <span>Emmanuel le 5/6/2008 à 17h54</span>: "Salut les Copains ! [...]"
                            </div>
                        </div>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>


</div>
</template>

<script>
export default {
    data: () => ({
        query: '',
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
    display: block;
    font-size: 1.5em;
    font-weight: bold;
    text-align: left;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-family: "Comfortaa", sans-serif;
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
