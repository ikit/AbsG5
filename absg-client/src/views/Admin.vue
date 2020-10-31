<template>
  <div>
    <v-tabs centered>
      <v-tab
        :to="{path:'/admin/dashboard'}"
        style="color: red"
      >
        <v-icon left>
          fas fa-tachometer-alt
        </v-icon> Tableau de bord
      </v-tab>
      <v-tab
        :to="{path:'/admin/settings'}"
        style="color: red"
      >
        <v-icon left>
          fas fa-tools
        </v-icon> Paramètres généraux
      </v-tab>
      <v-tab
        :to="{path:'/admin/users'}"
        style="color: red"
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

export default  {
    data: () => ({}),
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';

</style>
