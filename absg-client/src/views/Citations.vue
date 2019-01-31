<template>
  <div class="home" style="margin-top: 50px;">
    <h1>Les citations cultes</h1>
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
          :items="authors"
          label="Sélectionner un auteur"
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
          Nouvelle citation
        </v-btn>
        </v-flex>

      </v-layout>
    </v-container>
  </v-form>
    </v-card>
    <v-card style="margin: 14px;">
    <v-list two-line>
          <template v-for="(item, index) in items">
            <v-subheader
              v-if="item.header"
              :key="item.header"
            >
              {{ item.header }}
            </v-subheader>

            <v-divider
              v-else-if="item.divider"
              :inset="item.inset"
              :key="index"
            ></v-divider>

            <v-list-tile
              v-else
              :key="item.title"
              avatar
            >
              <v-list-tile-avatar>
                <img :src="item.avatar">
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title v-html="item.title"></v-list-tile-title>
                <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
    </v-card>
  </div>
</template>



<script lang="ts">
export default  {
    data: () => ({
        authors: ['Olivier', 'Jocelyne', 'Denis', 'Alain', 'Annie'],
        items: [
          {
            avatar: 'http://absolumentg.fr/assets/img/avatars/005.png',
            title: 'Brunch this weekend?',
            subtitle: "<span class='text--primary'>Ali Connors</span> &mdash; I'll be in your neighborhood doing errands this weekend. Do you want to hang out?"
          },
          { divider: true, inset: true },
          {
            avatar: 'http://absolumentg.fr/assets/img/avatars/012.png',
            title: 'Summer BBQ <span class="grey--text text--lighten-1">4</span>',
            subtitle: "<span class='text--primary'>to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend."
          },
          { divider: true, inset: true },
          {
            avatar: 'http://absolumentg.fr/assets/img/avatars/013.png',
            title: 'Oui oui',
            subtitle: "<span class='text--primary'>Sandra Adams</span> &mdash; Do you have Paris recommendations? Have you ever been?"
          }
        ]
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