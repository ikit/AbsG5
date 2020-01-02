<template>
    <div>
        <h1>404</h1>
        <hr/>
        <p>La page que vous demandez n'a pas été trouvée.</p>
        <p>N'hésitez pas à en parler à Olivier si ça vous paraît bizarre.</p>
        <p class="token">Numéro de log <span style="color: red">{{ debugToken }}</span></p>
    </div>
</template>


<script>
import Vue from 'vue';

export default {
    data: () => ({
        debugToken: new Date().toISOString().substr(0,19).replace(/[\-T:]/g, "")
    })
}
</script>


<style lang="scss" scoped>
@import '../themes/global.scss';
h1 {
    font-size: 200px;
    line-height: 400px;;
}
hr {
    width: 200px;
    border: 1px;
    border-bottom: 1px solid #aaa;
    margin: auto;
    margin-top: -50px;
    margin-bottom: 70px;
}
p {
    text-align: center;
    color: #999;
    font-size: 1.5em;
}
p.token {
    font-family: monospace;
    width: 210px;
    margin: auto;
    margin-top: 50px;
    border: 1px solid #999;
    background: #fff;
    text-align: center
}
</style>
