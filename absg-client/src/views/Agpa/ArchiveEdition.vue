<template>
  <section id="content">
    <div :class="{ stickyHeader: $vuetify.display.lgAndUp, stickyHeaderSmall: !$vuetify.display.lgAndUp }">
      <v-row style="padding: 15px">
        <v-tooltip
          v-if="$vuetify.display.mdAndUp"
          bottom
        >
          <template #activator="{ props }">
            <v-btn
              depressed
              small
              :to="{path: '/agpa/archives/' }"
              v-bind="props"
            >
              <v-icon left>
                fas fa-chevron-left
              </v-icon>
              <span>Retour</span>
            </v-btn>
          </template>
          <span>Retour au sommaire des archives</span>
        </v-tooltip>
        <v-tooltip
          v-else
          bottom
        >
          <template #activator="{ on }">
            <v-btn
              small
              depressed
              :to="{path: '/agpa/archives/' }"
              v-on="on"
            >
              <v-icon>fas fa-chevron-left</v-icon>
            </v-btn>
          </template>
          <span>Retour au sommaire des archives</span>
        </v-tooltip>

        <v-spacer />

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              small
              :disabled="isLoading"
              v-on="on"
              @click="gotoNextYear(-1)"
            >
              <v-icon>fa-chevron-left</v-icon>
            </v-btn>
          </template>
          <span>Edition précédente</span>
        </v-tooltip>
        <span class="grey--text">
          {{ year }}
        </span>
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              small
              :disabled="isLoading"
              v-on="on"
              @click="gotoNextYear(1)"
            >
              <v-icon>fa-chevron-right</v-icon>
            </v-btn>
          </template>
          <span>Edition suivante</span>
        </v-tooltip>

        <v-spacer />
      </v-row>
      <v-progress-linear
        v-if="isLoading"
        color="accent"
        indeterminate
        style="position: absolute; bottom: -5px; left: 0; right: 0; height: 5px"
      />
    </div>

    <div v-if="current && agpaMeta">
      <!-- <v-row style="margin: 15px; ">
                <v-card width="400px">
                    classement auteurs
                </v-card>
                <v-spacer></v-spacer>
                <v-card width="400px">
                    meilleur photo
                </v-card>
                <v-spacer></v-spacer>
                <v-card width="400px">
                    meilleur titre
                </v-card>
            </v-row> -->

      <v-row
        v-for="catIdx of current.categoriesOrders"
        :key="catIdx"
        style="margin: 15px; margin-top: 50px; flex-wrap: nowrap;"
      >
        <v-card style="margin: 15px; width: 400px; min-width: 400px; display: relative; padding: 40px 0 10px 0;">
          <img
            :src="`/img/agpa/cupesMaxi/c${catIdx}.png`"
            width="100px"
            style="position: absolute; top: -50px; left: 150px"
          >
          <v-row style="padding: 5px 15px; margin: 0; background: #efefef; border: 1px solid #ddd; border-width: 1px 0">
            <span style="font-family: 'Tangerine', serif; font-size: 2em">
              {{ current.categories[catIdx].title }}
            </span>
            <v-spacer />
            <v-tooltip bottom>
              <v-spacer />
              <template #activator="{ on }">
                <span
                  style="line-height: 48px"
                  v-on="on"
                ><i class="far fa-user" /> {{ current.categories[catIdx].totalUsers }}</span>
              </template>
              <span>Nombre total de participants</span>
            </v-tooltip>
                        &nbsp; &nbsp;
            <v-tooltip bottom>
              <v-spacer />
              <template #activator="{ on }">
                <span
                  style="line-height: 48px"
                  v-on="on"
                ><i class="far fa-image" /> {{ current.categories[catIdx].totalPhotos }}</span>
              </template>
              <span>Nombre total de photos</span>
            </v-tooltip>
          </v-row>

          <v-list>
            <v-simple-table dense>
              <template #default>
                <tbody>
                  <tr
                    v-for="p of current.categories[catIdx].photos"
                    :key="p.id"
                  >
                    <td style="text-align: left">
                      <span
                        v-for="a of p.awards"
                        :key="a"
                      >
                        <i
                          v-if="a == 'diamond'"
                          class="fas fa-circle"
                          style="color: #c3f1ff"
                        />
                        <i
                          v-if="a == 'gold'"
                          class="fas fa-circle"
                          style="color: #c68b00"
                        />
                        <i
                          v-if="a == 'sylver'"
                          class="fas fa-circle"
                          style="color: #9b9b9b"
                        />
                        <i
                          v-if="a == 'bronze'"
                          class="fas fa-circle"
                          style="color: #964c31"
                        />
                        <i
                          v-if="a == 'nominated'"
                          class="far fa-circle"
                        />
                        <i
                          v-if="a == 'honor'"
                          class="far fa-smile"
                        />
                      </span>
                    </td>
                    <td style="text-align: left">
                      {{ p.user.username }}
                    </td>
                    <td style="text-align: left">
                      {{ p.title }}
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-list>

          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn
                style="margin-top: 20px"
                depressed
                :to="{path: `/agpa/archives/${year}/${catIdx}` }"
                v-on="on"
              >
                <v-icon left>
                  far fa-images
                </v-icon>
                <span v-if="$vuetify.display.mdAndUp">Galerie</span>
              </v-btn>
            </template>
            <span>Voir les photos de la catégorie {{ current.categories[catIdx].title }} </span>
          </v-tooltip>
        </v-card>
        <div style="overflow: hidden; display: flex; width: 100%;">
          <div
            v-for="photo of current.categories[catIdx].photos"
            :key="photo.id"
            style="display: inline-block; width: 250px; height: 250px; margin: auto;"
          >
            <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <img
                    class="thumb"
                    :src="photo.thumb"
                    v-on="on"
                    @click="photosGalleryDisplay(photo.idx)"
                  >
                </template>
                <span>{{ photo.username }} - {{ photo.title }}</span>
              </v-tooltip>
            </div>
          </div>
        </div>
      </v-row>
    </div>
  </section>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { mapState } from 'vuex';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';

export default {
    store,
    data: () => ({
        isLoading: true,
        current: null,
        error: null,
        year: 0,
    }),
    computed: {
        ...mapState([
            'agpaMeta',
            'photosGallery',
        ])
    },
    watch: {
        $route(to, from) {
            this.initView();
        }
    },
    mounted () {
        this.initView();
    },
    methods: {
        initView() {
            this.isLoading = true;

            // Reset photos list
            this.photosGalery = [];
            this.year = Number.parseInt(this.$route.params.year);
            this.category = Number.parseInt(this.$route.params.catId);

            axios.get(`/api/agpa/archives/${this.year}`).then(response => {
                this.current = parseAxiosResponse(response);
                // Prepare photo galery
                if (this.current) {
                    const photosGalery = [];
                    let idx = 0;
                    for (let catId in this.current.categories) {
                        const cat = this.current.categories[catId];
                        if (catId > 0) {
                            for (let photoIdx = 0;  photoIdx < this.current.categories[catId].photos.length; photoIdx++) {
                                const p = agpaPhotoToGalleryPhoto(this.current.categories[catId].photos[photoIdx]);
                                p.idx = idx;
                                photosGalery.push(p);
                                idx++;
                                this.current.categories[catId].photos[photoIdx] = {
                                    ...this.current.categories[catId].photos[photoIdx],
                                    ...p
                                }
                            }
                        }
                    }
                    store.commit('photosGalleryReset', photosGalery);
                }
                this.isLoading = false;
            });
        },
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },
        photosGalleryHide() {
            store.commit('photosGalleryHide');
        },
        gotoNextYear(step) {
            let nextYear = this.year + step;
            nextYear = nextYear > this.agpaMeta.maxYear ? this.agpaMeta.minYear : nextYear;
            nextYear = nextYear < this.agpaMeta.minYear ? this.agpaMeta.maxYear : nextYear;
            this.$router.replace({path: `/agpa/archives/${nextYear}`});
        },
    }

};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
@import '../../themes/agpa.scss';

#content {
    text-align: center;
}


.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}

</style>
