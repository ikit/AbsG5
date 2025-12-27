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
              size="small"
              :to="{path: '/agpa/archives/' }"
              v-bind="props"
            >
              <v-icon start>
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
          <template #activator="{ props }">
            <v-btn
              size="small"
              :to="{path: '/agpa/archives/' }"
              v-bind="props"
            >
              <v-icon>fas fa-chevron-left</v-icon>
            </v-btn>
          </template>
          <span>Retour au sommaire des archives</span>
        </v-tooltip>

        <v-spacer />

        <v-tooltip bottom>
          <template #activator="{ props }">
            <v-btn
              variant="text"
              size="small"
              :disabled="isLoading"
              v-bind="props"
              @click="gotoNextYear(-1)"
            >
              <v-icon>fas fa-chevron-left</v-icon>
            </v-btn>
          </template>
          <span>Edition précédente</span>
        </v-tooltip>
        <span class="text-grey">
          {{ year }}
        </span>
        <v-tooltip bottom>
          <template #activator="{ props }">
            <v-btn
              variant="text"
              size="small"
              :disabled="isLoading"
              v-bind="props"
              @click="gotoNextYear(1)"
            >
              <v-icon>fas fa-chevron-right</v-icon>
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
        class="loading-bar"
      />
    </div>

    <div v-if="current && agpaMeta">
      <!-- Section Prix Hors Catégorie -->
      <div :style="{
        display: 'grid',
        gridTemplateColumns: $vuetify.display.mobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        margin: '20px',
        marginBottom: '40px'
      }">
        <!-- Meilleur Photographe -->
        <v-card style="padding: 20px; position: relative; overflow: visible;">
          <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%);">
            <v-icon size="60" color="#c68b00">fas fa-trophy</v-icon>
          </div>
          <div style="text-align: center; margin-top: 40px;">
            <div style="font-family: 'Tangerine', serif; font-size: 2.5em; margin-bottom: 10px;">
              Meilleur Photographe
            </div>
            <div v-if="current.bestPhotographer" style="font-size: 1.3em; font-weight: bold; margin-bottom: 5px;">
              {{ current.bestPhotographer.username }}
            </div>
            <div v-if="current.bestPhotographer" style="color: #666;">
              {{ current.bestPhotographer.score }} points
            </div>
            <div v-else style="color: #999; font-style: italic;">
              Non attribué
            </div>
          </div>
        </v-card>

        <!-- Meilleure Photographie -->
        <v-card style="padding: 20px; position: relative; overflow: visible;">
          <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%);">
            <v-icon size="60" color="#c3f1ff">fas fa-camera</v-icon>
          </div>
          <div style="text-align: center; margin-top: 40px;">
            <div style="font-family: 'Tangerine', serif; font-size: 2.5em; margin-bottom: 10px;">
              Meilleure Photographie
            </div>
            <div v-if="current.bestPhoto">
              <div style="font-size: 1.1em; font-weight: bold; margin-bottom: 3px;">
                {{ current.bestPhoto.title }}
              </div>
              <div style="color: #666; margin-bottom: 10px;">
                par {{ current.bestPhoto.username }}
              </div>
              <div v-if="current.bestPhoto.thumb" style="margin-top: 10px;">
                <img
                  :src="current.bestPhoto.thumb"
                  class="thumb"
                  style="max-height: 150px; cursor: pointer;"
                  @click="photosGalleryDisplay(current.bestPhoto.idx)"
                >
              </div>
            </div>
            <div v-else style="color: #999; font-style: italic;">
              Non attribuée
            </div>
          </div>
        </v-card>

        <!-- Meilleur Titre -->
        <v-card style="padding: 20px; position: relative; overflow: visible;">
          <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%);">
            <v-icon size="60" color="#9b9b9b">fas fa-pen-fancy</v-icon>
          </div>
          <div style="text-align: center; margin-top: 40px;">
            <div style="font-family: 'Tangerine', serif; font-size: 2.5em; margin-bottom: 10px;">
              Meilleur Titre
            </div>
            <div v-if="current.bestTitle">
              <div style="font-size: 1.3em; font-weight: bold; margin-bottom: 5px; font-style: italic;">
                "{{ current.bestTitle.title }}"
              </div>
              <div style="color: #666;">
                par {{ current.bestTitle.username }}
              </div>
            </div>
            <div v-else style="color: #999; font-style: italic;">
              Non attribué
            </div>
          </div>
        </v-card>
      </div>

      <!-- Titre des catégories -->
      <div style="text-align: center; margin: 40px 20px 20px;">
        <h2 style="font-family: 'Tangerine', serif; font-size: 3em; color: #666;">
          Catégories
        </h2>
      </div>

      <div
        v-for="catIdx of current.categoriesOrders"
        :key="catIdx"
        :style="{
          display: 'grid',
          gridTemplateColumns: $vuetify.display.mobile ? '1fr' : 'auto 1fr',
          gap: '20px',
          margin: '15px',
          marginTop: '50px'
        }"
      >
        <!-- Category Card -->
        <v-card :style="{
          width: $vuetify.display.mobile ? '100%' : '400px',
          minWidth: $vuetify.display.mobile ? 'auto' : '400px',
          padding: '40px 0 10px 0',
          position: 'relative',
          overflow: 'visible'
        }">
          <img
            :src="`/img/agpa/cupesMaxi/c${catIdx}.png`"
            width="100px"
            :style="{
              position: 'absolute',
              top: '-50px',
              left: $vuetify.display.mobile ? '50%' : '150px',
              transform: $vuetify.display.mobile ? 'translateX(-50%)' : 'none'
            }"
          >
          <div style="padding: 5px 15px; margin: 0; background: #efefef; border: 1px solid #ddd; border-width: 1px 0; display: flex; align-items: center; gap: 10px;">
            <span style="font-family: 'Tangerine', serif; font-size: 2em">
              {{ current.categories[catIdx].title }}
            </span>
            <div style="flex: 1" />
            <v-tooltip bottom>
              <template #activator="{ props }">
                <span
                  style="line-height: 48px"
                  v-bind="props"
                ><i class="far fa-user" /> {{ current.categories[catIdx].totalUsers }}</span>
              </template>
              <span>Nombre total de participants</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ props }">
                <span
                  style="line-height: 48px"
                  v-bind="props"
                ><i class="far fa-image" /> {{ current.categories[catIdx].totalPhotos }}</span>
              </template>
              <span>Nombre total de photos</span>
            </v-tooltip>
          </div>

          <v-list>
            <v-table density="compact">
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
            </v-table>
          </v-list>

          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn
                style="margin-top: 20px"
                :to="{path: `/agpa/archives/${year}/${catIdx}` }"
                v-bind="props"
              >
                <v-icon start>
                  far fa-images
                </v-icon>
                <span v-if="$vuetify.display.mdAndUp">Galerie</span>
              </v-btn>
            </template>
            <span>Voir les photos de la catégorie {{ current.categories[catIdx].title }} </span>
          </v-tooltip>
        </v-card>

        <!-- Photo Gallery -->
        <div :style="{
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px'
        }">
          <div
            v-for="photo of current.categories[catIdx].photos"
            :key="photo.id"
            :style="{
              display: 'inline-block',
              width: $vuetify.display.mobile ? '150px' : '250px',
              height: $vuetify.display.mobile ? '150px' : '250px',
              margin: $vuetify.display.mobile ? '0' : 'auto'
            }"
          >
            <div :style="{
              width: $vuetify.display.mobile ? '150px' : '250px',
              height: $vuetify.display.mobile ? '150px' : '250px',
              display: 'table-cell',
              textAlign: 'center',
              verticalAlign: 'middle'
            }">
              <v-tooltip bottom>
                <template #activator="{ props }">
                  <img
                    class="thumb"
                    :src="photo.thumb"
                    v-bind="props"
                    @click="photosGalleryDisplay(photo.idx)"
                  >
                </template>
                <span>{{ photo.username }} - {{ photo.title }}</span>
              </v-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<script>
import axios from 'axios';
import { mapState } from '../../stores/helpers';
import store from '../../stores/helpers';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';

export default {
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
            }).catch(error => {
                console.error('Error loading archive:', error);
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
@use '../../themes/global.scss' as *;
@use '../../themes/agpa.scss' as *;

#content {
    text-align: center;
}


.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}

.loading-bar {
    height: 3px;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

</style>
