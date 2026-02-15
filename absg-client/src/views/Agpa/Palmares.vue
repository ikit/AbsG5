<template>
  <div>
    <v-container>
      <!-- Mode Debug Admin -->
      <v-card v-if="showDebugPanel" class="palmares-debug">
        <v-card-title class="palmares-debug__title">
          <v-icon start color="white">fas fa-user-secret</v-icon>
          Mode Debug Admin
        </v-card-title>
        <v-card-text class="palmares-debug__content">
          <div class="palmares-debug__row">
            <v-autocomplete
              v-model="debugUserId"
              :items="allUsers"
              item-title="username"
              item-value="id"
              label="Voir le palmarès d'un utilisateur"
              prepend-icon="fas fa-user"
              clearable
              density="comfortable"
              class="palmares-debug__autocomplete"
              @update:model-value="onDebugUserChange"
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.username"
                  :subtitle="`${item.raw.rootFamily || 'Aucune famille'} - ID: ${item.raw.id}`"
                >
                  <template #prepend>
                    <v-avatar size="32">
                      <img :src="`/files/avatars/${String(item.raw.id).padStart(3, '0')}.png`" :alt="item.raw.username">
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
            <v-chip v-if="debugUserId" color="warning" class="palmares-debug__chip">
              Affichage: {{ debugUserName }}
            </v-chip>
            <v-btn
              v-if="debugUserId"
              icon="fas fa-times"
              color="error"
              size="small"
              @click="clearDebugMode"
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- Barre de contrôles -->
      <div class="palmares-toolbar bg-surface-variant">
        <div class="palmares-toolbar-inner">
          <v-icon size="small" class="palmares-toolbar-icon">fas fa-sliders-h</v-icon>

          <!-- Sélecteur de période -->
          <v-menu
            v-model="showPeriodSlider"
            :close-on-content-click="false"
            location="bottom"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                size="small"
                variant="flat"
                color="primary"
                :disabled="palmaresMode !== 'sliding'"
                class="palmares-period-btn"
              >
                <v-icon start size="small">fas fa-calendar-alt</v-icon>
                <template v-if="selectedSlidingPeriod">
                  {{ selectedSlidingPeriod.from }} - {{ selectedSlidingPeriod.to }}
                </template>
                <template v-else>
                  Période
                </template>
                <v-icon end size="x-small">fas fa-caret-down</v-icon>
              </v-btn>
            </template>
            <v-card class="palmares-period-card">
              <div class="palmares-period-label">Période glissante (3 ans)</div>
              <v-slider
                v-model="sliderYearTo"
                :min="sliderMin"
                :max="sliderMax"
                :step="1"
                show-ticks="always"
                thumb-label="always"
                color="primary"
                hide-details
                @end="onSliderEnd"
              >
                <template #thumb-label="{ modelValue }">
                  {{ modelValue - 2 }}-{{ modelValue }}
                </template>
              </v-slider>
              <div class="palmares-period-range">
                <span>{{ sliderMin - 2 }}</span>
                <span>{{ sliderMax }}</span>
              </div>
            </v-card>
          </v-menu>

          <div class="palmares-toolbar-separator" />

          <!-- Toggle algorithme -->
          <v-btn-toggle
            v-model="selectedAlgorithm"
            mandatory
            density="comfortable"
            class="palmares-toolbar-toggle"
          >
            <v-btn value="V2010" size="small">v2010</v-btn>
            <v-btn value="V2026" size="small">v2026</v-btn>
          </v-btn-toggle>

          <div class="palmares-toolbar-separator" />

          <!-- Toggle mode -->
          <v-btn-toggle
            v-model="palmaresMode"
            mandatory
            density="comfortable"
            class="palmares-toolbar-toggle"
          >
            <v-btn value="global" size="small">
              <v-icon start size="small">fas fa-globe</v-icon>
              Global
            </v-btn>
            <v-btn value="sliding" size="small">
              <v-icon start size="small">fas fa-chart-line</v-icon>
              Glissant
            </v-btn>
          </v-btn-toggle>

          <v-spacer />

          <!-- Export ZIP -->
          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            :loading="isDownloadingData"
            class="palmares-period-btn"
            @click="downloadAllData"
          >
            <v-icon start size="small">fas fa-download</v-icon>
            Data
          </v-btn>
        </div>
      </div>

      <!-- Palmarès et Badges côte à côte -->
      <v-row class="palmares-cards">
        <!-- Palmarès AGPA -->
        <v-col cols="12" md="6">
          <v-card
            class="palmares-card"
            @click="showPalmaresDialog = true"
            hover
          >
            <v-card-title class="palmares-card__title palmares-card__title--palmares">
              <v-icon start color="white">fas fa-trophy</v-icon>
              Palmarès AGPA
            </v-card-title>
            <v-card-text class="palmares-card__body">
              <!-- Label mode/période -->
              <div class="palmares-card__mode-label">
                <span v-if="palmaresMode === 'sliding' && slidingYearFrom && slidingYearTo">
                  {{ slidingYearFrom }} - {{ slidingYearTo }}
                </span>
                <span v-else>
                  Classement global
                </span>
              </div>

              <!-- Total points cumulés -->
              <div class="palmares-card__points">
                <template v-if="currentPoints > 0">
                  <div class="palmares-card__points-value palmares-card__points-value--palmares">
                    {{ currentPoints }}
                  </div>
                  <div class="palmares-card__points-label">
                    point{{ currentPoints > 1 ? 's' : '' }} cumulé{{ currentPoints > 1 ? 's' : '' }}
                  </div>
                </template>
                <template v-else>
                  <div class="palmares-card__empty-icon">
                    <i class="far fa-smile palmares-card__empty-smiley"></i>
                  </div>
                  <div class="palmares-card__empty-text">
                    Ton heure viendra :)
                  </div>
                </template>
              </div>

              <!-- Répartition des récompenses -->
              <div class="palmares-awards">
                <div class="palmares-awards__item">
                  <i class="fas fa-circle palmares-awards__icon palmares-awards__icon--gold"></i>
                  <span class="palmares-awards__count palmares-awards__count--gold">{{ currentAwards.gold }}</span>
                </div>
                <div class="palmares-awards__item">
                  <i class="fas fa-circle palmares-awards__icon palmares-awards__icon--silver"></i>
                  <span class="palmares-awards__count palmares-awards__count--silver">{{ currentAwards.sylver }}</span>
                </div>
                <div class="palmares-awards__item">
                  <i class="fas fa-circle palmares-awards__icon palmares-awards__icon--bronze"></i>
                  <span class="palmares-awards__count palmares-awards__count--bronze">{{ currentAwards.bronze }}</span>
                </div>
                <div class="palmares-awards__item">
                  <i class="far fa-circle palmares-awards__icon palmares-awards__icon--nominated"></i>
                  <span class="palmares-awards__count palmares-awards__count--nominated">{{ currentAwards.nominated }}</span>
                </div>
              </div>

              <div class="palmares-card__cta">
                Cliquez pour voir le palmarès complet
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Mes Succès -->
        <v-col cols="12" md="6">
          <v-card
            class="palmares-card"
            @click="showFamilyGalleryDialog = true"
            hover
          >
            <v-card-title class="palmares-card__title palmares-card__title--badges">
              <v-icon start color="white">fas fa-award</v-icon>
              Mes Succès
            </v-card-title>
            <v-card-text class="palmares-card__body">
              <!-- Total badges actifs -->
              <div class="palmares-card__points">
                <div class="palmares-card__mode-label">
                  <span v-if="palmaresMode === 'sliding' && slidingYearFrom && slidingYearTo">
                    {{ slidingYearFrom }} - {{ slidingYearTo }}
                  </span>
                  <span v-else>
                    Tous les badges
                  </span>
                </div>
                <div class="palmares-card__points-value palmares-card__points-value--badges">
                  {{ totalActiveBadges }}
                </div>
                <div class="palmares-card__points-label">
                  Badge{{ totalActiveBadges > 1 ? 's' : '' }} actif{{ totalActiveBadges > 1 ? 's' : '' }}
                </div>
              </div>

              <!-- Top 3 badges les plus rares -->
              <div v-if="topRarestBadges.length > 0" class="palmares-badge-previews">
                <div
                  v-for="(badgeData, index) in topRarestBadges"
                  :key="badgeData.badge.badge"
                  class="palmares-badge-preview"
                  :style="{
                    background: `linear-gradient(135deg, ${badgeData.badge.color}22 0%, ${badgeData.badge.color}11 100%)`,
                    borderColor: badgeData.badge.color
                  }"
                  @click.stop="showBadgesDialog = true"
                >
                  <div class="palmares-badge-preview__row">
                    <!-- Icône du badge -->
                    <div class="palmares-badge-preview__icon-wrapper">
                      <i
                        :class="badgeData.badge.icon"
                        class="palmares-badge-preview__icon"
                        :style="{ color: badgeData.badge.color }"
                      ></i>
                    </div>

                    <!-- Infos du badge -->
                    <div class="palmares-badge-preview__info">
                      <div class="palmares-badge-preview__name">
                        {{ badgeData.badge.badge }}
                      </div>
                      <div class="palmares-badge-preview__description">
                        {{ badgeData.badge.description }}
                      </div>
                    </div>

                    <!-- Badge type chip -->
                    <v-chip
                      size="x-small"
                      :color="getBadgeTypeColor(badgeData.badge.type)"
                      variant="flat"
                      class="palmares-badge-preview__chip"
                    >
                      {{ getBadgeTypeLabel(badgeData.badge.type) }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <!-- Si moins de 3 badges -->
              <div v-else class="palmares-card__empty-placeholder">
                <i class="fas fa-trophy palmares-card__empty-trophy"></i>
                <div>Obtenez des badges en participant aux AGPA !</div>
              </div>

              <div class="palmares-card__cta">
                Cliquez pour voir la galerie par famille
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </v-container>

    <!-- Dialog Palmarès Unifié -->
    <PalmaresDialog
      v-model="showPalmaresDialog"
      :sliding-palmares="slidingPalmares"
      :global-palmares="palmares"
      :sliding-year-from="slidingYearFrom"
      :sliding-year-to="slidingYearTo"
      :loading="isLoading"
      :initial-mode="palmaresMode"
    />

    <!-- Dialog Détails Palmarès Utilisateur -->
    <v-dialog
      v-if="palmaresDetails"
      v-model="palmaresDetails"
      width="800px"
    >
      <v-card>
        <v-card-title class="bg-grey-lighten-4 py-4 title">
          Palmarès de {{ palmaresDetails.username }}
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <v-table>
            <thead>
              <tr>
                <th class="text-left" />
                <th class="text-left">
                  Nomination
                </th>
                <th class="text-left">
                  Bronze
                </th>
                <th class="text-left">
                  Argent
                </th>
                <th class="text-left">
                  Or
                </th>
                <th class="text-left">
                  Diamant
                </th>
                <th class="text-left">
                  AGPA total
                </th>
                <th class="text-left">
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="i in palmaresDetails.statsByCategories"
                :key="i.id"
              >
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
          </v-table>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="closeDialog()"
          >
            fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Liste des Badges -->
    <v-dialog
      v-model="showBadgesDialog"
      max-width="1200px"
      scrollable
    >
      <v-card>
        <v-card-title class="palmares-dialog-title palmares-dialog-title--badges">
          <v-icon start color="white">fas fa-award</v-icon>
          Tous les badges disponibles
        </v-card-title>

        <v-card-text class="palmares-dialog-content">
          <!-- Filtres -->
          <div class="palmares-dialog-filters">
            <v-chip-group
              v-model="badgeFilter"
              mandatory
              selected-class="text-primary"
              color="primary"
            >
              <v-chip value="all" variant="outlined">
                <v-icon start size="small">fas fa-globe</v-icon>
                Tous ({{ allBadgesCount }})
              </v-chip>
              <v-chip value="obtained" variant="outlined">
                <v-icon start size="small">fas fa-check-circle</v-icon>
                Obtenus ({{ obtainedBadgesCount }})
              </v-chip>
              <v-chip value="active" variant="outlined">
                <v-icon start size="small">fas fa-fire</v-icon>
                Actifs 3 ans ({{ activeBadgesCount }})
              </v-chip>
              <v-chip value="almostCombo" variant="outlined">
                <v-icon start size="small">fas fa-hourglass-half</v-icon>
                Combos en cours ({{ almostComboBadgesCount }})
              </v-chip>
              <v-chip value="neverObtained" variant="outlined">
                <v-icon start size="small">fas fa-lock</v-icon>
                Jamais obtenus ({{ neverObtainedBadgesCount }})
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Badges Votant -->
          <div v-if="filteredVoterBadges.length > 0" class="palmares-badge-section">
            <h3 class="palmares-badge-section__header">
              <i class="fas fa-vote-yea palmares-badge-section__icon palmares-badge-section__icon--voter"></i>
              Badges Votant ({{ filteredVoterBadges.length }})
            </h3>
            <v-row>
              <v-col
                v-for="badge in filteredVoterBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <BadgeCard
                  :badge="badge"
                  :badge-status="badgesHistory[badge.badge]"
                  :all-badges-status="badgesHistory"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Badges Photographe -->
          <div v-if="filteredPhotographerBadges.length > 0" class="palmares-badge-section">
            <h3 class="palmares-badge-section__header">
              <i class="fas fa-camera palmares-badge-section__icon palmares-badge-section__icon--photographer"></i>
              Badges Photographe ({{ filteredPhotographerBadges.length }})
            </h3>
            <v-row>
              <v-col
                v-for="badge in filteredPhotographerBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <BadgeCard
                  :badge="badge"
                  :badge-status="badgesHistory[badge.badge]"
                  :all-badges-status="badgesHistory"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Badges Combo -->
          <div v-if="filteredComboBadges.length > 0">
            <h3 class="palmares-badge-section__header">
              <i class="fas fa-puzzle-piece palmares-badge-section__icon palmares-badge-section__icon--combo"></i>
              Badges Combo ({{ filteredComboBadges.length }})
            </h3>
            <div class="palmares-badge-section__subtitle">
              <i class="fas fa-info-circle palmares-badge-section__subtitle-icon"></i>
              Les badges combo nécessitent des prérequis (badges votant ou photographe)
            </div>
            <v-row>
              <v-col
                v-for="badge in filteredComboBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <BadgeCard
                  :badge="badge"
                  :badge-status="badgesHistory[badge.badge]"
                  :all-badges-status="badgesHistory"
                  :progression-data="getProgressionData(badge)"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Message si aucun badge ne correspond au filtre -->
          <div
            v-if="filteredVoterBadges.length === 0 && filteredPhotographerBadges.length === 0 && filteredComboBadges.length === 0"
            class="palmares-empty-state"
          >
            <v-icon size="64" color="grey-lighten-2">fas fa-filter</v-icon>
            <div class="palmares-empty-state__text">
              Aucun badge ne correspond à ce filtre
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="showBadgesDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Galerie par Famille -->
    <v-dialog
      v-model="showFamilyGalleryDialog"
      max-width="1200px"
      scrollable
    >
      <v-card>
        <v-card-title class="palmares-dialog-title palmares-dialog-title--badges">
          <v-icon start color="white">fas fa-users</v-icon>
          Galerie des Badges par Famille
        </v-card-title>

        <v-card-text class="palmares-dialog-content palmares-dialog-content--large">
          <!-- Sélecteur de famille -->
          <div class="palmares-family-selector">
            <v-btn-toggle
              v-model="selectedFamily"
              mandatory
              color="primary"
              variant="outlined"
              divided
            >
              <v-btn value="gueudelot" size="large">
                <v-icon start>fas fa-users</v-icon>
                Gueudelot
              </v-btn>
              <v-btn value="guyomard" size="large">
                <v-icon start>fas fa-users</v-icon>
                Guyomard
              </v-btn>
              <v-btn value="guibert" size="large">
                <v-icon start>fas fa-users</v-icon>
                Guibert
              </v-btn>
            </v-btn-toggle>
          </div>

          <!-- Message de chargement -->
          <div v-if="loadingFamilyMembers" class="palmares-empty-state">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            />
            <div class="palmares-empty-state__text palmares-empty-state__text--muted">
              Chargement des membres de la famille...
            </div>
          </div>

          <!-- Message si pas de membres -->
          <div v-else-if="!loadingFamilyMembers && familyMembers.length === 0" class="palmares-empty-state">
            <v-icon size="64" color="grey">fas fa-user-slash</v-icon>
            <div class="palmares-empty-state__text">
              Aucun membre actif trouvé pour cette famille
            </div>
            <div class="palmares-empty-state__subtext">
              (Actif = ayant participé aux AGPA ces 3 dernières années)
            </div>
          </div>

          <!-- Galerie des membres -->
          <v-row v-else>
            <v-col
              v-for="member in familyMembers"
              :key="member.userId"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="member-card"
                hover
                elevation="2"
                @click="showMemberDetails(member)"
              >
                <!-- Avatar -->
                <div class="member-card__avatar-wrapper">
                  <v-avatar
                    size="120"
                    class="member-card__avatar"
                  >
                    <img
                      :src="`/files/avatars/${String(member.userId).padStart(3, '0')}.png`"
                      :alt="member.username"
                      @error="onAvatarError"
                    >
                  </v-avatar>
                </div>

                <!-- Nom d'utilisateur -->
                <v-card-title class="member-card__title">
                  {{ member.username }}
                </v-card-title>

                <!-- Badge principal (le plus rare) -->
                <v-card-text v-if="member.mainBadge" class="member-card__badge-wrapper">
                  <div class="member-card__main-badge">
                    <div class="member-card__badge-icon-row">
                      <i
                        :class="member.mainBadge.icon"
                        class="member-card__badge-icon"
                        :style="{ color: member.mainBadge.color || '#ffffff' }"
                      ></i>
                    </div>
                    <div class="member-card__badge-name">
                      {{ member.mainBadge.badge }}
                    </div>
                    <div class="member-card__badge-description">
                      {{ member.mainBadge.description }}
                    </div>
                    <div class="member-card__badge-year">
                      Édition {{ member.mainBadge.year }}
                    </div>
                  </div>
                </v-card-text>

                <!-- Si pas de badge -->
                <v-card-text v-else class="member-card__badge-wrapper">
                  <div class="member-card__no-badge">
                    <i class="fas fa-medal member-card__no-badge-icon"></i>
                    <div class="member-card__no-badge-text">
                      Aucun badge obtenu
                    </div>
                  </div>
                </v-card-text>

                <!-- Nombre total de badges obtenus -->
                <v-card-actions class="member-card__actions">
                  <v-chip
                    v-if="member.totalBadges > 0"
                    color="primary"
                    variant="tonal"
                    size="small"
                  >
                    <v-icon start size="small">fas fa-award</v-icon>
                    {{ member.totalBadges }} badge{{ member.totalBadges > 1 ? 's' : '' }}
                  </v-chip>
                  <v-chip
                    v-else
                    color="grey"
                    variant="tonal"
                    size="small"
                  >
                    <v-icon start size="small">fas fa-medal</v-icon>
                    En attente
                  </v-chip>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="showFamilyGalleryDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog modale pour afficher tous les badges d'un membre -->
    <v-dialog
      v-model="memberDetailsDialog"
      max-width="800"
      scrollable
    >
      <v-card v-if="selectedMember">
        <!-- En-tête avec avatar et nom -->
        <v-card-title class="palmares-member-dialog__title">
          <div class="palmares-member-dialog__header">
            <v-avatar size="80" class="palmares-member-dialog__avatar">
              <img
                :src="`/files/avatars/${String(selectedMember.userId).padStart(3, '0')}.png`"
                :alt="selectedMember.username"
                @error="onAvatarError"
              >
            </v-avatar>
            <div>
              <div class="palmares-member-dialog__name">
                {{ selectedMember.username }}
              </div>
              <div class="palmares-member-dialog__count">
                <v-icon start color="white" size="small">fas fa-award</v-icon>
                {{ selectedMember.totalBadges }} badge{{ selectedMember.totalBadges > 1 ? 's' : '' }} obtenu{{ selectedMember.totalBadges > 1 ? 's' : '' }}
              </div>
            </div>
          </div>
        </v-card-title>

        <!-- Corps avec la liste des badges -->
        <v-card-text class="palmares-member-dialog__content">
          <div v-if="selectedMember.allBadges && selectedMember.allBadges.length > 0">
            <div
              v-for="(badge, index) in selectedMember.allBadges"
              :key="`${badge.badge}_${badge.year}_${badge.type}`"
              class="palmares-member-dialog__badge-item"
            >
              <v-card
                :style="{
                  border: `2px solid ${badge.color || '#ccc'}`,
                  background: `linear-gradient(135deg, ${badge.color || '#ccc'}22 0%, ${badge.color || '#ccc'}11 100%)`
                }"
                elevation="1"
              >
                <v-card-text class="palmares-member-dialog__badge-body">
                  <div class="palmares-member-dialog__badge-row">
                    <!-- Icône du badge -->
                    <div class="palmares-member-dialog__badge-icon-wrapper">
                      <i
                        :class="badge.icon"
                        class="palmares-member-dialog__badge-icon"
                        :style="{ color: badge.color || 'inherit' }"
                      ></i>
                    </div>

                    <!-- Infos du badge -->
                    <div class="palmares-member-dialog__badge-info">
                      <div class="palmares-member-dialog__badge-name">
                        {{ badge.badge }}
                      </div>
                      <div class="palmares-member-dialog__badge-description">
                        {{ badge.description }}
                      </div>
                      <div class="palmares-member-dialog__badge-chips">
                        <v-chip
                          size="small"
                          :color="getBadgeTypeColor(badge.type)"
                          variant="flat"
                        >
                          <v-icon start size="x-small">{{ getBadgeTypeIcon(badge.type) }}</v-icon>
                          {{ getBadgeTypeLabel(badge.type) }}
                        </v-chip>
                        <v-chip size="small" color="grey" variant="tonal">
                          <v-icon start size="x-small">fas fa-calendar</v-icon>
                          {{ badge.year }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <!-- Message si aucun badge -->
          <div v-else class="palmares-empty-state">
            <v-icon size="64" color="grey-lighten-2">fas fa-medal</v-icon>
            <div class="palmares-empty-state__text">
              Aucun badge obtenu sur les 3 dernières années
            </div>
          </div>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="palmares-member-dialog__actions">
          <v-btn
            color="primary"
            variant="text"
            @click="memberDetailsDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
import axios from 'axios';
import { mapState } from '../../stores/helpers';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';
import BadgeCard from '../../components/BadgeCard.vue';
import PalmaresDialog from '../../components/PalmaresDialog.vue';
import { getBadgesByType } from '../../middleware/badgesMetadata';

export default {
    name: 'Palmares',
    components: {
        BadgeCard,
        PalmaresDialog
    },
    data: () => ({
        isLoading: false,
        headers: [
            { text: 'Photographe', value: 'photographe' },
            { text: 'Score', value: 'score' },
            { text: 'Participation', value: 'participation' },
            { text: 'Récompenses', value: 'awards' },
            { text: 'Meilleure année', value: 'bestYear' },
            { text: 'Meilleure catégorie', value: 'bestCat' },
            { text: '', value: 'actions' },
        ],
        filter: {
            search: "",
            searchSliding: "",
            familyFilter: null,
            familyFilterSliding: null
        },
        palmares: [],
        slidingPalmares: [],
        palmaresDetails: null,
        showPalmaresDialog: false,
        palmaresTab: 'sliding',
        myGlobalRank: null,
        myGlobalAgpas: null,
        myGlobalAwards: { gold: 0, sylver: 0, bronze: 0, nominated: 0 },
        mySlidingRank: null,
        mySlidingAgpas: null,
        mySlidingAwards: { gold: 0, sylver: 0, bronze: 0, nominated: 0 },
        myRankChange: null,
        slidingYearFrom: null,
        slidingYearTo: null,
        myGlobalBadges: null,
        mySlidingBadges: [],
        voteProfiles: {},
        showBadgesDialog: false,
        badgesHistory: {}, // Will hold badge status for each badge from API
        badgeFilter: 'all', // Filter for badges dialog: all, obtained, active, almostCombo, neverObtained
        // Galerie par famille
        showFamilyGalleryDialog: false,
        selectedFamily: 'gueudelot',
        familyMembers: [],
        loadingFamilyMembers: false,
        memberDetailsDialog: false,
        selectedMember: null,
        // Barre de contrôles
        selectedAlgorithm: 'V2026',
        palmaresMode: 'sliding',
        selectedSlidingPeriod: null,
        showPeriodSlider: false,
        sliderYearTo: null,
        initialized: false,
        isDownloadingData: false,
        // Mode debug admin
        debugModeEnabled: false,
        debugUserId: null,
        debugUserName: '',
        allUsers: [],
    }),
    computed: {
        ...mapState(['user', 'agpaMeta']),
        isAdmin() {
            return this.user?.roles?.includes('admin') || false;
        },
        showDebugPanel() {
            return this.isAdmin && this.debugModeEnabled;
        },

        // Points et awards adaptés au mode (global ou sliding)
        currentPoints() {
            return this.palmaresMode === 'sliding' ? this.mySlidingAgpas : this.myGlobalAgpas;
        },
        currentAwards() {
            return this.palmaresMode === 'sliding' ? this.mySlidingAwards : this.myGlobalAwards;
        },

        // Badges arrays from metadata
        voterBadges() {
            return getBadgesByType('voter');
        },
        photographerBadges() {
            return getBadgesByType('photographer');
        },
        comboBadges() {
            return getBadgesByType('combo');
        },

        // Top 3 badges les plus rares obtenus par l'utilisateur
        topRarestBadges() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return [];
            }

            // Récupérer tous les badges actifs avec leurs métadonnées
            const activeBadges = [];
            const allBadges = [...this.voterBadges, ...this.photographerBadges, ...this.comboBadges];

            for (const badge of allBadges) {
                const badgeStatus = this.badgesHistory[badge.badge];
                if (badgeStatus && badgeStatus.isActive) {
                    activeBadges.push({
                        badge: badge,
                        status: badgeStatus
                    });
                }
            }

            // Trier par priorité: combo > progressive > rare badges
            // Priorité 1: Badges combo (les plus difficiles)
            // Priorité 2: Badges progressifs (nécessitent plusieurs années)
            // Priorité 3: Badges directs dans cet ordre de rareté
            const rarityOrder = {
                // Combo badges (très rares)
                'L\'Incompris': 1,
                'Le Couple Parfait': 2,
                'Le Perfectionniste': 3,
                'La Force Tranquille': 4,
                'L\'Expert Oublié': 5,
                'Le Solitaire': 6,
                'Le Modeste': 7,
                'Le Phénomène Discret': 8,
                'Le Philanthrope Méconnu': 9,
                'Le Généreux Invisible': 10,
                'L\'Iconoclaste': 11,
                'Le Prodige': 12,
                'Le Diplomate Étoilé': 13,
                'La Légende': 14,

                // Progressive badges (rares car nécessitent du temps)
                'L\'Habitué': 50,
                'Le Fidèle': 51,
                'Le Vétéran': 52,
                'Le Polyvalent': 53,
                'L\'Éclectique': 54,
                'L\'Artiste Complet': 55,
                'Le Productif': 56,
                'Le Prolifique': 57,
                'L\'Auteur': 58,
                'Le Créateur': 59,
                'L\'Influent': 60,
                'Le Collectionneur': 61,
                'Le Grand Collectionneur': 62,
                'Le Maître Collectionneur': 63,

                // Photographer badges (moyennement rares)
                'Le Phénomène': 100,
                'La Star': 101,
                'Le Chéri(e) de Mon Cœur': 102,
                'Le Chouchou de Famille': 103,
                'Le Transfuge': 104,
                'Le Protégé': 105,
                'La Coqueluche des Dames': 106,
                'L\'Équilibré': 107,
                'L\'Inconnu': 108,

                // Voter badges (plus communs)
                'L\'Admirateur': 150,
                'L\'Amoureux Transi': 151,
                'Le Parent Fier': 152,
                'Le Sniper': 153,
                'Féministe Convaincu': 154,
                'Le Philanthrope': 155,
                'L\'Anticonformiste': 156,
                'Le Diplomate': 157,
                'Le Radin': 158,
                'Le Mécène': 159,
                'Le Modéré': 160
            };

            activeBadges.sort((a, b) => {
                const rarityA = rarityOrder[a.badge.badge] || 999;
                const rarityB = rarityOrder[b.badge.badge] || 999;
                return rarityA - rarityB;
            });

            // Retourner les 3 premiers
            return activeBadges.slice(0, 3);
        },

        // Nombre total de badges actifs (obtenus sur les 3 dernières éditions)
        totalActiveBadges() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return 0;
            }

            // Compter tous les badges actifs (isActive = true)
            let count = 0;
            for (const badgeName in this.badgesHistory) {
                const badgeStatus = this.badgesHistory[badgeName];
                if (badgeStatus && badgeStatus.isActive) {
                    count++;
                }
            }

            return count;
        },

        // Badge filter counts
        allBadgesCount() {
            return this.voterBadges.length + this.photographerBadges.length + this.comboBadges.length;
        },

        obtainedBadgesCount() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return 0;
            }
            let count = 0;
            for (const badgeName in this.badgesHistory) {
                const badgeStatus = this.badgesHistory[badgeName];
                if (badgeStatus && badgeStatus.everObtained) {
                    count++;
                }
            }
            return count;
        },

        activeBadgesCount() {
            return this.totalActiveBadges; // Reuse existing computed property
        },

        almostComboBadgesCount() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return 0;
            }

            let count = 0;
            for (const comboBadge of this.comboBadges) {
                const badgeStatus = this.badgesHistory[comboBadge.badge];

                // Skip if combo badge is already obtained
                if (badgeStatus && badgeStatus.isActive) {
                    continue;
                }

                // Check if combo has prerequisites defined
                if (!comboBadge.requires || comboBadge.requires.length === 0) {
                    continue;
                }

                // Check if user has at least one ACTIVE required badge (but not all)
                let activeCount = 0;
                for (const requiredBadge of comboBadge.requires) {
                    const requiredStatus = this.badgesHistory[requiredBadge];
                    if (requiredStatus && requiredStatus.isActive) {
                        activeCount++;
                    }
                }

                // "Almost complete" = has at least 1 active prerequisite but not all of them
                if (activeCount > 0 && activeCount < comboBadge.requires.length) {
                    count++;
                }
            }
            return count;
        },

        neverObtainedBadgesCount() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return this.allBadgesCount;
            }

            let count = 0;
            const allBadges = [...this.voterBadges, ...this.photographerBadges, ...this.comboBadges];

            for (const badge of allBadges) {
                const badgeStatus = this.badgesHistory[badge.badge];
                if (!badgeStatus || !badgeStatus.everObtained) {
                    count++;
                }
            }
            return count;
        },

        // Filtered badge lists based on selected filter
        filteredVoterBadges() {
            return this.filterBadgesByType(this.voterBadges);
        },

        filteredPhotographerBadges() {
            return this.filterBadgesByType(this.photographerBadges);
        },

        filteredComboBadges() {
            return this.filterBadgesByType(this.comboBadges);
        },

        // Options pour le select de filtrage par famille
        familyOptions() {
            return [
                { title: 'Gueudelot', value: 'gueudelot' },
                { title: 'Guibert', value: 'guibert' },
                { title: 'Guyomard', value: 'guyomard' },
                { title: 'Autre', value: 'autre' }
            ];
        },

        // Palmarès global filtré par recherche et famille
        filteredPalmares() {
            let result = this.palmares;

            // Filtre par famille
            if (this.filter.familyFilter) {
                result = result.filter(p => {
                    const family = (p.rootFamily || 'autre').toLowerCase();
                    return family === this.filter.familyFilter.toLowerCase();
                });
            }

            // Filtre par recherche
            if (this.filter.search && this.filter.search.trim() !== '') {
                const search = this.filter.search.toLowerCase();
                result = result.filter(p => {
                    return (p.username || '').toLowerCase().includes(search) ||
                           (p.rootFamily || '').toLowerCase().includes(search);
                });
            }

            return result;
        },

        // Palmarès glissant filtré par recherche et famille
        filteredSlidingPalmares() {
            let result = this.slidingPalmares;

            // Filtre par famille
            if (this.filter.familyFilterSliding) {
                result = result.filter(p => {
                    const family = (p.rootFamily || 'autre').toLowerCase();
                    return family === this.filter.familyFilterSliding.toLowerCase();
                });
            }

            // Filtre par recherche
            if (this.filter.searchSliding && this.filter.searchSliding.trim() !== '') {
                const search = this.filter.searchSliding.toLowerCase();
                result = result.filter(p => {
                    return (p.username || '').toLowerCase().includes(search) ||
                           (p.rootFamily || '').toLowerCase().includes(search);
                });
            }

            return result;
        },

        // Available sliding periods (3-year windows)
        availableSlidingPeriods() {
            const periods = [];

            // Use AGPA metadata for min/max years, fallback to reasonable defaults
            const minYear = this.agpaMeta?.minYear || 2006;
            const maxYear = this.agpaMeta?.maxYear || new Date().getFullYear();

            // Generate all possible 3-year sliding windows
            // Start from the most recent period and go backwards
            for (let yearTo = maxYear; yearTo >= minYear + 2; yearTo--) {
                periods.push({
                    from: yearTo - 2,
                    to: yearTo
                });
            }

            return periods;
        },
        sliderMin() {
            return (this.agpaMeta?.minYear || 2006) + 2;
        },
        sliderMax() {
            return this.agpaMeta?.maxYear || new Date().getFullYear();
        }
    },
    watch: {
        selectedFamily() {
            if (this.showFamilyGalleryDialog) {
                this.loadFamilyMembers();
            }
        },
        showFamilyGalleryDialog(newVal) {
            if (newVal) {
                this.loadFamilyMembers();
            }
        },
        selectedAlgorithm() {
            if (this.initialized) this.reloadPalmaresData();
        },
        palmaresMode() {
            if (this.initialized) this.reloadPalmaresData();
        },
        selectedSlidingPeriod(newVal) {
            if (this.initialized && newVal && this.palmaresMode === 'sliding') {
                this.reloadPalmaresData();
            }
        }
    },
    mounted () {
        // Initialiser la période glissante par défaut
        if (this.availableSlidingPeriods.length > 0) {
            this.selectedSlidingPeriod = this.availableSlidingPeriods[0];
            this.sliderYearTo = this.selectedSlidingPeriod.to;
        }
        this.initView();
        this.loadAllUsers();
        this.checkDebugMode();
        this.setupKeyboardShortcut();
    },
    beforeUnmount() {
        this.removeKeyboardShortcut();
    },
    methods: {
        onSliderEnd(value) {
            this.selectedSlidingPeriod = { from: value - 2, to: value };
        },

        async downloadAllData() {
            this.isDownloadingData = true;
            try {
                const response = await axios.get('/api/agpa/data/export-all', {
                    responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'AGPA-Export.zip');
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading AGPA data:', error);
            } finally {
                this.isDownloadingData = false;
            }
        },

        async initView() {
            this.isLoading = true;
            const algo = this.selectedAlgorithm;

            // Charger le palmarès global
            try {
                const response = await axios.get(`/api/agpa/palmares?algorithm=${algo}`);
                const palmaresData = parseAxiosResponse(response);

                if (palmaresData && Array.isArray(palmaresData)) {
                    this.palmares = palmaresData.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                } else {
                    this.palmares = [];
                }

                this.calculateMyGlobalStats();
                this.isLoading = false;
            } catch (err) {
                console.error(err);
                this.palmares = [];
                this.isLoading = false;
            }

            // Charger le palmarès glissant
            try {
                let slidingUrl = `/api/agpa/palmares/sliding?algorithm=${algo}`;
                if (this.selectedSlidingPeriod) {
                    slidingUrl += `&yearFrom=${this.selectedSlidingPeriod.from}&yearTo=${this.selectedSlidingPeriod.to}`;
                }
                const response = await axios.get(slidingUrl);
                const data = parseAxiosResponse(response);

                if (!data) {
                    this.slidingPalmares = [];
                } else if (Array.isArray(data)) {
                    this.slidingPalmares = data.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                } else if (data?.palmares && Array.isArray(data.palmares)) {
                    this.slidingPalmares = data.palmares.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                    this.slidingYearFrom = data.yearFrom;
                    this.slidingYearTo = data.yearTo;
                } else {
                    this.slidingPalmares = [];
                }

                this.calculateMySlidingStats();
            } catch (err) {
                console.error('Palmarès glissant non disponible:', err);
                this.slidingPalmares = this.palmares || [];
                this.calculateMySlidingStats();
            }

            // Charger les badges
            await this.calculateMyGlobalBadges();
            await this.calculateMySlidingBadges();
            await this.loadBadgeHistory();

            this.initialized = true;
        },

        async reloadPalmaresData() {
            this.isLoading = true;
            const algo = this.selectedAlgorithm;

            try {
                // Recharger le palmarès global
                const globalResponse = await axios.get(`/api/agpa/palmares?algorithm=${algo}`);
                const globalData = parseAxiosResponse(globalResponse);
                this.palmares = (globalData && Array.isArray(globalData))
                    ? globalData.map(e => ({ ...e, ...getPeopleAvatar(e) }))
                    : [];
                this.calculateMyGlobalStats();

                // Recharger le palmarès glissant
                let slidingUrl = `/api/agpa/palmares/sliding?algorithm=${algo}`;
                if (this.selectedSlidingPeriod) {
                    slidingUrl += `&yearFrom=${this.selectedSlidingPeriod.from}&yearTo=${this.selectedSlidingPeriod.to}`;
                }
                const slidingResponse = await axios.get(slidingUrl);
                const slidingData = parseAxiosResponse(slidingResponse);

                if (!slidingData) {
                    this.slidingPalmares = [];
                } else if (Array.isArray(slidingData)) {
                    this.slidingPalmares = slidingData.map(e => ({ ...e, ...getPeopleAvatar(e) }));
                } else if (slidingData?.palmares && Array.isArray(slidingData.palmares)) {
                    this.slidingPalmares = slidingData.palmares.map(e => ({ ...e, ...getPeopleAvatar(e) }));
                    this.slidingYearFrom = slidingData.yearFrom;
                    this.slidingYearTo = slidingData.yearTo;
                } else {
                    this.slidingPalmares = [];
                }

                this.calculateMySlidingStats();
            } catch (err) {
                console.error('Erreur lors du rechargement:', err);
            }

            this.isLoading = false;
        },

        calculateMyGlobalStats() {
            if (!this.user || !this.palmares) return;

            const myEntry = this.palmares.find(p => p.username === this.user.username);
            if (myEntry) {
                this.myGlobalRank = this.palmares.indexOf(myEntry) + 1;
                this.myGlobalAgpas = myEntry.totalPoints || 0;
                this.myGlobalAwards = {
                    gold: myEntry.awards?.gold || 0,
                    sylver: myEntry.awards?.sylver || 0,
                    bronze: myEntry.awards?.bronze || 0,
                    nominated: myEntry.awards?.nominated || 0
                };
            }
        },

        calculateMySlidingStats() {
            if (!this.user || !this.slidingPalmares) return;

            const myEntry = this.slidingPalmares.find(p => p.username === this.user.username);
            if (myEntry) {
                this.mySlidingRank = this.slidingPalmares.indexOf(myEntry) + 1;
                this.mySlidingAgpas = myEntry.totalPoints || 0;
                this.mySlidingAwards = {
                    gold: myEntry.awards?.gold || 0,
                    sylver: myEntry.awards?.sylver || 0,
                    bronze: myEntry.awards?.bronze || 0,
                    nominated: myEntry.awards?.nominated || 0
                };
                // Récupérer la variation de rang depuis l'API
                this.myRankChange = myEntry.rankChange !== undefined ? myEntry.rankChange : null;
            }
        },

        async changeSlidingPeriod(yearFrom, yearTo) {
            // Update the selected period
            this.slidingYearFrom = yearFrom;
            this.slidingYearTo = yearTo;

            // Reload sliding palmares with the selected period
            try {
                const response = await axios.get(`/api/agpa/palmares/sliding?yearFrom=${yearFrom}&yearTo=${yearTo}&algorithm=${this.selectedAlgorithm}`);
                const data = parseAxiosResponse(response);

                if (!data) {
                    this.slidingPalmares = [];
                } else if (Array.isArray(data)) {
                    // Format ancien (fallback) - tableau direct
                    this.slidingPalmares = data.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                } else if (data?.palmares && Array.isArray(data.palmares)) {
                    // Format avec années - objet avec propriété palmares
                    this.slidingPalmares = data.palmares.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                } else {
                    this.slidingPalmares = [];
                }

                // Recalculer les stats et badges pour la nouvelle période
                this.calculateMySlidingStats();
                await this.calculateMySlidingBadges();
            } catch (err) {
                console.error('Erreur lors du chargement de la période glissante:', err);
                this.slidingPalmares = [];
            }
        },

        async loadVoteProfiles(year) {
            try {
                const response = await axios.get(`/api/agpa/vote-profiles/${year}`);
                const profiles = parseAxiosResponse(response);

                // Stocker les profils par année
                if (!this.voteProfiles[year]) {
                    this.voteProfiles[year] = profiles;
                }

                return profiles;
            } catch (err) {
                console.error(`Erreur chargement profils ${year}:`, err);
                return null;
            }
        },

        async calculateMyGlobalBadges() {
            if (!this.user) return;

            // Charger les profils de l'année courante ou dernière disponible
            const currentYear = new Date().getFullYear();
            let profiles = await this.loadVoteProfiles(currentYear);

            // Si pas de profils pour l'année courante, essayer l'année précédente
            if (!profiles || !profiles[this.user.id]) {
                profiles = await this.loadVoteProfiles(currentYear - 1);
            }

            if (!profiles || !profiles[this.user.id]) {
                this.myGlobalBadges = null;
                return;
            }

            const userProfiles = profiles[this.user.id];
            const allBadges = [];

            // Collecter tous les badges non-null
            if (userProfiles.voterProfile) allBadges.push(userProfiles.voterProfile);
            if (userProfiles.photographerProfile) allBadges.push(userProfiles.photographerProfile);
            if (userProfiles.comboProfile) allBadges.push(userProfiles.comboProfile);

            // Total possible: 11 voter + 9 photographer + 14 combo = 34 badges
            const totalPossible = 34;

            // Dernier badge = combo si existe, sinon photographe, sinon voter
            const lastBadge = userProfiles.comboProfile ||
                             userProfiles.photographerProfile ||
                             userProfiles.voterProfile;

            this.myGlobalBadges = {
                totalCount: allBadges.length,
                totalPossible: totalPossible,
                lastBadge: lastBadge
            };
        },

        async calculateMySlidingBadges() {
            if (!this.user) return;

            const currentYear = new Date().getFullYear();
            const years = [currentYear, currentYear - 1, currentYear - 2];
            const slidingBadges = [];

            // Charger les profils pour les 3 dernières années
            for (const year of years) {
                const profiles = await this.loadVoteProfiles(year);

                if (profiles && profiles[this.user.id]) {
                    const userProfiles = profiles[this.user.id];

                    // Priorité: combo > photographer > voter
                    const badge = userProfiles.comboProfile ||
                                 userProfiles.photographerProfile ||
                                 userProfiles.voterProfile;

                    if (badge) {
                        slidingBadges.push({
                            ...badge,
                            year: year
                        });
                    }
                }
            }

            this.mySlidingBadges = slidingBadges;
        },
        displaydetails(palmares) {
            this.palmaresDetails = palmares;
        },
        closeDialog() {
            this.palmaresDetails = null;
        },

        searchMethod(value, search, item) {
            if (value && search && item ) {
                return `${item.username} ${item.rootFamily}`.toLowerCase().indexOf(search.toLowerCase()) > -1;
            }
            return false
        },

        getOrdinalSuffix(rank) {
            if (rank === 1) {
                return 'er';
            }
            return 'ème';
        },

        async loadBadgeHistory() {
            if (!this.user) return;

            try {
                const response = await axios.get('/api/agpa/my-badges-history');
                const data = parseAxiosResponse(response);

                if (data && data.badgeHistory) {
                    this.badgesHistory = data.badgeHistory;
                }
            } catch (err) {
                console.error('Erreur chargement historique badges:', err);
                this.badgesHistory = {};
            }
        },

        getProgressionData(badge) {
            // Only progressive badges have progression data
            if (badge.timing !== 'progressive') {
                return null;
            }

            // Check if this badge exists in history
            const badgeStatus = this.badgesHistory[badge.badge];
            if (!badgeStatus) {
                return {
                    percentage: 0,
                    description: 'Aucune progression pour le moment'
                };
            }

            // For progressive badges obtained, show 100%
            if (badgeStatus.isActive) {
                return {
                    percentage: 100,
                    description: `Badge actif (obtenu ${badgeStatus.years.length} fois)`
                };
            }

            if (badgeStatus.everObtained) {
                return {
                    percentage: 50,
                    description: `Badge obtenu dans le passé (${badgeStatus.years.join(', ')})`
                };
            }

            // Not obtained yet - could add more specific progression logic here
            return {
                percentage: 0,
                description: 'Non obtenu'
            };
        },

        countBadgesByType(type) {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return 0;
            }

            // Count active badges (obtained in last 3 editions) of the given type
            let count = 0;
            const badgesToCheck = type === 'voter' ? this.voterBadges :
                                 type === 'photographer' ? this.photographerBadges :
                                 type === 'combo' ? this.comboBadges : [];

            for (const badge of badgesToCheck) {
                const badgeStatus = this.badgesHistory[badge.badge];
                if (badgeStatus && badgeStatus.isActive) {
                    count++;
                }
            }

            return count;
        },

        // Mode debug admin
        checkDebugMode() {
            if (!this.isAdmin) return;

            // Vérifier si le query parameter debug=true est présent
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('debug') === 'true') {
                this.debugModeEnabled = true;
            }
        },

        setupKeyboardShortcut() {
            if (!this.isAdmin) return;

            this.handleKeyDown = (event) => {
                // Ctrl+Shift+D
                if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                    event.preventDefault();
                    this.debugModeEnabled = !this.debugModeEnabled;

                    // Afficher un message de confirmation
                    if (this.debugModeEnabled) {
                        console.log('[Debug Mode] Activé');
                    } else {
                        console.log('[Debug Mode] Désactivé');
                        // Réinitialiser le mode debug si désactivé
                        if (this.debugUserId) {
                            this.clearDebugMode();
                        }
                    }
                }
            };

            window.addEventListener('keydown', this.handleKeyDown);
        },

        removeKeyboardShortcut() {
            if (this.handleKeyDown) {
                window.removeEventListener('keydown', this.handleKeyDown);
            }
        },

        async loadAllUsers() {
            if (!this.isAdmin) return;

            try {
                const response = await axios.get('/api/users/list');
                const data = parseAxiosResponse(response);
                if (data && data.users) {
                    this.allUsers = data.users.sort((a, b) => a.username.localeCompare(b.username));
                }
            } catch (error) {
                console.error('Erreur lors du chargement des utilisateurs:', error);
            }
        },

        onDebugUserChange(userId) {
            if (userId) {
                const selectedUser = this.allUsers.find(u => u.id === userId);
                this.debugUserName = selectedUser ? selectedUser.username : '';
                // Recharger les données avec l'utilisateur sélectionné
                this.loadPalmaresData(userId);
            } else {
                this.clearDebugMode();
            }
        },

        clearDebugMode() {
            this.debugUserId = null;
            this.debugUserName = '';
            // Recharger les données de l'utilisateur connecté
            this.loadPalmaresData(this.user.id);
        },

        async loadPalmaresData(userId) {
            this.isLoading = true;
            const algo = this.selectedAlgorithm;

            try {
                // Charger le palmarès global
                const globalResponse = await axios.get(`/api/agpa/palmares?algorithm=${algo}`);
                const globalData = parseAxiosResponse(globalResponse);
                if (globalData) {
                    this.palmares = globalData;
                    this.updateMyGlobalStats(userId);
                }

                // Charger le palmarès glissant
                const slidingResponse = await axios.get(`/api/agpa/palmares/sliding?algorithm=${algo}`);
                const slidingData = parseAxiosResponse(slidingResponse);
                if (slidingData) {
                    this.slidingPalmares = slidingData.palmares || [];
                    this.slidingYearFrom = slidingData.yearFrom;
                    this.slidingYearTo = slidingData.yearTo;
                    this.updateMySlidingStats(userId);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du palmarès:', error);
            }

            // Charger l'historique des badges (en dehors du try principal pour ne pas bloquer)
            await this.loadBadgeHistoryForUser(userId);
            await this.loadMySlidingBadgesForUser(userId);

            this.isLoading = false;
        },

        updateMyGlobalStats(userId) {
            const myEntry = this.palmares.find(p => p.userId === userId);
            if (myEntry) {
                this.myGlobalRank = this.palmares.indexOf(myEntry) + 1;
                this.myGlobalAgpas = myEntry.totalPoints || 0;
                this.myGlobalAwards = {
                    gold: myEntry.awards?.gold || 0,
                    sylver: myEntry.awards?.sylver || 0,
                    bronze: myEntry.awards?.bronze || 0,
                    nominated: myEntry.awards?.nominated || 0
                };
            }
        },

        updateMySlidingStats(userId) {
            const myEntry = this.slidingPalmares.find(p => p.userId === userId);
            if (myEntry) {
                this.mySlidingRank = this.slidingPalmares.indexOf(myEntry) + 1;
                this.mySlidingAgpas = myEntry.totalPoints || 0;
                this.mySlidingAwards = {
                    gold: myEntry.awards?.gold || 0,
                    sylver: myEntry.awards?.sylver || 0,
                    bronze: myEntry.awards?.bronze || 0,
                    nominated: myEntry.awards?.nominated || 0
                };
                this.myRankChange = myEntry.rankChange !== undefined ? myEntry.rankChange : null;
            }
        },

        async loadBadgeHistoryForUser(userId) {
            try {
                const response = await axios.get(`/api/agpa/badges-history/${userId}`);
                const data = parseAxiosResponse(response);

                if (data && data.badgeHistory) {
                    this.badgesHistory = data.badgeHistory;
                }
            } catch (error) {
                console.error('Erreur lors du chargement de l\'historique des badges:', error);
            }
        },

        async loadMySlidingBadgesForUser(userId) {
            if (!this.slidingYearFrom || !this.slidingYearTo) return;

            const slidingBadges = [];
            for (let year = this.slidingYearFrom; year <= this.slidingYearTo; year++) {
                const profiles = await this.loadVoteProfiles(year);

                if (profiles && profiles[userId]) {
                    const userProfiles = profiles[userId];

                    const badge = userProfiles.comboProfile ||
                                 userProfiles.photographerProfile ||
                                 userProfiles.voterProfile;

                    if (badge) {
                        slidingBadges.push({
                            ...badge,
                            year: year
                        });
                    }
                }
            }

            this.mySlidingBadges = slidingBadges;
        },

        // Méthodes pour la galerie par famille
        async loadFamilyMembers() {
            this.loadingFamilyMembers = true;
            try {
                const response = await axios.get(`/api/agpa/family-badges/${this.selectedFamily}`);
                if (response.data.success) {
                    this.familyMembers = response.data.members || [];
                } else {
                    console.error('Erreur lors du chargement des membres:', response.data);
                    this.familyMembers = [];
                }
            } catch (error) {
                console.error('Erreur lors du chargement des membres de la famille:', error);
                this.familyMembers = [];
            } finally {
                this.loadingFamilyMembers = false;
            }
        },

        showMemberDetails(member) {
            this.selectedMember = member;
            this.memberDetailsDialog = true;
        },

        onAvatarError(event) {
            // Fallback to default avatar if image not found
            event.target.src = '/files/avatars/default.png';
        },

        getBadgeTypeLabel(type) {
            const labels = {
                voter: 'Votant',
                photographer: 'Photographe',
                combo: 'Combo'
            };
            return labels[type] || type;
        },

        getBadgeTypeColor(type) {
            const colors = {
                voter: 'blue',
                photographer: 'green',
                combo: 'purple'
            };
            return colors[type] || 'grey';
        },

        getBadgeTypeIcon(type) {
            const icons = {
                voter: 'fas fa-vote-yea',
                photographer: 'fas fa-camera',
                combo: 'fas fa-star'
            };
            return icons[type] || 'fas fa-medal';
        },

        // Filter badges based on selected filter
        filterBadgesByType(badgesList) {
            if (!badgesList || badgesList.length === 0) {
                return [];
            }

            if (this.badgeFilter === 'all') {
                return badgesList;
            }

            return badgesList.filter(badge => {
                const badgeStatus = this.badgesHistory[badge.badge];

                switch (this.badgeFilter) {
                    case 'obtained':
                        // Badges obtenus au moins une fois
                        return badgeStatus && badgeStatus.everObtained;

                    case 'active':
                        // Badges actifs (obtenus sur les 3 dernières éditions)
                        return badgeStatus && badgeStatus.isActive;

                    case 'almostCombo':
                        // Only for combo badges: user has some (but not all) ACTIVE prerequisites
                        if (badge.type !== 'combo') {
                            return false;
                        }
                        if (badgeStatus && badgeStatus.isActive) {
                            return false; // Already obtained
                        }

                        // Check if combo has prerequisites defined
                        if (!badge.requires || badge.requires.length === 0) {
                            return false;
                        }

                        // Count how many ACTIVE required badges the user has
                        let activeCount = 0;
                        for (const requiredBadge of badge.requires) {
                            const requiredStatus = this.badgesHistory[requiredBadge];
                            if (requiredStatus && requiredStatus.isActive) {
                                activeCount++;
                            }
                        }

                        // Return true if user has at least 1 active prerequisite but not all of them
                        return activeCount > 0 && activeCount < badge.requires.length;

                    case 'neverObtained':
                        // Badges jamais obtenus
                        return !badgeStatus || !badgeStatus.everObtained;

                    default:
                        return true;
                }
            });
        }
    }
};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;
@use '../../themes/agpa-tokens' as *;

// ============================================
// Gradients de page
// ============================================
$gradient-palmares: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);

// ============================================
// Toolbar (existant)
// ============================================
.palmares-toolbar {
  border-radius: 12px;
  padding: 12px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.palmares-toolbar-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.palmares-toolbar-icon {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.5;
}

.palmares-period-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
}

.palmares-period-card {
  min-width: 320px;
  padding: 16px 24px 8px;

  :deep(.v-slider-thumb__label) {
    color: white !important;
  }
}

.palmares-period-label {
  font-size: 0.85em;
  opacity: 0.6;
  margin-bottom: 4px;
}

.palmares-period-range {
  display: flex;
  justify-content: space-between;
  font-size: 0.75em;
  opacity: 0.4;
  margin-top: -4px;
  padding: 0 2px;
}

.palmares-toolbar-separator {
  width: 1px;
  height: 28px;
  background: rgba(var(--v-theme-on-surface), 0.12);
  flex-shrink: 0;
}

.palmares-toolbar-toggle {
  :deep(.v-btn-group) {
    background: transparent;
  }

  :deep(.v-btn) {
    text-transform: none;
    font-weight: 500;
    letter-spacing: 0;
    background: rgba(var(--v-theme-on-surface), 0.08) !important;
    color: rgba(var(--v-theme-on-surface), 0.6) !important;
  }

  :deep(.v-btn--active) {
    color: white !important;
    background: rgb(var(--v-theme-primary)) !important;
    font-weight: 700;
  }
}

// ============================================
// Debug panel
// ============================================
.palmares-debug {
  margin-bottom: 20px;
  border: 2px solid rgb(var(--v-theme-warning));

  &__title {
    background: rgb(var(--v-theme-warning));
    color: white;
    padding: 10px 20px;
  }

  &__content {
    padding: 15px 20px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  &__autocomplete {
    flex: 1;
  }

  &__chip {
    font-weight: bold;
  }
}

// ============================================
// Cartes Palmarès & Mes Succès
// ============================================
.palmares-cards {
  margin-bottom: 20px;
}

.palmares-card {
  cursor: pointer;
  transition: transform 0.2s;
  height: 100%;

  &__title {
    color: white;

    &--palmares {
      background: $gradient-palmares;
    }

    &--badges {
      background: $gradient-badges;
    }
  }

  &__body {
    padding: 30px;
    text-align: center;
  }

  &__mode-label {
    font-size: 0.85em;
    color: rgba(var(--v-theme-on-surface), 0.5);
    margin-bottom: 10px;
  }

  &__points {
    margin-bottom: 25px;
  }

  &__points-value {
    font-size: 3em;
    font-weight: bold;
    margin-bottom: 5px;

    &--palmares {
      color: rgb(var(--v-theme-primary));
    }

    &--badges {
      color: #fa709a;
    }
  }

  &__points-label {
    font-size: 0.9em;
    color: rgba(var(--v-theme-on-surface), 0.5);
  }

  &__empty-icon {
    font-size: 2.5em;
    margin-bottom: 10px;
  }

  &__empty-smiley {
    color: rgb(var(--v-theme-warning));
  }

  &__empty-text {
    font-size: 1em;
    color: rgba(var(--v-theme-on-surface), 0.5);
    font-style: italic;
  }

  &__empty-placeholder {
    padding: 30px;
    color: rgba(var(--v-theme-on-surface), 0.4);
    font-style: italic;
  }

  &__empty-trophy {
    font-size: 2em;
    opacity: 0.3;
    margin-bottom: 10px;
  }

  &__cta {
    margin-top: 20px;
    font-size: 0.9em;
    color: rgba(var(--v-theme-on-surface), 0.4);
    font-style: italic;
  }
}

// ============================================
// Répartition des récompenses
// ============================================
.palmares-awards {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 15px;

  &__item {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  &__icon {
    font-size: 0.8em;

    &--gold { color: $award-gold; }
    &--silver { color: $award-silver; }
    &--bronze { color: $award-bronze; }
    &--nominated { color: $award-nominated; }
  }

  &__count {
    font-size: 1.6em;
    font-weight: bold;

    &--gold { color: $award-gold; }
    &--silver { color: $award-silver; }
    &--bronze { color: $award-bronze; }
    &--nominated { color: $award-nominated; }
  }
}

// ============================================
// Aperçu des badges (top 3 rarest)
// ============================================
.palmares-badge-previews {
  margin-bottom: 15px;
}

.palmares-badge-preview {
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon-wrapper {
    min-width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &__icon {
    font-size: 1.5em;
  }

  &__info {
    flex: 1;
    text-align: left;
  }

  &__name {
    font-weight: 600;
    font-size: 0.95em;
    color: rgba(var(--v-theme-on-surface), 0.87);
    margin-bottom: 2px;
  }

  &__description {
    font-size: 0.75em;
    color: rgba(var(--v-theme-on-surface), 0.5);
  }

  &__chip {
    min-width: 70px;
  }
}

// ============================================
// Dialogs communs
// ============================================
.palmares-dialog-title {
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;

  &--badges {
    background: $gradient-badges;
  }
}

.palmares-dialog-content {
  padding: 20px;

  &--large {
    padding: 30px;
  }
}

.palmares-dialog-filters {
  margin-bottom: 25px;
}

// ============================================
// Sections de badges (votant/photographe/combo)
// ============================================
.palmares-badge-section {
  margin-bottom: 30px;

  &__header {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__icon {
    &--voter { color: rgb(var(--v-theme-info)); }
    &--photographer { color: rgb(var(--v-theme-warning)); }
    &--combo { color: #9c27b0; }
  }

  &__subtitle {
    font-size: 0.9em;
    color: rgba(var(--v-theme-on-surface), 0.5);
    margin-bottom: 15px;
    font-style: italic;
  }

  &__subtitle-icon {
    margin-right: 4px;
  }
}

// ============================================
// États vides
// ============================================
.palmares-empty-state {
  text-align: center;
  padding: 50px;
  color: rgba(var(--v-theme-on-surface), 0.4);

  &__text {
    margin-top: 20px;
    font-size: 1.1em;

    &--muted {
      color: rgba(var(--v-theme-on-surface), 0.5);
    }
  }

  &__subtext {
    margin-top: 10px;
    color: rgba(var(--v-theme-on-surface), 0.4);
    font-size: 0.9em;
  }
}

// ============================================
// Sélecteur de famille
// ============================================
.palmares-family-selector {
  margin-bottom: 30px;
  text-align: center;
}

// ============================================
// Carte membre (galerie famille)
// ============================================
.member-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
  }

  &__avatar-wrapper {
    text-align: center;
    padding: 20px 20px 10px;
  }

  &__avatar {
    border: 4px solid rgba(var(--v-theme-on-surface), 0.08);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &__title {
    text-align: center;
    padding: 10px 15px;
    font-size: 1.1em;
  }

  &__badge-wrapper {
    text-align: center;
    padding: 15px;
  }

  &__main-badge {
    padding: 15px;
    border-radius: 12px;
    background: $gradient-palmares;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &__badge-icon-row {
    margin-bottom: 8px;
  }

  &__badge-icon {
    font-size: 2em;
  }

  &__badge-name {
    font-weight: 600;
    font-size: 0.95em;
    margin-bottom: 4px;
  }

  &__badge-description {
    font-size: 0.75em;
    opacity: 0.9;
  }

  &__badge-year {
    font-size: 0.7em;
    opacity: 0.7;
    margin-top: 6px;
  }

  &__no-badge {
    padding: 15px;
    border-radius: 12px;
    background: rgba(var(--v-theme-on-surface), 0.05);
    color: rgba(var(--v-theme-on-surface), 0.4);
  }

  &__no-badge-icon {
    font-size: 2em;
    opacity: 0.3;
  }

  &__no-badge-text {
    font-size: 0.85em;
    margin-top: 8px;
  }

  &__actions {
    justify-content: center;
    padding: 10px;
  }
}

// ============================================
// Dialog détails membre
// ============================================
.palmares-member-dialog {
  &__title {
    background: $gradient-palmares;
    color: white;
    padding: 25px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__avatar {
    border: 3px solid white;
  }

  &__name {
    font-size: 1.5em;
    font-weight: 600;
  }

  &__count {
    font-size: 0.9em;
    opacity: 0.9;
    margin-top: 5px;
  }

  &__content {
    padding: 25px;
    max-height: 500px;
  }

  &__badge-item {
    margin-bottom: 15px;
  }

  &__badge-body {
    padding: 20px;
  }

  &__badge-row {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__badge-icon-wrapper {
    min-width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__badge-icon {
    font-size: 1.8em;
  }

  &__badge-info {
    flex: 1;
  }

  &__badge-name {
    font-weight: 600;
    font-size: 1.1em;
    margin-bottom: 5px;
  }

  &__badge-description {
    color: rgba(var(--v-theme-on-surface), 0.5);
    font-size: 0.9em;
    margin-bottom: 8px;
  }

  &__badge-chips {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  &__actions {
    padding: 15px 25px;
    justify-content: flex-end;
  }
}
</style>
