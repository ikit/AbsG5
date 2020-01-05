<template>
<div>

    <v-container fluid  grid-list-md style="padding: 0; padding-top: 2px">
        <v-simple-table>
            <template v-slot:default>
            <thead>
                <tr>
                <th class="text-left">Photographe</th>
                <th class="text-left">Total AGPA</th>
                <th class="text-left">Total points</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in palmares" :key="item.userId" @click="displaydetails(item)" style="cursor: pointer">
                <td>{{ item.username }}</td>
                <td>{{ item.totalAward }}</td>
                <td>{{ item.totalPoints }}</td>
                </tr>
            </tbody>
            </template>
        </v-simple-table>
    </v-container>

    <v-dialog v-if="palmaresDetails" v-model="palmaresDetails" width="800px">
        <v-card >
            <v-card-title class="grey lighten-4 py-4 title">
                Palmarès de {{ palmaresDetails.username }}
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
                <v-simple-table>
                    <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left"></th>
                            <th class="text-left">Nomination</th>
                            <th class="text-left">Bronze</th>
                            <th class="text-left">Argent</th>
                            <th class="text-left">Or</th>
                            <th class="text-left">Diamant</th>
                            <th class="text-left">AGPA total</th>
                            <th class="text-left">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="i in palmaresDetails.statsByCategories" :key="i.id">
                            <td>{{ i.title }}</td>
                            <td>{{ i.stats[0] }}</td>
                            <td>{{ i.stats[1] }}</td>
                            <td>{{ i.stats[2] }}</td>
                            <td>{{ i.stats[3] }}</td>
                            <td>{{ i.stats[4] }}</td>
                            <td>{{ i.stats[5] }}</td>
                            <td>{{ i.stats[6] }}</td>
                        </tr>
                    </tbody>
                    </template>
                </v-simple-table>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="closeDialog()">fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>


<script>
import axios from 'axios';

export default {
    name: 'Palmares',
    data: () => ({
        palmares: null,
        palmaresDetails: null
    }),
    props: ['current'],
    mounted () {
        this.initView();
    },
    methods: {
        initView() {
            // Reset photos list

            axios.get(`/api/agpa/palmares`).then(response => {
                console.log(response.data);
                this.palmares = response.status === 200 ? response.data.data : null;
                this.error = response.status !== 200 ? response : null;

                this.isLoading = false;
            });
        },
        displaydetails(palmares) {
            this.palmaresDetails = palmares;
            console.log("details", palmares);
        },
        closeDialog() {
            this.palmaresDetails = null;
        }
    }
};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 40px;
    font-family: "Comfortaa", sans-serif;
    margin: 20px 0 60px 0;
}
</style>
