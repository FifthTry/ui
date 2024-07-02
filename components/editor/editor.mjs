import {EditorView, basicSetup} from "codemirror";
import {EditorState} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import {python} from "@codemirror/lang-python";
import {markdown} from "@codemirror/lang-markdown";
import {html} from "@codemirror/lang-html";

class CMEditor extends HTMLElement {
    constructor() {
        super();
        this.style.width = "100%";
        this.style.height = "100%";
        this.classList.add('fastn-ignore-global-keyboard');
        this.currentDocument = "current";
        this.documents = {};
    }


    connectedCallback() {
        let data = window.ftd.component_data(this);
        let self = this;

        let content = fastn_utils.getFlattenStaticValue(data.doc.get().get("content"));
        let language = fastn_utils.getFlattenStaticValue(data.doc.get().get("language"));
        this.currentDocument = fastn_utils.getFlattenStaticValue(data.doc.get().get("file_name"));

        function update(vu) {
            self.documents[self.currentDocument] = vu.state;
        }

        function get_extensions(language, update) {
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
    }
}

customElements.define('cm-editor', CMEditor);

window.ide_dispatch_event = function (data) {
    console.log('ide_dispatch_event', data);
    window.dispatchEvent(new CustomEvent("ide-event", { detail: data }));
};