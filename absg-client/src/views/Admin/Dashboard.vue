<template>
  <v-card style="margin: 15px">
    <v-card-title class="bg-grey-lighten-4">
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
        onNotificationClicked(notification) {
            if (notification && !notification.read) {
                store.commit("readNotification", notification);
                if (notification.module && notification.module.url) {
                    this.$router.push(notification.module.url);
                }
            }
        }
    }
}
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;
</style>
