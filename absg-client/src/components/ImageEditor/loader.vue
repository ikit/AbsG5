<template>
    <div
        class="loader"
        @change="change"
        @dragover="dragover"
        @drop="drop"
    >
        <v-icon style="display: block; position: absolute; left: 50%; font-size: 70px; top: 50px; margin-left: -35px">fas fa-download</v-icon>

        <p>Déposer votre image ici, ou bien
        <label class="browse">sélectionnez là...
            <input
                id="file"
                class="sr-only"
                type="file"
                accept="image/*"
            />
        </label>
        </p>
    </div>
</template>

<script>
const URL = window.URL || window.webkitURL;

export default {
    name: 'Loader',
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },

    methods: {
        read(files) {
            return new Promise((resolve, reject) => {
                if (!files || files.length === 0) {
                resolve();
                return;
                }

                const file = files[0];

                if (/^image\/\w+$/.test(file.type)) {
                    if (URL) {
                        resolve({
                            loaded: true,
                            name: file.name,
                            type: file.type,
                            url: URL.createObjectURL(file),
                        });
                    } else {
                        reject(new Error('Your browser is not supported.'));
                    }
                } else {
                    reject(new Error('Please choose an image file.'));
                }
            });
        },

        change({ target }) {
            this.read(target.files).then((data) => {
                target.value = '';
                this.update(data);
            }).catch((e) => {
                target.value = '';
                this.alert(e);
            });
        },

        dragover(e) {
            e.preventDefault();
        },

        drop(e) {
            e.preventDefault();
            this.read(e.dataTransfer.files)
                .then((data) => {
                this.update(data);
                })
                .catch(this.alert);
        },

        alert(e) {
            window.alert(e && e.message ? e.message : e);
        },

        update(data) {
            Object.assign(this.data, data);
        },
    },
};
</script>

<style lang="scss" scoped>
.loader {
    display: table;
    height: 100%;
    overflow: hidden;
    width: 100%;

    & > p {
        color: #999;
        display: table-cell;
        text-align: center;
        vertical-align: middle;
    }
}

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

.browse {
    color: #0074d9;
    cursor: pointer;
    margin-left: .25rem;

    &:hover {
        color: #08f;
        text-decoration: underline;
    }
}
</style>
