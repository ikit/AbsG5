<template>
  <div>
    <div
      :class="{ stickyHeader: $vuetify.display.lgAndUp, stickyHeaderSmall: !$vuetify.display.lgAndUp }"
      style="padding: 15px"
    >
      <router-link
        :to="{ path: `/forum/browse` }"
        tag="button"
      >
        <v-icon>fas fa-home</v-icon>
        <span
          v-if="$vuetify.display.lgAndUp"
          style="margin-left: 15px"
        >Liste des forums</span>
      </router-link>

      <div
        v-for="(path, idx) in breadcrumb"
        :key="idx"
        style="display: inline-block; margin-left: 15px"
      >
        <router-link
          :to="{ path: path.url }"
          tag="button"
        >
          <v-icon start>
            fas fa-chevron-right
          </v-icon> {{ path.label }}
        </router-link>
      </div>

      <!-- <v-btn
            v-if="breadcrumb.length === 1"
            style="position: absolute; right: 15px; top: 10px"
            @click.stop="newTopic()">
            <v-icon start>fas fa-plus</v-icon>Nouvelle discussion
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
          />
          <v-spacer />
          <v-btn
            v-if="$vuetify.display.mdAndUp"
            :disabled="topicEditor.disabled"
            @click.stop="newTopic()"
          >
            <v-icon start>
              fas fa-plus
            </v-icon>
            <span>Nouvelle discussion</span>
          </v-btn>
          <v-btn
            v-else
            fab
            small
            @click.stop="newTopic()"
          >
            <v-icon>fas fa-plus</v-icon>
          </v-btn>
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
          disable-sort
        >
          <template #item="{item}">
            <router-link
              v-if="breadcrumb.length === 0"
              :to="{ path: item.id === 2 ? `/forum/tbz` : `/forum/browse/${item.id}` }"
              tag="tr"
              style="cursor: pointer"
              :style="{ opacity: item.archived ? '0.5' : '1'}"
            >
              <td style="font-size: 1.1em; font-weight: bold; font-family: 'Comfortaa', sans-serif;">
                <v-icon>fas fa-archive</v-icon>  {{ item.name }}
              </td>
              <td v-if="$vuetify.display.lgAndUp">
                {{ item.description }}
              </td>
              <td>
                <img
                  v-if="$vuetify.display.lgAndUp"
                  :src="item.last.avatar"
                  :alt="item.last.username"
                  style="display: block; margin-right: 15px; float: left; height: 40px"
                >
                <span style="font-weight: bold">{{ item.last.username }}</span>
                <br>
                <span style="opacity: 0.5">{{ item.last.dateLabel }}</span>
              </td>
            </router-link>

            <router-link
              v-if="breadcrumb.length === 1"
              :to="{ path: `/forum/read/${item.id}#post_${item.last.id}` }"
              tag="tr"
              style="cursor: pointer"
            >
              <td style="font-size: 1em; font-weight: bold; font-family: 'Comfortaa', sans-serif;">
                <v-icon>far fa-comment-dots</v-icon> {{ item.name }}
              </td>
              <td v-if="$vuetify.display.lgAndUp">
                {{ item.first.username }}<br><span style="opacity: 0.5">{{ item.first.dateLabel }}</span>
              </td>
              <td>
                <img
                  v-if="$vuetify.display.lgAndUp"
                  :src="item.last.avatar"
                  :alt="item.last.username"
                  style="display: block; margin-right: 15px; float: left; height: 40px"
                >
                <span style="font-weight: bold">{{ item.last.username }}</span>
                <br>
                <span style="opacity: 0.5">{{ item.last.dateLabel }}</span>
              </td>
            </router-link>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <v-dialog
      v-model="topicEditor.open"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          Nouvelle discussion
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <v-row
            row
            wrap
          >
            <v-col cols="12">
              <v-autocomplete
                v-model="topicEditor.forum"
                prepend-icon="fas fa-archive"
                label="Forum"
                :items="topicEditor.forumsList"
                item-title="name"
                item-value="id"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="topicEditor.title"
                prepend-icon="fas fa-quote-left"
                label="Titre de la discussion"
              />
            </v-col>
            <v-col cols="12">
              <TextEditor
                ref="msgEditor"
                v-model="topicEditor.msg"
                style="max-height: 80vh"
              />
            </v-col>

            <VEmojiPicker
              v-if="topicEditor.displayEmojis"
              :emojis-by-row="10"
              :show-search="false"
              style="width: 100%; margin-top: 10px;"
              @select="selectEmoji"
            />
          </v-row>
        </v-container>
        <v-card-actions>
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
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="resetDialog()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            @click="saveTopic()"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import store from '../../store';
import { fr } from "date-fns/locale";
import { differenceInMonths, format } from 'date-fns';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';
import TextEditor from '../../components/TextEditor.vue';
import VEmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

export default {
    components: {
        TextEditor,
        VEmojiPicker
    },
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
        topicEditor: {
            disabled: true,
            open: false,
            forum: null,
            forumsList: [],
            title: "",
            msg: "",
            displayEmojis: false,
        },
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
                    this.topicEditor.disabled = data.forum.archived,
                    this.topicEditor.forumsList = [data.forum];
                    this.topicEditor.forum = data.forum;
                    this.isLoading = false;
                });
            } else {
                // On récupère la liste des forums
                this.breadcrumb = [];
                axios.get(`/api/forum/browse`).then(response => {
                    this.items = parseAxiosResponse(response);
                    this.topicEditor.disabled = false,
                    this.topicEditor.forumsList = this.items.filter(f => f.id !== 2 && !f.archived);
                    this.topicEditor.forum = this.items[0];
                    this.isLoading = false;
                });
            }
        },
        formatDate(date) {
            return format(new Date(date), "'le' cccc d MMM yyyy 'à' HH:mm", { locale: fr });
        },

        // On affiche ou masque les smilies
        switchSmilies() {
            this.topicEditor.displayEmojis = !this.topicEditor.displayEmojis;
        },

        selectEmoji(emoji) {
            this.$refs.msgEditor.insert(emoji.data);
        },

        newTopic() {
            this.topicEditor.open = true;
            this.topicEditor.forumId = null;
            this.topicEditor.title = ""
        },
        resetDialog() {
            this.topicEditor.open = false;
        },
        saveTopic() {
            const formData = new FormData();
            formData.append("forumId", this.topicEditor.forum.id);
            formData.append("topicTitle", this.topicEditor.title);
            formData.append("text", this.topicEditor.msg);
            axios.post(`/api/forum/post`, formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                }
            })
            .then( response => {
                const msg = parseAxiosResponse(response);
                this.$router.push({ path: `/forum/read/${msg.topic.id}`})
            })
            .catch( err => {
                store.commit('onError', err);
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';

</style>
