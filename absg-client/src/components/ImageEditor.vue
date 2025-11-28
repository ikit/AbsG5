<template>
  <div
    style="border: 1px solid rgba(0, 0, 0, 0.4); position: relative"
    :style="{ 'margin-left': icon ? '33px' : '0' }"
  >
    <v-icon style="display: block; position: absolute; left: -33px; top: 0;">
      {{ icon }}
    </v-icon>
    <main class="main">
      <Editor
        v-if="data.loaded"
        ref="editor"
        :data="data"
        :mode="mode"
      />
      <Loader
        v-else
        ref="loader"
        :data="data"
        :bg-url="formerUrl"
      />
    </main>
  </div>
</template>



<script>
import 'cropperjs/dist/cropper.css';
import './ImageEditor';

import Editor from './ImageEditor/editor.vue';
import Loader from './ImageEditor/loader.vue';

export default {
    name: 'ImageEditor',
    components: {
        Editor,
        Loader
    },
    props: {
        icon: {
            type: String,
            default: () => "",
        },
        formerUrl: {
            type: String,
            default: () => ""
        },
        disabled: {
            type: Boolean,
            default: () => false
        },
        mode: {
          type: String,
          default: () => "free" // free or square
        }
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
