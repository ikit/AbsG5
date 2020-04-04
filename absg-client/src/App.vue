<template>
<v-app id="inspire" :dark="darkMode">
    <v-app-bar
        v-if="user"
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
            <span v-if="notifications.length > 0" slot="badge">{{ notifications.length }}</span>
            <v-btn icon
                @click.stop="dialog = !dialog">
                <v-icon>far fa-list-alt</v-icon>
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

            <v-list nav>
                <v-list-item href="/me/informations">
                    <v-list-item-title :key="0">
                        <v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-info-circle</v-icon>Mes informations
                    </v-list-item-title>
                </v-list-item>
                <v-list-item href="/me/stats">
                    <v-list-item-title :key="1">
                        <v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-chart-bar</v-icon>Mes statistiques
                    </v-list-item-title>
                </v-list-item>
                <v-list-item href="/me/password">
                    <v-list-item-title :key="2"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-lock</v-icon>Changer mot de passe</v-list-item-title>
                </v-list-item>
                <v-list-item>
                    <v-switch label="Mode nuit" v-model="darkMode"></v-switch>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="logout()">
                    <v-list-item-title :key="3"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-power-off</v-icon>Déconnexion</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>

    <v-content id="bgcontent">
        <div class="menu" v-if="user">
            <v-list style="background: none">
                <template v-for="item in items">
                    <div class="menuItem" v-if="item.url && checkUserRolesMatch(item)" :key="item.id">
                        <router-link :to="{ path: item.url }">
                            <v-icon color="inherit">{{ item.icon }}</v-icon><br/>
                            <span style="display: inline-block; line-height: 1.1em;">{{ item.name }}</span>
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
            <router-view :socket="ws"></router-view>
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
            <v-card-title class="grey lighten-4">
            Historiques des événements
            </v-card-title>
            <v-container fluid  grid-list-md style="padding:0">
                <v-list dense>
                    <template v-for="(item, index) in notifications">
                        <v-list-item
                            class="citationRow"
                            :key="index">
                            <v-list-item-avatar>
                                <img :src="item.user.url"/>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <div style="display: flex;">
                                    <v-icon style="flex">{{item.module.icon}}</v-icon>
                                    <span style="display: inline-block; margin-left: 15px; line-height: 25px">{{ item.dateLabel }} - {{item.message}}</span>
                                </div>

                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-list>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="closeNotifications()">Fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>


    <v-dialog v-model="errDialog" width="80vw">
        <v-card>
            <v-card-title class="grey lighten-4">
            Une erreur s'est produite
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
               { { error} }
            </v-container>
            <v-card-actions>
                <v-btn text color="primary">Supprimer toutes les notifications</v-btn>
                <v-spacer></v-spacer>
                <v-btn text @click="errDialog=false">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</v-app>
</template>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import store from './store';
import axios from 'axios';
import { mapState } from 'vuex';
import { MODULES, parseAxiosResponse } from  './middleware/CommonHelper';
import { webSocket } from "rxjs/webSocket";
import { logoutUser, checkAutentication } from "./middleware/AuthHelper";


export default {
    name: 'App',
    store,
    data: () => ({
        dialog: false,
        errDialog: false,
        darkMode: false,
        drawer: null,
        ws: null,
        items: MODULES
    }),
    props: {
        source: String
    },
    mounted() {
        // On initialise le websocket
        this.ws = webSocket("ws://localhost:5011");
        this.ws.subscribe(
            msg => this.processWebsocketMessage(msg),
            err => this.processWebsocketError("Problème de mise à jour temps réel", err),
            () => console.log("complete") // Called when connection is closed (for whatever reason).
        );
    },
    methods: {
        logout() {
            logoutUser(store);
            this.$router.push('/login');
        },
        processWebsocketMessage(msg) {
            console.log("processWebsocketMessage", msg);
        },
        processWebsocketError(msg, err) {
            console.log("processWebsocketError", msg, err);
        },
        checkUserRolesMatch(item) {
            let result = false;
            if (item && this.user && Array.isArray(item.roles)) {
                for (const r of this.user.roles) {
                    if (item.roles.find(e => e === r)) {
                        result = true;
                    }
                }
            };
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
        },
        closeNotifications() {
            dialog=false;
            axios.get(`/api/users/checkNotifications`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    this.isLoading = false;
                    store.commit('updateCitation', data.citation);
                    store.commit('updateImmt', data.immt);
                    store.commit('updateNotifications', data.notifications);

                    // On crée la listes des logs de passaG (les 24 dernières heures)
                    this.passage = []
                    const now = new Date();
                    for (let hDelta = 0; hDelta<24; hDelta++) {
                        let h = ((now.getHours() - hDelta) + 24) % 24;  // On simule le modulo
                        this.passage.unshift({
                            time: `${h}h`,
                            passage: data.passag
                                .filter(e => new Date(e.datetime).getHours() === h)
                                .map(e => ({ username: `${e.username}`, avatar: `./img/avatars/${padNumber(e.userId, 3)}.png` })),
                        })

                    }
                }
            });
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
