<template>
  <div class="row">
    <v-card
      class="column"
      style="margin: 15px"
    >
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
            <td>{{ item.dateLabel }}</td>
            <td>
              {{ item.message }}
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>


    <div
      class="column"
      style="margin: 15px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          Outils
        </v-card-title>
        <a
          class="tool"
          style="margin: 15px;"
          href="https://pgadmin.absolumentg.fr"
          target="_blank"
        >
          <img
            src="/img/pgadmin.png"
            width="100px"
          >
          <p>pgAdmin</p>
        </a>
        <a
          class="tool"
          style="margin: 15px;"
          href="https://pgadmin.absolumentg.fr"
          target="_blank"
        >
          <img
            src="/img/pgadmin.png"
            width="100px"
          >
          <p>Logs systèmes</p>
        </a>
        <a
          class="tool"
          style="margin: 15px;"
          href="https://console.online.net/fr/account/home"
          target="_blank"
        >
          <img
            src="/img/dedibox.jpg"
            width="200px"
          >
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
import store from "../../store";
import axios from "axios";
import { MODULES, parseAxiosResponse } from  "../../middleware/CommonHelper";
import { mapState } from "../../stores/helpers";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default {
    store,
    data: () => ({
        notifications: [],
        notificationsHeaders: [
            { text: "Quand" },
            { text: "Quoi" },
        ],
    }),
    mounted() {
        this.refreshLogs();
    },
    methods: {
        refreshLogs() {
            axios.get("/api/admin/notifications").then( response => {
                const notifications = parseAxiosResponse(response);
                this.notifications = notifications.map(n => ({
                  ...n,
                  dateLabel: format(new Date(n.datetime), "dd MMM HH'h'mm", {locale: fr}),
                }));
            })
        },
    }
}
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;

.tool {
    display: inline-block;
    widows: 100px;
    text-align: center;
    font-weight: bold;
    text-decoration: none;
}
</style>
