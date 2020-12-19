<template>
  <div>
    <v-tabs centered>
      <v-tab
        v-if="isAdmin"
        :to="{path:'/admin/dashboard'}"
      >
        <v-icon left>
          fas fa-tachometer-alt
        </v-icon> Tableau de bord
      </v-tab>
      <v-tab
        v-if="isAdmin"
        :to="{path:'/admin/settings'}"
      >
        <v-icon left>
          fas fa-tools
        </v-icon> Paramètres généraux
      </v-tab>
      <v-tab
        v-if="isAdmin"
        :to="{path:'/admin/users'}"
      >
        <v-icon left>
          fas fa-users-cog
        </v-icon> Utilisateurs
      </v-tab>
      <!-- <v-tab :to="{path:'/admin/profile'}"> <v-icon left>fas fa-info-circle</v-icon> Mes informations</v-tab> -->
      <v-tab :to="{path:'/admin/resetpwd'}">
        <v-icon left>
          fas fa-lock
        </v-icon> Changer mot de passe
      </v-tab>
    </v-tabs>

    <router-view />
  </div>
</template>



<script>
import store from "../store";
import { mapState } from "vuex";

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
        this.isAdmin = this.user ? this.user.roles.indexOf("admin") > -1 : false;
    }
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';

</style>
