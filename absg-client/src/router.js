import Vue from 'vue';
import VueRouter from 'vue-router'
import Home from './views/Home.vue';
import E404 from './views/E404.vue';
import Changelog from './views/Changelog.vue';
import Login from './views/Login.vue';
import axios from 'axios';
import store from './store';
import { checkAutentication, logoutUser } from './middleware/AuthHelper';

Vue.use(VueRouter);

export const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            component: Home,
        },
        // Administration
        {
            path: '/admin',
            component: () => import('./views/Admin.vue'),
            children: [
                {
                    path: '',
                    redirect: '/admin/dashboard'
                },
                {
                    path: 'dashboard',
                    component: () => import('./views/Admin/Dashboard.vue'),
                },
                {
                    path: 'settings',
                    component: () => import('./views/Admin/Settings.vue'),
                },
                {
                    path: 'users',
                    component: () => import('./views/Admin/Users.vue'),
                }
            ]
        },
        // Citations
        {
            path: '/citations',
            component: () => import('./views/Citations.vue'),
            children: [
                {
                    path: '',
                    redirect: '/citations/browser'
                },
                {
                    path: 'browser',
                    component: () => import('./views/Citations/Browser.vue'),
                },
                {
                    path: 'play',
                    component: () => import('./views/Citations/Game.vue'),
                },
                {
                    path: 'stats',
                    component: () => import('./views/Citations/Stats.vue'),
                }
            ]
        },
        // Photos
        {
            path: '/photos',
            component: () => import('./views/Photos.vue'),
            children: [
                {
                    path: '',
                    redirect: '/photos/immt'
                },
                {
                    path: 'immt',
                    component: () => import('./views/Photos/Immt.vue'),
                },
                {
                    path: 'albums',
                    component: () => import('./views/Photos/Albums.vue'),
                },
                {
                    path: 'browser',
                    component: () => import('./views/Photos/Browser.vue'),
                },
            ]
        },
        // Discussions
        {
            path: '/discussions',
            component: () => import('./views/Discussions.vue'),
            children: [
                {
                    path: '',
                    redirect: '/discussions/tbz'
                },
                {
                    path: 'tbz',
                    component: () => import('./views/Discussions/Tbz.vue'),
                },
                {
                    path: 'locations',
                    component: () => import('./views/Agenda/Locations.vue'),
                },
                {
                    path: 'events',
                    component: () => import('./views/Agenda/Events.vue'),
                },
                {
                    path: 'trombi',
                    component: () => import('./views/Agenda/Trombi.vue'),
                },
                {
                    path: 'genealogy',
                    component: () => import('./views/Agenda/Genealogy.vue'),
                }
            ]
        },
        {
            path: '/discussions/forum/:id',
            component: () => import('./views/Discussions/Forum.vue'),
        },
        // Agenda
        {
            path: '/agenda',
            component: () => import('./views/Agenda.vue'),
            children: [
                {
                    path: '',
                    redirect: '/agenda/directory'
                },
                {
                    path: 'directory',
                    component: () => import('./views/Agenda/Directory.vue'),
                },
                {
                    path: 'locations',
                    component: () => import('./views/Agenda/Locations.vue'),
                },
                {
                    path: 'events',
                    component: () => import('./views/Agenda/Events.vue'),
                },
                {
                    path: 'trombi',
                    component: () => import('./views/Agenda/Trombi.vue'),
                },
                {
                    path: 'genealogy',
                    component: () => import('./views/Agenda/Genealogy.vue'),
                }
            ]
        },
        // AGPA
        {
            path: '/agpa',
            component: () => import('./views/Agpa.vue'),
            children: [
                {
                    path: '',
                    component: () => import('./views/Agpa/Edition.vue'),
                },
                {
                    path: 'rules',
                    component: () => import('./views/Agpa/Rules.vue'),
                },
                {
                    path: 'archives',
                    component: () => import('./views/Agpa/ArchivesSummary.vue'),
                },
                {
                    path: 'archives/:year',
                    component: () => import('./views/Agpa/ArchiveEdition.vue'),
                },
                {
                    path: 'archives/:year/:catId',
                    component: () => import('./views/Agpa/ArchiveCategory.vue'),
                },
                {
                    path: 'palmares',
                    component: () => import('./views/Agpa/Palmares.vue'),
                },
                {
                    path: 'stats',
                    component: () => import('./views/Agpa/Stats.vue'),
                },
                {
                    path: 'ceremony',
                    component: () => import('./views/Agpa/CeremonyMenu.vue'),
                },
                {
                    path: 'ceremony/:year',
                    component: () => import('./views/Agpa/Ceremony.vue'),
                }
            ]
        },
        // Pages uniques
        {
            path: '/login',
            component: Login,
        },
        {
            path: '/voyag',
            component: () => import('./views/VoyaG.vue'),
        },
        {
            path: '/changelog',
            component: Changelog
        },

        // Error management
        {
            path: '/404',
            component: E404
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});

router.beforeEach((to, from, next) => {
    // Si la page nécessite une authent ou non
    const publicPages = ['/login'];
    if (publicPages.includes(to.path)) {
        return next();
    }

    // Si pas d'authent, on redirige vers la page de login
    const user = checkAutentication(store);
    if (!user) {
        return next('/login');
    }

    // // Si accès restreint et pas le role, on redirige vers l'accueil
    // TODO

    next();
  })


// On intercepte les requêtes qui échouent, pour rediriger en conséquence
axios.interceptors.response.use(
    response => {
        return response
    },
    error => {
        // Session invalide, on force la déconnection/reconnection de l'utilisateur
        if (error.response.status === 401) {
            logoutUser(store);
            return router.push('/login');
        }
        // Accès refusé, on redirige vers l'accueil
        if (error.response.status === 403) {
            return router.push('/');
        }
        // Erreur du serveur
        if (error.response.status === 500) {
            store.commit(store, error);
            return;
        }
        // Pour tout le reste on redirige vers 404
        console.log("TODO: NOT MANAGED ERROR", error.response)
        router.push('/404');
        return Promise.reject(error)
    });
