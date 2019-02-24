<template>
<div class="home" style="margin-top: 58px;">

    <v-card class="box tbz">
        <h2>Nouvelles du mois de Juin !</h2>
        <p>Dernier message : <span class="group1-fg">Annie</span> le 5/6 à 17h35</p>
        <p>5/7 événements</p>
    </v-card>

    <v-card class="box blabla">
        <h2>Blabla !</h2>
        <p>Dernier message : <span class="group1-fg">Annie</span> le 5/6 à 17h35</p>
        <p>5/7 événements</p>
    </v-card>

    <v-card class="box archives">
        <h2>Arhives du forum</h2>
        <div class="row">
            <div class="column">
                <span>13 465</span> messages
            </div>
            <div class="column">
                <span>7 935</span> sujets
            </div>
            <div class="column">
                <span>1,3</span> messages/jour
            </div>
        </div>
        <div class="row">
            <span>Message au hasard :</span>
            <div class="column">
                <span>Emmanuel le 5/6/2008 à 17h54</span>: "Salut les Copains ! [...]"
            </div>
        </div>
    </v-card>
</div>
</template>

<script>
export default {
    data: () => ({
        query: '',
        tbz: {
            title: 'Nouvelles de février',
            totalMessages: 13,
            lastAuthor: {
                userID: 12,
                username: 'Annie',
                class: 'group1',
                date: new Date(),
            },
            evenements: {
                total: 10,
                passed: 7,
            },
        },
        blabla: {
            totalTopics: 889,
            totalMessages: 13538,
            lastActivities: [
            ]
        },
        currentUser: {
            id: 2,
            username: 'Olivier'
        }
    }),
    methods: {
        resetDialog (open = false) {
            this.citationEditor.open = open;
            this.citationEditor.citationId = null;
            this.citationEditor.citation = null;
            this.citationEditor.author = null;
        },
        saveCitation: function () {
            this.citations.push({
                authorAvatar: 'http://absolumentg.fr/assets/img/avatars/016.png',
                authorId: 16,
                authorName: this.citationEditor.author,
                citation: this.citationEditor.citation,
            });
            this.resetDialog();
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../assets/global.scss';
.box {
    margin: 14px;
    background-position: 30px 10px;
    padding: 10px;
    padding-left: 200px;
    height: 150px;
}
.tbz {
    background-image: url('../assets/images/tbz.png');
}
.blabla {
    background-image: url('../assets/images/forum-new.png');
}
.archives {
    background-image: url('../assets/images/forum-archives.png');
}

h2 {
    display: block;
    font-size: 1.5em;
    font-weight: bold;
    text-align: left;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-family: "Comfortaa", sans-serif;
}
</style>
