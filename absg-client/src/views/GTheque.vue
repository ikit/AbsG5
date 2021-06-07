<template>
  <div>
    <v-tabs
      centered
      class="fixed-tabs-bar"
    >
      <v-tab :to="{path:'/gtheque/collections'}">
        <v-icon left>
          fas fa-book
        </v-icon> Collections
      </v-tab>
      <v-tab :to="{path:'/gtheque/grenier'}">
        <v-icon left>
          fas fa-star
        </v-icon> Grenier
      </v-tab>
    </v-tabs>

    <router-view />
  </div>
</template>


<script>
import Vue from 'vue';
import { format } from 'date-fns';

export default {
    data: () => ({
        debugToken: format(new Date(), "yyyyMMddHHmmss")
    })
}
</script>


<style lang="scss" scoped>
@import '../themes/global.scss';
h1 {
    font-size: 200px;
    line-height: 400px;
}
hr {
    width: 200px;
    border: 1px;
    border-bottom: 1px solid #aaa;
    margin: auto;
    margin-top: -50px;
    margin-bottom: 70px;
}
p {
    text-align: center;
    color: #999;
    font-size: 1.5em;
}
p.token {
    font-family: monospace;
    width: 210px;
    margin: auto;
    margin-top: 50px;
    border: 1px solid #999;
    background: #fff;
    text-align: center
}
</style>
