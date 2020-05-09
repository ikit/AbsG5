<template>
    <v-container>
        <v-card style="width: 400px; padding:50px; margin: auto; margin-top: 100px; position: relative">
            <v-form  v-on:submit="login" v-model="valid" >
                <div>
                    <v-text-field
                        prepend-icon="fas fa-user"
                        label="Identifiant"
                        required
                        outlined
                        autocomplete="username"
                        v-model="username"
                        :rules="[v => !!v || 'Ce champs est obligatoire']">
                    </v-text-field>
                </div>
                <div>
                    <v-text-field
                        prepend-icon="fas fa-lock"
                        label="Mot de passe"
                        required
                        outlined
                        type="password"
                        autocomplete="current-password"
                        v-model="password"
                        :rules="[v => !!v || 'Ce champs est obligatoire']">
                    </v-text-field>
                </div>
                <div style="text-align: center">
                    <v-btn color="accent" @click="login()" :disabled="!valid">Se connecter</v-btn>
                </div>
                <p class="errorMsg">
                    {{ error }}
                </p>
            </v-form>
        </v-card>
        <div style="margin: 10px auto; text-align: center; opacity: 0.5;">
            <router-link to="/forgotten" style="text-decoration: none">
                J'ai oublié mes identifiants
            </router-link>
        </div>

    </v-container>
</template>



<script>
import Vue from "vue";
import axios from "axios";
import store from "../store";
import { parseAxiosResponse, getPeopleAvatar } from "../middleware/CommonHelper";
import { logUser } from "../middleware/AuthHelper";

export default {
    name: "Login",
    data: () => ({
        valid: false,
        username: "",
        password: "",
        error: "",
    }),
    methods: {
        login: function () {

        let data = {
            username: this.username,
            password: this.password
        }
        axios.post("/api/auth/login", data)
            .then(response => {
                let user = parseAxiosResponse(response);
                // On log l'utilisateur
                logUser(store, user);
                // On redirige vers l'accueil
                this.$router.replace({path: `/`});
            })
            .catch((errors) => {
                this.error = "Echec de l'authentification."
            })
        }
    }

}
</script>


<style lang="scss" scoped>
@import '../themes/global.scss';

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
