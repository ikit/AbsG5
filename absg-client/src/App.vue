<template>
<v-app id="inspire">
    <v-navigation-drawer v-if="user && user.id > 0 && !$vuetify.breakpoint.lgAndUp" v-model="drawerOpen" app style="height: 100%; z-index: 1000">
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
        v-if="user && user.id > 0"
        app
        fixed
        style="z-index: 2000; background: #37474f">
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
        <div v-if="citation && $vuetify.breakpoint.lgAndUp" style="text-align:center; margin: 0 100px; color: #fff">
            <b>{{citation.author}} - </b> <span style="font-style: italic; font-weight: 200; opacity: 0.7; color: #fff" v-html="citation.citation"></span>
        </div>
        </v-spacer >
        <!-- <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-badge color="accent" style="margin-right: 15px" overlap :value="unreadNotifications">
                    <span slot="badge" >{{ unreadNotifications }}</span>
                    <v-btn icon v-on="on" @click.stop="notifDialog = !notifDialog">
                        <v-icon>far fa-bell</v-icon>
                    </v-btn>
                </v-badge>
            </template>
            <span>Voir l'historique des événements</span>
        </v-tooltip> -->

        <!-- <v-btn @click="getOnline()">online</v-btn> -->

        <v-menu offset-y bottom left>
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon color="primary" v-bind="attrs" v-on="on" style="margin-right: 0">
                    <img :src="user.avatarUrl" style="height: 40px;" />
                </v-btn>
            </template>
            <v-list nav>
                <v-list-item :to="{ path: '/admin/profile'}">
                    <v-list-item-title :key="1"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-info-circle</v-icon>Mes informations</v-list-item-title>
                </v-list-item>
                <v-list-item @click="setGPSPosition()">
                    <v-list-item-title :key="2"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-crosshairs</v-icon>Ma position</v-list-item-title>
                </v-list-item>
                <!-- <v-list-item @click="toggleDarkMode()">
                    <v-list-item-title :key="5"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-adjust</v-icon>Mode {{ $vuetify.theme.dark ? "sombre" : "clair" }}</v-list-item-title>
                </v-list-item> -->
                <v-list-item :to="{ path: '/admin/resetpwd'}">
                    <v-list-item-title :key="3"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-lock</v-icon>Changer mot de passe</v-list-item-title>
                </v-list-item>
                <v-list-item @click="logout()">
                    <v-list-item-title :key="4"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-power-off</v-icon>Se déconnecter</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>

    <v-main id="bgcontent" style="background: rgba(200, 200, 200, 0.1)">
        <div class="menu" v-if="user && user.id > 0 && $vuetify.breakpoint.lgAndUp">
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
                    <span style="display: inline-block; line-height: 0.9em;">v5 beta</span>
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
    </v-main>


    <v-dialog v-model="notifDialog" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4">
            Historiques des événements
            </v-card-title>
            <v-data-table
                :headers="notificationsHeaders"
                :items="notifications"
                itemsPerPage="500"
                loading-text="Récupération des notifications..."
                hide-default-footer
                height="60vh"
                class="notifications"
            >
                <template v-slot:item="{item}">
                    <tr v-bind:class="{ 'unreadNotification': !item.read }" @click="onNotificationClicked(item)">
                        <td><img :src="item.url" height="40px"/></td>
                        <td>
                            <div style="display: flex;">
                                <v-icon style="flex">{{ item.module.icon }}</v-icon>
                                <span style="display: inline-block; margin-left: 15px; line-height: 25px">{{ item.message }}</span>
                            </div>
                        </td>
                        <td>{{ item.dateLabel }}</td>
                        <td><v-simple-checkbox v-model="item.read" disabled></v-simple-checkbox></td>
                    </tr>
                </template>
            </v-data-table>
            <v-card-actions style="padding-top: 20px">
                <v-spacer></v-spacer>
                <v-btn @click="closeNotifications(true)">Marquer tout comme vu</v-btn>
                <v-btn @click="closeNotifications()">Fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="notif.displayed" class="msgDiallog" width="500px">
        <v-card>
            <v-card-title class="annonce">
                <v-icon color="#fff" left>fas fa-info-circle</v-icon> {{ notif.title }}
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
               <div v-html="notif.msg"></div>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="notif.displayed=false">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="warning.displayed" class="msgDiallog" width="500px">
        <v-card>
            <v-card-title class="warning">
                <v-icon color="#fff" left>fas fa-exclamation-triangle</v-icon> Attention
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
               <div v-html="warning.msg"></div>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="warning.displayed=false">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="error.displayed" class="msgDiallog" width="500px">
        <v-card>
            <v-card-title class="error">
                <v-icon color="#fff" left>fas fa-exclamation-circle</v-icon> Une erreur s'est produite
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
               <pre><span style="font-weight: bold">Date:    </span> {{ error.log }}</pre>
               <pre><span style="font-weight: bold">Requête: </span> {{ error.query ? error.query : "-" }}</pre>
               <pre><span style="font-weight: bold">Status:  </span> {{ error.htmlError ? error.htmlError : "-" }}</pre>
               <pre style="border: 1px solid #999; margin-top: 10px; padding: 5px">{{ error.msg ? error.msg : "Aucune information sur l'erreur :(" }}</pre>
            </v-container>
            <v-card-actions>
                <v-btn text @click="copyError()"><v-icon left>far fa-copy</v-icon> Copier l'erreur</v-btn>
                <v-spacer></v-spacer>
                <v-btn text @click="error.displayed=false">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</v-app>
</template>

<script>
import store from "./store";
import axios from "axios";
import { mapState } from "vuex";
import { MODULES, parseAxiosResponse } from  "./middleware/CommonHelper";
import { logoutUser, checkAutentication } from "./middleware/AuthHelper";
import PhotoMetadataEditor from "./components/PhotoMetadataEditor.vue";


export default {
    name: "App",
    store,
    components: {
        PhotoMetadataEditor
    },
    data: () => ({
        drawerOpen: false, // flag pour savoir si le menu-tiroir (écran mobile)
        notifDialog: false,
        errDialog: false,
        drawer: null,
        ws: null,
        menuItems: MODULES,
        notificationsHeaders: [
            { text: "Qui", value: "who" },
            { text: "Quoi", value: "what" },
            { text: "Quand", value: "when" },
            { text: "", value: "read" },
        ],

        // Galerie photo editor
        photoDisplayedDateMenu: false,
        persons: ["olivier", "Annie", "Gérard", "Emmanuel", "Sébastien", "Fanny"]
    }),
    props: {
        source: String
    },
    mounted() {
        // On charge les informations sur le thème à utiliser depuis le localstorage du browser
        const theme = localStorage.getItem("dark_theme");
        if (theme) {
            if (theme == "true") {
                this.$vuetify.theme.dark = true;
            } else {
                this.$vuetify.theme.dark = false;
            }
        }

        // On initialise le store
        store.dispatch("initStore");
    },
    methods: {
        logout() {
            logoutUser(store);
            this.$router.push("/login");
        },
        setGPSPosition() {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // On met à jour les infos de l'utilisateur,
                        axios.post(`/api/users/${this.user.id}/updateGPS`, [position.coords.latitude, position.coords.longitude]).then(
                            savedUser => {
                                store.commit("onNotif", [
                                    "Localisation mise à jours",
                                    `Votre position a été mise à jours avec les coordonnées GPS suivantes : <code>[${position.coords.latitude}, ${position.coords.longitude}]</code>`]);
                                },
                            err => {
                                store.commit('onError', err);
                            }
                        );
                    },
                    () => {
                        store.commit("onWarning", `
                            La récupération automatique de votre position est bloquée par votre navigateur.<br/>
                            Vous pouvez modifier manuellement votre position dans la section '<a href="/admin/profile">Mes informations</a>' du site.`);
                    }
                );
            } else {
                store.commit("onWarning", `
                    La récupération automatique de votre position est bloquée par votre navigateur.<br/>
                    Vous pouvez modifier manuellement votre position dans la section '<a href="/admin/profile">Mes informations</a>' du site.`);
            }
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
            store.commit("photosGalleryHide");
        },
        photosGalleryPrev() {
            store.commit("photosGalleryPrev");
        },
        photosGalleryNext() {
            store.commit("photosGalleryNext");
        },
        photosGalleryPlayPause() {
            console.debug("TODO: photosGalleryPlayPause");
        },
        photosGalleryAuto() {
            console.debug("TODO: photosGalleryAuto");
        },
        onNotificationClicked(notification) {
            console.debug("onNotificationClicked", notification);
            if (notification) {
                store.commit("readNotification", notification);
                this.$router.push(notification.module.url);
                this.notifDialog = false;
            }
        },
        closeNotifications(readAll = false) {
            this.notifDialog = false;
            if (readAll) {
                store.commit("readAllNotification");
            }
        },

        toggleDarkMode() {
            this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
            localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
        }
    },
    computed: {
        ...mapState([
            "citation",
            "user",
            "notifications",
            "unreadNotifications",
            "error",
            "warning",
            "notif"
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
            return "/img/zaffa-notfound.png";
        },
        // Editeur photos
        photosEditorDisplayed() {
            return this.$store.state.photosEditorDisplayed;
        },

        //
        getOnline() {
            axios.get(`/api/online`).then(response => {
                const data = parseAxiosResponse(response);
            });
        }
    }
};
</script>


<style lang="scss" scoped>
@import "./themes/global.scss";
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
    // background-image: url("/img/background/r00.png");
    // background-position: center;
    // background-size: cover;
    // background-attachment: fixed;
    // position: relative;
}

.menu {
    position: fixed;
    font-family: "Comfortaa", sans-serif;
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

.unreadNotification {
    font-weight: bold;
    color: $accent;
    cursor: pointer;
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
