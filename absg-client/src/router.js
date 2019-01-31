import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router)

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
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "citations" */ './views/Citations.vue'),
    },
    {
      path: '/immt',
      name: 'immt',
      component: () => import( './views/Immt.vue'),
    },
    {
      path: '/calendrier',
      name: 'calendrier',
      component: () => import( './views/AgendaCalendar.vue'),
    },
  ],
})
