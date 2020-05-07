<template>
<v-app id="inspire" :dark="darkMode">
    <v-navigation-drawer v-if="user && !$vuetify.breakpoint.lgAndUp" v-model="drawerOpen" app style="height: 100%; z-index: 1000">
        <v-list nav dense>
            <v-list-item to="/" style="margin-top: 60px">
                <v-list-item-action>
                    <v-icon>fas fa-home</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        Accueil
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <template v-for="item in menuItems">
                <v-list-item  v-if="item.url && checkUserRolesMatch(item)" :key="item.id" link :to="{ path: item.url }">
                    <v-list-item-action>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ item.name }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>
        </v-list>
    </v-navigation-drawer>

    <v-app-bar
        v-if="user"
        color="primary"
        dark
        app
        fixed
        style="z-index: 2000">
         <v-app-bar-nav-icon v-if="!$vuetify.breakpoint.lgAndUp" @click.stop="drawerOpen = !drawerOpen"/>

        <v-toolbar-title v-if="$vuetify.breakpoint.lgAndUp">
            <!-- <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon> -->
            <span>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <router-link to="/" v-on="on"><span class="absg">Absolument <span>G</span></span></router-link>
                    </template>
                    <span>Revenir à l'accueil</span>
                </v-tooltip>
            </span>
        </v-toolbar-title>
        <v-spacer>
        <div v-if="citation && $vuetify.breakpoint.lgAndUp" style="text-align:center; margin: 0 100px">
            <b>{{citation.author}} - </b> <span style="font-style: italic; font-weight: 200; opacity: 0.7; " v-html="citation.citation"></span>
        </div>
        </v-spacer >
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-badge color="accent" style="margin-right: 15px" overlap v-if="user">
                    <span v-if="notifications.length > 0" slot="badge">{{ notifications.length }}</span>
                    <v-btn icon v-on="on" @click.stop="notifDialog = !notifDialog">
                        <v-icon>far fa-bell</v-icon>
                    </v-btn>
                </v-badge>
            </template>
            <span>Voir l'historique des événements</span>
        </v-tooltip>
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

    <v-content id="bgcontent" style="background: #f9f9f9">
        <div class="menu" v-if="user && $vuetify.breakpoint.lgAndUp">
            <v-list style="background: none">
                <template v-for="item in menuItems">
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
        <div class="mainContent" v-bind:style="{ 'margin-left': $vuetify.breakpoint.lgAndUp ? '85px' : '0' }" >
            <router-view :socket="ws" style="min-height: 100%"></router-view>
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
                    <div style="display: flex; max-height: 100%;">
                        <!-- La photo -->
                        <div style="flex: 1 1 0; max-height: 100%;">
                            <img :src="photoDisplayed.url"/>
                            <div v-if="photoDisplayed.hasOwnProperty('title')" style="text-align: center">
                                {{photoDisplayed.title}}
                            </div>
                        </div>
                        <!-- L'éditeur de meta data -->
                        <PhotoMetadataEditor
                            v-if="photoMetadataEditorDisplayed"
                            :photo="photoDisplayed"
                            style="flex: 0 1 0; min-width: 330px; padding: 15px; margin-left: 15px; margin-right: -30px; overflow: auto;"></PhotoMetadataEditor>
                    </div>
                </div>
            </div>
        </div>
    </v-content>


    <v-dialog v-model="notifDialog" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4">
            Historiques des événements
            </v-card-title>
            <v-container fluid  grid-list-md style="padding:0; height: 60vh; overflow: hidden; overflow-y: scroll;">
                <v-list dense>
                    <template v-for="(item, index) in notifications">
                        <v-list-item
                            class="citationRow"
                            :key="index">
                            <v-list-item-avatar>
                                <img :src="item.url"/>
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


    <v-dialog v-model="error.displayed" width="80vw">
        <v-card>
            <v-card-title class="error">
                <v-icon color="#fff">fas fa-exclamation-circle</v-icon> &nbsp; Une erreur s'est produite
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
               <pre><span style="font-weight: bold">Date:    </span> {{ error.log }}</pre>
               <pre><span style="font-weight: bold">Requête: </span> {{ error.query ? error.query : "-" }}</pre>
               <pre><span style="font-weight: bold">Status:  </span> {{ error.htmlError ? error.htmlError : "-" }}</pre>
               <pre style="border: 1px solid #999; margin-top: 10px; padding: 5px">{{ error.msg ? error.msg : "Aucune information sur l'erreur :(" }}</pre>
            </v-container>
            <v-card-actions>
                <v-btn text @click="copyError()"><v-icon>far fa-copy</v-icon> &nbsp; Copier l'erreur</v-btn>
                <v-spacer></v-spacer>
                <v-btn text @click="error.displayed=false">OK</v-btn>
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
import { logoutUser, checkAutentication } from "./middleware/AuthHelper";
import PhotoMetadataEditor from './components/PhotoMetadataEditor.vue';


export default {
    name: 'App',
    store,
    components: {
        PhotoMetadataEditor
    },
    data: () => ({
        drawerOpen: false, // flag pour savoir si le menu-tiroir (écran mobile)
        notifDialog: false,
        errDialog: false,
        darkMode: false,
        drawer: null,
        ws: null,
        menuItems: MODULES,

        // Galerie photo editor
        photoDisplayedDateMenu: false,
        persons: ["olivier", "Annie", "Gérard", "Emmanuel", "Sébastien", "Fanny"]
    }),
    props: {
        source: String
    },
    mounted() {
        store.dispatch('initStore');
    },
    methods: {
        logout() {
            logoutUser(store);
            this.$router.push('/login');
        },
        copyError() {
            navigator.clipboard.writeText(`Erreur Absolument G\nDate: ${this.error.log}\nRequête: ${this.error.query}\nStatus: ${this.error.htmlError}\nError: ${this.error.msg}`);;
        },

        checkUserRolesMatch(item) {
            let result = false;
            if (item && Array.isArray(item.roles) && this.user && Array.isArray(this.user.roles)) {
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
            this.notifDialog = false;
            // axios.get(`/api/users/checkNotifications`).then(response => {
            //     const data = parseAxiosResponse(response);
            //     if (data) {
            //         this.isLoading = false;

            //         // On crée la listes des logs de passaG (les 24 dernières heures)
            //         this.passage = []
            //         const now = new Date();
            //         for (let hDelta = 0; hDelta<24; hDelta++) {
            //             let h = ((now.getHours() - hDelta) + 24) % 24;  // On simule le modulo
            //             this.passage.unshift({
            //                 time: `${h}h`,
            //                 passage: data.passag
            //                     .filter(e => new Date(e.datetime).getHours() === h)
            //                     .map(e => ({ username: `${e.username}`, avatar: `./img/avatars/${padNumber(e.userId, 3)}.png` })),
            //             })

            //         }
            //     }
            // });
        }
    },
    computed: {
        ...mapState([
            'citation',
            'user',
            'notifications',
            'error'
        ]),
        // Gallerie photos
        photosGalleryDisplayed() {
            return this.$store.state.photosGalleryDisplayed;
        },
        photoMetadataEditorDisplayed() {
            return this.$store.state.photoMetadataEditorDisplayed;
        },
        photosGallery () {
            return this.$store.state.photosGallery;
        },
        photosGalleryIndex() {
            return this.$store.state.photosGalleryIndex;
        },
        photoDisplayed () {
            if (this.photosGalleryIndex >= 0 && this.photosGalleryIndex < this.photosGallery.length) {
                return this.photosGallery[this.photosGalleryIndex];
            }
            return '/img/zaffa-notfound.png';
        },
        // Editeur photos
        photosEditorDisplayed() {
            return this.$store.state.photosEditorDisplayed;
        },
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
