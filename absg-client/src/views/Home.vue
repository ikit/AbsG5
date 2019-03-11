<template>
    <div class="home" v-cloak>
        <div class="citation"><b>Alain :&nbsp;</b> {{citation.citation}} </div>
        <v-container fluid grid-list-xl>
            <v-layout row wrap>
                <v-flex xs12 sm12 md6 lg4 xl4>
                    <v-card>
                        <v-card-title>
                            <h1>Passa G


                            <v-btn flat
                                style="position: absolute; right: 15px; top: 15px;"
                                @click.stop="">
                                <v-icon left>far fa-clock</v-icon>historique
                            </v-btn>

                            </h1>
                        </v-card-title>

                        <v-list class="passage">
                        <template v-for="(item, i1) in passage">
                            <v-list-tile
                                :key="item.title"
                                ripple>

                                <div style="position: absolute; right: 15px; color: #aaa;" v-if="item.date">{{ item.date }}</div>
                                <div style="width: 50px;">{{ item.time }}</div>
                                <template v-for="(user, i2) in item.passage">
                                    <v-tooltip :key="i2" bottom>
                                        <template v-slot:activator="{ on }">
                                            <img :key="i2" :src="user.avatar" :alt="user.username" v-on="on" height="40px" />
                                        </template>
                                        <span>{{ user.username }}</span>
                                    </v-tooltip>


                                </template>

                            </v-list-tile>
                            <v-divider
                                v-if="i1 + 1 < passage.length"
                                :key="i1"></v-divider>
                        </template>
                        </v-list>
                    </v-card>
                </v-flex>
                <v-flex xs12 sm12 md6 lg8 xl8>
                    <v-card >
                        <silentbox-single src="http://absolumentg.fr/assets/img/immt/2019_037.jpg" description="Bonne année 2019 !">
                            <v-img src="http://absolumentg.fr/assets/img/immt/2019_037.jpg" height="500px"></v-img>
                        </silentbox-single>

                        <v-card-title primary-title>
                        <p style="text-align:center;">Bonne année 2019 !</p>
                        </v-card-title>
                    </v-card>
                </v-flex>
            </v-layout>
            <v-layout row wrap>
                <v-flex xs12 sm12 md4>
                    <v-card class="statBox">
                        <div class="statIcon">
                            <v-icon left>fas fa-user</v-icon>
                        </div>
                        <div class="statValue">
                            <span style="font-size: 2em; font-weight: bold;">15</span> visites/jours
                            <p class="details"><b>max :</b> 28 le 15/12/2016</p>
                        </div>
                    </v-card>
                </v-flex>

                <v-flex xs12 sm12 md4>
                    <v-card class="statBox">
                        <div class="statIcon">
                            <v-icon left>fas fa-users</v-icon>
                        </div>
                        <div class="statValue">
                            <span style="font-size: 2em; font-weight: bold;">15</span> visites par jours
                            max : 28 le 15/12/2016
                        </div>
                    </v-card>
                </v-flex>

                <v-flex xs12 sm12 md4>
                    <v-card class="statBox">
                        <div class="statIcon">
                            <v-icon left>fas fa-database</v-icon>
                        </div>
                        <div class="statValue">
                            <span style="font-size: 2em; font-weight: bold;">15</span> visites par jours
                            max : 28 le 15/12/2016
                        </div>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>

    </div>
</template>


<script>
import Vue from 'vue';
import VueSilentbox from 'vue-silentbox';
Vue.use(VueSilentbox);

export default {
    data: () => ({
        citation: {
            author: 'Alain',
            citation: '"C\'est dans la baignoire qu\'on se douche !"',
        },
        selected: [2],
        passage: [
        {
            date: null,
            time: '1h',
            passage: [
                { username: 'Bébé Ma\'anne', avatar: `./img/avatars/009.png` },
            ],
        },
        {
            date: '12/03/2019',
            time: '0h',
            passage: [
                { username: 'Sev', avatar: `./img/avatars/010.png` },
                { username: 'Olive', avatar: `./img/avatars/002.png` },
                { username: 'Fannette', avatar: `./img/avatars/018.png` },
                { username: 'Manouel', avatar: `./img/avatars/004.png` },
            ],
        },
        {
            date: null,
            time: '23h',
            passage: [
                { username: 'Fannette', avatar: `./img/avatars/018.png` },
                { username: 'Olive', avatar: `./img/avatars/002.png` },
            ],
        },
        {
            date: null,
            time: '22h',
            passage: [
                { username: 'Bébé Ma\'anne', avatar: `./img/avatars/009.png` },
                { username: 'Sev', avatar: `./img/avatars/010.png` },
                { username: 'Olive', avatar: `./img/avatars/002.png` },
                { username: 'Flo', avatar: `./img/avatars/005.png` },
            ],
        },
        {
            date: null,
            time: '21h',
            passage: [
                { username: 'Annie', avatar: `./img/avatars/012.png` },
            ],
        },
        {
            date: null,
            time: '20h',
            passage: [],
        },
        {
            date: null,
            time: '19h',
            passage: [
                { username: 'Annie', avatar: `./img/avatars/012.png` },
                { username: 'Olive', avatar: `./img/avatars/002.png` },
            ],
        },
        {
            date: null,
            time: '18h',
            passage: [],
        },
        {
            date: null,
            time: '17h',
            passage: [],
        },
        {
            date: null,
            time: '16h',
            passage: [],
        }],
        methods: {
            toggle: function (index) {
                const i = this.selected.indexOf(index);
                if (i > -1) {
                    this.selected.splice(i, 1);
                } else {
                    this.selected.push(index);
                }
            }
        }
    })
};
</script>



<style lang="scss" scoped>
@import '../assets/global.scss';
h1 {
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 1.5em;
    font-family: "Comfortaa", sans-serif;
    font-weight: bold;
    margin: 10px 0;
}
.passage {
    height: 495px;
    overflow: hidden;
}
.citation {
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 40px;
    height: 50px;
    font-style: italic;
    display: flex;
    justify-content: center;
    align-items: center;
}
.statBox {
    height: 100px;

    .statIcon {
        position: absolute;
        top: 20px;
        left: 20px;

        .v-icon {
            font-size: 4em;
        }
    }

    .statValue {
        position: absolute;
        top: 0;
        left: 100px;
        right: 15px;
        bottom: 0;

        .details {
            color: #aaa;
            font-size: 0.9em;
        }
    }
}

</style>
