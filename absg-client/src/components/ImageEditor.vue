<template>
  <div style="border: 1px solid rgba(0, 0, 0, 0.4); position: relative" v-bind:style="{ 'margin-left': icon ? '33px' : '0' }">

    <v-icon  style="display: block; position: absolute; left: -33px; top: 0;">{{icon}}</v-icon>
    <main class="main">
        <Editor
            v-if="data.loaded"
            ref="editor"
            :data="data"
        />
        <Loader
            v-else
            ref="loader"
            :data="data"
        />
    </main>
  </div>
</template>



<script>
import 'cropperjs/dist/cropper.css';
import './ImageEditor';

// TODO: check avec Alex pour pour import ImageEditor[/index.js] ne fonctionne pas
import Vue from 'vue';
import Editor from './ImageEditor/editor.vue';
import Loader from './ImageEditor/loader.vue';
Vue.component(Editor.name, Editor);
Vue.component(Loader.name, Loader);



export default {
    components: {
        Editor,
        Loader
    },
    name: 'ImageEditor',
    props: {
        icon: {
            type: String,
            default: () => "",
        },
    },
    data() {
        return {
            data: {
                cropped: false,
                cropping: false,
                loaded: false,
                name: '',
                previousUrl: '',
                type: '',
                url: '',
            },
        };
    },
    methods: {
        reset() {
            const { editor } = this.$refs;
            if (editor) {
                editor.reset();
            }
        },

        imageUrl() {
            return this.data.url;
        }
    }
}
</script>



<style lang="scss" scoped>
@import '../themes/global.scss';


.header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3rem;
    overflow: hidden;
    padding-left: 1rem;
    padding-right: 1rem;
    position: relative;
    z-index: 1;
}

.main {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
}

</style>
