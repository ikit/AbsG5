<template>
<div>
    <v-tabs centered>
        <v-tab :to="{path:'/discussions/tbz'}">
            <v-badge right color="accent">
                <template v-slot:badge>
                    <span>3</span>
                </template>
                <v-icon>fas fa-comment-dots</v-icon> &nbsp; T.B.Z.
            </v-badge>
        </v-tab>
        <v-tab> <v-icon>far fa-comment</v-icon> &nbsp; Lanslevillard</v-tab>
        <v-tab> <v-icon>far fa-comment</v-icon> &nbsp; Malaucène</v-tab>
        <v-tab> <v-icon>far fa-comment-dots</v-icon> &nbsp; A.G.P.A.</v-tab>
        <v-tab> <v-icon>fas fa-archive</v-icon> &nbsp; Archives</v-tab>
        <v-tab> <v-icon>fas fa-plus</v-icon> &nbsp; Nouvelle discussion</v-tab>
    </v-tabs>

    <router-view></router-view>
</div>
</template>

<script>
export default {
    data: () => ({
    }),
    methods: {
    }
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';

.box {
    //margin: 14px;
    background-position: right 10px top 10px;
    padding: 10px;
    //padding-left: 200px;
}
.tbz {
    background-image: url('/img/tbz.png');
}
// .blabla {
//     background-image: url('/img/forum-new.png');
// }
// .archives {
//     background-image: url('/img/forum-archives.png');
// }

h2 {
    display: inline-block;
    font-size: 1.5em;
    font-weight: bold;
    text-align: left;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-family: "Comfortaa", sans-serif;
}
h2 a {
    text-decoration: none;
}

.notif {
    background-color: $accent;
    color: #fff;
    font-size: 0.8em;
    padding: 2px 10px;
    border-radius: 25px;
}

.date {
    color: #000;
}
.gueudelot {
    color: $group1;
}
.guibert {
    color: $group2;
}
.guyomard {
    color: $group3;
}

</style>
