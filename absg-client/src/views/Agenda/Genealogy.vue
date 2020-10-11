<template>
    <div>

    </div>
</template>


<script>
import Vue from 'vue';

export default {
    components: {
        VoBasic
    },
    data: () => ({
        genealogData: {
            name: 'LETOT Raymond',
            children: [
                {
                    name: 'GUEUDELOT Annie',
                    children: [
                        { name: 'Sébastien' },
                        { name: 'Emmanuel' },
                        { name: 'Olivier' }]
                },
                {
                    name: 'GUYOMARD Jocelyne',
                    children: [
                        { name: 'Julien' },
                        { name: 'Fanny' },
                        { name: 'Frédéric' },
                        { name: 'Marion' }]
                },
                {
                    name: 'GUIBERT Sylviane',
                    children: [{ name: 'Thomas' }]
                }
            ]
        }
    })
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
</style>
