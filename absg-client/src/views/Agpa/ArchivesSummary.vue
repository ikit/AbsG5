<template>
  <v-container
    v-if="summary"
    fluid
  >
    <v-row justify="center">
      <v-col
        v-for="edition in summary"
        :key="edition.year"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="3"
      >
        <router-link
          :to="{path: '/agpa/archives/' + edition.year}"
          style="text-decoration: none"
        >
          <v-card class="edition-card">
            <v-img
              :src="getEditionPhoto(edition)"
              height="200"
              cover
            />

            <v-card-title class="edition-title">
              <h3 class="headline mb-0">
                Edition {{ edition.year }}
              </h3>
              <div class="authors-avatars">
                <v-tooltip
                  v-for="(author, index) in edition.authors"
                  :key="author.id"
                  bottom
                >
                  <template #activator="{ props }">
                    <img
                      class="author-avatar"
                      :src="getAvatar(author)"
                      :alt="getName(author)"
                      v-bind="props"
                    >
                  </template>
                  <span>{{ `${getPlace(index)}: ${getName(author)}` }}</span>
                </v-tooltip>
              </div>
            </v-card-title>

            <v-card-actions class="edition-actions">
              <span class="photo-count">{{ edition.totalPhotos }} photos</span>

              <v-tooltip
                v-if="edition.palmares"
                bottom
              >
                <template #activator="{ props }">
                  <div
                    class="palmares-badges"
                    v-bind="props"
                  >
                    <template v-if="edition.palmares.diamond">
                      <i
                        class="fas fa-circle"
                        style="color: #c3f1ff"
                      /> {{ edition.palmares.diamond }}
                    </template>
                    <template v-if="edition.palmares.gold">
                      <i
                        class="fas fa-circle"
                        style="color: #c68b00"
                      /> {{ edition.palmares.gold }}
                    </template>
                    <template v-if="edition.palmares.sylver">
                      <i
                        class="fas fa-circle"
                        style="color: #9b9b9b"
                      /> {{ edition.palmares.sylver }}
                    </template>
                    <template v-if="edition.palmares.bronze">
                      <i
                        class="fas fa-circle"
                        style="color: #964c31"
                      /> {{ edition.palmares.bronze }}
                    </template>
                    <template v-if="edition.palmares.nominated">
                      <i class="far fa-circle" /> {{ edition.palmares.nominated }}
                    </template>
                    <template v-if="edition.palmares.honor">
                      <i class="far fa-smile" /> {{ edition.palmares.honor }}
                    </template>
                  </div>
                </template>
                <span>Mon palmarès {{ edition.year }}</span>
              </v-tooltip>
            </v-card-actions>
          </v-card>
        </router-link>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import axios from 'axios';
import { mapState } from '../../stores/helpers';
import { getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    name: 'ArchivesSummary',
    data: () => ({
        summary: []
    }),
    mounted () {
        axios.get(`/api/agpa/archives`).then(response => {
            this.summary = parseAxiosResponse(response);
            this.isLoading = false;
        }).catch( err => {
            this.main.onError(err);
        });
    },
    computed: {
        ...mapState(['main'])
    },
    methods: {
        getPlace(index) {
            return ["1er", "2e", "3e", "4e"][index];
        },
        getAvatar(author) {
            return getPeopleAvatar(author).url;
        },
        getName(author) {
            return author.firstname;
        },
        getEditionPhoto (edition) {
            if (edition) {
                return `/files/agpa/${edition.year}/mini/${edition.photos[0].filename}`;
            }
            return null
        },
    }

};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;

.edition-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0px 4px 8px rgba(0,0,0,0.2);
    }
}

.edition-title {
    position: relative;
    padding-bottom: 10px;
    flex-grow: 1;

    h3 {
        font-family: 'Tangerine', serif;
        color: #c0b44f;
        font-size: 2em;
        font-weight: bold;
        margin: 0;
    }
}

.authors-avatars {
    position: absolute;
    top: 10px;
    right: 15px;
    display: flex;
    gap: 5px;
    flex-direction: row-reverse;
}

.author-avatar {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    object-fit: cover;
}

.edition-actions {
    position: relative;
    padding: 12px 16px;
    border-top: 1px solid rgba(0,0,0,0.12);
}

.photo-count {
    font-weight: 500;
    color: rgba(0,0,0,0.6);
}

.palmares-badges {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.9em;
    display: flex;
    gap: 8px;
    align-items: center;
}
</style>
