<template>
<div>
    <v-tabs centered>
        <v-tab :to="{path:'/admin/dashboard'}" disabled> <v-icon>fas fa-tachometer-alt</v-icon> &nbsp; Tableau de bord</v-tab>
        <v-tab :to="{path:'/admin/settings'}" > <v-icon>fas fa-tools</v-icon> &nbsp; Paramètres généraux</v-tab>
        <v-tab :to="{path:'/admin/users'}"> <v-icon>fas fa-users-cog</v-icon> &nbsp; Utilisateurs</v-tab>
    </v-tabs>

    <router-view></router-view>

</div>
</template>



<script>

export default  {
    data: () => ({})
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';

</style>
