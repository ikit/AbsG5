<template>
  <span class="award-badges">
    <template v-if="awards.diamond">
      <i class="fas fa-circle award-diamond" /> {{ awards.diamond }}
    </template>
    <template v-if="awards.gold">
      <i class="fas fa-circle award-gold" /> {{ awards.gold }}
    </template>
    <template v-if="awards.sylver">
      <i class="fas fa-circle award-silver" /> {{ awards.sylver }}
    </template>
    <template v-if="awards.bronze">
      <i class="fas fa-circle award-bronze" /> {{ awards.bronze }}
    </template>
    <template v-if="awards.nominated">
      <i class="far fa-circle" /> {{ awards.nominated }}
    </template>
    <template v-if="awards.honor">
      <i class="far fa-smile" /> {{ awards.honor }}
    </template>
  </span>
</template>

<script>
export default {
  name: 'AwardBadges',
  props: {
    awards: {
      type: Object,
      required: true
    }
  }
};
</script>
