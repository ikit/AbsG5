<template>
  <div class="navbar">
    <nav
      class="nav"
      @click="click"
    >
      <label
        v-if="!data.loaded"
        class="nav__button"
        for="file"
        title="Upload"
        role="button"
      ><v-icon>fas fa-upload</v-icon>
      </label>
      <button
        v-if="data.cropped"
        type="button"
        class="nav__button"
        data-action="restore"
        title="Undo (Ctrl + Z)"
      >
        <v-icon>fas fa-undo</v-icon>
      </button>
      <button
        v-if="data.loaded && !data.cropping"
        type="button"
        class="nav__button nav__button--danger"
        data-action="remove"
        title="Delete (Delete)"
      >
        <v-icon>fas fa-trash</v-icon>
      </button>
      <button
        v-if="data.cropping"
        type="button"
        class="nav__button nav__button--danger"
        data-action="clear"
        title="Cancel (Esc)"
      >
        <v-icon>fas fa-ban</v-icon>
      </button>
      <button
        v-if="data.cropping"
        type="button"
        class="nav__button nav__button--success"
        data-action="crop"
        title="OK (Enter)"
      >
        <v-icon>fas fa-check</v-icon>
      </button>
      <a
        v-if="downloadable && data.loaded"
        class="nav__button nav__button--success"
        title="Download"
        :download="data.name"
        :href="data.url"
      ><v-icon>fa fa-upload</v-icon></a>
      <a
        class="nav__button"
        href="https://github.com/fengyuanchen/photo-editor"
        title="View on GitHub"
      ><v-icon>fab fa-github</v-icon></a>
    </nav>
  </div>
</template>

<script>
export default {
    name: 'Navbar',
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            downloadable: typeof document.createElement('a').download !== 'undefined',
        };
    },

    methods: {
        click({ target }) {
            const action = target.getAttribute('data-action') || target.parentElement.getAttribute('data-action');

            if (action) {
                this.$emit('change', action);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.navbar {
  float: right;
}

.nav__button {
    background-color: transparent;
    border-width: 0;
    color: #fff;
    cursor: pointer;
    display: block;
    float: left;
    height: 3rem;
    line-height: 3rem;
    text-align: center;
    width: 3rem;

    &:focus {
        outline: none;
    }

    &:hover {
        background-color: #0074d9;
        color: #fff;
    }
}

.nav--success:hover {
    background-color: #2ecc40;
}

.nav--danger:hover {
    background-color: #ff4136;
}
</style>
