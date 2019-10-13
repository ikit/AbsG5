<template>
<div>
    <h2>Edition <span style="font-size: 1.5em; font-weight: 500">{{ current.editionYear }}</span> des AGPA</h2>
    <h3>Phase 1 - Enregistrement des photos</h3>


    <div class="category left">
		<h2 id="category_1" style="color: #F99;">Portrait</h2>
		<p style="color: #F99;">
			Photos mettant en évidence un personnage unique.
        </p>
        <div id="o_1_1" class="oeuvre">
			<div class="photo">
				<a class="emptySlot" onclick="javascript:showNewImage('1', 'o_1_1');" title="Cliquez ici pour insérer une photo">&nbsp;</a>
			</div>
		</div>
		<div id="o_1_2" class="oeuvre">
			<div class="photo">
				<a class="emptySlot" onclick="javascript:showNewImage('1', 'o_1_2');" title="Cliquez ici pour insérer une photo">&nbsp;</a>
			</div>
		</div>
	</div>
</div>
</template>


<script>

export default {
    name: 'Phase1',
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
@import '../../themes/global.scss';

h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
}
h3 {
    font-family: 'Tangerine', serif;
    color: $accent;
    font-size: 2.5em;
}

.emptySlot{
    display: block;
    width: 200px;
    line-height: 200px;
    background: transparent url('../../assets/images/theme/agpa/photoSlot.png') 0 0 no-repeat;
}
.emptySlot:hover {
    cursor: pointer;
    background-position-y: -200px;
}
</style>
