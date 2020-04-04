<template>
    <v-card style="width: 400px; padding:50px; margin: auto; margin-top: 100px">
        <form  v-on:submit="login" method="post" >
            <div>
                <v-text-field
                    prepend-icon="fas fa-user"
                    label="Identifiant"
                    :outlined="true"
                    v-model="username">
                </v-text-field>
            </div>
            <div>
                <v-text-field
                    prepend-icon="fas fa-lock"
                    label="Mot de passe"
                    :outlined="true"
                    type="password"
                    v-model="password">
                </v-text-field>
            </div>
            <div style="text-align: center">
                <v-btn color="accent" @click="login()">Se connecter</v-btn>
            </div>
        </form>
    </v-card>
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
        username: "",
        password: ""
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
                console.log("Cannot log in", errors)
            })
        }
    }

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
    margin-bottom: 100px;
}
p {
    text-align: center;
    color: #999;
    font-size: 1.5em;
}
</style>
