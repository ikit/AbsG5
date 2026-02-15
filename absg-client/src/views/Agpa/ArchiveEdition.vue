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
      <!-- Titre des catégories -->
      <div class="archive-section-heading">
        <h2 class="archive-section-title">
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
          <div class="archive-cat-header">
            <span class="archive-cat-title">
              {{ current.categories[catIdx].title }}
            </span>
            <div class="flex-grow-1" />
            <v-tooltip bottom>
              <template #activator="{ props }">
                <span
                  class="archive-stat-value"
                  v-bind="props"
                ><i class="far fa-user" /> {{ current.categories[catIdx].totalUsers }}</span>
              </template>
              <span>Nombre total de participants</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ props }">
                <span
                  class="archive-stat-value"
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
                  <td class="text-left">
                    <span
                      v-for="a of p.awards"
                      :key="a"
                    >
                      <i
                        v-if="a == 'diamond'"
                        class="fas fa-circle award-diamond"
                      />
                      <i
                        v-if="a == 'gold'"
                        class="fas fa-circle award-gold"
                      />
                      <i
                        v-if="a == 'sylver'"
                        class="fas fa-circle award-silver"
                      />
                      <i
                        v-if="a == 'bronze'"
                        class="fas fa-circle award-bronze"
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
                  <td class="text-left">
                    {{ p.user.username }}
                  </td>
                  <td class="text-left">
                    {{ p.title }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-list>

          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn
                class="archive-gallery-btn"
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

      <!-- Bouton de téléchargement des données -->
      <div class="archive-download-section">
        <v-tooltip bottom>
          <template #activator="{ props }">
            <v-btn
              color="primary"
              variant="outlined"
              v-bind="props"
              :loading="isDownloading"
              @click="downloadData"
            >
              <v-icon start>fas fa-download</v-icon>
              Télécharger les données
            </v-btn>
          </template>
          <span>Télécharger les données de l'édition {{ year }} (photos, votes, awards, badges) au format CSV</span>
        </v-tooltip>
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
        isDownloading: false,
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
        async downloadData() {
            this.isDownloading = true;
            try {
                const response = await axios.get(`/api/agpa/archives/${this.year}/files`, {
                    responseType: 'blob'
                });
                // Créer un lien de téléchargement
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `AGPA-${this.year}.zip`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading data:', error);
            } finally {
                this.isDownloading = false;
            }
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
    background: rgb(var(--v-theme-surface));
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}

.archive-section-heading {
    text-align: center;
    margin: 40px 20px 20px;
}

.archive-section-title {
    font-family: 'Tangerine', serif;
    font-size: 3em;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.archive-cat-header {
    padding: 5px 15px;
    margin: 0;
    background: rgba(var(--v-theme-on-surface), 0.05);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
    border-width: 1px 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.archive-cat-title {
    font-family: 'Tangerine', serif;
    font-size: 2em;
}

.archive-stat-value {
    line-height: 48px;
}

.archive-gallery-btn {
    margin-top: 20px;
}

.archive-download-section {
    text-align: center;
    margin: 60px 20px 40px;
    padding-top: 40px;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.15);
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
