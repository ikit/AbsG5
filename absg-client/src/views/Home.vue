<template>
  <div class="home" style="margin-top: 50px;" v-cloak>
    <v-container fluid grid-list-md align-center>
      <v-layout justify-center row>
        <v-flex shrink>
          <v-img
            :src="require('../assets/logo.png')"
            >
          </v-img>
        </v-flex>
      </v-layout>
      <v-layout justify-center row>
        <v-flex sm8 md6>
          <v-card class="absgCard" style="margin: auto">
            <div style="float:left; margin: 10px;">
              <v-icon>fas fa-quote-left</v-icon> <span style="font-weight: bold; font-size: 1.3em; color: #555; margin-left: 10px;">{{citation.author}}</span>
            </div>
              <div class="citation">{{citation.citation}}</div>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout justify-center wrap style="margin-top: 20px;">
        
        <v-flex sm12 md6 lg4 align-self-center>
          <v-card >
            <v-card-title primary-title>
              <h1>Dernières activités</h1>
            </v-card-title>
            <v-list two-line>
              <template v-for="(item, index) in logs">
                <v-list-tile
                  :key="item.title"
                  avatar
                  ripple
                  @click="toggle(index)"
                >
                  <v-list-tile-content>
                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                    <v-list-tile-sub-title class="text--primary">{{ item.headline }}</v-list-tile-sub-title>
                    <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-list-tile-action-text>{{ item.action }}</v-list-tile-action-text>
                    <v-icon
                      v-if="selected.indexOf(index) < 0"
                      color="grey lighten-1"
                    >
                      star_border
                    </v-icon>

                    <v-icon
                      v-else
                      color="yellow darken-2"
                    >
                      star
                    </v-icon>
                  </v-list-tile-action>

                </v-list-tile>
                <v-divider
                  v-if="index + 1 < logs.length"
                  :key="index"
                ></v-divider>
              </template>
            </v-list>
          </v-card>
        </v-flex>
        
        <v-flex sm12 md6 lg4 align-self-center>
          <v-card >
            
            <v-img
              src="http://absolumentg.fr/assets/img/immt/2019_003.jpg"
              aspect-ratio="1"
            ></v-img>
            <v-card-title primary-title>
              <p style="text-align:center;">Bonne année 2019 !</p>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>

  
</template>



<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
})
export default class Home extends Vue {
  citation = {
    author: "Alain",
    citation: "C'est dans la baignoire qu'on se douche !",
  };
  selected = [2];
  logs = [
    {
      action: '15 min',
      headline: 'Brunch this weekend?',
      title: 'Ali Connors',
      subtitle: "I'll be in your neighborhood doing errands this weekend. Do you want to hang out?"
    },
    {
      action: '2 hr',
      headline: 'Summer BBQ',
      title: 'me, Scrott, Jennifer',
      subtitle: "Wish I could come, but I'm out of town this weekend."
    },
    {
      action: '6 hr',
      headline: 'Oui oui',
      title: 'Sandra Adams',
      subtitle: 'Do you have Paris recommendations? Have you ever been?'
    },
    {
      action: '12 hr',
      headline: 'Birthday gift',
      title: 'Trevor Hansen',
      subtitle: 'Have any ideas about what we should get Heidi for her birthday?'
    },
    {
      action: '18hr',
      headline: 'Recipe to try',
      title: 'Britta Holt',
      subtitle: 'We should eat this: Grate, Squash, Corn, and tomatillo Tacos.'
    }
  ];
  
  toggle (index: number) {
    const i = this.selected.indexOf(index)

    if (i > -1) {
      this.selected.splice(i, 1)
    } else {
      this.selected.push(index)
    }
  }

}
</script>


<style scoped>
  h1 {
    color: rgba(0, 0, 0, 0.5);
    text-shadow: 0 1px #fff;
    font-size: 25px;
    font-weight: 100;
    margin-top: 70px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }

  .absgCard{
    background-position: bottom left; 
    background-repeat: no-repeat; 
    background-image: url('../assets/zaffaneries/005/rang-05.png.v.png');
    max-width: 600px;
    min-height: 100px;

  }
  .citation {
    display: block;
    clear: both;
    text-align: center;
    font-size: 1.1em;
  }
</style>