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
        unreadNotifications: 0, // le nombre de notification non lu par
        settings: null, // les paramètres actuels du site
        // Websocket connection
        wsOnline: false, // Est-ce que la connexion temps réelle est active ou non
        wsMessage: null, // Le dernier message reçu
        // Galerie photos
        photosGallery: [],
        photosGalleryIndex: 0,
        photosGalleryDisplayed: false,
        // Editeur photo
        photoMetadataEditorDisplayed: false,
        agpaMeta: null,
        // Notification
        notif: {
            displayed: false,
            title: "",
            msg: "",
            log: ""
        },
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
                user.avatarUrl = `/files/avatars/${idAsStr.padStart(3, '0')}.png`;
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
        updateAgpaMeta(state, meta) {
            state.agpaMeta = meta;
        },
        updateSettings(state, settings) {
            state.settings = settings;
            // TODO: déterminer en fonction de la dernière visite du user si il faut lui afficher l'annonce ou pas (1x par jour pas plus)
        },

        // ========
        // Notification methods
        updateNotifications(state, notifications) {
            state.notifications = notifications.map(e => {
                const m = getModuleInfo(e.module);
                return {
                    id: e.id,
                    module: m,
                    message: e.message,
                    datetime: new Date(e.datetime),
                    dateLabel: format(new Date(e.datetime), "dd MMM HH'h'mm", {locale: fr}),
                    url: getPeopleAvatar(e).url,
                    read: e.read
                };
            });
            console.log(state.notifications.filter(e => !e.read ));
            state.unreadNotifications = state.notifications.filter(e => !e.read ).length;
        },
        readAllNotification(state) {
            for (const n of state.notifications) {
                n.read = true;
            }
            state.unreadNotifications = 0;
            // On notifie le back de marquer comme lu cette notification pour l'utilisateur
            axios.get(`/api/markAsRead/all`);
        },
        readNotification(state, notification) {
            //const t = notification.datetime.getTime();
            const idx = state.notifications.findIndex( e => e.datetime === notification.datetime)
            if (idx > -1) {
                state.notifications[idx].read = true;
                state.unreadNotifications -= 1;
                // On notifie le back de marquer comme lu cette notification pour l'utilisateur
                axios.get(`/api/markAsRead/${notification.id}`);
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

        // ========
        // WEBSOCKETS methods
        SOCKET_ONOPEN (state, event)  {
            Vue.prototype.$socket = event.currentTarget;
            state.wsOnline = true;
        },
        SOCKET_ONCLOSE (state, event)  {
            state.wsOnline = false;
        },
        SOCKET_ONMESSAGE (state, message)  {
            state.wsMessage = message;
        },
        SOCKET_ONERROR (state, event)  {
            console.log("TODO: processWebsocketError", event);
        },
        SOCKET_RECONNECT(state, count) {
            console.log("WS reconnect");
        },
        SOCKET_RECONNECT_ERROR(state) {
            console.log("WS reaconnect error", state);
        },

        // ========
        // NOTIF methods
        onNotif(state, info) {
            state.notif.title = info[0];
            state.notif.msg = info[1];
            state.notif.displayed = true;
        },
        onWarning(state, message) {
            state.warning.msg =  message;
            state.warning.log = format(new Date(), "yyyy.MM.dd.HH.mm.ss");
            state.warning.displayed = true;
        },
        onError(state, axiosError) {
            state.error.query = `${axiosError.config.method.toUpperCase()} ${axiosError.config.url}`;
            state.error.log = format(new Date(), "yyyy.MM.dd.HH.mm.ss");
            state.error.displayed = true;

            if (axiosError.response) {
                state.error.htmlError = `${axiosError.response.status} ${axiosError.response.statusText}`;
                state.error.msg =  axiosError.response.data ? axiosError.response.data.message : axiosError;
            } else {
                state.error.htmlError = `${axiosError.request.status} ${axiosError.request.statusText}`;
                state.error.msg =  axiosError;
            }
        },
    },
    actions: {
        initStore(state) {
            if (!state.isInitialized) {
                // On récupère les infos de base
                axios.get(`/api/welcom`).then(response => {
                    const data = parseAxiosResponse(response);
                    // On met à jour le modèle
                    this.commit("updateSettings", data.settings);
                    this.commit("updateCitation", data.citation);
                    this.commit("updateNotifications", data.notifications);

                    // On indique que le modèle est initialisé, pour éviter de le refaire
                    state.isInitialized = true;
                });
            }
        },
        initAGPA(state) {
            if (!state.agpaMeta) {
                axios.get(`/api/agpa`).then(response => {
                    this.commit("updateAgpaMeta", parseAxiosResponse(response));
                });
            }
        },
        sendWsMessage: function(context, message) {
            console.log("WS send", message);
            Vue.prototype.$socket.sendObj(message)
          }
    }
});
