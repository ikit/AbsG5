import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from './middleware/CommonHelper';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        isInitialized: false, // est-ce que le store a été initialisé ou pas
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
        error: {
            displayed: false,
            query: "",
            msg: "",
            log: ""
        }
    },
    mutations: {
        initStore(state) {
            if (!state.isInitialized) {
                axios.get(`/api/welcom`).then(response => {
                    const data = parseAxiosResponse(response);
                    // Paramètres du site et annonces
                    state.settings = data.settings;
                    // TODO: déterminer en fonction de la dernière visite du user si il faut lui afficher l'annonce ou pas (1x par jour pas plus)

                    // La citation aléatoire
                    if (data.citation) {
                        data.citation.author = data.citation.author.surname ? data.citation.author.surname : data.citation.author.firstname;
                    }
                    state.citation = data.citation;

                    // Les notifications
                    state.notifications = data.notifications

                    // On indique que le modèle est initialisé, pour éviter de le refaire
                    state.isInitialized = true;
                });
            }
        },
        initAGPA(state) {
            if (!state.agpaMeta) {
                axios.get(`/api/agpa`).then(response => {
                    state.agpaMeta = parseAxiosResponse(response);
                });
            }
        },
        setCurrentUser(state, user) {
            if (user) {
                // Get user avatar url
                const idAsStr = `${user.id}`;
                user.avatarUrl = `/img/avatars/${idAsStr.padStart(3, '0')}.png`;
            } else {
                state.user = null;
            }

            state.user = user;
        },
        updateUser(state, user) {
            state.user = user;
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
                    // TODO: read: e.datetime > user.lastRead
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
            // TODO: bind keyboard event
        },
        photosGalleryHide(state) {
            state.photosGalleryDisplayed = false;
            state.photoMetadataEditorDisplayed = false;
            // TODO: unbind keyboard event
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

        onError(state, axiosError) {
            console.log("ERR SERVER", axiosError);
            state.error.query = `${axiosError.config.method.toUpperCase()} ${axiosError.config.url}`;
            state.error.htmlError = `${axiosError.request.status} ${axiosError.request.statusText}`;
            state.error.msg =  axiosError;
            state.error.log = format(new Date(), "yyyy.MM.dd.HH.mm.ss");
            state.error.displayed = true;
        },
    },
    // actions: {
    //     photosGalleryNext(state) {
    //         state.photosGalleryIndex = 0;
    //     }
    // }
});
