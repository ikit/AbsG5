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
        photosGalleryDisplayed: false,
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
            state.photosGallery = [{
                url: immt.src,
                title: immt.title
            }];
            state.photosGalleryIndex = 0;
        },

        photosGalleryReset(state, galery) {
            state.photosGallery = galery;
            state.photosGalleryIndex = 0;
        },
        photosGalleryDisplay(state) {
            state.photosGalleryDisplayed = true;
        },
        photosGalleryHide(state) {
            state.photosGalleryDisplayed = false;
        },
        photosGalleryNext(state) {
            if (state.photosGallery.length > 1) {
                state.photosGalleryIndex++;
                state.photosGalleryIndex %= state.photosGallery.length;
            }
        },
        photosGalleryPrev(state) {
            if (state.photosGallery.length > 1) {
                state.photosGalleryIndex--;
                state.photosGalleryIndex %= state.photosGallery.length;
                if (state.photosGalleryIndex < 0) {
                    state.photosGalleryIndex = state.photosGallery.length - 1;
                }
            }
        },
        photosGallerySetIndex(state, index) {
            state.photosGalleryIndex = index;
        },
    },
        actions: {
            photosGalleryNext(context) {
                state.photosGalleryIndex = 0;
            }
    }
});
