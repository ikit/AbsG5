<template>
  <div>
    <div
      :class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }"
      style="padding: 15px"
    >
      <v-btn
        icon
        small
        @click="$router.push(`/forum/archives`)"
      >
        <v-icon>fas fa-home</v-icon>
      </v-btn>

      <div
        v-for="(path, idx) in breadcrumb"
        :key="idx"
        style="display: inline-block; margin-left: 15px"
      >
        <router-link
          :to="{ path: path.url }"
          tag="button"
        >
          <v-icon left>
            fas fa-chevron-right
          </v-icon> {{ path.label }}
        </router-link>
      </div>


      <v-tooltip
        v-if="topicId && topicId > 0"
        bottom
      >
        <template #activator="{ on }">
          <v-btn
            icon
            small
            :color="pinned ? 'accent' : 'default'"
            style="margin-left: 20px"
            v-on="on"
            @click.stop="switchPin()"
          >
            <v-icon>fas fa-thumbtack</v-icon>
          </v-btn>
        </template>
        <span v-if="!pinned">Mettre le sujet en accès direct</span>
        <span v-if="pinned">Retirer le sujet des accès direct</span>
      </v-tooltip>

      <!-- <v-btn
            style="position: absolute; right: 15px; top: 10px"
            @click.stop="newTopic()">
            <v-icon left>fas fa-plus</v-icon>Nouvelle discussion
        </v-btn> -->
    </div>

    <Reader ref="messageReader" />
  </div>
</template>

<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';
import { differenceInMonths, format } from 'date-fns';
import Reader from "./Reader";

export default {
    components: {
        Reader
    },
    data: () => ({
        isLoading: false,
        breadcrumb: [],
        pinned: false,
    }),
    mounted() {
        this.isLoading = true;
        this.topicId = Number.parseInt(this.$route.params.topicId);
        axios.get(`/api/forum/read/${this.topicId}`).then(response => {
            const data = parseAxiosResponse(response);
            this.$refs.messageReader.initTopic(data);

            this.breadcrumb.push({ label: data.topic.forum.name, url: `/forum/browse/${data.topic.forum.id}` });
            this.breadcrumb.push({ label: data.topic.name, url: `/forum/read/${data.topic.id}` });
            this.pinned = data.topic.pinned;
        });
    },
    methods: {
        switchPin() {
            axios.get(`/api/forum/topic/${this.topicId}/switchPin`).then(response => {
                const topic = parseAxiosResponse(response);
                this.pinned = topic.pinned;
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';

.msgDetails {
    position: absolute;
    text-align: right;
    top: 0;
    right: 80px;
    width: 200px;
    font-size: 0.9em;
    font-family: "Comfortaa", sans-serif;

    span {
        display: block;
    }
    .name {
        font-weight: bold;
    }
    .date {
        opacity: 0.5;
    }
}

</style>
