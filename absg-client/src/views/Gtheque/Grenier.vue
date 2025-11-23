<template>
  <div>
    <div
      :class="{ stickyHeader: $vuetify.display.lgAndUp, stickyHeaderSmall: !$vuetify.display.lgAndUp }"
      style="padding: 15px"
    >
      <router-link
        :to="{ path: `/gtheque/grenier` }"
        tag="button"
      >
        <v-icon>fas fa-home</v-icon>
        <span
          v-if="$vuetify.display.lgAndUp"
          style="margin-left: 15px"
        >Grenier</span>
      </router-link>

      <router-link
        v-for="p of paths"
        :to="{ path: '/gtheque/grenier' + p.path }"
        tag="button"
        :key="p.path"
        style="margin-left: 10px"
      >
        <v-icon>fas fa-chevron-right</v-icon>
        {{ p.label }}
      </router-link>
    </div>
    
    <v-container fluid>
      <v-row
        row
        wrap
      >
        <v-col
          v-for="item in files"
          :key="item.name"
          style="width: 300px; max-width: 300px; margin: 15px;"
        >
          <router-link
            v-if="item.type === 'folder'"
            :to="{path: `/gtheque/grenier/${item.path}`}"
            style="text-decoration: none"
          >
            <v-card style="display: block; ">
              <v-img
                :src="item.thumb"
                aspect-ratio="1.5"
              />

              <v-card-title
                primary-title
                style="position: relative"
              >
                {{ item.name }}
              </v-card-title>
              <v-card-subtitle>
                {{ item.comment }}
              </v-card-subtitle>
            </v-card>
          </router-link>

          <a 
            v-else 
            target="_blank" 
            :href="item.url"
            @click="logClickOnMedia(item)"
            style="text-decoration: none">
            <v-card>
              <v-img
                :src="item.thumb"
                aspect-ratio="1.7"
              />

              <v-card-title
                primary-title
                style="position: relative"
              >
                {{ item.name }}
              </v-card-title>
              <v-card-subtitle>
                {{ item.date }} par {{ item.author }} - {{ item.size }}
              </v-card-subtitle>
            </v-card>
          </a>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>


<script>
import Vue from 'vue';
import axios from 'axios';
import { mapState } from 'vuex';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';

export default {
    data: () => ({
        tree: [],
        files: [],
        paths: []
    }),
    watch: {
        $route(change) {
            console.log(change)
            this.loadPath(change.params[0]);
        }
    },
    mounted () {
        axios.get(`/api/gtheque/grenary`).then(response => {
            this.tree = parseAxiosResponse(response);
            this.files = this.tree;
            this.loadPath(this.$route.params[0])
        });
    },
    methods: {
        loadPath(path) {
            if (path && path.startsWith("/")) {
              path = path.substr(1);
            }
            const parts = path ? path.split("/") : [];
            let currentPath = "";
            this.paths = parts.map(p => {
                currentPath += "/" + p;
                return {
                    label: p,
                    path: currentPath
                };
            });

            let result = this.tree;
            for (const p of this.paths) {
              result = result.find(f => p.path.startsWith(f.path)).content;
              
            }
            this.files = Array.isArray(result) ? result : result.content;
        },

        logClickOnMedia(item) {
          axios.post(`/api/gtheque/grenary/click-on-media`, item);
        }
    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
h1 {
    font-size: 200px;
    line-height: 400px;
}
hr {
    width: 200px;
    border: 1px;
    border-bottom: 1px solid #aaa;
    margin: auto;
    margin-top: -50px;
    margin-bottom: 70px;
}
p {
    text-align: center;
    color: #999;
    font-size: 1.5em;
}
p.token {
    font-family: monospace;
    width: 210px;
    margin: auto;
    margin-top: 50px;
    border: 1px solid #999;
    background: #fff;
    text-align: center
}
</style>
