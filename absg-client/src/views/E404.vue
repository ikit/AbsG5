<template>
    <div>
        <h1>404</h1>
        <hr/>
        <p>La page demandée n'existe pas.</p>
        <p>N'hésitez pas à en parler à Olivier si ça vous paraît bizarre.</p>
        <p class="token">Numéro de log <span style="color: red">{{ debugToken }}</span></p>
    </div>
</template>


<script>
import Vue from 'vue';
import { format } from 'date-fns';

export default {
    data: () => ({
        debugToken: format(new Date(), "yyyyMMddHHmmss")
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
