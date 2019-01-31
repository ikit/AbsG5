<template>
  <div class="home" style="margin-top: 50px;">
    <h1>Les images du moment</h1>
    <!-- <CitationsList/> -->
    <v-card style="margin: 14px;">
      <v-form v-model="valid">
    <v-container>
      <v-layout>
        <v-flex
          sm12
          md3
        >
          <v-text-field
            v-model="firstname"
            label="Rechercher"
          ></v-text-field>
        </v-flex>

        <v-flex
          sm12
          md3
        >
          <v-select
          :items="posters"
          label="Sélectionner un posteur"
        ></v-select>
        </v-flex>

        <v-flex
          sm12
          md3
        >
          
        </v-flex>
        <v-flex
          sm12
          md3
        >
        <v-btn color="primary" slot="activator">
          <v-icon left>fas fa-plus</v-icon>
          Nouvelle image
        </v-btn>
        </v-flex>

      </v-layout>
    </v-container>
  </v-form>
    </v-card>
    <v-card style="margin: 14px;">
        <v-subheader>2019</v-subheader>
        <v-container fluid grid-list-sm>
          <v-layout row wrap>
            <v-flex v-for="i in 15" :key="i" xs2>
              <img :src="`https://randomuser.me/api/portraits/men/${i + 20}.jpg`" class="image" alt="lorem" width="100%" height="100%">
            </v-flex>
          </v-layout>
        </v-container>
        <v-subheader>2018</v-subheader>
        <v-container fluid grid-list-sm>
          <v-layout row wrap>
            <v-flex v-for="i in 27" :key="i" xs2>
              <img :src="`https://randomuser.me/api/portraits/women/${i + 5}.jpg`" class="image" alt="lorem" width="100%" height="100%">
            </v-flex>
          </v-layout>
        </v-container>
        <v-footer class="mt-5"></v-footer>
      </v-card>
  </div>
</template>



<script lang="ts">
export default  {
    data: () => ({
        posters: ['Olivier', 'Jocelyne', 'Denis', 'Alain', 'Annie']
    })
}
</script>

<style lang="scss" scoped>
  @import '../assets/fonts.css';
  @import '../assets/global.scss';
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
    font-family: "AbsgFont", sans-serif;
    margin: 20px 0 60px 0;
  }
</style>