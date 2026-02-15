<template>
  <v-app id="mainContent">
    <v-navigation-drawer
      v-if="user && user.id > 0 && !$vuetify.display.lgAndUp"
      v-model="drawerOpen"
      app
      temporary
      class="h-100"
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
      color="primary"
      :style="{ zIndex: 2000 }"
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
      <v-spacer />

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
        bottom
        left
      >
        <template #activator="{ props }">
          <v-btn
            icon
            color="primary"
            v-bind="props"
            data-cy="user"
            class="mr-3"
          >
            <img
              :src="user.avatarUrl"
              class="app-avatar"
              @error="(e) => e.target.style.display = 'none'"
            >
          </v-btn>
        </template>
        <v-list nav>
          <v-list-item :to="{ path: '/profile'}">
            <v-list-item-title :key="1">
              <v-icon class="app-menu-icon">
                fas fa-user
              </v-icon>Mon profil
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="toggleDarkMode()">
            <v-list-item-title :key="2">
              <v-icon class="app-menu-icon">
                {{ isDarkMode ? 'fas fa-sun' : 'fas fa-moon' }}
              </v-icon>{{ isDarkMode ? 'Mode clair' : 'Mode sombre' }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout()">
            <v-list-item-title :key="4">
              <v-icon class="app-menu-icon">
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
        <v-list class="app-sidebar-list">
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
                <span class="app-menu-label">{{ item.name }}</span>
              </router-link>
            </div>
          </template>
        </v-list>

        <div
          class="menuItem app-version-item"
        >
          <router-link>
            <v-icon color="inherit">
              far fa-question-circle
            </v-icon><br>
            <span class="app-menu-label">{{ version ? `v${version}` : "v5 - beta" }}</span>
          </router-link>
        </div>
      </div>
      <router-view
        :socket="ws"
        :class="['app-content', { 'app-content--with-sidebar': $vuetify.display.lgAndUp }]"
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
      v-model="notif.displayed"
      class="msgDiallog"
      width="500px"
    >
      <v-card>
        <v-card-title class="annonce">
          <v-icon
            color="white"
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
            variant="text"
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
            color="white"
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
            variant="text"
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
            color="white"
            left
          >
            fas fa-exclamation-circle
          </v-icon> Une erreur s'est produite
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <pre><span class="font-weight-bold">Date:    </span> {{ error.log }}</pre>
          <pre><span class="font-weight-bold">Requête: </span> {{ error.query ? error.query : "-" }}</pre>
          <pre><span class="font-weight-bold">Status:  </span> {{ error.htmlError ? error.htmlError : "-" }}</pre>
          <pre class="app-error-detail">{{ error.msg ? error.msg : "Aucune information sur l'erreur :(" }}</pre>
        </v-container>
        <v-card-actions>
          <v-btn
            variant="text"
            @click="copyError()"
          >
            <v-icon left>
              far fa-copy
            </v-icon> Copier l'erreur
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
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

      <template #actions>
        <v-btn
          color="secondary"
          variant="text"
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
import { useUserStore } from "./stores/user";
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
        drawer: null,
        usersOnline: [],
        menuItems: MODULES,
        version: "",

        // Galerie photo editor
        photoDisplayedDateMenu: false,
        persons: ["olivier", "Annie", "Gérard", "Emmanuel", "Sébastien", "Fanny"]
    }),
    computed: {
        ...mapState([
            "wsOnline",
            "wsMessage",
            "error",
            "warning",
            "notif",
            "snack"
        ]),
        // Utiliser directement le store Pinia pour une meilleure réactivité
        user() {
            const userStore = useUserStore();
            return userStore.currentUser;
        },
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
        },
        // Thème
        isDarkMode() {
            return this.$vuetify.theme.global.name === 'dark';
        },
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

        // Initialiser le store (citations, settings) même si l'utilisateur n'est pas connecté
        this.init();
    },
    methods: {
        async init() {
            // On vérifie si l'utilisateur a une session active
            await store.dispatch("checkSession");
            // On initialise le store (citations, settings)
            await store.dispatch("initStore");
        },
        logout() {
            logoutUser(store);
            this.$router.push("/login");
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
#title {
    font-size: 1.5em;
    line-height: 1.5em;
    font-family: "Comfortaa", sans-serif;
    color: white;
    text-decoration: none;
    span {
        color: rgb(var(--v-theme-accent));
    }
}

#online {
    margin: 0 20px;
    min-width: 100px;
    text-align: center;
    position: relative;
    padding-left: 15px;
    border-bottom: 1px solid rgba(var(--v-theme-on-primary), 0.2);
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
        color: rgba(var(--v-theme-on-primary), 0.2);
        background: rgb(var(--v-theme-primary));
        font-variant: all-small-caps;
        font-size: 11px;
    }
}

#mainContent {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgb(var(--v-theme-background));
}

#menu {
    position: fixed;
    font-family: "Comfortaa", sans-serif;
    top: 48px;
    bottom: 0;
    left: 0;
    width: 85px;
    background: rgb(var(--v-theme-primary));
    padding-top: 8px;

    a {
        display: table-cell;
        text-align: center;
        vertical-align: middle;
        width: 85px;
        height: 75px;
        color: rgba(var(--v-theme-on-primary), 0.9);
        text-decoration: none;
        cursor: pointer;
        border-right: 1px solid rgba(var(--v-theme-on-primary), 0.1);

        span {
            font-size: 0.8em
        }
    }

    .router-link-active {
        background: rgb(var(--v-theme-accent));
        color: white !important;

        .v-icon {
            color: white;
        }
    }
}

.menuItem {
    border-bottom: 1px solid rgba(var(--v-theme-on-primary), 0.1);
}

.menuItem:hover {
    background: rgba(var(--v-theme-on-primary), 0.15);
}

.unreadNotification {
    font-weight: bold;
    color: rgb(var(--v-theme-accent));
    cursor: pointer;
}

.theme--light.v-icon {
    color: rgba(var(--v-theme-on-surface), 0.54);
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
    color: rgba(255, 255, 255, 0.7);

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

.app-avatar {
    height: 40px;
}

.app-menu-icon {
    width: 38px;
    margin-right: 8px;
    text-align: center;
}

.app-menu-label {
    display: inline-block;
    line-height: 1.1em;
}

.app-sidebar-list {
    background: none;
}

.app-version-item {
    position: absolute;
    bottom: 0;
    border-top: 1px solid rgba(var(--v-theme-on-primary), 0.1);
}

.app-content {
    min-height: 100%;

    &--with-sidebar {
        margin-left: 85px;
    }
}

.app-error-detail {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.3);
    margin-top: 10px;
    padding: 5px;
    white-space: pre-line;
}
</style>

<style lang="scss">
// Styles globaux (non scoped) pour les overlays comme les tooltips
.v-tooltip > .v-overlay__content {
    background: rgb(var(--v-theme-on-surface)) !important;
    color: rgb(var(--v-theme-surface)) !important;
}
</style>
