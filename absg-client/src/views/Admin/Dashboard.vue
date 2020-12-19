<template>
  <div class="row">
      <v-card class="column" style="margin: 15px">
        <v-card-title class="grey lighten-4">
          Evénements
        </v-card-title>
        <v-data-table
          :headers="notificationsHeaders"
          :items="notifications"
          items-per-page="10"
          loading-text="Récupération des notifications..."
          height="100%"
          class="notifications"
        >
          <template #item="{item}">
            <tr
              :class="{ 'unreadNotification': !item.read }"
              @click="onNotificationClicked(item)"
            >
              <td>
                <img
                  :src="item.url"
                  height="40px"
                >
              </td>
              <td>
                <div style="display: flex;">
                  <v-icon style="flex">
                    {{ item.module.icon }}
                  </v-icon>
                  <span style="display: inline-block; margin-left: 15px; line-height: 25px">{{ item.message }}</span>
                </div>
              </td>
              <td>{{ item.dateLabel }}</td>
              <td>
                <v-simple-checkbox
                  v-model="item.read"
                  disabled
                />
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>


  <div class="column" style="margin: 15px">
        <v-card>
            <v-card-title class="grey lighten-4">
                Outils
            </v-card-title>
            <a class="tool" style="margin: 15px;" href="https://pgadmin.absolumentg.fr" target="_blank">
                <img src="/img/pgadmin.png" width="100px" />
                <p>pgAdmin</p>
            </a>
            <a class="tool" style="margin: 15px;" href="https://pgadmin.absolumentg.fr" target="_blank">
                <img src="/img/pgadmin.png" width="100px" />
                <p>Logs systèmes</p>
            </a>
            <a class="tool" style="margin: 15px;" href="https://console.online.net/fr/account/home" target="_blank">
                <img src="/img/dedibox.jpg" width="200px" />
                <p>Dedibox</p>
            </a>
        </v-card>

        <v-card style="margin-top: 15px">
            <v-card-title class="grey lighten-4">
                Monitoring
            </v-card-title>

            occupation RAM, stats dockers, taille files assets, taille db/tables
        </v-card>
    </div>
  </div>
</template>


<script>
import Vue from 'vue';
import store from "../../store";
import axios from "axios";
import { MODULES, parseAxiosResponse } from  "../../middleware/CommonHelper";
import { mapState } from "vuex";

export default {
    store,
    data: () => ({
        notifications: [],
        notificationsHeaders: [
            { text: "Qui", value: "who" },
            { text: "Quoi", value: "what" },
            { text: "Quand", value: "when" },
            { text: "", value: "read" },
        ],
    }),
    mounted() {
        this.refreshLogs();
    },
    methods: {
        refreshLogs() {
            axios.get("/api/notifications").then( response => {
                const notifications = parseAxiosResponse(response);
                this.notifications = notifications;
            })
        },
    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

.tool {
    display: inline-block;
    widows: 100px;
    text-align: center;
    font-weight: bold;
    text-decoration: none;
}
</style>
