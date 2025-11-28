<template>
  <v-container>
    <v-card style="width: 400px; padding:50px; margin: auto; margin-top: 100px; position: relative">
      <v-form ref="loginForm">
        <div>
          <v-text-field
            v-model="username"
            prepend-icon="fas fa-user"
            label="Identifiant"
            required
            outlined
            autocomplete="username"
            data-cy="username"
            :rules="[v => !!v || 'Ce champs est obligatoire']"
          />
        </div>
        <div>
          <v-text-field
            v-model="password"
            prepend-icon="fas fa-lock"
            label="Mot de passe"
            required
            outlined
            type="password"
            autocomplete="current-password"
            data-cy="password"
            :rules="[v => !!v || 'Ce champs est obligatoire']"
          />
        </div>
        <div style="text-align: center">
          <v-btn
            color="accent"
            :disabled="!isFormValid"
            @click="login()"
          >
            Se connecter
          </v-btn>
        </div>
        <p class="errorMsg">
          {{ error }}
        </p>
      </v-form>
    </v-card>
    <div style="margin: 10px auto; text-align: center; opacity: 0.5;">
      <router-link
        to="/forgotten"
        style="text-decoration: none"
      >
        J'ai oublié mes identifiants
      </router-link>
    </div>
  </v-container>
</template>



<script>
import Vue from "vue";
import axios from "axios";
import store from "../../store";
import { parseAxiosResponse, getPeopleAvatar } from "../../middleware/CommonHelper";
import { logUser } from "../../middleware/AuthHelper";

export default {
    name: "Login",
    data: () => ({
        username: "",
        password: "",
        error: "",
    }),
    computed: {
        isFormValid() {
            // Simple validation: both fields must be filled
            return this.username && this.username.length > 0 && 
                   this.password && this.password.length > 0;
        }
    },
    mounted() {
        localStorage.removeItem('user');
    },
    methods: {
        login() {
            let data = {
                username: this.username,
                password: this.password
            };
            axios.post("/api/auth/login", data)
                .then(response => {
                    // L'utilisateur est bien identifié
                    let user = parseAxiosResponse(response);
                    // On log l'utilisateur
                    logUser(store, user);
                    // On redirige vers l'accueil
                    this.$router.replace({path: `/`});
                })
                .catch(error => {
                    // Cas spécial de l'erreur mot de passe à réinitialiser
                    if (error.response && error.response.data && error.response.data.message === "Réinitialisation du mot de passe requis.") {
                        store.commit('onNotif', [
                            "Réinitialisation de votre mot de passe",
                            `${this.username}, un email t'as été envoyé pour réinitialiser ton mot de passe.
                            Penses a regarder dans les spams si tu ne le trouve pas.`
                        ]);
                        return;
                    }
                    // Autres erreurs
                    store.dispatch('onError', error);
                });
        }
    }

}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

.errorMsg {
    position: absolute;
    font-size: 1em;
    color: $error;
    bottom: 10px;
    margin: 0;
    left: 0;
    right: 0;
    text-align: center
}
</style>
