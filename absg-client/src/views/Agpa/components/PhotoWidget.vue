<template>
<div>
    <table v-if="photo.id !== -1" width="100%">
        <tr>
            <td style="width: 250px; height: 250px; text-align: center; vertical-align: middle;">
                <img class="thumb" :src="photo.thumb"/>
            </td>
        </tr>
        <tr>
            <td style="text-align: center">{{ photo.title }}</td>
        </tr>
        <tr>
            <td style="text-align: center; padding-top: 20px">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" fab small>
                            <v-icon style="font-size: 20px">fas fa-pen</v-icon>
                        </v-btn>
                    </template>
                    <span>Modifier la photo</span>
                </v-tooltip>
                &nbsp;
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" fab small>
                            <v-icon style="font-size: 20px">fas fa-times</v-icon>
                        </v-btn>
                    </template>
                    <span>Supprimer la photo</span>
                </v-tooltip>
            </td>
        </tr>
    </table>

    <table v-else width="100%">
        <tr>
            <td style="width: 250px; height: 250px; text-align: center; vertical-align: middle;">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" depressed @click="addNewPhoto()">
                            <v-icon left>fas fa-plus</v-icon>
                            <span>Photo</span>
                        </v-btn>
                    </template>
                    <span>Enregistrer une nouvelle photo</span>
                </v-tooltip>
            </td>
        </tr>
    </table>
</div>
</template>


<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../../middleware/CommonHelper';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";
import ImageEditor from '../../../components/ImageEditor.vue';

export default {
    name: 'PhotoWidget',
    components: {
        ImageEditor
    },
    data: () => ({
    }),
    props: [
        "photo"
    ],
    mounted () {
        console.log(this.current, this.photos)
        // Récupérer la participation de l'utilisateur et les stats
    },
    methods: {
        addNewPhoto() {
            this.$emit("new-photo");
        }
    }
};
</script>


<style lang="scss" scoped>
@import '../../../themes/global.scss';

h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
}
h3 {
    font-family: 'Tangerine', serif;
    color: $accent;
    font-size: 2.5em;
}

.emptySlot{
    display: block;
    width: 200px;
    line-height: 200px;
    background: transparent url('/img/agpa/photoSlot.png') 0 0 no-repeat;
}
.emptySlot:hover {
    cursor: pointer;
    background-position-y: -200px;
}

.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}
</style>
