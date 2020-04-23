<template>
<div>
    <v-tabs centered>
        <v-tab :to="{path:'/citations/browser'}"> <v-icon>fas fa-bars</v-icon> &nbsp; Liste</v-tab>
        <v-tab :to="{path:'/citations/play'}" disabled> <v-icon>far fa-grin-tongue</v-icon> &nbsp; Devinettes</v-tab>
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
