<template>
<v-container fluid  grid-list-md>
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
        <tr v-for="item in palmares" :key="item.userId">
          <td>{{ item.username }}</td>
          <td>{{ item.totalAward }}</td>
          <td>{{ item.totalPoints }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</v-container>
</template>


<script>
import axios from 'axios';

export default {
    name: 'Palmares',
    data: () => ({
        palmares: null
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
