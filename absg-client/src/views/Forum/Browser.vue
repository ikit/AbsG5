<template>
<div>
    <div v-bind:class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }" style="padding: 15px">

        <router-link :to="{ path: `/forum/browse` }" tag="button">
            <v-icon>fas fa-home</v-icon>
            <span v-if="$vuetify.breakpoint.lgAndUp" style="margin-left: 15px">Liste des forums</span>
        </router-link>

        <div style="display: inline-block; margin-left: 15px" v-for="(path, idx) in breadcrumb" :key="idx">
            <router-link :to="{ path: path.url }" tag="button">
                <v-icon left>fas fa-chevron-right</v-icon> {{ path.label }}
            </router-link>
        </div>

        <!-- <v-btn
            v-if="breadcrumb.length === 1"
            style="position: absolute; right: 15px; top: 10px"
            @click.stop="newTopic()">
            <v-icon left>fas fa-plus</v-icon>Nouvelle discussion
        </v-btn> -->
    </div>


    <v-container>
        <v-card>
            <v-card-title>
                <v-text-field
                    v-model="filter.search"
                    prepend-icon="fas fa-search"
                    label="Rechercher"
                    style="max-width: 300px"
                    single-line
                    hide-details
                ></v-text-field>
            </v-card-title>

            <v-data-table
                :headers="breadcrumb.length === 0 ? headersF : headersS"
                :items="items"
                :search="filter.search"
                :loading="isLoading"
                :hide-default-footer="items.length <= 10"
                loading-text="Récupération des données..."
                no-data-text="Aucune donnée trouvé."
                no-results-text="Aucune donnée trouvé."
                class="elevation-1"
                disable-sort>
                <template v-slot:item="{item}">

                    <router-link v-if="breadcrumb.length === 0" :to="{ path: `/forum/browse/${item.id}` }" tag="tr" style="cursor: pointer">
                        <td style="font-size: 1.1em; font-weight: bold; font-family: 'Comfortaa', sans-serif;">
                            <v-icon>fas fa-archive</v-icon>  {{ item.name }}
                        </td>
                        <td v-if="$vuetify.breakpoint.lgAndUp">{{ item.description }}</td>
                        <td>
                            <img
                                v-if="$vuetify.breakpoint.lgAndUp"
                                :src="item.last.avatar"
                                :alt="item.last.username"
                                style="display: block; margin-right: 15px; float: left; height: 40px"/>
                            <span style="font-weight: bold">{{ item.last.username }}</span>
                            <br/>
                            <span style="opacity: 0.5">{{ item.last.dateLabel }}</span></td>
                    </router-link>

                    <router-link v-if="breadcrumb.length === 1" :to="{ path: `/forum/read/${item.id}#post_${item.last.id}` }" tag="tr" style="cursor: pointer">
                        <td style="font-size: 1em; font-weight: bold; font-family: 'Comfortaa', sans-serif;">
                            <v-icon>far fa-comment-dots</v-icon> {{ item.name }}
                        </td>
                        <td v-if="$vuetify.breakpoint.lgAndUp">{{ item.first.username }}<br/><span style="opacity: 0.5">{{ item.first.dateLabel }}</span></td>
                        <td><img
                                v-if="$vuetify.breakpoint.lgAndUp"
                                :src="item.last.avatar"
                                :alt="item.last.username"
                                style="display: block; margin-right: 15px; float: left; height: 40px"/>
                            <span style="font-weight: bold">{{ item.last.username }}</span>
                            <br/>
                            <span style="opacity: 0.5">{{ item.last.dateLabel }}</span></td>
                    </router-link>
                </template>
            </v-data-table>
        </v-card>
    </v-container>

</div>
</template>

<script>
import axios from 'axios';
import store from '../../store';
import { fr } from "date-fns/locale";
import { differenceInMonths, format } from 'date-fns';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';

export default {
    data: () => ({
        isLoading: false,
        breadcrumb: [],
        filter: { search: "" }, // un filtre par recherche de mot clés multichamps
        headersF: [
            { text: 'Forum', value: 'forum' },
            { text: 'Description', value: 'description' },
            { text: 'Dernier message', value: 'last' }
        ],
        headersS: [
            { text: 'Sujet', value: 'topic' },
            { text: 'Créé', value: 'creation' },
            { text: 'Dernier message', value: 'last' },
        ],
        items: [],
    }),
    watch: {
        $route(change) {
            this.init();
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            const forumId = Number.parseInt(this.$route.params.forumId);
            this.isLoading = true;
            if (forumId) {
                // On récupère la liste des sujets du forum
                axios.get(`/api/forum/browse/${forumId}`).then(response => {
                    const data = parseAxiosResponse(response);
                    this.breadcrumb.push({ label: data.forum.name, url: `/forum/browse/${data.forum.id}` });
                    this.items = data.topics;
                    this.isLoading = false;
                });
            } else {
                // On récupère la liste des forums
                this.breadcrumb = [];
                axios.get(`/api/forum/browse`).then(response => {
                    this.items = parseAxiosResponse(response);
                    this.isLoading = false;
                });
            }
        },
        formatDate(date) {
            return format(new Date(date), "'le' cccc d MMM yyyy 'à' HH:mm", { locale: fr });
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';

</style>
