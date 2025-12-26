<template>
  <div />
</template>


<script>
export default {
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
@use '../../themes/global.scss' as *;
</style>
