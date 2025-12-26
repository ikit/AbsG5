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
  </v-container>
</template>

<script>
import axios from 'axios';
import store from "../../store";
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
@use '../../themes/global.scss' as *;
</style>
