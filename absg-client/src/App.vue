<template>
  <v-app id="mainContent">
    <v-navigation-drawer
      v-if="user && user.id > 0 && !$vuetify.display.lgAndUp"
      v-model="drawerOpen"
      app
      temporary
      style="height: 100%"
    >
      <v-list
        nav
        density="compact"
        data-cy="menuDrawer"
      >
        <v-list-item
          to="/"
          style="margin-top: 60px"
          prepend-icon="fas fa-home"
        >
          <v-list-item-title>
            Accueil
          </v-list-item-title>
        </v-list-item>
        <template v-for="item in menuItems">
          <v-list-item
            v-if="item.url && checkUserRolesMatch(item)"
            :key="item.id"
            link
            :to="{ path: item.url }"
            :prepend-icon="item.icon"
          >
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      v-if="user && user.id > 0"
      app
      fixed
      style="z-index: 2000; background: #37474f"
    >
      <v-app-bar-nav-icon
        v-if="!$vuetify.display.lgAndUp"
        data-cy="menuButton"
        @click.stop="drawerOpen = !drawerOpen"
      />

      <v-toolbar-title
        v-if="$vuetify.display.lgAndUp"
        data-cy="title"
      >
        <router-link
          id="title"
          to="/"
        >
          Absolument <span>G</span>
        </router-link>
      </v-toolbar-title>
      <v-spacer>
        <div
          v-if="citation && $vuetify.display.lgAndUp"
          data-cy="citation"
          style="text-align:center; margin: 0 100px; color: #fff"
        >
          <b>{{ citation.author }} - </b> <span
            style="font-style: italic; font-weight: 200; opacity: 0.7; color: #fff"
            v-html="citation.citation"
          />
        </div>
      </v-spacer>
      <v-tooltip bottom>
        <template #activator="{ props }">
          <v-badge
            color="accent"
            style="margin-right: 15px"
            overlap
            data-cy="notifications"
            :content="unreadNotifications"
            :model-value="unreadNotifications > 0"
          >
            <v-btn
              icon
              v-bind="props"
              @click.stop="displayNotifications()"
            >
              <v-icon>far fa-bell</v-icon>
            </v-btn>
          </v-badge>
        </template>
        <span>Voir l'historique des événements</span>
      </v-tooltip>

      <div
        v-if="usersOnline.length > 0"
        id="online"
        data-cy="online"
      >
        <v-tooltip
          v-for="u of usersOnline"
          :key="u.id"
          bottom
        >
          <template #activator="{ props }">
            <img
              :src="u.avatarUrl"
              :style="{ opacity: u.opacity }"
              v-bind="props"
              @error="(e) => e.target.style.display = 'none'"
            >
          </template>
          <span>{{ u.username }} - {{ u.activity }}</span>
        </v-tooltip>
        <span>en ligne</span>
      </div>
      <!-- <div
        v-else
        id="online"
        data-cy="online"
      >
        <span style="bottom: -15px">personne en ligne</span>
      </div> -->

      <v-menu
        offset-y
        bottom
        left
      >
        <template #activator="{ props }">
          <v-btn
            icon
            color="primary"
            v-bind="props"
            data-cy="user"
            style="margin-right: 0"
          >
            <img
              :src="user.avatarUrl"
              style="height: 40px;"
              @error="(e) => e.target.style.display = 'none'"
            >
          </v-btn>
        </template>
        <v-list nav>
          <!-- <v-list-item :to="{ path: '/admin/profile'}">
                    <v-list-item-title :key="1"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-info-circle</v-icon>Mes informations</v-list-item-title>
                </v-list-item> -->
          <v-list-item @click="setGPSPosition()">
            <v-list-item-title :key="2">
              <v-icon style="width: 38px; margin-right: 8px; text-align: center;">
                fas fa-crosshairs
              </v-icon>Ma position
            </v-list-item-title>
          </v-list-item>
          <!-- <v-list-item @click="toggleDarkMode()">
                    <v-list-item-title :key="5"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-adjust</v-icon>Mode {{ $vuetify.theme.dark ? "sombre" : "clair" }}</v-list-item-title>
                </v-list-item> -->
          <v-list-item :to="{ path: '/admin/resetpwd'}">
            <v-list-item-title :key="3">
              <v-icon style="width: 38px; margin-right: 8px; text-align: center;">
                fas fa-lock
              </v-icon>Changer mot de passe
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout()">
            <v-list-item-title :key="4">
              <v-icon style="width: 38px; margin-right: 8px; text-align: center;">
                fas fa-power-off
              </v-icon>Se déconnecter
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <div
        v-if="user && user.id > 0 && $vuetify.display.lgAndUp"
        id="menu"
        data-cy="menu"
      >
        <v-list style="background: none">
          <template v-for="item in menuItems">
            <div
              v-if="item.url && checkUserRolesMatch(item)"
              :key="item.id"
              class="menuItem"
            >
              <router-link :to="{ path: item.url }">
                <v-icon color="inherit">
                  {{ item.icon }}
                </v-icon><br>
                <span style="display: inline-block; line-height: 1.1em;">{{ item.name }}</span>
              </router-link>
            </div>
          </template>
        </v-list>

        <div
          class="menuItem"
          style="position: absolute; bottom: 0; border-top: 1px solid rgba(0, 0, 0, 0.2)"
        >
          <router-link to="/changelog">
            <v-icon color="inherit">
              far fa-question-circle
            </v-icon><br>
            <span style="display: inline-block; line-height: 0.9em;">{{ version ? `v${version}` : "v5 - beta" }}</span>
          </router-link>
        </div>
      </div>
      <router-view
        :socket="ws"
        style="min-height: 100%"
        :style="{ 'margin-left': $vuetify.display.lgAndUp ? '85px' : '0' }"
      />
      <div
        v-if="user && user.id > 0 && photosGalleryDisplayed"
        class="gallery"
      >
        <div
          style="position: relative; padding: 50px; height: 100%;"
          @click="photosGalleryAuto()"
        >
          <div class="galleryControl">
            <div
              v-if="photosGallery.length > 1"
              class="count"
            >
              {{ photosGalleryIndex + 1 }} / {{ photosGallery.length }}
            </div>

            <button
              v-if="photosGallery.length > 1"
              type="button"
              class="button"
              @click.stop="photosGalleryPrev()"
              @keyup.left.stop="photosGalleryPrev()"
            >
              <i class="fas fa-chevron-left" />
            </button>
            <button
              v-if="photosGallery.length > 1"
              type="button"
              class="button"
              @click.stop="photosGalleryPlayPause()"
              @keyup.space.stop="photosGalleryPlayPause()"
            >
              <i class="fas fa-play" />
            </button>
            <button
              v-if="photosGallery.length > 1"
              type="button"
              class="button"
              @click.stop="photosGalleryNext()"
              @keyup.right.stop="photosGalleryNext()"
            >
              <i class="fas fa-chevron-right" />
            </button>

            <button
              type="button"
              class="close"
              @click.stop="photosGalleryHide()"
              @keyup.esc.stop="photosGalleryHide()"
            >
              <i class="fas fa-times" /> Fermer
            </button>
          </div>
          <div style="display: flex; max-height: 100%;">
            <!-- La photo -->
            <div style="flex: 1 1 0; max-height: 100%;">
              <img :src="photoDisplayed.url">
              <div
                v-if="photoDisplayed.hasOwnProperty('title')"
                style="text-align: center"
              >
                {{ photoDisplayed.title }}
              </div>
              <div
                v-if="photoDisplayed.hasOwnProperty('username')"
                style="text-align: center; font-style: italic; opacity: 0.5"
              >
                {{ photoDisplayed.username }}
              </div>
            </div>
            <!-- L'éditeur de meta data -->
            <PhotoMetadataEditor
              v-if="photoMetadataEditorDisplayed"
              :photo="photoDisplayed"
              style="flex: 0 1 0; min-width: 330px; padding: 15px; margin-left: 15px; margin-right: -30px; overflow: auto;"
            />
          </div>
        </div>
      </div>
    </v-main>


    <v-dialog
      v-model="notifDialog"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          Historiques des événements
        </v-card-title>
        <v-data-table
          :headers="notificationsHeaders"
          :items="notifications"
          items-per-page="500"
          loading-text="Récupération des notifications..."
          hide-default-footer
          height="60vh"
          class="notifications"
        >
          <template #item="{item}">
            <tr
              :class="{ 'unreadNotification': !item.read }"
              @click="onNotificationClicked(item)"
            >
              <td>
                <img
                  :src="item.url"
                  height="40px"
                >
              </td>
              <td>
                <div style="display: flex;">
                  <v-icon style="flex">
                    {{ item.module.icon }}
                  </v-icon>
                  <span style="display: inline-block; margin-left: 15px; line-height: 25px">{{ item.message }}</span>
                </div>
              </td>
              <td>{{ item.dateLabel }}</td>
              <td>
                <v-checkbox
                  v-model="item.read"
                  disabled
                  hide-details
                  density="compact"
                />
              </td>
            </tr>
          </template>
        </v-data-table>
        <v-card-actions style="padding-top: 20px">
          <v-spacer />
          <v-btn @click="closeNotifications(true)">
            Marquer tout comme vu
          </v-btn>
          <v-btn @click="closeNotifications()">
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="notif.displayed"
      class="msgDiallog"
      width="500px"
    >
      <v-card>
        <v-card-title class="annonce">
          <v-icon
            color="#fff"
            left
          >
            fas fa-info-circle
          </v-icon> {{ notif.title }}
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <div v-html="notif.msg" />
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="notif.displayed=false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="warning.displayed"
      class="msgDiallog"
      width="500px"
    >
      <v-card>
        <v-card-title class="warning">
          <v-icon
            color="#fff"
            left
          >
            fas fa-exclamation-triangle
          </v-icon> Attention
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <div v-html="warning.msg" />
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="warning.displayed=false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="error.displayed"
      class="msgDiallog"
      width="500px"
    >
      <v-card>
        <v-card-title class="error">
          <v-icon
            color="#fff"
            left
          >
            fas fa-exclamation-circle
          </v-icon> Une erreur s'est produite
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <pre><span style="font-weight: bold">Date:    </span> {{ error.log }}</pre>
          <pre><span style="font-weight: bold">Requête: </span> {{ error.query ? error.query : "-" }}</pre>
          <pre><span style="font-weight: bold">Status:  </span> {{ error.htmlError ? error.htmlError : "-" }}</pre>
          <pre style="border: 1px solid #999; margin-top: 10px; padding: 5px; white-space: pre-line;">{{ error.msg ? error.msg : "Aucune information sur l'erreur :(" }}</pre>
        </v-container>
        <v-card-actions>
          <v-btn
            text
            @click="copyError()"
          >
            <v-icon left>
              far fa-copy
            </v-icon> Copier l'erreur
          </v-btn>
          <v-spacer />
          <v-btn
            text
            @click="error.displayed=false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snack.displayed"
    >
      {{ snack.msg }}

      <template #action="{ attrs }">
        <v-btn
          color="secondary"
          text
          v-bind="attrs"
          @click="snack.displayed = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import store from "./store";
import axios from "axios";
import { mapState } from "./stores/helpers";
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
        usersOnline: [],
        menuItems: MODULES,
        version: "",
        notificationRefreshing: false,
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
    computed: {
        ...mapState([
            "citation",
            "user",
            "wsOnline",
            "wsMessage",
            "notifications",
            "unreadNotifications",
            "error",
            "warning",
            "notif",
            "snack"
        ]),
        // WebSocket
        ws() {
            return this.$socket || null;
        },
        // Galerie photos
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
        }
    },
    watch: {
        user(newValue, oldValue) {
            if (newValue && !oldValue) {
                // On initialise qu'une fois quand on détecte qu'un user vient de se connecter
                this.init();
            }
        },
        wsMessage(newValue, oldValue) {
            if (newValue.message === "onlineUsers") {
                // on met à jours la liste des utilisateurs en ligne
                const now = new Date().getTime();
                this.usersOnline = newValue.payload.filter(e => e && e.id && e.id > 0 && this.user && e.id != this.user.id).map(e => ({
                    ...e,
                    avatarUrl: `/files/avatars/${e.id.toString().padStart(3, '0')}.png`,
                    opacity: now - new Date(e.lastTime).getTime() <= 300000 ? 0.9 : 0.5 // 300000 = 5 minutes
                })).sort((a,b) => new Date(a.lastTime).getTime() < new Date(b.lastTime).getTime());
                // console.log(this.usersOnline.reduce((p, e) => (`${p}> ${e.id}:${e.username} `), ""))
                // On met à jour l'indicateur de notifications pour l'utilisateur
                if (this.user) {
                    const activity = newValue.payload.find(e => e.id === this.user.id);
                    if (activity && activity.unreadNotifications.length > this.unreadNotifications) {
                        this.refreshNotifications();
                    }
                }
            }
        }
    },
    mounted() {
        // On récupère le numéro de version depuis import.meta.env ou package.json
        // Note: En Vite, on ne peut pas utiliser require()
        this.version = import.meta.env.VITE_APP_VERSION || "5.2.0";

        // On charge les informations sur le thème à utiliser depuis le localstorage du browser
        const theme = localStorage.getItem("dark_theme");
        if (theme) {
            // En Vuetify 3, l'API du thème a changé
            this.$vuetify.theme.global.name = theme === "true" ? "dark" : "light";
        }

        if (this.user) {
            this.init();
        }
    },
    methods: {
        init() {
            // On initialise le store
            store.dispatch("initStore");
        },
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
        refreshNotifications() {
            if (!this.notificationRefreshing) {
                this.notificationRefreshing = true;
                axios.get("/api/notifications")
                    .then( response => {
                        const notifications = parseAxiosResponse(response);
                        store.commit("updateNotifications", notifications);
                        this.notificationRefreshing = false;
                    })
                    .catch(err => {
                        store.commit("onError", err);
                        this.notificationRefreshing = false;
                    });
            }
        },
        displayNotifications() {
            this.notifDialog = true;
            this.refreshNotifications();
        },
        onNotificationClicked(notification) {
            if (notification && !notification.read) {
                store.commit("readNotification", notification);
                this.notifDialog = false;
                if (notification.module.id == "forum") {
                    const topic = notification.data.topicId ? `read/${notification.data.topicId}` : "tbz";
                    const msgId = notification.data.msgId;
                    const url = `${notification.module.url}/${topic}`;
                    this.$router.push({ path: url }); // , hash: `#post_${msgId}`
                } else {
                    this.$router.push(notification.module.url);
                }

            }
        },
        closeNotifications(readAll = false) {
            this.notifDialog = false;
            if (readAll) {
                store.commit("readAllNotification");
            }
        },

        toggleDarkMode() {
            // Vuetify 3 theme API
            const currentTheme = this.$vuetify.theme.global.name;
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.$vuetify.theme.global.name = newTheme;
            localStorage.setItem("dark_theme", (newTheme === 'dark').toString());
        }

    }
};
</script>


<style lang="scss" scoped>
@import "./themes/global.scss";
#title {
    font-size: 1.5em;
    line-height: 1.5em;
    font-family: "Comfortaa", sans-serif;
    color: white;
    text-decoration: none;
    span {
        color: $accent;
    }
}

#online {
    margin: 0 20px;
    min-width: 100px;
    text-align: center;
    position: relative;
    padding-left: 15px;
    border-bottom: 1px solid rgba(255,255,255, 0.2);
    img {
        height: 35px;
        margin-left: -15px;
    }
    span {
        position: absolute;
        display: block;
        width: 50px;
        left: 50%;
        margin-left: -25px;

        text-align: center;
        bottom: -7px;
        color: rgba(255,255,255, 0.2);
        background: #37474f;
        font-variant: all-small-caps;
        font-size: 11px;
    }
}

#mainContent {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(200, 200, 200, 0.1)
    // background-image: url("/img/background/r00.png");
    // background-position: center;
    // background-size: cover;
    // background-attachment: fixed;
    // position: relative;
}

#menu {
    position: fixed;
    font-family: "Comfortaa", sans-serif;
    top: 48px;
    bottom: 0;
    left: 0;
    width: 85px;
    background: $primary;
    padding-top: 8px;

    a {
        display: table-cell;
        text-align: center;
        vertical-align: middle;
        width: 85px;
        height: 75px;
        color: rgba(0,0,0, 0.9);
        text-decoration: none;
        cursor: pointer;
        border-right: 1px solid #000;

        span {
            font-size: 0.8em
        }
    }

    .router-link-active {
        background: $accent;
        color: white!important;

        .theme--light.v-icon {
            color: white;
        }
    }
}
.menuItem {
    border-bottom: 1px solid rgba(0,0,0, 0.2);
}
.menuItem:hover {
    background: rgba(255,255,255, 0.2);
}


.unreadNotification {
    font-weight: bold;
    color: $accent;
    cursor: pointer;
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
