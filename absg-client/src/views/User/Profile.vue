<template>
  <div>
    <v-container class="profile-container">
      <!-- Chargement -->
      <v-card v-if="isLoading">
        <v-card-text class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <div class="mt-4">Chargement du profil...</div>
        </v-card-text>
      </v-card>

      <template v-else-if="profile">
        <!-- Section Mon profil -->
        <v-card class="section-card">
          <v-card-title>
            <h2>Mon profil</h2>
          </v-card-title>

          <v-card-text>
            <!-- Informations utilisateur (lecture seule) -->
            <div class="row mb-4">
              <div class="column" style="flex: 0 0 auto; margin-right: 24px;">
                <img
                  :src="avatarUrl"
                  class="profile-avatar"
                  @error="(e) => e.target.src = '/img/default-avatar.png'"
                >
              </div>
              <div class="column readonly-info">
                <div class="info-row">
                  <v-icon size="small" class="info-icon">fas fa-user</v-icon>
                  <span class="info-label">Pseudo</span>
                  <span class="info-value">{{ profile.username }}</span>
                </div>
                <div class="info-row">
                  <v-icon size="small" class="info-icon">fas fa-users</v-icon>
                  <span class="info-label">Famille</span>
                  <span class="info-value">{{ capitalizeFamily(profile.rootFamily) || 'Non definie' }}</span>
                </div>
                <div class="info-row">
                  <v-icon size="small" class="info-icon">fas fa-user-tag</v-icon>
                  <span class="info-label">Roles</span>
                  <span class="info-value">
                    <v-chip
                      v-for="role in profile.roles"
                      :key="role"
                      size="x-small"
                      :color="getRoleColor(role)"
                      class="mr-1"
                    >
                      {{ getRoleLabel(role) }}
                    </v-chip>
                  </span>
                </div>
              </div>
            </div>

            <!-- Bandeau d'information AGPA -->
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="my-6"
              style="margin: 30px 0;"
            >
              <v-icon start size="small">fas fa-trophy</v-icon>
              Les informations ci-dessous sont utilisees pour les différents jeux et le calcul des badges AGPA.
            </v-alert>

            <!-- Informations personnelles modifiables -->
            <v-form ref="profileForm" v-model="profileValid">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="profileData.firstname"
                    prepend-icon="fas fa-id-card"
                    label="Prenom"
                    variant="underlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="profileData.lastname"
                    label="Nom"
                    variant="underlined"
                    density="compact"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="profileData.sex"
                    :items="sexes"
                    prepend-icon="fas fa-venus-mars"
                    label="Sexe"
                    variant="underlined"
                    density="compact"
                    item-title="label"
                    item-value="id"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="profileData.email"
                    prepend-icon="fas fa-envelope"
                    label="Email"
                    type="email"
                    :rules="emailRules"
                    variant="underlined"
                    density="compact"
                  />
                </v-col>
              </v-row>

              <!-- Relations familiales -->
              <v-row>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="profileData.motherId"
                    :items="mothersListForRelations"
                    prepend-icon="fas fa-female"
                    label="Mere"
                    variant="underlined"
                    density="compact"
                    clearable
                    item-title="displayName"
                    item-value="personId"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar size="32" class="relation-avatar">
                            <img :src="item.raw.url" class="relation-avatar-img">
                          </v-avatar>
                        </template>
                      </v-list-item>
                    </template>
                    <template #selection="{ item }">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <v-avatar size="24" class="relation-avatar">
                          <img :src="item.raw.url" class="relation-avatar-img">
                        </v-avatar>
                        {{ item.raw.displayName }}
                      </div>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="profileData.fatherId"
                    :items="fathersListForRelations"
                    prepend-icon="fas fa-male"
                    label="Pere"
                    variant="underlined"
                    density="compact"
                    clearable
                    item-title="displayName"
                    item-value="personId"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar size="32" class="relation-avatar">
                            <img :src="item.raw.url" class="relation-avatar-img">
                          </v-avatar>
                        </template>
                      </v-list-item>
                    </template>
                    <template #selection="{ item }">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <v-avatar size="24" class="relation-avatar">
                          <img :src="item.raw.url" class="relation-avatar-img">
                        </v-avatar>
                        {{ item.raw.displayName }}
                      </div>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="profileData.spouseId"
                    :items="spousesListForRelations"
                    prepend-icon="fas fa-heart"
                    label="Conjoint(e)"
                    variant="underlined"
                    density="compact"
                    clearable
                    item-title="displayName"
                    item-value="personId"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar size="32" class="relation-avatar">
                            <img :src="item.raw.url" class="relation-avatar-img">
                          </v-avatar>
                        </template>
                      </v-list-item>
                    </template>
                    <template #selection="{ item }">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <v-avatar size="24" class="relation-avatar">
                          <img :src="item.raw.url" class="relation-avatar-img">
                        </v-avatar>
                        {{ item.raw.displayName }}
                      </div>
                    </template>
                  </v-select>
                </v-col>
              </v-row>

              <div class="text-right mt-2">
                <v-btn
                  color="accent"
                  :loading="isSavingProfile"
                  :disabled="!hasProfileChanges"
                  @click="saveProfile"
                >
                  <v-icon start size="small">fas fa-save</v-icon>
                  Enregistrer les modifications
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Section Changer le mot de passe -->
        <v-card class="section-card">
          <v-card-title>
            <h2>Changer le mot de passe</h2>
          </v-card-title>

          <v-card-text>
            <v-form ref="pwdForm" v-model="pwdValid">
              <div class="row align-center">
                <div class="column" style="max-width: 200px;">
                  <v-text-field
                    v-model="newPassword"
                    prepend-icon="fas fa-lock"
                    label="Nouveau mot de passe"
                    type="password"
                    :rules="pwdRules"
                    variant="underlined"
                    density="compact"
                    autocomplete="new-password"
                  />
                </div>
                <div class="column" style="max-width: 200px; margin-left: 16px;">
                  <v-text-field
                    v-model="confirmPassword"
                    label="Confirmer"
                    type="password"
                    :rules="confirmPwdRules"
                    variant="underlined"
                    density="compact"
                    autocomplete="new-password"
                  />
                </div>
                <div class="column" style="flex: 0 0 auto; margin-left: 16px;">
                  <v-btn
                    color="accent"
                    size="small"
                    :loading="isSavingPwd"
                    :disabled="!pwdValid || !newPassword"
                    @click="changePassword"
                  >
                    <v-icon start size="small">fas fa-key</v-icon>
                    Changer
                  </v-btn>
                </div>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Section Mon trombinoscope -->
        <v-card class="section-card">
          <v-card-title>
            <h2>Mon trombinoscope</h2>
            <v-spacer />
            <v-btn
              color="accent"
              size="small"
              @click="openTrombiDialog"
            >
              <v-icon start size="small">fas fa-plus</v-icon>
              Ajouter une photo
            </v-btn>
          </v-card-title>

          <v-card-text>
            <p class="text-caption mb-3" style="opacity: 0.6;">
              Une photo par an, format carre. Cliquez sur une photo pour la voir en grand.
            </p>

            <div v-if="profile.trombis && profile.trombis.length > 0" class="trombi-container">
              <div
                v-for="trombi in profile.trombis"
                :key="trombi.year"
                class="trombi-item"
              >
                <img
                  :src="trombi.thumb"
                  :alt="trombi.year"
                  class="trombi-photo"
                  @click="openGallery(trombi)"
                  @error="(e) => e.target.style.display = 'none'"
                >
                <div class="text-caption text-center mt-1">{{ trombi.year }}</div>
              </div>
            </div>
            <div v-else class="text-center pa-4" style="opacity: 0.5;">
              <v-icon size="48">fas fa-image</v-icon>
              <div class="mt-2">Aucune photo dans le trombinoscope</div>
            </div>
          </v-card-text>
        </v-card>
      </template>
    </v-container>

    <!-- Dialog ajout trombi -->
    <v-dialog v-model="trombiDialog.open" width="400px">
      <v-card>
        <v-card-title class="bg-grey-lighten-4">
          Ajouter une photo
        </v-card-title>

        <v-card-text class="pa-4">
          <v-alert
            v-if="trombiDialog.yearExists"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            Une photo existe deja pour cette annee. Elle sera remplacee par la nouvelle.
          </v-alert>

          <v-select
            v-model="trombiDialog.year"
            :items="availableYears"
            label="Annee"
            prepend-icon="fas fa-calendar"
            variant="underlined"
            @update:model-value="checkYearExists"
          />

          <ImageEditor
            ref="imgEditor"
            icon="fas fa-camera"
            style="height: 280px;"
            mode="square"
          />

          <div v-if="trombiDialog.isLoading" class="text-center mt-2">
            <v-progress-linear
              :model-value="trombiDialog.progress"
              color="accent"
              height="6"
            />
            <span class="text-caption">Envoi en cours... {{ trombiDialog.progress }}%</span>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="trombiDialog.isLoading"
            @click="trombiDialog.open = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            :loading="trombiDialog.isLoading"
            :disabled="!trombiDialog.year || trombiDialog.isLoading"
            @click="saveTrombi"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import store from '../../stores/helpers';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';
import { mapState } from '../../stores/helpers';
import ImageEditor from '../../components/ImageEditor.vue';

export default {
  components: {
    ImageEditor
  },
  store,
  data: () => ({
    isLoading: true,
    profile: null,
    personsList: [],

    // Profile data
    profileData: {
      firstname: '',
      lastname: '',
      sex: 'undefined',
      email: '',
      motherId: null,
      fatherId: null,
      spouseId: null
    },
    originalProfileData: null,
    profileValid: false,
    isSavingProfile: false,
    emailRules: [
      v => !v || /.+@.+\..+/.test(v) || 'Email invalide'
    ],
    sexes: [
      { id: 'undefined', label: 'Pas touche' },
      { id: 'male', label: 'Homme' },
      { id: 'female', label: 'Femme' }
    ],
    roles: [
      { id: 'member', label: 'Membre', color: 'grey' },
      { id: 'admin', label: 'Admin', color: 'red' },
      { id: 'archivist', label: 'Archiviste', color: 'blue' }
    ],

    // Password
    newPassword: '',
    confirmPassword: '',
    pwdValid: false,
    isSavingPwd: false,
    pwdRules: [
      v => !v || v.length >= 8 || 'Au moins 8 caracteres'
    ],

    // Trombi dialog
    trombiDialog: {
      open: false,
      year: null,
      yearExists: false,
      isLoading: false,
      progress: 0
    }
  }),
  computed: {
    ...mapState(['user']),
    avatarUrl() {
      if (!this.user?.id) return '/img/default-avatar.png';
      const idAsStr = `${this.user.id}`;
      return `/files/avatars/${idAsStr.padStart(3, '0')}.png`;
    },
    confirmPwdRules() {
      return [
        v => !v || v === this.newPassword || 'Les mots de passe ne correspondent pas'
      ];
    },
    availableYears() {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let y = currentYear; y >= currentYear - 50; y--) {
        years.push(y);
      }
      return years;
    },
    hasProfileChanges() {
      if (!this.originalProfileData) return false;
      return ['firstname', 'lastname', 'sex', 'email', 'motherId', 'fatherId', 'spouseId'].some(
        key => this.profileData[key] !== this.originalProfileData[key]
      );
    },
    personsListForRelations() {
      return this.personsList.map(p => ({
        ...p,
        personId: p.id,
        displayName: p.firstname && p.lastname
          ? `${p.firstname} ${p.lastname}`
          : p.firstname || p.lastname || `Personne ${p.id}`,
        url: p.thumb || '/img/default-avatar.png'
      })).filter(p => p.personId !== this.profile?.personId);
    },
    userBirthYear() {
      if (!this.profile?.dateOfBirth) return null;
      const dateParts = this.profile.dateOfBirth.split('.');
      if (dateParts.length > 0) {
        return parseInt(dateParts[0], 10);
      }
      return null;
    },
    mothersListForRelations() {
      const userYear = this.userBirthYear;
      return this.personsListForRelations.filter(p => {
        if (p.sex !== 'female') return false;
        // Filtrer par age: au moins 15 ans de plus
        if (!userYear || !p.dateOfBirth) return true;
        const personBirthParts = p.dateOfBirth.split('.');
        if (personBirthParts.length === 0) return true;
        const personBirthYear = parseInt(personBirthParts[0], 10);
        return userYear - personBirthYear >= 15;
      }).sort((a, b) => a.displayName.localeCompare(b.displayName));
    },
    fathersListForRelations() {
      const userYear = this.userBirthYear;
      return this.personsListForRelations.filter(p => {
        if (p.sex !== 'male') return false;
        // Filtrer par age: au moins 15 ans de plus
        if (!userYear || !p.dateOfBirth) return true;
        const personBirthParts = p.dateOfBirth.split('.');
        if (personBirthParts.length === 0) return true;
        const personBirthYear = parseInt(personBirthParts[0], 10);
        return userYear - personBirthYear >= 15;
      }).sort((a, b) => a.displayName.localeCompare(b.displayName));
    },
    spousesListForRelations() {
      let list;
      if (this.profileData.sex === 'male') {
        list = this.personsListForRelations.filter(p => p.sex === 'female');
      } else if (this.profileData.sex === 'female') {
        list = this.personsListForRelations.filter(p => p.sex === 'male');
      } else {
        list = this.personsListForRelations;
      }
      return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }
  },
  mounted() {
    this.loadProfile();
  },
  methods: {
    capitalizeFamily(family) {
      if (!family) return null;
      return family.charAt(0).toUpperCase() + family.slice(1);
    },
    getRoleColor(role) {
      const r = this.roles.find(e => e.id === role);
      return r ? r.color : 'grey';
    },
    getRoleLabel(role) {
      const r = this.roles.find(e => e.id === role);
      return r ? r.label : role;
    },
    async loadProfile() {
      this.isLoading = true;
      try {
        const response = await axios.get('/api/users/profile');
        const data = parseAxiosResponse(response);
        this.profile = data.profile;
        this.personsList = data.persons || [];

        // Initialize editable fields
        this.profileData = {
          firstname: this.profile.firstname || '',
          lastname: this.profile.lastname || '',
          sex: this.profile.sex || 'undefined',
          email: this.profile.email || '',
          motherId: this.profile.motherId || null,
          fatherId: this.profile.fatherId || null,
          spouseId: this.profile.spouseId || null
        };
        this.originalProfileData = { ...this.profileData };
      } catch (err) {
        store.commit('onError', err);
      } finally {
        this.isLoading = false;
      }
    },

    openGallery(trombi) {
      store.commit('photosGalleryReset', [{
        url: trombi.url,
        thumb: trombi.thumb,
        title: `Photo ${trombi.year}`
      }]);
      store.commit('photosGallerySetIndex', 0);
      store.commit('photosGalleryDisplay');
    },

    async saveProfile() {
      if (!this.hasProfileChanges) return;

      this.isSavingProfile = true;
      try {
        await axios.post('/api/users/profile/info', this.profileData);
        this.originalProfileData = { ...this.profileData };
        store.commit('onSnack', 'Profil mis a jour');
      } catch (err) {
        store.commit('onError', err);
      } finally {
        this.isSavingProfile = false;
      }
    },

    async changePassword() {
      if (!this.pwdValid || this.newPassword !== this.confirmPassword) {
        store.commit('onWarning', 'Les deux mots de passe ne correspondent pas');
        return;
      }

      this.isSavingPwd = true;
      try {
        const response = await axios.post('/api/users/change-pwd', { pwd: this.newPassword });
        const user = parseAxiosResponse(response);
        if (user) {
          store.commit('setCurrentUser', user);
        }
        store.commit('onSnack', 'Mot de passe modifie');
        this.newPassword = '';
        this.confirmPassword = '';
        this.$refs.pwdForm?.reset();
      } catch (err) {
        store.commit('onError', err);
      } finally {
        this.isSavingPwd = false;
      }
    },

    openTrombiDialog() {
      this.trombiDialog.open = true;
      this.trombiDialog.year = new Date().getFullYear();
      this.trombiDialog.yearExists = false;
      this.trombiDialog.isLoading = false;
      this.trombiDialog.progress = 0;
      this.checkYearExists();
      this.$nextTick(() => {
        if (this.$refs.imgEditor) {
          this.$refs.imgEditor.reset();
        }
      });
    },

    checkYearExists() {
      if (this.profile?.trombis && this.trombiDialog.year) {
        this.trombiDialog.yearExists = this.profile.trombis.some(
          t => t.year === this.trombiDialog.year
        );
      } else {
        this.trombiDialog.yearExists = false;
      }
    },

    async saveTrombi() {
      if (!this.trombiDialog.year) return;

      this.trombiDialog.isLoading = true;
      this.trombiDialog.progress = 0;

      try {
        const imageUrl = await this.$refs.imgEditor.imageUrl();
        if (!imageUrl) {
          store.commit('onWarning', 'Veuillez selectionner une image');
          this.trombiDialog.isLoading = false;
          return;
        }

        const imageResponse = await axios.get(imageUrl, { responseType: 'blob' });

        const formData = new FormData();
        formData.append('year', this.trombiDialog.year);
        formData.append('image', imageResponse.data);

        const response = await axios.post('/api/users/profile/trombi', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: progressEvent => {
            this.trombiDialog.progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
          }
        });

        const result = parseAxiosResponse(response);

        if (result.trombi) {
          const existingIndex = this.profile.trombis.findIndex(
            t => t.year === result.trombi.year
          );
          if (existingIndex > -1) {
            this.profile.trombis[existingIndex] = result.trombi;
          } else {
            this.profile.trombis.push(result.trombi);
            this.profile.trombis.sort((a, b) => a.year - b.year);
          }
        }

        store.commit('onSnack', result.replaced ? 'Photo remplacee' : 'Photo ajoutee');
        this.trombiDialog.open = false;
      } catch (err) {
        store.commit('onError', err);
      } finally {
        this.trombiDialog.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '../../themes/global.scss' as *;

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-card {
  margin: 0;
}

h2 {
  font-family: "Comfortaa", sans-serif;
  font-size: 1.5em;
  color: rgb(var(--v-theme-primary));
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ddd;
}

.readonly-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  width: 20px;
  color: rgb(var(--v-theme-primary));
  opacity: 0.7;
}

.info-label {
  font-weight: 500;
  color: #666;
  min-width: 60px;
}

.info-value {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.trombi-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.trombi-item {
  flex: 0 0 auto;
}

.trombi-photo {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);

  &:hover {
    transform: scale(1.05);
  }
}

.align-center {
  align-items: center;
}

.relation-avatar {
  overflow: hidden;
  border: 1px solid #ddd;
}

.relation-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

<style lang="scss">
// Styles non-scoped pour les elements dans les portals (dropdowns)
.v-list-item .relation-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
