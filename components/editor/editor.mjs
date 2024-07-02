import {EditorView, basicSetup} from "codemirror";
import {EditorState} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";

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

        let content = data.doc.get().get("content").get();
        this.currentDocument = data.doc.get().get("file_name").get();

        function update(vu) {
            self.documents[self.currentDocument] = vu.state;
        }

        let extensions =[basicSetup, javascript(), EditorView.updateListener.of(update)]

        this.documents[this.currentDocument] = EditorState.create({
            doc: content,
            extensions: extensions,
        });

        window.ide_cm_editor = new EditorView({
            state: this.documents[self.currentDocument],
            parent: this
        });

        data.doc.on_change(() => {
            let content = fastn_utils.getFlattenStaticValue(data.doc.get().get("content"));
            this.currentDocument = fastn_utils.getFlattenStaticValue(data.doc.get().get("file_name"));

            // TODO: see if this.currentDocument is already in this.documents
            this.documents[this.currentDocument] = EditorState.create({
                doc: content,
                extensions: extensions,
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