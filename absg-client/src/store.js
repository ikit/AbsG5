import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import { webSocket } from "rxjs/webSocket";
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
        unreadNotifications: 0, // le nombre de notification non lu par
        settings: null, // les paramètres actuels du site

        // Galerie photos
        photosGallery: [],
        photosGalleryIndex: 0,
        photosGalleryDisplayed: false,
        // Editeur photo
        photoMetadataEditorDisplayed: false,
        agpaMeta: null,
        // Warning
        warning: {
            displayed: false,
            msg: "",
            log: ""
        },
        // Erreur
        error: {
            displayed: false,
            query: "",
            msg: "",
            log: ""
        }
    },
    mutations: {
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
        updateCitation(state, citation) {
            if (citation) {
                citation.author = citation.author.surname ? citation.author.surname : citation.author.firstname;
            }
            state.citation = citation;
        },
        updateSettings(state, settings) {
            state.settings = settings;
            // TODO: déterminer en fonction de la dernière visite du user si il faut lui afficher l'annonce ou pas (1x par jour pas plus)
        },

        // ========
        // Notification methods
        updateNotifications(state, notifications) {
            state.notifications = state.notifications.concat(notifications.map(e => {
                const m = getModuleInfo(e.module);
                return {
                    module: m,
                    message: e.message,
                    datetime: new Date(e.datetime),
                    dateLabel: format(new Date(e.datetime), "dd MMM h'h'mm", {locale: fr}),
                    url: getPeopleAvatar(e).url,
                    read: new Date(e.datetime).getTime() < new Date(2020, 4, 5).getTime(), // TODO: state.user.lastActivity
                };
            }));
            state.unreadNotifications = state.notifications.filter(e => !e.read ).length;
        },
        readAllNotification(state) {
            for (const n of state.notifications) {
                n.read = true;
            }
            state.unreadNotifications = 0;
        },
        readNotification(state, notification) {
            //const t = notification.datetime.getTime();
            const idx = state.notifications.findIndex( e => e.datetime === notification.datetime)
            if (idx > -1) {

                state.notifications[idx].read = true;
                state.unreadNotifications -= 1;
            }
        },

        // ========
        // Photo gallery methods
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

        onWsMessage(msg) {
            console.log("TODO: processWebsocketMessage", msg);
        },
        onWsError(err) {
            console.log("TODO: processWebsocketError", err);
        },
        onWsCompleted() {
            console.log("TODO: WS closed. ");
        },

        onWarning(state, message) {
            console.log("WARNING", message);
            state.warning.msg =  message;
            state.warning.log = format(new Date(), "yyyy.MM.dd.HH.mm.ss");
            state.warning.displayed = true;
        },
        onError(state, axiosError) {
            console.log("ERROR", axiosError);
            state.error.query = `${axiosError.config.method.toUpperCase()} ${axiosError.config.url}`;
            state.error.htmlError = `${axiosError.request.status} ${axiosError.request.statusText}`;
            state.error.msg =  axiosError;
            state.error.log = format(new Date(), "yyyy.MM.dd.HH.mm.ss");
            state.error.displayed = true;
        },
    },
    actions: {
        initStore(state) {

            if (!state.isInitialized) {
                // On initialise le websocket
                const host = process.env.NODE_ENV === "production" ? `wss://${window.location.hostname}/ws` : `ws://localhost:5011`;
                this.ws = webSocket(host);
                this.ws.subscribe(
                    msg => this.commit("onWsMessage", msg),
                    err => this.commit("onWsError", err),
                    ()  => this.commit("onWsCompleted", err)
                );

                // On récupère les infos de base
                axios.get(`/api/welcom`).then(response => {
                    const data = parseAxiosResponse(response);
                    // On met à jour le modèle
                    this.commit("updateSettings", data.settings);
                    this.commit("updateCitation", data.citation);
                    this.commit("updateNotifications", data.notifications);

                    // On indique que le modèle est initialisé, pour éviter de le refaire
                    state.isInitialized = true;
                    console.log("initStore", state);
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
    }
});
