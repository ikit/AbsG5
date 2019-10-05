<template>
<v-app id="inspire" :dark="darkMode">
    <v-app-bar
        color="primary"
        dark
        app
        fixed
        style="z-index: 2000">
        <v-toolbar-title>
            <!-- <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon> -->
            <span class="hidden-sm-and-down">
                <router-link to="/"><span class="absg">Absolument <span>G</span></span></router-link>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon color="primary" dark v-on="on">home</v-icon>
                    </template>
                    <span>Revenir à l'accueil</span>
                </v-tooltip>

            </span>
        </v-toolbar-title>
        <v-spacer>
            <div v-if="citation" style="text-align:center; margin: 0 100px">
                <b>{{citation.author}} - </b> <span style="font-style: italic; font-weight: 200; opacity: 0.7; " v-html="citation.citation"></span>
            </div>
        </v-spacer>
        <v-badge color="accent" overlap>
            <span slot="badge">8</span>
            <v-btn icon
                @click.stop="dialog = !dialog">
                <v-icon>fas fa-bell</v-icon>
            </v-btn>
        </v-badge>
        <v-menu offset-y bottom left>
            <template v-slot:activator="{ on, attrs }">
                <v-btn depressed color="primary" v-bind="attrs" v-on="on">
                    Bébé Ma'anne
                    <!-- <v-icon right>fas fa-user-circle</v-icon> -->
                    <img src="/img/avatars/009.png" style="height: 40px; margin-left: 15px" />
                </v-btn>
            </template>

            <v-list>
                <v-list-item>
                    <v-list-item-title :key="0">
                        <v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-info-circle</v-icon>Mes informations
                    </v-list-item-title>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title :key="1">
                        <v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-chart-bar</v-icon>Mes statistiques
                    </v-list-item-title>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title :key="2"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-lock</v-icon>Changer mot de passe</v-list-item-title>
                </v-list-item>
                <v-list-item>
                    <v-switch label="Mode nuit" v-model="darkMode"></v-switch>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item>
                    <v-list-item-title :key="3"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-power-off</v-icon>Déconnexion</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>

    <v-content id="bgcontent">
        <div class="menu">
            <v-list style="background: none">
                <template v-for="item in items">
                    <div class="menuItem" v-if="!item.children" :key="item.text">
                        <router-link :to="item.route">
                            <v-icon color="inherit">{{ item.icon }}</v-icon><br/>
                            <span style="display: inline-block; line-height: 1.1em;">{{ item.text }}</span>
                        </router-link>
                    </div>
                </template>
            </v-list>
        </div>
        <div class="mainContent" >
            <router-view></router-view>
            <div class="gallery" @click="liteboxClose()" :v-if="photosGalleryDisplayed">
                <div style="position: relative; padding: 50px; height: 100%;">
                    <div class="galleryControl">
                        <div class="count">
                            {{ photosGalleryIndex + 1 }} / {{ photosGallery.length }}
                        </div>

                        <button type="button" class="button" @click="liteboxPrev(); return false;"><i class="fas fa-chevron-left"></i></button>
                        <button type="button" class="button" @click="liteboxPlayPause(); return false;"><i class="fas fa-play"></i></button>
                        <button type="button" class="button" @click="liteboxNext(); return false;"><i class="fas fa-chevron-right"></i></button>

                        <button type="button" class="close" @click="liteboxClose(); return false;"><i class="fas fa-times"></i> Fermer</button>
                    </div>

                    <img :src="photoDisplayed.url" @click="liteboxAuto()"/>
                    <div style="text-align: center">
                        {{photoDisplayed.title}}
                    </div>
                </div>
            </div>
        </div>
    </v-content>


    <v-dialog v-model="dialog" width="800px">
    <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
        Notifications
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
</v-app>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import store from './store';
import ClientOAuth2 from 'client-oauth2';


var githubAuth = new ClientOAuth2({
  clientId: 'abc',
  clientSecret: '123',
  accessTokenUri: 'https://github.com/login/oauth/access_token',
  authorizationUri: 'https://github.com/login/oauth/authorize',
  redirectUri: 'http://example.com/auth/github/callback',
  scopes: ['notifications', 'gist']
});

console.log(githubAuth);


export default {
    name: 'App',
    store,
    data: () => ({
    dialog: false,
    darkMode: false,
    drawer: null,
    photosGalleryDisplayed: true,
    items: [
        { icon: 'fas fa-quote-left', text: 'Citations', route: '/citations' },
        { icon: 'fas fa-image', text: 'Images du moment', route: '/immt' },
        { icon: 'fas fa-comment', text: 'Discussions', route: '/discussions' },
        { icon: 'fas fa-address-book', text: 'Agenda', route: '/agenda' },
        { icon: 'fas fa-map-marked-alt', text: 'Voya G', route: '/voyag' },
        { icon: 'fas fa-camera', text: 'A.G.P.A', route: '/agpa' },
        { icon: 'fas fa-globe', text: 'Web 3G', route: '/web3g' },
    ]
    }),
    props: {
        source: String
    },
    methods: {

        hideLitebox() {
            console.log('hideLitebox');
            return store.photosGalleryDisplayed;
            store.commit('hideImageGalery');
            return store.photosGalleryDisplayed;
        },
        liteboxClose() {
            this.photosGalleryDisplayed = false;
            store.commit('setImageGalleryVisible', false);
        },
        liteboxPrev() {

        },
        liteboxPlayPause() {

        },
        liteboxNext() {

        },
        liteboxAuto() {

        }
    },
    computed: {
        citation () {
            return this.$store.state.citation;
        },
        user () {
            return this.$store.state.user;
        },
        photosGallery () {
            return this.$store.state.photosGallery;
        },
        photosGalleryIndex() {
            return this.$store.state.photosGalleryIndex;
        },
        photoDisplayed () {
            return {
                url: 'http://absolumentg.fr/assets/img/agpa/2018/mini/1544998619.jpg',
                title: 'D&#039;un mill&eacute;naire &agrave; l&#039;autre',
            }

            // if (this.$store.state.photosGalleryIndex >= 0 && this.$store.state.photosGalleryIndex < this.$store.state.photosGallery.length) {
            //     return this.$store.state.photosGallery[this.$store.state.photosGalleryIndex];
            // }
            // return 'http://localhost:8080/img/immt-new.png';
        },

    }
};
</script>


<style lang="scss" scoped>
@import './assets/global.scss';
.absg {
    font-size: 1.5em;
    line-height: 1.5em;
    font-family: "Comfortaa", sans-serif;
    color: white;
}
.absg span {
    color: $accent;
}
#bgcontent {
    width: 100%;
    height: 100%;
    // background-image: url('./assets/images/background/r00.png');
    // background-position: center;
    // background-size: cover;
    // background-attachment: fixed;
    // position: relative;
}

.menu {
    position: fixed;
    top: 48px;
    bottom: 0;
    left: 0;
    width: 85px;
    background: $primary;
    padding-top: 8px
}
.menuItem {
    border-bottom: 1px solid rgba(0,0,0, 0.2);
}
.menu a {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    width: 85px;
    height: 75px;
    color: rgba(0,0,0, 0.9);
    text-decoration: none;
    cursor: pointer;
    border-right: 1px solid #000;
}
.menu .router-link-active {
    background: $accent;
    color: white!important;

    .theme--light.v-icon {
        color: white;
    }
}
.menu a span {
    font-size: 0.8em
}
.menuItem:hover {
    background: rgba(255,255,255, 0.2);
}


.mainContent {
    position: relative;
    margin-left: 85px;
}
.theme--light.v-icon {
    color: rgba(0,0,0,0.54);
}


.gallery {
    position: fixed;
    z-index:20000;
    top: 0;
    left: 0;
    right:0;
    bottom: 0;
    background: rgba(0,0,0,0.95);
    text-align: center;
    color: #aaa;

    .galleryControl {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50px;
        text-align: center;
        line-height: 50px;

        .count {
            position: absolute;
            top: 0;
            left: 10px;
            line-height: 50px;
        }

        .button {
            width: 30px;
            text-align: center;
            font-size: 1.2em;
        }

        .close {
            position: absolute;
            top: 0;
            right: 10px;
            line-height: 50px;
            font-size: 1.2em;
        }
    }

    img {
        background: #fff!important;
        padding: 1px!important;
        border: 1px solid #000!important;
        max-height: 100%;
        max-width: 100%;
    }
}



.vlb-arrows {
    position: absolute!important;
    top: 10px!important;
}
.vlb-close-wrapper {
    position: absolute;
    top: 10px;
    right: 10px;
}


.vlb-caption-count {
    position: absolute;
    top: 10px;
    left: 10px;
}
.vlb-caption-title {
    font-size: 1.5em;
    color: #fff;

}
</style>
