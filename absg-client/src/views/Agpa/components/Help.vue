<template>
    <v-tabs centered>
        <v-tab>
            <v-icon v-if="agpaMeta && agpaMeta.phase === 1">far fa-check-square</v-icon>
            <v-icon v-else>fas fa-square</v-icon>
            &nbsp; Phase 1</v-tab>
        <v-tab>
            <v-icon v-if="agpaMeta && agpaMeta.phase < 2">far fa-square</v-icon>
            <v-icon v-else-if="agpaMeta && agpaMeta.phase === 2">far fa-check-square</v-icon>
            <v-icon v-else>fas fa-square</v-icon>
            &nbsp; Phase 2</v-tab>
        <v-tab>
            <v-icon v-if="agpaMeta && agpaMeta.phase < 3">far fa-square</v-icon>
            <v-icon v-else-if="agpaMeta && agpaMeta.phase === 3">far fa-check-square</v-icon>
            <v-icon v-else>fas fa-square</v-icon>
            &nbsp; Phase 3</v-tab>
        <v-tab>
            <v-icon v-if="agpaMeta && agpaMeta.phase < 4">far fa-square</v-icon>
            <v-icon v-else-if="agpaMeta && agpaMeta.phase === 4">far fa-check-square</v-icon>
            <v-icon v-else>fas fa-square</v-icon>
            &nbsp; Phase 4</v-tab>
        <v-tab>
            <v-icon v-if="agpaMeta && agpaMeta.phase < 5">far fa-square</v-icon>
            <v-icon v-else-if="agpaMeta && agpaMeta.phase === 5">far fa-check-square</v-icon>
            <v-icon v-else>fas fa-square</v-icon>
            &nbsp; Phase 5</v-tab>

        <!-- P1 -->
        <v-tab-item>
            <div class="help-content">
                <h3>Enregistrement des photos</h3>
                <p>Lors de l’enregistrement des photos, vous devez attribuer un titre à chacune de vos œuvres.
                    Le titre donné est visible lors de l'évaluation des jurés, ils pourront donc en tenir compte s' ils le souhaitent.
                </p>
                <p>Durant cette phase, vous pouvez :
                    <ul>
                        <li>Envoyer et nommer de nouvelles photos (dans la limite de deux par catégorie) ;</li>
                        <li>Supprimer, remplacer ou renommer les photos déjà envoyées.</li>
                    </ul>
                </p>
                <p>Techniquement, les photos doivent être au format jpg. Il n'y a pas d'autres contraintes techniques, si ce n'est qu'une photo, comme toutes
                    les fichiers enregistrés sur le site, doit faire moins de 200Mo.
                    Lors de l'enregistrement, les photos trop grosses seront redimmensionnées automatiquement par le site Absolument G. Si toutefois vous voulez gérer
                    vous-mêmes le redimmensionnement, il est conseillé de fournis des photos en haute résolution, c'est à dire à minima <b>FULL HD</b> (1920 x 1080).
                    Mais du <b>4K</b> (3840 x 2160) serait préférable afin de permettre à ceux qui le souhaiterais
                    de profiter d'une projection des photos en hautes qualités ou d'en faire des tirages.
                    De plus à l'avenir, les téléphones portables et ordinateurs utiliseront couramment cette résolution.
                </p>
            </div>
        </v-tab-item>

        <!-- P2 -->
        <v-tab-item>
            <div class="help-content">
                <p>Pendant cette période, vous pouvez :
                    <ul>
                        <li>Visualiser toutes les photos de tous les candidats ;</li>
                        <li>Signaler ou donner votre avis sur une photo ne correspondant pas aux critères de validités du concours.</li>
                    </ul>
                </p>
                <p>Si une photo est jugée non conforme aux critères définis, le candidat concerné sera prévenu et aura la possibilité de remplacer son œuvre.
                    S’il ne le fait pas, la photo en cause sera exclues de la phase de vote et ne pourra pas obtenir de point pour le classement final. </p>
            </div>
        </v-tab-item>

        <!-- P3 -->
        <v-tab-item>
            <div class="help-content">
                    <p>Le vote est ouvert à tous les membres du forum Absolument G. Même les enfants de moins de 12 ans
                        peuvent voter, cependant seuls les votes des jurés ayant 12 ans ou plus au cours de l'année sont pris en compte lors du décompte.</p>
                    <p>La phase de vote dure en général 3 jours. </p>
                    <p>Pendant cette période, les membres du forum peuvent :
                        <ul>
                            <li>Visualiser les photos de tous les candidats. A noter que les photos refusées lors de la phase 2 seront visibles, mais il ne sera pas possible
                                de voter pour elles;
                            </li>
                            <li>Voter pour les meilleures photos parmi celles envoyées par les autres candidats, en attribuant pour chaque catégorie :
                            <ul>
                                <li>1 ou 2 étoiles aux meilleures photos;</li>
                                <li>1 plume pour les meilleurs titres de photo.</li>
                            </ul></li>
                            <li>Corriger leurs votes</li>
                            <li>Toutes les photos qui n'ont pas été refusées lors de la phase précédente de vérification, sont considérées comme valables</li>
                            <li>Corriger leurs votes</li>
                        </ul>
                    </p>
                    <p>Les candidats qui votent, doivent attribuer un minimum de points dans chaque catégorie.
                        S'ils ne le font pas, pour les catégories concernées, leurs votes partiels ne seront pas pris en compte.
                        Un indicateur dans le formulaire de vote permet de savoir le nombre de points que l'on peut attribuer pour chaque catégorie
                        Ainsi que le nombre de point que l'on a déjà attribué. Cet indicateur passe du rouge au vert quand un nombre suffisant de points
                        a été attribués.
                    </p>
            </div>
        </v-tab-item>

        <!-- P4 -->
        <v-tab-item>
            <div class="help-content">
            </div>
        </v-tab-item>

        <!-- P5 -->
        <v-tab-item>
            <div class="help-content">
            </div>
        </v-tab-item>
    </v-tabs>
</template>


<script>
import { mapState } from 'vuex';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";

export default {
    name: 'PhotoWidget',
    props: [
        "selectedTab",
    ],
    computed: {
        ...mapState([
            'agpaMeta',
        ]),
    },
    mounted () {
        console.log(this.agpaMeta);
    },
    watch: {
        'selectedTab': function () {
            console.log("Help selectedTab changed", this.selectedTab);
        }
    },
    methods: {
    }
};
</script>


<style lang="scss" scoped>
@import '../../../themes/global.scss';

.help-content {
    padding: 10px;

    h3 {
        font-size: 20px;
    }
}
</style>
