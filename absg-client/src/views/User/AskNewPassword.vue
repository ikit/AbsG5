<template>
    <v-container>
        <v-card style="width: 400px; padding:50px; margin: auto; margin: 50px auto">
            <v-form v-if="!sent" ref="form" v-model="valid">
                <v-text-field
                    v-model="email"
                    label="Votre adresse email"
                    :rules="rules"
                    required
                    outlined
                    type="email"
                ></v-text-field>
                <div style="text-align: center">
                    <v-btn color="accent" @click="go()" :disabled="!valid">Réinitialiser mon mot de passe</v-btn>
                </div>
            </v-form>
            <div v-if="sent" style="text-align: center">
                <h3>Merci.</h3>
                <p>Un message a été envoyé à l'adresse email indiqué afin de vous expliquer la marche à suivre pour réinitialiser votre mot de passe.</p>
            </div>
        </v-card>
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
        sent: false,

        valid: false,
        email: "",
        rules: [
            v => !!v || "L'e-mail est obligatoire",
            v => /.+@.+\..+/.test(v) || "Cette adresse email n'est pas valide",
        ],
    }),
    methods: {
        go() {
            axios.post("/api/auth/ask-new-pwd", { email: this.email })
            .then(response => {
                const user = parseAxiosResponse(response);
                if (user) {
                    // Le changement de mot de passe s'est bien déroulé, on met à jour la session de l'utilisateur
                    store.commit("logUser", user);

                    // On redirige vers la page d'accueil
                    this.$router.push('/');
                }
                this.sent = true;
            }).catch(err => {
                store.commit('onError', err);
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
