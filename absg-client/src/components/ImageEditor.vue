<template>
  <div>
    <header class="header">
      <span class="title">Photo Editor</span>
      <Navbar
        :data="data"
        @change="change"
      />
    </header>
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
import Navbar from './ImageEditor/navbar.vue';
Vue.component(Editor.name, Editor);
Vue.component(Loader.name, Loader);
Vue.component(Navbar.name, Navbar);



export default {
    components: {
        Editor,
        Loader,
        Navbar
    },
    name: 'ImageEditor',
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
        change(action) {
            const { editor } = this.$refs;
            switch (action) {
                case 'crop':
                    editor.crop();
                break;
                case 'clear':
                    editor.clear();
                break;
                case 'restore':
                    editor.restore();
                break;
                case 'remove':
                    editor.reset();
                break;
                default:
            }
        },
    }
}
</script>



<style lang="scss" scoped>
@import '../themes/global.scss';


.sr-only {
  border: 0;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  background-color: #666;
  height: 3rem;
  overflow: hidden;
  padding-left: 1rem;
  padding-right: 1rem;
  position: relative;
  z-index: 1;
}
@media (min-width: 768px) {
  .header {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
.title {
  color: #fff;
  display: block;
  float: left;
  font-size: 1.125rem;
  line-height: 3rem;
}
.main {
  background-color: #333;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 3rem;
}
</style>
