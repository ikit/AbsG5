<template>
<div>
    <v-tabs centered>
        <v-tab :to="{path:'/admin/dashboard'}" style="color: red"> <v-icon>fas fa-tachometer-alt</v-icon> &nbsp; Tableau de bord</v-tab>
        <v-tab :to="{path:'/admin/settings'}" style="color: red"> <v-icon>fas fa-tools</v-icon> &nbsp; Paramètres généraux</v-tab>
        <v-tab :to="{path:'/admin/users'}" style="color: red"> <v-icon>fas fa-users-cog</v-icon> &nbsp; Utilisateurs</v-tab>
        <v-tab :to="{path:'/admin/profile'}"> <v-icon>fas fa-info-circle</v-icon> &nbsp; Mes informations</v-tab>
        <v-tab :to="{path:'/admin/resetpwd'}"> <v-icon>fas fa-lock</v-icon> &nbsp; Changer mot de passe</v-tab>
    </v-tabs>

    <router-view></router-view>

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
