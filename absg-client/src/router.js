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
            path: '/calendrier',
            name: 'calendar',
            component: () => import('./views/Calendar.vue'),
        },
    ]
});
