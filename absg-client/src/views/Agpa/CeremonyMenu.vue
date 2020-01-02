<template>
<div>

    <v-btn icon href="/agpa/ceremony/2019" target="_blank">
        2019
    </v-btn>

</div>
</template>


<script>
import axios from 'axios';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import { padNumber } from '../../middleware/CommonHelper';

export default {
    name: 'CeremonyMenu',
    data: () => ({
        isLoading: false,
        year: 2018,
    }),
    mounted() {
    },
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';


</style>
