<template>
  <div>
    <v-tabs centered>
      <v-tab :to="{path:'/citations/browser'}">
        <v-icon left>
          fas fa-bars
        </v-icon> Liste
      </v-tab>
      <v-tab
        :to="{path:'/citations/play'}"
        disabled
      >
        <v-icon left>
          far fa-grin-tongue
        </v-icon> Devinettes
      </v-tab>
    </v-tabs>
    <router-view />
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
