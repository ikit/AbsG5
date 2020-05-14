<template>
<div>
    <div v-bind:class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }" style="padding: 15px">
        <v-btn
            icon small
            @click="$router.push(`/forum/archives`)">
            <v-icon>fas fa-home</v-icon>
        </v-btn>

        <div style="display: inline-block; margin-left: 15px" v-for="(path, idx) in breadcrumb" :key="idx">
            <router-link :to="{ path: path.url }" tag="button">
                <v-icon left>fas fa-chevron-right</v-icon> {{ path.label }}
            </router-link>
        </div>

        <v-btn
            style="position: absolute; right: 15px; top: 10px"
            @click.stop="newTopic()">
            <v-icon left>fas fa-plus</v-icon>Nouvelle discussion
        </v-btn>
    </div>


    <v-timeline align-top dense style="background: none; margin: auto; max-width: 700px; width: 100%;">
        <v-timeline-item fill-dot color="#fff" v-for="msg in messages" :key="msg.id">
            <template v-slot:icon>
                <div>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <img :src="msg.poster.avatar" v-on="on" style="width: 50px;" />
                        </template>
                        <span>{{ msg.poster.username }} {{ msg.shortLabel }}</span>
                    </v-tooltip>

                    <div class="msgDetails" v-bind:style="{ display: $vuetify.breakpoint.lgAndUp ? 'block' : 'none' }">
                        <span class="name">{{ msg.poster.username }}</span>
                        <span class="date">le {{ msg.dateLabel }}<br/>à {{ msg.timeLabel }}</span>
                    </div>
                </div>

            </template>

            <v-card style="padding: 0 15px">
                <v-list-item-content>
                    <div class="citation" v-html="msg.text"></div>
                </v-list-item-content>
            </v-card>
        </v-timeline-item>
    </v-timeline>

</div>
</template>

<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';
import { differenceInMonths, format } from 'date-fns';

export default {
    data: () => ({
        isLoading: false,
        breadcrumb: [],
        filter: { search: "" }, // un filtre par recherche de mot clés multichamps
        messages: [],
        editorText: "<h1>coucou</h1>"
    }),
    mounted() {
        this.isLoading = true;
        this.topicId = Number.parseInt(this.$route.params.topicId);
        axios.get(`/api/forum/read/${this.topicId}`).then(response => {
            const data = parseAxiosResponse(response);
            this.messages = data.posts;
            this.breadcrumb.push({ label: data.topic.forum.name, url: `/forum/browse/${data.topic.forum.id}` });
            this.breadcrumb.push({ label: data.topic.name, url: `/forum/read/${data.topic.id}` });

            // Si dernière discussion en cours, on scroll à la fin
            // if (this.currentYear === this.todayYear && this.currentMonth === this.todayMonth) {
            //     document.querySelector("last").scrollIntoView();
            // }
        });
    },
    methods: {
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
