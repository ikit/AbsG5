<template>
  <v-tabs
    :model-value="selectedTab"
    @update:model-value="$emit('update:selectedTab', $event)"
    centered
  >
    <v-tab key="1">
      <v-icon
        v-if="agpaMeta && agpaMeta.phase === 1"
        left
      >
        fas fa-square
      </v-icon>
      <v-icon
        v-else
        left
      >
        far fa-check-square
      </v-icon>
      Phase 1
    </v-tab>
    <v-tab key="2">
      <v-icon
        v-if="agpaMeta && agpaMeta.phase < 2"
        left
      >
        far fa-square
      </v-icon>
      <v-icon
        v-else-if="agpaMeta && agpaMeta.phase === 2"
        left
      >
        fas fa-square
      </v-icon>
      <v-icon
        v-else
        left
      >
        far fa-check-square
      </v-icon>
      Phase 2
    </v-tab>
    <v-tab key="3">
      <v-icon
        v-if="agpaMeta && agpaMeta.phase < 3"
        left
      >
        far fa-square
      </v-icon>
      <v-icon
        v-else-if="agpaMeta && agpaMeta.phase === 3"
        left
      >
        fas fa-square
      </v-icon>
      <v-icon
        v-else
        left
      >
        far fa-check-square
      </v-icon>
      Phase 3
    </v-tab>
    <v-tab key="4">
      <v-icon
        v-if="agpaMeta && agpaMeta.phase < 4"
        left
      >
        far fa-square
      </v-icon>
      <v-icon
        v-else-if="agpaMeta && agpaMeta.phase === 4"
        left
      >
        fas fa-square
      </v-icon>
      <v-icon
        v-else
        left
      >
        far fa-check-square
      </v-icon>
      Phase 4
    </v-tab>
    <v-tab key="5">
      <v-icon
        v-if="agpaMeta && agpaMeta.phase < 5"
        left
      >
        far fa-square
      </v-icon>
      <v-icon
        v-else-if="agpaMeta && agpaMeta.phase === 5"
        left
      >
        fas fa-square
      </v-icon>
      <v-icon
        v-else
        left
      >
        far fa-check-square
      </v-icon>
      Phase 5
    </v-tab>

  </v-tabs>

  <v-window :model-value="selectedTab" @update:model-value="$emit('update:selectedTab', $event)">
    <!-- P1 -->
    <v-window-item :value="0">
      <div class="help-content">
        <h3>Enregistrement des photos</h3>
        <p>
          Lors de l’enregistrement des photos, vous devez attribuer un titre à chacune de vos œuvres.
          Le titre donné est visible lors de l'évaluation des jurés, ils pourront donc en tenir compte s' ils le souhaitent.
        </p>
        <p>
          Durant cette phase, vous pouvez :
          <ul>
            <li>Envoyer et nommer de nouvelles photos (dans la limite de deux par catégorie) ;</li>
            <li>Supprimer, remplacer ou renommer les photos déjà envoyées.</li>
          </ul>
        </p>
        <p>
          Techniquement, les photos doivent être au format jpg. Il n'y a pas d'autres contraintes techniques, si ce n'est qu'une photo, comme toutes
          les fichiers enregistrés sur le site, doit faire moins de 200Mo.
          Lors de l'enregistrement, les photos trop grosses seront redimmensionnées automatiquement par le site Absolument G. Si toutefois vous voulez gérer
          vous-mêmes le redimmensionnement, il est conseillé de fournis des photos en haute résolution, c'est à dire à minima <b>FULL HD</b> (1920 x 1080).
          Mais du <b>4K</b> (3840 x 2160) serait préférable afin de permettre à ceux qui le souhaiterais
          de profiter d'une projection des photos en hautes qualités ou d'en faire des tirages.
          De plus à l'avenir, les téléphones portables et ordinateurs utiliseront couramment cette résolution.
        </p>
      </div>
    </v-window-item>

    <!-- P2 -->
    <v-window-item :value="1">
      <div class="help-content">
        <h3>Vérification des photos</h3>
        <p>
          Pendant cette période, vous pouvez :
          <ul>
            <li>Visualiser toutes les photos de tous les candidats ;</li>
            <li>Signaler ou donner votre avis sur une photo ne correspondant pas aux critères de validités du concours.</li>
          </ul>
        </p>
        <p>
          Si une photo est jugée non conforme aux critères définis, le candidat concerné sera prévenu et aura la possibilité de remplacer son œuvre.
          S’il ne le fait pas, la photo en cause sera exclues de la phase de vote et ne pourra pas obtenir de point pour le classement final.
        </p>
      </div>
    </v-window-item>

    <!-- P3 -->
    <v-window-item :value="2">
      <div class="help-content">
        <h3>Votes</h3>
        <p>
          Le vote est ouvert à tous les membres du forum Absolument G. Même les enfants de moins de 12 ans
          peuvent voter, cependant seuls les votes des jurés ayant 12 ans ou plus au cours de l'année sont pris en compte lors du décompte.
        </p>
        <p>La phase de vote dure en général 3 jours. </p>
        <p>
          Pendant cette période, les membres du forum peuvent :
          <ul>
            <li>
              Visualiser les photos de tous les candidats. A noter que les photos refusées lors de la phase 2 seront visibles, mais il ne sera pas possible
              de voter pour elles;
            </li>
            <li>
              Voter pour les meilleures photos parmi celles envoyées par les autres candidats, en attribuant pour chaque catégorie :
              <ul>
                <li>1 ou 2 étoiles aux meilleures photos;</li>
                <li>1 plume pour les meilleurs titres de photo.</li>
              </ul>
            </li>
            <li>Corriger leurs votes</li>
            <li>Toutes les photos qui n'ont pas été refusées lors de la phase précédente de vérification, sont considérées comme valables</li>
            <li>Corriger leurs votes</li>
          </ul>
        </p>
        <p>
          Les candidats qui votent, doivent attribuer un minimum de points dans chaque catégorie.
          S'ils ne le font pas, pour les catégories concernées, leurs votes partiels ne seront pas pris en compte.
          Un indicateur (en haut à droite) dans le formulaire de vote permet de savoir le nombre de points que l'on peut attribuer pour chaque catégorie
          Ainsi que le nombre de point que l'on a déjà attribué. Cet indicateur passe du rouge au vert quand un nombre suffisant de points
          a été attribués.
        </p>
      </div>
    </v-window-item>

    <!-- P4 -->
    <v-window-item :value="3">
      <div class="help-content">
        <h3>Dépouillement des votes</h3>
        <p>
          Le dépouillement va compter les votes reçues par chaque photo et établir un classement à la
          fois au sein de la catégorie de la photo mais aussi globalement (toutes catégories confondues).
          En cas d'égalité, le nombre total de votes reçus fait la différence (les photos ayant reçu le plus de votes passant devant en ayant reçu le moins).
        </p>

        <p>
          A partir de l'édition 2008 des AGPA, une note unique est calculée pour chaque photo.
          Cette note dépend des deux critères de choix précédemment définis (nombre de points et nombre de votes),
          mais également du nombre de photos de la catégorie à laquelle elle appartient et du nombre de jurés de l'édition du concours.
          Cette variable a été créée pour permettre de comparer les photos entre elles à partir d’un chiffre unique,
          quelques soient la catégorie ou l'édition pour lesquelles elles concourent.
        </p>

        <p>
          Remarques :
          <ul>
            <li>
              Si cette note technique n'a pas vocation à être diffusée lors de la cérémonie des AGPA,
              elle pourra être communiquée à chaque participant en faisant la demande;
            </li>
            <li>
              Le palmarès des deux premières éditions ne sera pas modifié, même s’il aurait été différent avec ce mode d’évaluation,
              qui tient compte des nombres différents de photos entre les catégories.
            </li>
          </ul>
        </p>
      </div>
    </v-window-item>

    <!-- P5 -->
    <v-window-item :value="4">
      <div class="help-content">
        <h3>Cérémonie de remise des AGPA</h3>
        <p>
          Le palmarès sera dévoilé au public lors d'une cérémonie organisé pour l'occasion. En dehors de l’honorifique attribution des AGPA d’or,
          aucune récompense n’est assurée. Les photos gagnantes seront cependant durablement mises en ligne sur le site Absolument G.
        </p>
      </div>
    </v-window-item>
  </v-window>
</template>


<script>
import { mapState } from '../../../stores/helpers';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";

export default {
    name: 'AgpaHelp',
    props: {
        selectedTab: {
            type: Number,
            default: 0
        }
    },
    emits: ['update:selectedTab'],
    computed: {
        ...mapState([
            'agpaMeta',
        ]),
    },
    mounted () {
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
