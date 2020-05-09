<template>
<div>
    <v-tabs centered>
        <v-tab  :to="{path: `/forum/tbz`}">
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
        <v-tab :to="{path: `/forum/archives`}"> <v-icon>fas fa-archive</v-icon> &nbsp; Archives</v-tab>
        <!-- <v-tab :to="{path: `/forum/newTopic`}"> <v-icon>fas fa-plus</v-icon> &nbsp; Nouvelle discussion</v-tab> -->
    </v-tabs>

    <router-view></router-view>
</div>
</template>

<script>
export default {
    data: () => ({
        topics: [],
        tbzNnewMessages: 0
    }),
    mounted () {
        // récupèrer la liste des sujets principaux
        this.topics = [
            // {
            //     id: 2,
            //     name: "Lanslevillard",
            //     newMessages: 0,
            // },
            // {
            //     id: 3,
            //     name: "Malaucène",
            //     newMessages: 1,
            // },
            // {
            //     id: 4,
            //     name: "A.G.P.A.",
            //     newMessages: 0,
            // }
        ];

        // On charge le premier onglet
        this.activeTab = `/forum/read/${this.topics[0].id}`;
    },
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
