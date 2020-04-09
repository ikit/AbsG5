<template>
<div>
    <v-tabs centered>
        <v-tab :to="{path:'/photos/immt'}"> <v-icon>fas fa-image</v-icon> &nbsp; Immt</v-tab>
        <v-tab :to="{path:'/photos/albums'}"> <v-icon>fas fa-images</v-icon> &nbsp; Albums</v-tab>
        <v-tab :to="{path:'/photos/sorting'}"> <v-icon>fab fa-stack-overflow</v-icon> &nbsp; A tier</v-tab>
    </v-tabs>

    <router-view></router-view>

</div>
</template>



<script>
import axios from 'axios';
import { parseAxiosResponse, getPeopleAvatar } from '../middleware/CommonHelper';

export default  {
    data: () => ({})
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';

</style>
