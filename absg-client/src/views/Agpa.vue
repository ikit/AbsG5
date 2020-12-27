<template>
  <div class="agpa">
    <v-tabs
      centered
      class="fixed-tabs-bar"
    >
      <v-tab :to="{path:'/agpa/'}">
        <v-icon left>
          fas fa-star
        </v-icon> Edition {{ agpaMeta ? agpaMeta.year : "" }}
      </v-tab>
      <v-tab v-if="isAdmin" :to="{path:'/agpa/admin'}">
        <v-icon left>
          fas fa-tachometer-alt
        </v-icon> Edition Supervision
      </v-tab>
      <v-tab :to="{path:'/agpa/rules'}">
        <v-icon left>
          fas fa-scroll
        </v-icon> Réglement
      </v-tab>
      <v-tab :to="{path:'/agpa/archives'}">
        <v-icon left>
          fas fa-archive
        </v-icon> Archives
      </v-tab>
      <v-tab :to="{path:'/agpa/palmares'}">
        <v-icon left>
          fas fa-trophy
        </v-icon> Palmarès
      </v-tab>
      <v-tab :to="{path:'/agpa/ceremony'}">
        <v-icon left>
          fas fa-tv
        </v-icon> Cérémonies
      </v-tab>
    </v-tabs>
    <router-view />
  </div>
</template>



<script>
import store from '../store';
import { mapState } from 'vuex';

export default {
    store,
    data: () => ({
        isAdmin: false
    }),
    computed: {
        ...mapState([
            'agpaMeta',
            'user'
        ]),
    },
    mounted() {
        if (this.user) {
            this.isAdmin = this.user.roles.indexOf("admin") > -1;
        }
        store.dispatch('initAGPA');
    }
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';

.agpa-menu {
    position: fixed;
    top: 64px;
    left: 85px;
    right: 0;
    background:  #d0d0d0;
    padding: 10px 20px;
    text-align: center;
    z-index: 1000;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
}

h1 {
    font-size: 5em;
    line-height: 150px;
    font-weight: bold;
    font-family: 'Tangerine', serif;
}


</style>
