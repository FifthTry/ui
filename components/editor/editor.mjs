import {EditorView, basicSetup} from "codemirror";
import {javascript} from "@codemirror/lang-javascript";

class CMEditor extends HTMLElement {
    constructor() {
        super();
        this.style.width = "100%";
        this.style.height = "100%";
        this.classList.add('fastn-ignore-global-keyboard');
    }

    connectedCallback() {
        let data = window.ftd.component_data(this);

        const initialState = EditorState.create({
            doc: data.content.get(),
            extensions: [basicSetup, javascript()]
            // trying to set height to occupy the whole parent, but its not working
            // contentHeight: 40,
            // height: "100%",
            // viewportMargin: Infinity,
        });

        window.ide_cm_editor = new EditorView({
            state: initialState,
            parent: this
        });

        data.content.on_change(() => {
            const newState = EditorState.create({
                doc: newContent,
                extensions: [basicSetup, javascript()] // Reuse existing extensions
            });
            window.ide_cm_editor.setState(newState);
        });
    }
}

customElements.define('cm-editor', CMEditor);

window.ide_dispatch_event = function (data) {
    console.log('ide_dispatch_event', data);
    window.dispatchEvent(new CustomEvent("ide-event", { detail: data }));
};