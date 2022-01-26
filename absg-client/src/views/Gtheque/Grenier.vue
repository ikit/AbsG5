<template>
  <div>
    <div
      :class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }"
      style="padding: 15px"
    >
      <router-link
        :to="{ path: `/gtheque/grenier` }"
        tag="button"
      >
        <v-icon>fas fa-home</v-icon>
        <span
          v-if="$vuetify.breakpoint.lgAndUp"
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
      <v-layout
        row
        wrap
      >
        <v-flex
          v-for="item in files"
          :key="item.name"
          style="max-width: 400px; margin: 15px"
        >
          <router-link
            v-if="item.type === 'folder'"
            :to="{path: `/gtheque/grenier/${item.path}`}"
            style="text-decoration: none"
          >
            <v-card>
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
          <v-card 
            v-else
            @click.prevent="download(item)"
          >
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
              {{ item.type }} - {{ item.size }}
            </v-card-subtitle>
        </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>


<script>
import Vue from 'vue';
import axios from 'axios';
import { mapState } from 'vuex';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

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
        download(item) {
          console.log("dowload", item);
          axios.get(item.url, { responseType: 'blob' })
            .then(response => {
              console.log(response);
              const blob = new Blob([response.data], { type: `application/${item.type.substr(1)}` });
              saveAs(blob, `${item.name}${item.type}`);
            }).catch(console.error)
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
