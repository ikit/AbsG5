<template>
    <div class="home" v-cloak>
        <v-container fluid grid-list-md align-center>
        <v-layout justify-center row>
            <v-flex >
                <div class="citation"><b>Alain :</b> {{citation.citation}}</div>
            </v-flex>
        </v-layout>
        <v-layout justify-center wrap>
            <v-flex>
            <v-card class="absgCard">
                <v-card-title primary-title>
                    <h1>Passa G</h1>
                </v-card-title>
                <v-list two-line class="absgCard">
                <template v-for="(item, index) in logs">
                    <v-list-tile
                        :key="item.title"
                        avatar
                        ripple
                        @click="toggle(index)">

                    <v-list-tile-avatar>
                        <img :src="item.avatar">
                    </v-list-tile-avatar>

                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        <v-list-tile-sub-title class="text--primary">{{ item.headline }}</v-list-tile-sub-title>
                        <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
                    </v-list-tile-content>

                    <v-list-tile-action>
                        <v-list-tile-action-text>{{ item.action }}</v-list-tile-action-text>
                        <v-icon v-if="selected.indexOf(index) < 0" color="grey lighten-1">fas fa-star</v-icon>
                        <v-icon v-else color="yellow darken-2">fas fa-star</v-icon>
                    </v-list-tile-action>

                    </v-list-tile>
                    <v-divider
                        v-if="index + 1 < logs.length"
                        :key="index"></v-divider>
                </template>
                </v-list>
            </v-card>
            </v-flex>
            <v-flex >
            <v-card >
                <v-img
                    src="http://absolumentg.fr/assets/img/immt/2019_037.jpg"
                    aspect-ratio="1"></v-img>
                <v-card-title primary-title>
                <p style="text-align:center;">Bonne année 2019 !</p>
                </v-card-title>
            </v-card>
            </v-flex>
        </v-layout>
        </v-container>
    </div>
</template>


<script>
export default  {
    data: () => ({
        citation: {
            author: "Alain",
            citation: "C'est dans la baignoire qu'on se douche !",
        },
        selected: [2],
        logs: [
        {
            user: '012',
            username: 'Fanny',
            date: '12h50',
        },
        {
            user: '012',
            username: 'Fanny',
            date: '12h50',
        },
        {
            user: '012',
            username: 'Fanny',
            date: '12h50',
        },
        {
            user: '012',
            username: 'Fanny',
            date: '12h50',
        },
        {
            user: '012',
            username: 'Fanny',
            date: '12h50',
        }],
        methods: {
            toggle: function (index) {
                const i = this.selected.indexOf(index)
                if (i > -1) {
                this.selected.splice(i, 1)
                } else {
                this.selected.push(index)
                }
            }
        }
    })
}
</script>



<style lang="scss" scoped>
@import '../assets/global.scss';
h1 {
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 1.5em;
    font-family: "Comfortaa", sans-serif;
    font-weight: bold;
    margin: 10px 0;
}
.absgCard{
    // background-color: rgba($color: #ffffff, $alpha: 0)
}
.citation {
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 40px;

}
</style>
