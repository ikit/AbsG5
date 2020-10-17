<template>
    <tiptap-vuetify
        ref="editor"
        v-model="value"
        :extensions="extensions"
        placeholder="Rédigez ici votre nouveau message"
        @keydown="onKeyDown"
    />
</template>

<script>
import { TiptapVuetify, History, Heading, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, Image } from 'tiptap-vuetify';
import FileSelector from './TextEditor/FileSelector';
import { DOMParser } from 'prosemirror-model';

// import {MyCustomExtension} from './TextEditor/MyCustomExtension'

export default {
    components: {
        TiptapVuetify
    },
    name: 'TextEditor',
    model: {
        prop: 'value',
        event: 'change'
    },
    data: () => ({
        extensions: [
            // MyCustomExtension,
            Bold,
            Underline,
            Strike,
            Blockquote,
            Link,
            ListItem,
            BulletList,
            OrderedList,
            [
                Heading, {
                options: {
                    levels: [1, 2, 3]
                }
            }],
            HardBreak,
            [Image, {
                options: {
                imageSources: [{ component: FileSelector, name: 'File Selector' }]
                }
            }],
            History
        ],
    }),
    methods: {
        onKeyDown (event) {
            setTimeout(() => {
                this.$emit('change', this.value);
            });
        },
        reset() {
            this.$refs.editor.editor.clearContent();
        },
        elementFromString(value) {
            const element = document.createElement('div');
            element.innerHTML = value.trim();
            return element;
        },
        insert(value) {
            const { state, view } = this.$refs.editor.editor;
            const { selection } = state;
            const element = this.elementFromString(value);
            const slice = DOMParser.fromSchema(state.schema).parseSlice(element);
            const transaction = state.tr.insert(selection.anchor, slice.content);

            view.dispatch(transaction);
        }
    }
}
</script>

<style>
img {
    max-width: 700px;
    max-height: 400px;
}
</style>
