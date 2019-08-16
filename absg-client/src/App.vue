<template>
<v-app id="inspire" :dark="darkMode">
    <!-- <v-navigation-drawer
        fixed
        :clipped="$vuetify.breakpoint.smAndUp"
        app
        v-model="drawer"
        style="z-index: 2100">
    <v-list dense>
        <template v-for="item in items">
        <v-list-group
            v-if="item.children"
            v-model="item.model"
            :key="item.text"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon="">
            <v-list-item slot="activator">
                <v-list-item-content>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item v-for="(child, i) in item.children" :key="i" :to="child.route">
                <v-list-item-action v-if="child.icon">
                    <v-icon>{{ child.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list-group>
        <v-list-item v-else :key="item.text" :to="item.route" active-class="accent--text">
            <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
            <v-list-item-title>
                {{ item.text }}
            </v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        </template>
    </v-list>
    </v-navigation-drawer> -->

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
        <div class="mainContent">
            <router-view></router-view>
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
    items: [
        { icon: 'fas fa-quote-left', text: 'Citations', route: '/citations' },
        { icon: 'fas fa-image', text: 'Images du moment', route: '/immt' },
        { icon: 'fas fa-comment', text: 'Discussions', route: '/discussions' },
        { icon: 'fas fa-address-book', text: 'Agenda', route: '/agenda' },
        { icon: 'fas fa-map-marked-alt', text: 'Voya G', route: '/voyag' },
        { icon: 'fas fa-camera', text: 'A.G.P.A', route: '/agpa' },
        { icon: 'fas fa-globe', text: 'Web 3G', route: '/web3g' },
        // {
        // icon: 'fas fa-chevron-up',
        // 'icon-alt': 'fas fa-chevron-down',
        // text: 'Avancé',
        // model: false,
        // children: [
        //     { icon: 'fas fa-cloud', text: 'Cloud', route: '/cloud' },
        //     { icon: 'far fa-calendar-alt', text: 'Calendrier', route: '/calendrier' },
        //     { icon: 'fas fa-flask', text: 'Labo', route: '/lab' },
        //     { icon: 'fas fa-search', text: 'Rechercher', route: '/recherche' },
        //     { icon: 'fas fa-wrench', text: 'Paramètres', route: '/parametres' },
        //     { icon: 'fas fa-chart-bar', text: 'Statistiques', route: '/stats' },
        //     { icon: 'fas fa-tools', text: 'Administration', route: '/zaffa' },
        //     { icon: 'fas fa-question', text: 'Aide', route: '/aide' },
        // ]
        // },
    ]
    }),
    props: {
    source: String
    },
    computed: {
        citation () {
          return this.$store.state.citation;
        },
        user () {
          return this.$store.state.user;
        }
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

</style>
