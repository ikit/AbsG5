import Vue from "vue";
import VueRouter from "vue-router"
import Home from "./views/Home.vue";
import E404 from "./views/E404.vue";
import Changelog from "./views/Changelog.vue";
import Login from "./views/User/Login.vue";
import NewPassword from "./views/User/NewPassword.vue";
import AskNewPassword from "./views/User/AskNewPassword.vue";
import Profile from "./views/User/Profile.vue";
import axios from "axios";
import store from "./store";
import { checkAutentication, logoutUser, logUser } from "./middleware/AuthHelper";

Vue.use(VueRouter);

export const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/",
            component: Home,
        },
        // Administration
        {
            path: "/admin",
            component: () => import("./views/Admin.vue"),
            children: [
                {
                    path: "",
                    redirect: "/admin/dashboard"
                },
                {
                    path: "dashboard",
                    component: () => import("./views/Admin/Dashboard.vue"),
                },
                {
                    path: "settings",
                    component: () => import("./views/Admin/Settings.vue"),
                },
                {
                    path: "users",
                    component: () => import("./views/Admin/Users.vue"),
                }
            ]
        },
        // Citations
        {
            path: "/citations",
            component: () => import("./views/Citations/Browser.vue"), // import("./views/Citations.vue"),
            // children: [
            //     {
            //         path: "",
            //         redirect: "/citations/browser"
            //     },
            //     {
            //         path: "browser",
            //         component: () => import("./views/Citations/Browser.vue"),
            //     },
            //     {
            //         path: "play",
            //         component: () => import("./views/Citations/Game.vue"),
            //     },
            //     {
            //         path: "stats",
            //         component: () => import("./views/Citations/Stats.vue"),
            //     }
            // ]
        },
        // Photos
        {
            path: "/photos",
            component: () => import("./views/Photos.vue"),
            children: [
                {
                    path: "",
                    redirect: "/photos/immt"
                },
                {
                    path: "immt",
                    component: () => import("./views/Photos/Immt.vue"),
                },
                {
                    path: "albums",
                    component: () => import("./views/Photos/Albums.vue"),
                },
                {
                    path: "browser",
                    component: () => import("./views/Photos/Browser.vue"),
                },
            ]
        },
        // Forum
        {
            path: "/forum",
            component: () => import("./views/Forum.vue"),
            children: [
                {
                    path: "",
                    redirect: "/forum/tbz"
                },
                {
                    path: "tbz",
                    component: () => import("./views/Forum/Tbz.vue"),
                },
                {
                    path: "browse",
                    component: () => import("./views/Forum/Browser.vue"),
                },
                {
                    path: "browse/:forumId",
                    component: () => import("./views/Forum/Browser.vue"),
                },
                {
                    path: "read/:topicId",
                    component: () => import("./views/Forum/Read.vue"),
                }
            ]
        },
        // Agenda
        {
            path: "/agenda",
            component: () => import("./views/Agenda.vue"),
            children: [
                {
                    path: "",
                    redirect: "/agenda/directory"
                },
                {
                    path: "directory",
                    component: () => import("./views/Agenda/Directory.vue"),
                },
                {
                    path: "locations",
                    component: () => import("./views/Agenda/Locations.vue"),
                },
                {
                    path: "events",
                    component: () => import("./views/Agenda/Events.vue"),
                },
                {
                    path: "trombi",
                    component: () => import("./views/Agenda/Trombi.vue"),
                },
                {
                    path: "genealogy",
                    component: () => import("./views/Agenda/Genealogy.vue"),
                }
            ]
        },
        // AGPA
        {
            path: "/agpa",
            component: () => import("./views/Agpa.vue"),
            children: [
                {
                    path: "",
                    redirect: "/agpa/edition"
                },
                {
                    path: "edition",
                    component: () => import("./views/Agpa/Edition.vue"),
                },
                {
                    path: "rules",
                    component: () => import("./views/Agpa/Rules.vue"),
                },
                {
                    path: "archives",
                    component: () => import("./views/Agpa/ArchivesSummary.vue"),
                },
                {
                    path: "archives/:year",
                    component: () => import("./views/Agpa/ArchiveEdition.vue"),
                },
                {
                    path: "archives/:year/:catId",
                    component: () => import("./views/Agpa/ArchiveCategory.vue"),
                },
                {
                    path: "palmares",
                    component: () => import("./views/Agpa/Palmares.vue"),
                },
                {
                    path: "ceremony",
                    component: () => import("./views/Agpa/CeremonyMenu.vue"),
                },
                {
                    path: "ceremony/:year",
                    component: () => import("./views/Agpa/Ceremony.vue"),
                }
            ]
        },
        // Pages uniques
        {
            path: "/login",
            component: Login,
        },
        {
            path: "/resetpwd",
            component: NewPassword,
        },
        {
            path: "/forgotten",
            component: AskNewPassword,
        },
        {
            path: "/myprofile",
            component: Profile,
        },
        {
            path: "/voyag",
            component: () => import("./views/VoyaG.vue"),
        },
        {
            path: "/changelog",
            component: Changelog
        },

        // Error management
        {
            path: "/404",
            component: E404
        },
        {
            path: "*",
            redirect: "/404"
        }
    ]
});

router.beforeEach((to, from, next) => {
    console.log("TEST", to.path);
    // Si la page nécessite une authent ou non
    const publicPages = ["/login", "/forgotten"];
    if (publicPages.includes(to.path)) {
        return next();
    }

    // Si session de secours
    const rescueSession = to.query.session
    if (rescueSession) {
        logUser(store, { id: -1, rescue: true, token: decodeURI(rescueSession) })
        return next("/resetpwd");
    }

    // Si pas d"authent, on redirige vers la page de login
    const user = checkAutentication(store);
    if (!user) {
        return next("/login");
    }


    // Si session marquée comme rescue
    console.log("TODO RESCUE", user);

    // // Si accès restreint et pas le role, on redirige vers l"accueil
    if (rescueSession) {

        return next("/resetpwd");
    }

    next();
  })


// On intercepte les requêtes qui échouent, pour rediriger en conséquence
axios.interceptors.response.use(
    response => {
        return response
    },
    error => {
        // Session invalide, on force la déconnection/reconnection de l"utilisateur
        if (error.response.status === 401) {
            logoutUser(store);
            return router.push("/login");
        }
        // Accès refusé, on redirige vers l"accueil
        if (error.response.status === 403) {
            return router.push("/");
        }
        // Erreur du serveur
        if (error.response.status === 400 || error.response.status === 500) {
            store.commit("onError", error);
            return;
        }

        // Si il s"agit d"une route IHM inconnu on redirige vers 404
        if (!error.config.url.startsWith("/api/")) {
            router.push("/404");
        }
        // Si il s"agit d"une route interne (appel au serveur) on reste sur la même page
        return Promise.reject(error)
    });
