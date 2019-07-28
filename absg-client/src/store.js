import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        immt: null,
        citation: null,
        user: null,
        currentMonthEvents: [],
        passag: [],
        notifications: [],
        photosGallery: [],
        photosGalleryIndex: 0,
        todayLabel: new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    },
    mutations: {
        updateUser(state, user) {
            state.user = user;
        },
        updateCitation(state, citation) {
            citation.author = citation.authorSurname ? citation.authorSurname : citation.authorFirstname;
            state.citation = citation;
        },
        updateImmt(state, immt) {
            let day = `${immt.day}`;
            immt.src = `http://absolumentg.fr/assets/img/immt/${immt.year}_${day.padStart(3,'0')}.jpg`;
            state.immt = immt;
        }
    },
    actions: {

    }
});
