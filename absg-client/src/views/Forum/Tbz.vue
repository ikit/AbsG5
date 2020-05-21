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
                                    text
                                    v-on="on"
                                    :disabled="isLoading || (currentYear == 2004 && currentMonth == 0)"
                                    @click="go(2004, 0)">
                                    Janvier 2004
                                </v-btn>
                            </template>
                            <span>Premier message</span>
                        </v-tooltip>

                        <div>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        icon small
                                        v-on="on"
                                        @click="goByMonths(-12)"
                                        :disabled="isLoading || currentYear < 2015">
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
                                        @click="goByMonths(-1)"
                                        :disabled="isLoading || currentYear < 2004 || (currentYear == 2004 && currentMonth == 0)">
                                        <v-icon>fa-chevron-left</v-icon>
                                    </v-btn>
                                </template>
                                <span>Revenir un mois en arrière</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        text
                                        v-on="on"
                                        width="200px"
                                        :disabled="isLoading">
                                        {{ monthLabels[currentMonth] }} {{ currentYear }}
                                    </v-btn>
                                </template>
                                <span>Modifier directement la date en cours</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        icon small
                                        v-on="on"
                                        @click="goByMonths(1)"
                                        :disabled="isLoading || currentYear > todayYear || (currentYear == todayYear && currentMonth == todayMonth)">
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
                                        @click="goByMonths(12)"
                                        :disabled="isLoading || currentYear >= todayYear || (currentYear == todayYear -1 && currentMonth > todayMonth)">
                                        <v-icon>fas fa-angle-double-right</v-icon>
                                    </v-btn>
                                </template>
                                <span>Aller à l'année suivante</span>
                            </v-tooltip>
                        </div>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    text
                                    v-on="on"
                                    @click="go(todayYear, todayMonth, true)"
                                    :disabled="isLoading || (currentYear === todayYear && currentMonth === todayMonth)">
                                    Aujourd'hui
                                </v-btn>
                            </template>
                            <span>Dernier message</span>
                        </v-tooltip>
                    </v-row>
                </div>
            </template>

            <template v-slot:no-data>
                <div v-if="currentYear === todayYear && currentMonth === todayMonth" style="text-align: center; margin-top: 50px">
                    <img src="/img/zaffa-notfound.png"/>
                    <h1>Aucun message pour l'instant.</h1>
                    <p style="font-style: italic; opacity: 0.5">Soyez le premier à lancer la discussion en listant les événements majeures à ne pas louper ce mois-ci !</p>
                    <div style="max-width:700px; width: 100%; margin: auto; text-align: left;">
                        <tiptap-vuetify v-model="editorText" :extensions="extensions" placeholder="Rédigez ici votre nouveau message"
                            style="width: 100%; min-height: 200px; max-height: calc(100vh - 150px); overflow: auto"/>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    text
                                    v-on="on"
                                    @click="post()">
                                    Envoyer ma réponse
                                </v-btn>
                            </template>
                            <span>Poster votre message sur le forum</span>
                        </v-tooltip>
                    </div>
                </div>
                <div v-else style="text-align: center; margin-top: 50px">
                    <img src="/img/zaffa-notfound.png"/>
                    <h1>Il n'y a eu aucun message pour ce mois-ci.</h1>
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

                        <v-card class="msg" style="padding: 0 15px">
                            <div class="msgControls">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <a v-on="on" @click="edit(msg)">Editer</a>
                                    </template>
                                    <span>Modifier le message</span>
                                </v-tooltip>
                                -
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <a v-on="on" @click="supr(msg)">Supprimer</a>
                                    </template>
                                    <span>Supprimer le message</span>
                                </v-tooltip>

                            </div>
                            <v-list-item-content>
                                <div v-html="msg.text"></div>
                            </v-list-item-content>
                        </v-card>
                    </v-timeline-item>
                </v-timeline>

            </template>
        </v-data-iterator>
        <a id="last" name="last"></a>

        <v-card v-bind:class="{ largeEditor: $vuetify.breakpoint.lgAndUp, compactEditor: !$vuetify.breakpoint.lgAndUp }">
            <TextEditor ref="textEditor" v-model="editorText"></TextEditor>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn
                        style="margin: 5px 0 -5px 0;"
                        v-on="on"
                        @click="post()">
                        Envoyer
                    </v-btn>
                </template>
                <span>Poster votre nouveau message sur le forum</span>
            </v-tooltip>
        </v-card>
    </v-container>
</div>
</template>

<script>
import axios from 'axios';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { addMonths, addYears } from 'date-fns';
import { TiptapVuetify, Heading, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList,
ListItem, Link, Blockquote, HardBreak, Image } from 'tiptap-vuetify'

import TextEditor from '../../components/TextEditor.vue';



export default {
    components: {
        TextEditor
    },
    data: () => ({
        monthLabels: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        todayYear: 0,
        todayMonth: 0,
        currentYear: 0,
        currentMonth: 0,
        messages: [],
        editorText: "",

        extensions: [
            Bold,
            Underline,
            Strike,
            Blockquote,
            Link,
            ListItem,
            BulletList,
            OrderedList,
            [
                Heading, {
                options: {
                    levels: [1, 2, 3]
                }
            }],
            HardBreak
        ]
    }),
    mounted() {
        const today = new Date();
        this.todayYear = today.getFullYear();
        this.todayMonth = today.getMonth();

        // On récupère les paramètres de filtrage/pagination en query paramter
        this.currentYear = Number.parseInt(this.$route.query.y); // ? this.$route.query.y : this.todayYear;
        this.currentMonth = Number.parseInt(this.$route.query.m); // ? this.$route.query.m : this.todayMonth;
        this.currentYear = Number.isSafeInteger(this.currentYear) ? this.currentYear :  this.todayYear;
        this.currentMonth = Number.isSafeInteger(this.currentMonth) && this.currentMonth >= 0 && this.currentMonth <= 11 ? this.currentMonth : this.todayMonth;
        this.go(this.currentYear, this.currentMonth);

    },
    watch: {
        editorText: {
            handler: "onEditorTextChange"
        }
    },
    methods: {
        // Récupère les messages de la période demandé et les affiches
        go(year, month) {

            this.currentYear = year;
            this.currentMonth = month;
            axios.get(`/api/forum/tbz/${year}/${month}`).then(response => {
                const data = parseAxiosResponse(response);
                this.messages = data;

                // Si dernière discussion en cours, on scroll à la fin
                // if (this.currentYear === this.todayYear && this.currentMonth === this.todayMonth) {
                //     document.querySelector("last").scrollIntoView();
                // }
            });
        },

        // Additionne (ou soustrait) le nombre de mois demandé et affiche les messages
        goByMonths(months) {
            const date = addMonths(new Date(this.currentYear, this.currentMonth), months);
            this.go(date.getFullYear(), date.getMonth());
        },

        // Quand le texte change, on sauvegarde le brouillon ()
        onEditorTextChange(event) {
            // TODO: save draft every 10s
            // console.log("onEditorTextChange", event);
        },

        // Décide si le fichier peut être attaché au message (et uploadé sur le serveur)
        // On accepte tout, mais taille  de 200Mo max
        checkAttachment(attachment) {
            return attachment && attachment.file && attachment.file.size / 1024  <= 200000;
        },

        // Si la pièce jointe a été accepté, on la télécharge sur le serveur avant de l'insérer dans le message
        onAddAttachment(event) {
            if (event && event.attachment && event.attachment.file) {
                // On récupère la pièce jointe poussé par l'utilisateur
                const file = event.attachment.file;

                // On cré le form data qui va permettre d'uploader le fichier sur le serveur
                const formData = new FormData()
                formData.append("file", file)

                axios.post(`/api/forum/uploadFile`, formData, {
                    headers: {
                        "Content-Type" : "multipart/form-data",
                    },
                    onUploadProgress: progressEvent => {
                        event.attachment.setUploadProgress = (progressEvent.loaded / progressEvent.total * 100 | 0);
                    }
                })
                .then( response => {
                    const uploadedFile = parseAxiosResponse(response);
                    // on indique à l'éditur que l'upload de l'image a réussi en lui donnant l'adresse du fichier sur le serveur
                    event.attachment.setAttributes({
                        url: uploadedFile.url,
                        href: `${uploadedFile.url}?content-disposition=attachment`
                    });

                })
                .catch( err => {
                    store.commit('onError', err);
                });
            }


        },

        // Si on retire la pièce jointe, on prévient le serveur de la supprimer aussi pour libérer la place
        onRemoveAttachment(event) {
            axios.delete(`/api/forum/uploadFile/${encodeURI(event.attachment.attributes.values.url)}`)
                .catch( err => {
                    store.commit('onError', err);
                });
        },

        // On enregistre le message
        post() {
            const formData = new FormData();
            formData.append("forumId", 2);
            formData.append("topicId", null);
            formData.append("text", this.editorText);
            console.log(this.editorText);
            console.log(formData.get("text"))
            axios.post(`/api/forum/post`, formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                }
            })
            .then( response => {
                this.messages.push(parseAxiosResponse(response));
            })
            .catch( err => {
                store.commit('onError', err);
            });
        },

        edit(msg) {
            console.log("Edition du message", msg.id);
        },

        supr(msg) {
            console.log("Suppression du message", msg.id);
        }

    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';


h1 {
    font-size: 2em;
    line-height: 50px;
    margin-bottom: 50px;
}

.msg {
    position: relative;
    margin-right: 5px;
}
.msgControls {
    display: none;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 0.8em;
    background: #eee;
    padding-right: 5px;
    text-align: right;
}
.msg:hover .msgControls {
    display: block;
}


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

blockquote {
    border-left: .25em solid #dfe2e5;
    color: #6a737d;
    padding-left: 1em;
    margin: 20px 0 10px 20px!important;
}

.largeEditor {
    max-width: 700px;
    padding: 15px;
    margin: auto;
    margin-bottom: 25px;
    background-image: repeating-linear-gradient(-45deg, transparent 0, transparent 5px, #00000020 5px, #00000020 10px);
}

.compactEditor {
    max-width: 700px;
    padding: 5px;
    margin: auto;
    background-image: repeating-linear-gradient(-45deg, transparent 0, transparent 5px, #00000020 5px, #00000020 10px);
}

</style>
