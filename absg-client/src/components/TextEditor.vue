<template>
    <tiptap-vuetify
        v-model="value"
        :extensions="extensions"
        placeholder="Rédigez ici votre nouveau message"
        @keydown="onKeyDown"
    />
</template>

<script>
import { TiptapVuetify, History, Heading, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, Image } from 'tiptap-vuetify';
import FileSelector from './TextEditor/FileSelector';
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
