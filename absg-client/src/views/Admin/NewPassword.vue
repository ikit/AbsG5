<template>
  <v-container>
    <v-card style="width: 400px; padding:50px; margin: auto; margin: 50px auto">
      <v-form
        ref="form"
        v-model="valid"
      >
        <v-text-field
          v-model="pwd"
          label="Nouveau mot de passe"
          :rules="rules"
          required
          outlined
          validate-on-blur
          type="password"
          autocomplete="new-password"
        />
        <v-text-field
          v-model="pwd2"
          label="Confirmer le mot de passe"
          :rules="rules"
          required
          outlined
          type="password"
          autocomplete="new-password"
        />
        <div style="text-align: center">
          <v-btn
            color="accent"
            :disabled="!valid"
            @click="changePwd()"
          >
            Valider
          </v-btn>
        </div>
      </v-form>
    </v-card>

    <v-expansion-panels style="margin: 15px">
      <v-expansion-panel>
        <v-expansion-panel-header>Comment choisir mon mot de passe ?</v-expansion-panel-header>
        <v-expansion-panel-content>
          <p>
            Si on met de côté le vol de donnée, les personnes mal intentionnées ont 2 façons de deviner un mot de passe.
            <ul>
              <li>
                <b>La méthode "force brute":</b> elle repose sur la capacité de calcul des ordinateurs
                et va tester toutes les possibilités en testant d'abord les mots les plus courant (dictionnaire, statistiques, ...).
                Ce qu'il faut comprendre quand on parle de dictionnaire, c'est qu'on ne va pas juste tester les 10 000 définitions du Grand Robert...
                On va tester les centaines de millions d'identifiants et mots de passes qui ont déjà fuités et sont listés en accès libre sur certains sites.
                Et c'est trés efficaces, car souvent on se croit malin, mais on est rarement le premier ni le seul à avoir une idée;
              </li>
              <li>
                <b>La méthode des RG:</b> qui consiste à se renseigner sur la personne et mieux la cerner afin de trouver le mot de passe qu'elle a pu choisir.
                Gardez à l'esprit que Facebook ou Twitter n'ont besoin que d'une dizaine d'informations pour vous connaître mieux que vos proches et déduire
                vos gouts, intérêts et opinions sur tout un tas de sujets... ça va vite.
              </li>
            </ul>
          </p>
          <p>
            <span class="section">Les recommandations :</span>
            <ul>
              <li>
                <b>Pas d'informations personnelles</b> ou tirées de votre environnement proche ou professionnel.
                Un mot de passe basé sur vos données personnelles va être vite trouvé par les 2 méthodes;
              </li>
              <li>
                <b>Ne vous compliquez pas la vie</b> avec des codes aléatoires impossibles à mémoriser du genre <span class="code">tTh9pVFH9q6N2ZQ</span>.
                Mais bon après si ça vous amuse ça reste un bon mot de passe... mais comptez au moins 10 lettres pour que ça soit assez long à trouver pour un ordinateur;
              </li>
              <li>
                <b>La longueur du mot de passe est importante</b>. Ni trop long (trop compliqué à retenir), ni trop court (trop facile à casser).
                Ce <a
                  href="https://howsecureismypassword.net/"
                  target="_blank"
                >site</a> permet de tester des mots mots de passe
                et d'avoir un ordre d'idée de la durée qu'il faut à un ordinateur pour le trouver, et quels sont ses défauts.
              </li>
              <li>
                <b>Evitez les classiques et les suites logiques.</b> Choisissez un mot de passe plus original (et surtout plus fiable)
                que les <a
                  href="https://blog.httpcs.com/les-mots-de-passe-les-plus-utilises-en-france/"
                  target="_blank"
                >traditionnels</a> "motdepasse", "password", "cocuou", etc.
                Et les mots de passe tels que "1234", "azerty" ou "abcde" ne sont d’aucune utilité.
              </li><li>
                <b>Utilisez différents mots de passe.</b> l'idéal c'est d'en avoir un par accès (site/compte) différent. Mais au minimum,
                identifiez les sites stratégiques pour lesquels avoir un mot de passe unique. Le plus important est celui de votre boite mail.
                Car il contient toute votre vie. Pour absolument G, ce n'est pas aussi critique (pas d'information bancaire ou proféssionelle par exemple),
                et bien qu'il y ait beaucoup choses d'ordre privés (noms, prénoms, adresses, emails, téléphones, photos, ...), le site n'es pas publiquement/largement exposé.
                Le risque de se faire pirater est donc faible.
              </li>
            </ul>
          </p>
          <p>
            <span class="section">La recette du chef:</span>
            <ul>
              <li>
                Composez votre mot de passe avec plusieurs mots pris au pif, par exemple <span class="code">cheval ibiscus poutre</span>...
                2 avantages: c'est long et facile à retenir... vous trouverez vite une petite histoire pour associer et vous souvenir facilement de ces mots;
              </li>
              <li>Après libre à vous d'inventer des combines pour altérer le mot de passe et le rendre vraiment unique et introuvable.</li>
            </ul>
          </p>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>Olivier connaît-il tous les mots de passe ?</v-expansion-panel-header>
        <v-expansion-panel-content>
          <p>
            Il le pourrait si il avait volontairement programmé le site pour stocker en clair cette information sensible.
            Mais ça n'est pas le cas. Pour ceux qui veulent s'en convaincre, tout le code source du site est accessible sur
            Internet ainsi que la partie concernant <a
              href="https://github.com/ikit/AbsG5/blob/master/absg-core/src/middleware/userSessionHelpers.ts"
              target="_blank"
            >l'authentification et la gestion des mots de passe</a>.
          </p>
          <p>
            Pour résumer, on va utiliser une fonction mathématique trés complexe qui se base sur l'aléatoire et le temps pour obtenir une version
            chiffrée de votre mot de passe. Cette méthode étant basée sur le temps, pour un même mot de passe, elle renvera une version
            chiffrée différente à chaque essai. Vous pouvez tester la méthode <a
              class="code"
              href="https://www.bcrypt.fr/"
              target="_blank"
            >bcrypt.hash</a> qui implémente l'algorithme directement en ligne.
          </p>
          <p>
            Ensuite il n'est plus possible de retrouver la version originale du mot de passe à partir de la version chiffrée. Mais par contre il est possible
            de comparer deux versions chiffrées pour savoir si elles sont issues d'un même mot de passe. Lorsque vous créez votre mot de passe, on enregistre en
            base de donnée la version chiffrée de votre mot de passe, et ainsi à chaque fois que vous essaierez de vous authentifier, on comparera
            la version chiffrée du mot de passe que vous venez de saisir avec celle gardée en base de donnée.
          </p>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
import axios from 'axios';
import store from "../../store";
import { format } from 'date-fns';
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        isLoading: false,
        valid: false,
        pwd: "",
        pwd2: "",
        rules: [
            value => {
                return (value && value.length >= 8) || "Trop court (au moins 8 caractères)"
            }
        ],
    }),
    methods: {
        changePwd() {
            if (this.pwd != this.pwd2) {
                store.commit('onWarning', "Vos deux mots de passe ne sont pas identique.");
                return;
            }
            this.isLoading = true;
            axios.post("/api/users/change-pwd", { pwd: this.pwd })
            .then(response => {
                const user = parseAxiosResponse(response);
                if (user) {
                    // Le changement de mot de passe s'est bien déroulé, on met à jour la session de l'utilisateur
                    store.commit("logUser", user);

                    // On redirige vers la page d'accueil
                    this.$router.push('/');
                }
                this.isLoading = false;
            }).catch(err => {
                store.commit('onError', err);
                this.isLoading = false;
            });
        }
    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

.code {
    font-family: monospace;
    border: 1px solid rgba(0,0,0,0.1);
    padding: 3px;
    background: rgba(0,0,0, 0.05);
}
.section {
    text-decoration: underline
}
</style>
