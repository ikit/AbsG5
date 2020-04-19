import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import { getModuleInfo, getPeopleAvatar } from './middleware/CommonHelper';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        citation: null, // la citation aléatoire
        user: null, // les infos sur l'utilisateur connecté
        notifications: [], // les notifications affichées dans la bar d'application

        immt: null,
        currentMonthEvents: [], // les événements du mois en cours
        passag: [],
        // Galerie photos
        photosGallery: [],
        photosGalleryIndex: 0,
        photosGalleryDisplayed: false,
        // Editeur photo
        photoMetadataEditorDisplayed: false,
        agpaMeta: null,
        // Erreur
        errorDisplayed: false,
        error: null
    },
    mutations: {

        onError(state, axiosError) {
            console.log("ERR SERVER", axiosError);
            state.error = axiosError;
            state.errorDisplayed = true;
        },

        setCurrentUser(state, user) {
            if (user) {
                // Get user avatar url
                const idAsStr = `${user.id}`;
                user.avatarUrl = `http://absolumentg.fr/assets/img/avatars/${idAsStr.padStart(3, '0')}.png`;
            } else {
                state.user = null;
            }

            state.user = user;
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
        updateNotifications(state, notifications) {
            state.notifications = notifications.map(e => {
                const m = getModuleInfo(e.module);
                return {
                    module: m,
                    message: e.message,
                    datetime: new Date(e.datetime),
                    dateLabel: format(new Date(e.datetime), "dd MMM h'h'mm", {locale: fr}),
                    user: getPeopleAvatar(e)
                };
            });
        },

        photosGalleryReset(state, galery) {
            state.photosGallery = galery;
            state.photosGalleryIndex = 0;
        },
        photoMetadataEditorDisplay(state) {
            state.photoMetadataEditorDisplayed = true;
        },
        photoMetadataEditorHide(state) {
            state.photoMetadataEditorDisplayed = false;
        },
        photosGalleryDisplay(state) {
            state.photosGalleryDisplayed = true;
        },
        photosGalleryHide(state) {
            state.photosGalleryDisplayed = false;
            state.photoMetadataEditorDisplayed = false;
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
