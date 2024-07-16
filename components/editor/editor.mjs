import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { debounce } from "./debounce";


class CMEditor extends HTMLElement {
    constructor() {
        super();
        this.style.width = "100%";
        this.style.height = "100%";
        this.classList.add('fastn-ignore-global-keyboard');
        this.currentDocument = "current";
        /** @type {Object<string, EditorState>} */
        this.documents = {};
    }


    connectedCallback() {
        let data = window.ftd.component_data(this);
        let self = this;

        let content = fastn_utils.getFlattenStaticValue(data.doc.get().get("content"));
        let language = fastn_utils.getFlattenStaticValue(data.doc.get().get("language"));
        this.currentDocument = fastn_utils.getFlattenStaticValue(data.doc.get().get("file_name"));

        /**
         * @param {ViewUpdate} vu
         */
        function update(vu) {
            self.documents[self.currentDocument] = vu.state;
            syncToWorkspace(self.currentDocument, vu.state.doc.toString());
        }

        function get_extensions(language, update) {
            // TODO: move this debounce inside rust wasm
            let extensions = [basicSetup, javascript(), EditorView.updateListener.of(update)];
            switch (language) {
                case 'Python':
                    extensions.push(python());
                    break;
                case 'Markdown':
                    extensions.push(markdown());
                    break;
                case 'Html':
                    extensions.push(html());
                    break;
            }
            return extensions
        }

        this.documents[this.currentDocument] = EditorState.create({
            doc: content,
            extensions: get_extensions(language, update),
        });

        window.ide_cm_editor = new EditorView({
            state: this.documents[self.currentDocument],
            parent: this
        });

        data.doc.on_change(() => {
            let content = fastn_utils.getFlattenStaticValue(data.doc.get().get("content"));
            let language = fastn_utils.getFlattenStaticValue(data.doc.get().get("language"));
            this.currentDocument = fastn_utils.getFlattenStaticValue(data.doc.get().get("file_name"));

            // TODO: see if this.currentDocument is already in this.documents
            this.documents[this.currentDocument] = EditorState.create({
                doc: content,
                extensions: get_extensions(language, update),
            });
            window.ide_cm_editor.setState(this.documents[this.currentDocument]);
        });


        const syncToWorkspace = debounce((file_name, content) => {
            const filepath = ftd.get_value("ui.fifthtry.com/components/editor/vars#current-file");
            window.ide_dispatch_event("save-unsaved-file", { file_path: filepath, content });
        }, 600);
    }
}

customElements.define('cm-editor', CMEditor);

window.ide_dispatch_event = function(name, data) {
    console.log('ide_dispatch_event', data);
    window.dispatchEvent(new CustomEvent("ide-event", { detail: {name, data} }));
};

window.ide_clear_opfs = async function () {
    let root = await navigator.storage.getDirectory();

    for await (const key of root.keys()) {
        console.log("deleting", key);
        await root.removeEntry(key, {recursive: true});
    }

    console.log("done deleting");
}
