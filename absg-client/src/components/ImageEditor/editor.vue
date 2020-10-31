<template>
  <div class="editor">
    <div class="canvas">
      <img
        ref="image"
        :alt="data.name"
        :src="data.url"
        @loadstart="start"
        @load="start"
      >
    </div>

    <div
      v-if="cropper"
      class="toolbar"
      @click="click"
    >
      <button
        data-action="move"
        title="Déplacer"
      >
        <i class="fas fa-arrows-alt" />
      </button>
      <button
        data-action="crop"
        title="Rogner"
      >
        <i class="fas fa-crop-alt" />
      </button>
      <button
        data-action="rotate-left"
        title="Rotation à gauche"
      >
        <i class="fas fa-undo" />
      </button>
      <button
        data-action="rotate-right"
        title="Rotation à droite"
      >
        <i class="fas fa-redo" />
      </button>
      <button
        data-action="flip-horizontal"
        title="Flip horizontal"
      >
        <i class="fas fa-arrows-alt-h" />
      </button>
      <button
        data-action="flip-vertical"
        title="Flip vertical"
      >
        <i class="fas fa-arrows-alt-v" />
      </button>

      <!-- Bouttons spéciaux (en bas) -->
      <div style="position: absolute; bottom:0; color: white">
        <button
          v-if="data.loaded && !data.cropping"
          data-action="remove"
          title="Supprimer l'image"
        >
          <v-icon>fas fa-trash</v-icon>
        </button>
        <button
          v-if="data.cropping"
          data-action="clear"
          title="Annuler le rognage"
        >
          <v-icon>fas fa-ban</v-icon>
        </button>
        <button
          v-if="data.cropping"
          type="button"
          data-action="applyCrop"
          title="Valider le rognage"
        >
          <v-icon>fas fa-check</v-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Cropper from 'cropperjs';

export default {
    name: 'Editor',
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    data: () => ({
        canvasData: null,
        cropBoxData: null,
        croppedData: null,
        cropper: null,
    }),

    methods: {
        click({ target }) {
            const { cropper, data } = this;
            const action = target.getAttribute('data-action') || target.parentElement.getAttribute('data-action');

            switch (action) {
                case 'move':
                case 'crop':
                    cropper.setDragMode(action);
                    break;
                case 'zoom-in':
                    cropper.zoom(0.1);
                    break;
                case 'zoom-out':
                    cropper.zoom(-0.1);
                    break;
                case 'rotate-left':
                    cropper.rotate(-90);
                    break;
                case 'rotate-right':
                    cropper.rotate(90);
                    break;
                case 'flip-horizontal':
                    cropper.scaleX(-cropper.getData().scaleX || -1);
                    break;
                case 'flip-vertical':
                    cropper.scaleY(-cropper.getData().scaleY || -1);
                    break;
                case 'remove':
                    this.reset();
                    return;
                    break;
                case 'clear':
                    this.clear();
                    return;
                    break;
                case 'applyCrop':
                    this.crop();
                    return;
                    break;
                default:
            }

            this.update({
                cropped: false,
                previousUrl: data.url,
                url: cropper.getCroppedCanvas(data.type === 'image/png' ? {} : {
                    fillColor: '#fff',
                }).toDataURL(data.type),
            });
        },

        start() {
            const { data } = this;

            if (this.cropper) {
                return;
            }

            this.cropper = new Cropper(this.$refs.image, {
                autoCrop: false,
                dragMode: 'move',
                background: false,

                crop: ({ detail }) => {
                    if (detail.width > 0 && detail.height > 0 && !data.cropping) {
                        this.update({ cropping: true });
                    }
                },
            });
        },

        stop() {
            if (this.cropper) {
                this.cropper.destroy();
                this.cropper = null;
            }
        },

        crop() {
            const { cropper, data } = this;

            if (data.cropping) {
                this.update({
                    cropped: true,
                    cropping: false,
                    previousUrl: data.url,
                    url: cropper.getCroppedCanvas(data.type === 'image/png' ? {} : {
                        fillColor: '#fff',
                    }).toDataURL(data.type),
                });
                // On valide le crop et relance le cropper si besoin
                this.stop();
            }
        },

        clear() {
            if (this.data.cropping) {
                this.cropper.clear();
                this.update({ cropping: false });
            }
        },

        reset() {
            this.stop();
            this.update({
                cropped: false,
                cropping: false,
                loaded: false,
                name: '',
                previousUrl: '',
                type: '',
                url: '',
            });
        },

        update(data) {
            Object.assign(this.data, data);
            return this.data;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';

.editor {
    height: 100%;
}

.canvas {
    margin-left: 30px;
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;

    & > img {
        max-height: 100%;
        max-width: 100%;
    }
}

.toolbar {
    background-color: rgba(0, 0, 0, .5);
    top: 0;
    bottom: 0;
    color: #fff;
    left: 0;
    position: absolute;
    width: 2rem;
    z-index: 2015;
}

button {
    background-color: transparent;
    border-width: 0;
    color: #fff;
    cursor: pointer;
    display: block;
    float: left;
    font-size: .875rem;
    height: 2rem;
    text-align: center;
    width: 2rem;

    &:focus {
        outline: none;
    }

    &:hover {
        background-color: $accent;
        color: #fff;
    }
}
</style>
