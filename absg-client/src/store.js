import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        immt: null,
        citation: null,
        user: null,
        currentMonthEvents: [],
        passag: [],
        notifications: [],
        // Galerie photos
        photosGallery: [],
        photosGalleryIndex: 0,
        photosGalleryDisplayed: false,
        // Editeur photo
        photosEditorDisplayed: false,
        agpaMeta: null,
    },
    mutations: {
        login(state, data) {
            // Get user avatar url
            const idAsStr = `${data.id}`;
            data.avatarUrl = `http://absolumentg.fr/assets/img/avatars/${idAsStr.padStart(3, '0')}.png`;
            console.log("STORE LOGIN", data)

            state.user = data;
        },
        logout(state) {
            console.log("STORE LOGOUT")
            state.user = null;
        },

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
        initAGPA(state) {
            if (!state.agpaMeta) {
                axios.get(`/api/agpa/metadata`).then(response => {
                    state.agpaMeta = response.status === 200 ? response.data : null;
                });
            }
        }
    },
    actions: {
        photosGalleryNext(state) {
            state.photosGalleryIndex = 0;
        }
    }
});
