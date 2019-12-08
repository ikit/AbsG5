<template>
    <form  v-on:submit="login" method="post">
        <div>
            <label>Identifiant:</label>
            <v-text-field
                prepend-icon="fas fa-user"
                placeholder="Login"
                v-model="username">
            </v-text-field>
        </div>
        <div>
            <v-text-field
                prepend-icon="fas fa-lock"
                placeholder="Mot de passe"
                v-model="password">
            </v-text-field>
        </div>
        <div>
            <v-btn color="accent" @click="login()">Se connecter</v-btn>
        </div>
    </form>
</template>



<script>
import Vue from 'vue';
import axios from 'axios';
import { parseAxiosResponse, getPeopleAvatar } from '../middleware/CommonHelper';

export default {
    name: "Login",
    data: () => ({
        username: "Olive",
        password: ""
    }),
    methods: {
        login: function () {

            localStorage.setItem("toto", "coucou");

        let data = {
            username: this.username,
            password: this.password
        }
        axios.post("/api/auth/login", data)
            .then(response => {
                const user = parseAxiosResponse(response);
                if (user && user.token) {
                    // On sauvegarde les infos sur l'utilisateurs dans le store
                    // TODO
                    // On sauvegarde localement le token de session dans le navigateur
                    localStorage.setItem('user', JSON.stringify(user));
                    // On indique à axios que désormais chaque requête faites à l'API devra transmettre le token de session dans le header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
                }
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
