<template>
    <div>
        <h1>Albums</h1>
        <ul>
            <li>alums créés par les utilisateurs...</li>
            <li>albums Spéciaux:
                <ul>
                    <li>Vrac: toutes les photos triés qui n'ont pas d'albums</li>
                    <li>Random: Affiche une photo hasard (idée de mini-jeu: déviner la date ou le lieux quand l'info est renseignée ?)</li>
                </ul>
            </li>
        </ul>
    </div>
</template>


<script>
import Vue from 'vue';

export default {
    data: () => ({})
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
</style>
