<template>
<div>
    <h2>Cérémonie</h2>
</div>
</template>


<script>

export default {
    name: 'Phase3',
    data: () => ({
    }),
    props: ['current'],
    methods: {
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
