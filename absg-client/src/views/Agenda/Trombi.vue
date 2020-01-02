<template>
     <v-container fluid grid-list-sm>
            <v-layout row wrap>
            <v-flex v-for="i in 50" :key="i" xs1>
                <img :src="`https://randomuser.me/api/portraits/men/${i + 20}.jpg`" class="image" alt="lorem" width="100%" height="100%">
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
import Vue from 'vue';

export default {
    data: () => ({})
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
</style>
