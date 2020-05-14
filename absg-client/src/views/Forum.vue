<template>
<div>
    <v-tabs centered v-model="activeTab">
        <v-tab :to="{path: `/forum/tbz`}">
            <template >
                <v-badge right color="accent" :value="tbzNnewMessages">
                    <template v-slot:badge>
                        <span>{{ tbzNnewMessages }}</span>
                    </template>
                    <v-icon>far fa-comment-dots</v-icon> &nbsp; T.B.Z.
                </v-badge>
            </template>
        </v-tab>
        <v-tab v-for="t in topics" :key="t.forumId" :to="{path: `/forum/read/${t.forumId}`}">
            <template >
                <v-badge right color="accent" :value="t.newMessages">
                    <template v-slot:badge>
                        <span>{{ t.newMessages}}</span>
                    </template>
                    <v-icon>far fa-comment-dots</v-icon> &nbsp; {{ t.name }}
                </v-badge>
            </template>
        </v-tab>
        <v-tab :to="{path: `/forum/browse`}"> <v-icon>fas fa-archive</v-icon> &nbsp; Archives</v-tab>
    </v-tabs>

    <router-view></router-view>
</div>
</template>

<script>
import 'vue-trix';

export default {
    data: () => ({
        activeTab: `/forum/tbz#last`, // On charge la discussion TBZ à la date du jour par défaut
        topics: [],
        tbzNnewMessages: 0
    }),
    mounted () {
    },
    methods: {
    }
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';
</style>
