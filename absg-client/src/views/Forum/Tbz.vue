<template>
<div>
    <v-container fluid  grid-list-md style="padding:0">
        <v-data-iterator
            :items="messages"
            hide-default-footer>

            <template v-slot:header>
                <div v-bind:class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
                    <v-row style="padding: 15px" align="center" justify="center">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    :disabled="isLoading">
                                    <v-icon>fas fa-angle-double-left</v-icon>
                                </v-btn>
                            </template>
                            <span>Revenir un an en arrière</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    :disabled="isLoading">
                                    <v-icon>fa-chevron-left</v-icon>
                                </v-btn>
                            </template>
                            <span>Revenir un mois en arrière</span>
                        </v-tooltip>
                        <span class="grey--text" >
                            Avril 2020
                        </span>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    :disabled="isLoading">
                                    <v-icon>fa-chevron-right</v-icon>
                                </v-btn>
                            </template>
                            <span>Aller au mois suivant</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    :disabled="!isLoading">
                                    <v-icon>fas fa-angle-double-right</v-icon>
                                </v-btn>
                            </template>
                            <span>Aller à l'année suivante</span>
                        </v-tooltip>
                    </v-row>
                </div>
            </template>


            <template v-slot:default="props">
                <v-timeline align-top dense style="background: none; margin: auto; max-width: 700px; width: 100%;">
                    <v-timeline-item fill-dot color="#fff" v-for="msg in messages" :key="msg.id">
                        <template v-slot:icon>
                            <div>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <img :src="msg.poster.avatar" v-on="on" style="width: 50px;" />
                                    </template>
                                    <span>{{ msg.poster.username }} {{ msg.dateLabel }}</span>
                                </v-tooltip>

                                <div class="msgDetails" v-bind:style="{ display: $vuetify.breakpoint.lgAndUp ? 'block' : 'none' }">
                                    <span class="name">{{ msg.poster.username }}</span>
                                    <span class="date">{{ msg.dateLabel }}</span>
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
            </template>
        </v-data-iterator>
        <a name="last"></a>
    </v-container>
</div>
</template>

<script>
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '@ckeditor/ckeditor5-build-classic/build/translations/fr';
import VueCkeditor from 'vue-ckeditor5';
import VueSplitter from "@rmp135/vue-splitter"


import axios from 'axios';
import { parseAxiosResponse } from '../../middleware/CommonHelper';


export default {
    components: {
        'vue-ckeditor': VueCkeditor.component,
        VueSplitter
    },
    data: () => ({

        users: {
            2: {
                id: 2,
                avatar: `/img/avatars/002.png`,
                username: 'Olive',
                rootFamily: 'gueudelot',
            },
            13: {
                id: 13,
                avatar: `/img/avatars/013.png`,
                username: 'Poupette',
                rootFamily: 'guyomard'
            },
            15: {
                id: 15,
                avatar: `/img/avatars/015.png`,
                username: 'Sylve',
                rootFamily: 'guibert',
            }
        },
        messages: [],
        currentUser: {
            id: 2,
            username: 'Olivier'
        }
    }),
    mounted() {
        // On récupère les paramètres de filtrage/pagination en query paramter
        const year = Number.isInteger(this.$route.query.y) ? this.$route.query.y : new Date().getFullYear();
        const month = Number.isInteger(this.$route.query.m) ? this.$route.query.m : new Date().getMonth();
        console.log("RETRIEVE ", year, month);

        axios.get(`/api/forum/tbz/${year}/${month}`).then(response => {
                const data = parseAxiosResponse(response);
                this.messages = data;
                console.log("Read", this.messages);
        });

    },
    methods: {
        ckInput(newValue, instance, eventInfo, batch) {
            console.log("ckInput", newValue, instance, eventInfo, batch)
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
    width: 100%;
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
