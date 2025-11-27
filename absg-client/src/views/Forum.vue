<template>
  <div>
    <v-tabs
      v-model="activeTab"
      centered
      class="fixed-tabs-bar"
    >
      <v-tab :to="{path: `/forum/tbz`}">
        <v-badge
          right
          color="accent"
          :content="tbzNnewMessages"
          :model-value="tbzNnewMessages > 0"
        >
          <v-icon left>
            far fa-comment-dots
          </v-icon> T.B.Z.
        </v-badge>
      </v-tab>
      <v-tab
        v-for="t in topics"
        :key="t.forumId"
        :to="{path: `/forum/read/${t.id}`}"
      >
        <v-badge
          right
          color="accent"
          :content="t.newMessages || 0"
          :model-value="t.newMessages > 0"
        >
          <v-icon left>
            far fa-comment-dots
          </v-icon> {{ t.name }}
        </v-badge>
      </v-tab>
      <v-tab :to="{path: `/forum/browse`}">
        <v-icon left>
          fas fa-archive
        </v-icon> Forums
      </v-tab>
    </v-tabs>

    <router-view />
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
        if (this.$socket) {
            this._wsHandler = (wsMsg) => {
                const data = parseWsMessage(wsMsg);
                if (data.message === "pinnedTopicsChanged") {
                    this.topics = data.payload;
                }
            };
            this.$socket.addEventListener('message', this._wsHandler);
        }

        this.updatePinnedTopics();
    },
    beforeUnmount() {
        // On se désabonne aux notifications temps réels quand on quitte la section forum
        if (this.$socket && this._wsHandler) {
            this.$socket.removeEventListener('message', this._wsHandler);
        }
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
