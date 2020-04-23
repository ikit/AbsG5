<template>
    <div class="editor">
        <div class="canvas" @dblclick="dblclick">
            <img
                ref="image"
                :alt="data.name"
                :src="data.url"
                @loadstart="start"
                @load="start"
            />
        </div>

        <div v-if="cropper" class="toolbar" @click="click">
            <button data-action="move" title="Déplacer (M)">
                <i class="fas fa-arrows-alt"></i>
            </button>
            <button data-action="crop" title="Rogner (C)">
                <i class="fas fa-crop-alt"></i>
            </button>
            <button data-action="rotate-left" title="Rotation à gauche (L)">
                <i class="fas fa-undo"></i>
            </button>
            <button data-action="rotate-right" title="Rotation à droite (R)">
                <i class="fas fa-redo"></i>
            </button>
            <button data-action="flip-horizontal" title="Flip horizontal (H)">
                <i class="fas fa-arrows-alt-h"></i>
            </button>
            <button data-action="flip-vertical" title="Flip vertical (V)">
                <i class="fas fa-arrows-alt-v"></i>
            </button>
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
    data() {
        return {
            canvasData: null,
            cropBoxData: null,
            croppedData: null,
            cropper: null,
        };
    },

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

                default:
            }

            this.update({
                cropped: data.cropped,
                cropping: data.cropping,
                previousUrl: data.url,
                url: cropper.getCroppedCanvas(data.type === 'image/png' ? {} : {
                    fillColor: '#fff',
                }).toDataURL(data.type),
            });
        },

        dblclick(e) {
            if (e.target.className.indexOf('cropper-face') >= 0) {
                e.preventDefault();
                e.stopPropagation();
                this.crop();
            }
        },

        start() {
            const { data } = this;

            if (data.cropped || this.cropper) {
                return;
            }

            this.cropper = new Cropper(this.$refs.image, {
                autoCrop: false,
                dragMode: 'move',
                background: false,

                ready: () => {
                    if (this.croppedData) {
                        this.cropper
                            .crop()
                            .setData(this.croppedData)
                            .setCanvasData(this.canvasData)
                            .setCropBoxData(this.cropBoxData);
                        this.croppedData = null;
                        this.canvasData = null;
                        this.cropBoxData = null;
                    }
                },

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
                this.croppedData = cropper.getData();
                this.canvasData = cropper.getCanvasData();
                this.cropBoxData = cropper.getCropBoxData();
                this.update({
                    cropped: true,
                    cropping: false,
                    previousUrl: data.url,
                    url: cropper.getCroppedCanvas(data.type === 'image/png' ? {} : {
                        fillColor: '#fff',
                    }).toDataURL(data.type),
                });
                this.stop();
            }
        },

        clear() {
            if (this.data.cropping) {
                this.cropper.clear();
                this.update({ cropping: false });
            }
        },

        restore() {
            if (this.data.cropped) {
                this.update({
                    cropped: false,
                    previousUrl: '',
                    url: this.data.previousUrl,
                });
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
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';

.editor {
    height: 100%;
    border: 1px dashed rgba(0, 0, 0, 0.1);
}

.canvas {
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
