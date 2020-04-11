<template>
    <div class="navbar">
        <nav class="nav" @click="click">
            <button
                v-if="data.cropped"
                data-action="restore"
                title="Undo (Ctrl + Z)"
            >
                <v-icon>fas fa-undo</v-icon>
            </button>
        <button
            v-if="data.loaded && !data.cropping"
            data-action="remove"
            title="Supprimer l'image (Suppr)"
        >
            <v-icon>fas fa-trash</v-icon>
        </button>
        <button
            v-if="data.cropping"
            data-action="clear"
            title="Annuler le rognage (Esc)"
        >
            <v-icon>fas fa-ban</v-icon>
        </button>
        <button
            v-if="data.cropping"
            type="button"
            class="nav__button"
            data-action="crop"
            title="Valider le rognage (Enter)"
        >
            <v-icon>fas fa-check</v-icon>
        </button>
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
@import '../../themes/global.scss';

.navbar {
  float: right;
}

button {
    background: none;
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
        background-color: $accent;
        color: #fff;
    }
}

</style>
