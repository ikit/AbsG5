
import {AbstractExtension, VuetifyIcon, VuetifyIconsGroups, ExtensionActionRenderBtn} from 'tiptap-vuetify';

// A class must inherit from an abstract class
export default class MyCustomExtension extends AbstractExtension {

    isEditable;

    constructor() {

    }

    // Actions list
    get availableActions () {
        // For example, you can make this extension add a several buttons (array items)
        return [
        {
            render: new ExtensionActionRenderBtn({
            tooltip: (context, options) => options.isActive(context)
                ? 'Make read-only'
                : 'Disable read-only',
            // Button's icons for different icons groups. Usually for your extensions you only need one kind of icon,
            // but here is an example of how to make support for two types
            icons: {
                [VuetifyIconsGroups.fa]: new VuetifyIcon('fas fa-lock'),
            },
            // Button's click handler
            onClick: ({ editor }) => {
                this.isEditable = !editor.options.editable

                editor.setOptions({
                editable: this.isEditable
                })
            },
            // Is the button active? This affects the style of the button.
            isActive: () => {
                return !this.isEditable
            }
            })
        }
        ]
    }

    // Editor initialization hook, here you can access the Editor
    onEditorInit (editor) {
        this.isEditable = editor.options.editable
    }
}
