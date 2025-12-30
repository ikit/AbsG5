<template>
  <div>
    <v-tabs
      centered
      :show-arrows="$vuetify.display.xs"
    >
      <v-tab
        v-if="isAdmin"
        :to="{path:'/admin/dashboard'}"
        :style="{ minWidth: $vuetify.display.xs ? '60px' : 'auto' }"
      >
        <v-icon :start="!$vuetify.display.xs">
          fas fa-tachometer-alt
        </v-icon>
        <span v-if="!$vuetify.display.xs" style="margin-left: 8px;">Tableau de bord</span>
      </v-tab>
      <v-tab
        v-if="isAdmin"
        :to="{path:'/admin/settings'}"
        :style="{ minWidth: $vuetify.display.xs ? '60px' : 'auto' }"
      >
        <v-icon :start="!$vuetify.display.xs">
          fas fa-tools
        </v-icon>
        <span v-if="!$vuetify.display.xs" style="margin-left: 8px;">Paramètres généraux</span>
      </v-tab>
      <v-tab
        v-if="isAdmin"
        :to="{path:'/admin/users'}"
        :style="{ minWidth: $vuetify.display.xs ? '60px' : 'auto' }"
      >
        <v-icon :start="!$vuetify.display.xs">
          fas fa-users-cog
        </v-icon>
        <span v-if="!$vuetify.display.xs" style="margin-left: 8px;">Utilisateurs</span>
      </v-tab>
      <!-- <v-tab :to="{path:'/admin/profile'}"> <v-icon start>fas fa-info-circle</v-icon> Mes informations</v-tab> -->
      <v-tab
        :to="{path:'/admin/resetpwd'}"
        :style="{ minWidth: $vuetify.display.xs ? '60px' : 'auto' }"
      >
        <v-icon :start="!$vuetify.display.xs">
          fas fa-lock
        </v-icon>
        <span v-if="!$vuetify.display.xs" style="margin-left: 8px;">Changer mot de passe</span>
      </v-tab>
    </v-tabs>

    <router-view />
  </div>
</template>



<script>
import store from "../store";
import { mapState } from "../stores/helpers";

export default  {
    store,
    data: () => ({
        isAdmin: false
    }),
    computed: {
        ...mapState([
            "user",
        ]),
    },
    mounted() {
        console.log(this.user)
        this.isAdmin = this.user?.roles?.indexOf("admin") > -1 || false;
    }
};
</script>

<style lang="scss" scoped>
@use '../themes/global.scss' as *;

</style>
