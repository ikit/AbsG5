<template>
<div>
    <h2>Edition {{ current.editionYear }} des AGPA</h2>
    Phase 2
</div>
</template>


<script>

export default {
    name: 'Phase2',
    data: () => ({
    }),
    props: ['current'],
    methods: {
        resetDialog (open = false) {
            this.citationEditor.open = open;
            this.citationEditor.citationId = null;
            this.citationEditor.citation = null;
            this.citationEditor.author = null;
        },
        saveCitation: function () {
            this.citations.push({
                authorAvatar: '/img/avatars/016.png',
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
@import '../../themes/global.scss';

h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 40px;
    font-family: "Comfortaa", sans-serif;
    margin: 20px 0 60px 0;
}
</style>
