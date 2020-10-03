<template>
<div>
    <v-tabs centered v-model="activeTab">
        <v-tab :to="{path: `/forum/tbz`}">
            <template >
                <v-badge right color="accent" :value="tbzNnewMessages">
                    <template v-slot:badge>
                        <span>{{ tbzNnewMessages }}</span>
                    </template>
                    <v-icon left>far fa-comment-dots</v-icon> T.B.Z.
                </v-badge>
            </template>
        </v-tab>
        <v-tab v-for="t in topics" :key="t.forumId" :to="{path: `/forum/read/${t.id}`}">
            <template >
                <v-badge right color="accent" :value="t.newMessages ? t.newMessages : 0">
                    <template v-slot:badge>
                        <span>{{ t.newMessages}}</span>
                    </template>
                    <v-icon left>far fa-comment-dots</v-icon> {{ t.name }}
                </v-badge>
            </template>
        </v-tab>
        <v-tab :to="{path: `/forum/browse`}"> <v-icon left>fas fa-archive</v-icon> Forums</v-tab>
    </v-tabs>

    <router-view></router-view>
</div>
</template>

<script>
import axios from 'axios';
import store from '../store';
import { parseAxiosResponse, parseWsMessage } from '../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        activeTab: `/forum/tbz#last`, // On charge la discussion TBZ à la date du jour par défaut
        topics: [],
        tbzNnewMessages: 0
    }),
    mounted () {
        // On s'abonne aux notifications temps réels pour mettre à jours les notifications
        this.$options.sockets.onmessage = (wsMsg) => {
            const data = parseWsMessage(wsMsg);
            if (data.message === "pinnedTopicsChanged") {
                this.topics = data.payload;
            }
        };

        this.updatePinnedTopics();
    },
    beforeDestroy() {
        // On se désabonne aux notifications temps réels quand on quitte la section forum
        delete this.$options.sockets.onmessage;
    },

    methods: {
        updatePinnedTopics() {
            axios.get(`/api/forum/pinnedTopics`).then(response => {
                this.topics = parseAxiosResponse(response);
            });
        },
    }
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';
</style>
