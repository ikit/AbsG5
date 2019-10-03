import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/citations',
            name: 'citations',
            component: () => import('./views/Citations.vue'),
        },
        {
            path: '/immt',
            name: 'immt',
            component: () => import('./views/Immt.vue'),
        },
        {
            path: '/cloud',
            name: 'cloud',
            component: () => import('./views/Cloud.vue'),
        },
        {
            path: '/voyag',
            name: 'voyag',
            component: () => import('./views/VoyaG.vue'),
        },
        {
            path: '/discussions',
            name: 'discussions',
            component: () => import('./views/Discussions.vue'),
        },
        {
            path: '/discussions/forum/:id',
            name: 'forum',
            component: () => import('./views/Forum.vue'),
        },
        {
            path: '/calendrier',
            name: 'calendar',
            component: () => import('./views/Calendar.vue'),
        },
        {
            path: '/agenda',
            name: 'agenda',
            component: () => import('./views/Agenda.vue'),
        },
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
                    component: () => import('./views/Agpa/ArchiveEdition.vue'),
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
                    component: () => import('./views/Agpa/Ceremony.vue'),
                }
            ]
        },
    ]
});
