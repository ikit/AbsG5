import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import E404 from './views/E404.vue';
import Changelog from './views/Changelog.vue';

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
            path: '/changelog',
            name: 'changelog',
            component: Changelog
        },
        {
            path: '/citations',
            name: 'citations',
            component: () => import('./views/Citations.vue'),
        },
        {
            path: '/photos',
            name: 'photos',
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
                    path: 'random',
                    component: () => import('./views/Photos/Random.vue'),
                },
                {
                    path: 'loose',
                    component: () => import('./views/Photos/Loose.vue'),
                },
                {
                    path: 'sorting',
                    component: () => import('./views/Photos/ToSort.vue'),
                },
                {
                    path: 'albums',
                    component: () => import('./views/Photos/Albums.vue'),
                }
            ]
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
                    component: () => import('./views/Agpa/Ceremony.vue'),
                }
            ]
        },

        // Error management
        {
            path: '/404',
            name: '404',
            component: E404
        },
        {
            path: '*',
            redirect: '/404'
        },
    ]
});
