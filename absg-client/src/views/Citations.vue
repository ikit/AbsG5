<template>
  <div class="home" style="margin-top: 50px;">
    <h1>Les citations cultes</h1>
    <CitationsList/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CitationsList from '@/components/CitationsList.vue';

@Component({
  components: {
    CitationsList,
  },
})
export default class Citations extends Vue {


}
</script>