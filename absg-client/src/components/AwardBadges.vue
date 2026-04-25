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

<style lang="scss">
.award-diamond { color: #c3f1ff; }
.award-gold { color: #c68b00; }
.award-silver { color: #9b9b9b; }
.award-bronze { color: #964c31; }
</style>
