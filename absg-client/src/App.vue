<template>
<v-app id="inspire" :dark="darkMode">
    <v-navigation-drawer
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
            <v-list-tile slot="activator">
                <v-list-tile-content>
                    <v-list-tile-title>{{ item.text }}</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-for="(child, i) in item.children" :key="i" :to="child.route">
                <v-list-tile-action v-if="child.icon">
                    <v-icon>{{ child.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>{{ child.text }}</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </v-list-group>
        <v-list-tile v-else :key="item.text" :to="item.route" active-class="accent--text">
            <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
            <v-list-tile-title>
                {{ item.text }}
            </v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>
        </template>
    </v-list>
    </v-navigation-drawer>

    <v-toolbar
        color="primary"
        dark
        app
        :clipped-left="$vuetify.breakpoint.mdAndUp"
        fixed
        style="z-index: 2000">
        <v-toolbar-title class="ml-0 pl-3">
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <span class="hidden-sm-and-down">
                <span class="absg">Absolument <span>G</span></span>
                <v-tooltip bottom>
                    <span slot="activator"><router-link to="/">Absolument G</router-link></span>
                    <span>Revenir à l'accueil</span>
                </v-tooltip>
            </span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-badge color="accent" overlap>
            <span slot="badge">8</span>
            <v-btn icon
                @click.stop="dialog = !dialog">
                <v-icon>fas fa-bell</v-icon>
            </v-btn>
        </v-badge>
        <v-menu offset-y bottom left>
            <v-btn color="primary" dark depressed slot="activator">
                Bébé Ma'anne
                <v-icon right>fas fa-user-circle</v-icon>
            </v-btn>
            <v-list>
            <v-list-tile>
                <v-list-tile-title :key="0"> 
                    <v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-info-circle</v-icon>Mes informations
                </v-list-tile-title>
            </v-list-tile>
            <v-list-tile>
                <v-list-tile-title :key="1"> 
                    <v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-chart-bar</v-icon>Mes statistiques
                </v-list-tile-title>
            </v-list-tile>
            <v-list-tile>
                <v-list-tile-title :key="2"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-lock</v-icon>Changer mot de passe</v-list-tile-title>
            </v-list-tile>
            <v-list-tile>
                <v-switch label="Mode nuit" v-model="darkMode"></v-switch>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile>
                <v-list-tile-title :key="3"><v-icon style="width: 38px; margin-right: 8px; text-align: center;">fas fa-power-off</v-icon>Déconnexion</v-list-tile-title>
            </v-list-tile>
            </v-list>
        </v-menu>
    </v-toolbar>
    <v-content id="bgcontent">
        <router-view class="view"></router-view>
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
        <v-btn flat color="primary">Supprimer toutes les notifications</v-btn>
        <v-spacer></v-spacer>
        <v-btn flat @click="dialog=false">Fermer</v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
</v-app>
</template>

<script>

export default {
    name: 'App',
    data: () => ({
    dialog: false,
    darkMode: false,
    drawer: null,
    items: [
        { icon: 'fas fa-home', text: 'Accueil', route: '/' },
        { icon: 'fas fa-quote-left', text: 'Citations', route: '/citations' },
        { icon: 'fas fa-image', text: 'Images du moment', route: '/immt' },
        { icon: 'fas fa-comment', text: 'Discussions', route: '/discussions' },
        { icon: 'fas fa-address-book', text: 'Agenda', route: '/agenda' },
        { icon: 'far fa-calendar-alt', text: 'Calendrier', route: '/calendrier' },
        { icon: 'fas fa-map-marked-alt', text: 'Voya G', route: '/voyag' },
        { icon: 'fas fa-camera', text: 'A.G.P.A', route: '/agpa' },
        { icon: 'fas fa-cloud', text: 'Cloud', route: '/cloud' },
        { icon: 'fas fa-globe', text: 'Web 3G', route: '/web3g' },
        { icon: 'fas fa-flask', text: 'Labo', route: '/lab' },
        {
        icon: 'fas fa-chevron-up',
        'icon-alt': 'fas fa-chevron-down',
        text: 'Avancé',
        model: false,
        children: [
            { icon: 'fas fa-search', text: 'Rechercher', route: '/recherche' },
            { icon: 'fas fa-wrench', text: 'Paramètres', route: '/parametres' },
            { icon: 'fas fa-chart-bar', text: 'Statistiques', route: '/stats' },
            { icon: 'fas fa-tools', text: 'Administration', route: '/zaffa' },
            { icon: 'fas fa-question', text: 'Aide', route: '/aide' },
        ]
        },
    ]
    }),
    props: {
    source: String
    }
}
</script>


<style lang="scss" scoped>
@import './assets/global.scss';
.absg {
    font-size: 1.5em;
    line-height: 1.5em;
    font-family: "Comfortaa", sans-serif;
}
.absg span {
    color: $accent;
}
#bgcontent {
    width: 100%;
    height: 100%;
    background-image: url('http://absolumentg.fr//assets/img/rangs/r00-maxi.png'); 
    background-position: center; 
    background-size: cover;
    position: relative;
}
</style>
