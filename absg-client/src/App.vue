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
        <v-badge color="accent" style="margin-right: 15px" overlap v-if="user">
            <span slot="badge">8</span>
            <v-btn icon
                @click.stop="dialog = !dialog">
                <v-icon>fas fa-bell</v-icon>
            </v-btn>
        </v-badge>
        <v-menu offset-y bottom left v-if="user">
            <template v-slot:activator="{ on, attrs }">
                <v-btn depressed color="primary" v-bind="attrs" v-on="on">
                    {{ user.username }}
                    <!-- <v-icon right>fas fa-user-circle</v-icon> -->
                    <img :src="user.avatarUrl" style="height: 40px; margin-left: 15px" />
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
        <div class="menu" v-if="user">
            <v-list style="background: none">
                <template v-for="item in items">
                    <div class="menuItem" v-if="!item.roles || checkUserRolesMatch(item.roles)" :key="item.text">
                        <router-link :to="item.route">
                            <v-icon color="inherit">{{ item.icon }}</v-icon><br/>
                            <span style="display: inline-block; line-height: 1.1em;">{{ item.text }}</span>
                        </router-link>
                    </div>
                </template>
            </v-list>

            <div class="menuItem" style="position: absolute; bottom: 0; border-top: 1px solid rgba(0, 0, 0, 0.2)">
                <router-link to="/changelog">
                    <v-icon color="inherit">far fa-question-circle</v-icon><br/>
                    <span style="display: inline-block; line-height: 0.9em;">v5 apha</span>
                </router-link>
            </div>
        </div>
        <div class="mainContent" >
            <router-view></router-view>
            <div class="gallery" v-if="photosGalleryDisplayed">
                <div style="position: relative; padding: 50px; height: 100%;" @click="photosGalleryAuto()">
                    <div class="galleryControl">
                        <div class="count" v-if="photosGallery.length > 1">
                            {{ photosGalleryIndex + 1 }} / {{ photosGallery.length }}
                        </div>

                        <button v-if="photosGallery.length > 1" type="button" class="button"
                            @click.stop="photosGalleryPrev()"
                            @keyup.left.stop="photosGalleryPrev()"><i class="fas fa-chevron-left"></i></button>
                        <button v-if="photosGallery.length > 1" type="button" class="button"
                            @click.stop="photosGalleryPlayPause()"
                            @keyup.space.stop="photosGalleryPlayPause()"><i class="fas fa-play"></i></button>
                        <button v-if="photosGallery.length > 1" type="button" class="button"
                            @click.stop="photosGalleryNext()"
                            @keyup.right.stop="photosGalleryNext()"><i class="fas fa-chevron-right"></i></button>

                        <button type="button" class="close"
                            @click.stop="photosGalleryHide()"
                            @keyup.esc.stop="photosGalleryHide()"><i class="fas fa-times"></i> Fermer</button>
                    </div>

                    <img :src="photoDisplayed.url"/>
                    <div style="text-align: center">
                        {{photoDisplayed.title}}
                    </div>
                </div>
            </div>
            <div class="photoEditor" v-if="photosEditorDisplayed">
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
import { mapState } from 'vuex';

export default {
    name: 'App',
    store,
    data: () => ({
        dialog: false,
        darkMode: false,
        drawer: null,
        items: [
            { icon: 'fas fa-quote-left', text: 'Citations', route: '/citations' },
            { icon: 'fas fa-image', text: 'Photos', route: '/photos' },
            { icon: 'fas fa-comment', text: 'Discussions', route: '/discussions' },
            { icon: 'fas fa-address-book', text: 'Agenda', route: '/agenda' },
            { icon: 'fas fa-map-marked-alt', text: 'Voya G', route: '/voyag' },
            { icon: 'fas fa-camera', text: 'A.G.P.A', route: '/agpa' },
            { icon: 'fas fa-globe', text: 'Web 3G', route: '/web3g' },
            { icon: 'fas fa-cog', text: 'Admin', route: '/admin', roles: ["admin"]  },
        ]
    }),
    props: {
        source: String
    },
    methods: {
        checkUserRolesMatch(roles) {
            let result = true;
            console.log("checkUserRolesMatch", roles);
            return result;
        },
        photosGalleryHide() {
            store.commit('photosGalleryHide');
            console.log("couc", this.user);
        },
        photosGalleryPrev() {
            store.commit('photosGalleryPrev');
        },
        photosGalleryNext() {
            store.commit('photosGalleryNext');
        },
        photosGalleryPlayPause() {
            console.log('photosGalleryPlayPause');
        },
        photosGalleryAuto() {
            console.log('photosGalleryAuto');
        }
    },
    computed: {
        ...mapState([
            'citation',
            'user',
            'notifications'
        ]),
        // Gallerie photos
        photosGalleryDisplayed() {
            return this.$store.state.photosGalleryDisplayed;
        },
        photosGallery () {
            return this.$store.state.photosGallery;
        },
        photosGalleryIndex() {
            return this.$store.state.photosGalleryIndex;
        },
        photoDisplayed () {
            if (this.$store.state.photosGalleryIndex >= 0 && this.$store.state.photosGalleryIndex < this.$store.state.photosGallery.length) {
                return this.$store.state.photosGallery[this.$store.state.photosGalleryIndex];
            }
            return 'http://localhost:8080/img/immt-new.png';
        },
        // Editeur photos
        photosEditorDisplayed() {
            return this.$store.state.photosEditorDisplayed;
        }
    }
};
</script>


<style lang="scss" scoped>
@import './themes/global.scss';
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
    // background-image: url('/img/background/r00.png');
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
