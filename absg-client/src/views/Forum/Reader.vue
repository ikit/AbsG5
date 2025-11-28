<template>
  <div>
    <v-timeline
      v-if="messages.length > 0"
      align="start"
      density="compact"
      style="background: none; margin: auto; max-width: 700px; width: 100%;"
    >
      <v-timeline-item
        v-for="msg in messages.filter(m => m)"
        :key="msg.id"
        fill-dot
        color="#fff"
      >
        <template #icon>
          <div>
            <v-tooltip bottom>
              <template #activator="{ props }">
                <img
                  :src="msg.poster.avatar"
                  style="width: 50px;"
                  v-bind="props"
                >
              </template>
              <span>{{ msg.poster.username }} ({{ msg.dateLabel }})</span>
            </v-tooltip>

            <div
              class="msgDetails"
              :style="{ display: $vuetify.display.lgAndUp ? 'block' : 'none' }"
            >
              <span class="name">{{ msg.poster.username }}</span>
              <span class="date">le {{ msg.dateLabel }}</span>
            </div>
          </div>
        </template>
        <a
          :id="'post_'+msg.id"
          :ref="'post_'+msg.id"
          :name="'post_'+msg.id"
        />
        <v-card
          class="msg"
          style="padding: 0 15px"
        >
          <div class="msgControls">
            <v-tooltip bottom>
              <template #activator="{ props }">
                <a
                  v-bind="props"
                  @click="edit(msg)"
                >Editer</a>
              </template>
              <span>Modifier le message</span>
            </v-tooltip>
            -
            <v-tooltip bottom>
              <template #activator="{ props }">
                <a
                  v-bind="props"
                  @click="supr(msg)"
                >Supprimer</a>
              </template>
              <span>Supprimer le message</span>
            </v-tooltip>
          </div>
          <div v-html="msg.text" />
        </v-card>
      </v-timeline-item>
    </v-timeline>

    <v-card
      v-if="topicId && !isLoading && !readOnly"
      :class="{ largeEditor: $vuetify.display.lgAndUp, compactEditor: !$vuetify.display.lgAndUp }"
    >
      <TextEditor
        ref="newMsgEditor"
        v-model="newMessageText"
      />
      <div>
        <v-tooltip bottom>
          <template #activator="{ props }">
            <v-btn
              style="margin: 5px 0 -5px 0;"
              v-bind="props"
              @click="post()"
            >
              Envoyer
            </v-btn>
          </template>
          <span>Poster votre nouveau message sur le forum</span>
        </v-tooltip>
        <v-tooltip
          v-if="$vuetify.display.lgAndUp"
          bottom
        >
          <template #activator="{ props }">
            <v-btn
              style="margin: 5px 0 -5px 10px;"
              v-bind="props"
              @click="switchSmilies()"
            >
              Smilies
            </v-btn>
          </template>
          <span>Voir les smilies</span>
        </v-tooltip>
      </div>
      <VEmojiPicker
        v-if="displayEmojis"
        :emojis-by-row="10"
        :show-search="false"
        style="width: 100%; margin-top: 10px;"
        @select="selectEmoji"
      />
    </v-card>

    <v-dialog
      v-model="msgDeletion.open"
      width="800px"
    >
      <v-card v-if="msgDeletion.post">
        <v-card-title class="grey lighten-4">
          Supprimer le message
        </v-card-title>
        <p style="margin: 0 24px;">
          Êtes vous sûr de vouloir supprimer ce message écrit par {{ msgDeletion.post.poster.username }} le {{ msgDeletion.post.dateLabel }}?
        </p>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="msgDeletion.open = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            @click="suprMsg()"
          >
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="editMessageDisplayed"
      persistent
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          Modifier le message
        </v-card-title>
        <TextEditor
          ref="msgEditor"
          v-model="editMessageText"
          style="max-height: 80vh"
        />

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="editMessageDisplayed = null"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            @click="saveMsg()"
          >
            Sauvegarder
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';
import { differenceInMonths, format } from 'date-fns';
import TextEditor from '../../components/TextEditor.vue';
import VEmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

export default {
    name: 'Reader',
    components: {
        TextEditor,
        VEmojiPicker
    },
    props: {
        readOnly: {
            type: Boolean,
            default: () => false,
        },
        forumId: {
            type: Number,
            default: () => null,
        },
        topicId: {
            type: Number,
            default: () => null,
        },
        autoScrollEnd: {
            type: Boolean,
            default: () => true,
        },
    },
    data: () => ({
        isLoading: false,
        messages: [],
        newMessageText: "", // text de l'éditeur de nouveau message
        displayEmojis: false,

        editMessageDisplayed: false, // affichage ou non de l'éditeur de message
        editMessageText: "", // text de l'éditeur de message déjà existant
        editMessageId: null, // l'identifiant du message en cours d'édition

        msgDeletion: {
            open: false, // si oui ou non la boite de dialogue pour confirmer la suppression d'un message est affichée
            post: null, // le message à supprimer
        }
    }),
    mounted() {
        if (Number.isSafeInteger(this.$route.params.topicId)) {
            this.loadTopic(Number.parseInt(this.$route.params.topicId));
        }
    },
    methods: {
        loadTopic(id) {
            this.isLoading = true;
            this.topicId = id;
            axios.get(`/api/forum/read/${this.topicId}`).then(response => {
                const data = parseAxiosResponse(response);
                this.initTopic(data);
                this.isLoading = false;
            });
        },

        initTopic(data) {
            this.messages = data.posts;
            // Si le sujet possède des messages, on scroll automatiquement à la fin de la discussion
            if (this.messages.length > 0) {
                const lastMsg = this.messages[this.messages.length - 1];
                if (lastMsg && lastMsg.id) {
                    setTimeout(() => location.hash = "#post_" + lastMsg.id);
                }
            }
        },

        // On affiche ou masque les smilies
        switchSmilies() {
            this.displayEmojis = !this.displayEmojis;
        },

        selectEmoji(emoji) {
            this.$refs.newMsgEditor.insert(emoji.data);
        },

        // Enregistre un nouveau message
        post() {
            const formData = new FormData();
            formData.append("forumId", this.forumId ? this.forumId : 2);
            formData.append("topicId", this.topicId ? this.topicId : null);
            formData.append("text", this.newMessageText);
            axios.post(`/api/forum/post`, formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                }
            })
            .then( response => {
                this.messages.push(parseAxiosResponse(response));
                this.newMessageText = '';
            })
            .catch( err => {
                store.commit('onError', err);
            });
        },

        // Enregistre les modification apporté à un message
        saveMsg() {
            const formData = new FormData();
            formData.append("forumId", this.forumId ? this.forumId : 2);
            formData.append("topicId", this.topicId ? this.topicId : null);
            formData.append("postId", this.editMessageId);
            formData.append("text", this.editMessageText);
            axios.post(`/api/forum/post`, formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                }
            })
            .then( response => {
                const editedPost = parseAxiosResponse(response);
                const idx = this.messages.findIndex(e => e.id === editedPost.id)
                if (idx >= 0) {
                    this.messages[idx] = editedPost;
                }
                this.$refs.msgEditor.reset();
                this.editMessageDisplayed = false;
            })
            .catch( err => {
                store.commit('onError', err);
            });
        },

        edit(msg) {
            this.editMessageDisplayed = true;
            this.editMessageId = msg.id;
            this.editMessageText = msg.text;
            setTimeout(() => this.$refs.msgEditor.reset(msg.text));
        },

        supr(msg) {
            this.msgDeletion.open = true;
            this.msgDeletion.post = msg;
        },
        suprMsg() {
            axios.delete(`/api/forum/post/${this.msgDeletion.post.id}`)
            .then( response => {
                const idx = this.messages.findIndex(e => e.id === this.msgDeletion.post.id);
                if (idx > -1) {
                    // Maj citation existante
                    this.messages.splice(idx, 1)
                }
                // On met à jour l'IHM
                this.msgDeletion.post = null;
                this.msgDeletion.open = false;
            })
        },



        // Décide si le fichier peut être attaché au message (et uploadé sur le serveur)
        // // On accepte tout, mais taille  de 200Mo max
        // checkAttachment(attachment) {
        //     return attachment && attachment.file && attachment.file.size / 1024  <= 200000;
        // },

        // // Si la pièce jointe a été accepté, on la télécharge sur le serveur avant de l'insérer dans le message
        // onAddAttachment(event) {
        //     if (event && event.attachment && event.attachment.file) {
        //         // On récupère la pièce jointe poussé par l'utilisateur
        //         const file = event.attachment.file;

        //         // On cré le form data qui va permettre d'uploader le fichier sur le serveur
        //         const formData = new FormData()
        //         formData.append("file", file)

        //         axios.post(`/api/forum/uploadFile`, formData, {
        //             headers: {
        //                 "Content-Type" : "multipart/form-data",
        //             },
        //             onUploadProgress: progressEvent => {
        //                 event.attachment.setUploadProgress = (progressEvent.loaded / progressEvent.total * 100 || 0);
        //             }
        //         })
        //         .then( response => {
        //             const uploadedFile = parseAxiosResponse(response);
        //             // on indique à l'éditur que l'upload de l'image a réussi en lui donnant l'adresse du fichier sur le serveur
        //             event.attachment.setAttributes({
        //                 url: uploadedFile.url,
        //                 href: `${uploadedFile.url}?content-disposition=attachment`
        //             });

        //         })
        //         .catch( err => {
        //             store.commit('onError', err);
        //         });
        //     }


        // },

        // // Si on retire la pièce jointe, on prévient le serveur de la supprimer aussi pour libérer la place
        // onRemoveAttachment(event) {
        //     axios.delete(`/api/forum/uploadFile/${encodeURI(event.attachment.attributes.values.url)}`)
        //         .catch( err => {
        //             store.commit('onError', err);
        //         });
        // },
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';



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



.bb-quote, blockquote {
    border-left: .25em solid #dfe2e5;
    color: #6a737d;
    padding-left: 1em;
    margin: 20px 0 10px 20px!important;
}

</style>
