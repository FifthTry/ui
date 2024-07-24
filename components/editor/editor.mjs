import {EditorView, basicSetup} from "codemirror";
import {EditorState} from "@codemirror/state";
import {ViewUpdate, keymap} from "@codemirror/view";
import {javascript} from "@codemirror/lang-javascript";
import {python} from "@codemirror/lang-python";
import {markdown} from "@codemirror/lang-markdown";
import {html} from "@codemirror/lang-html";
import {indentWithTab} from "@codemirror/commands";
import {debounce} from "./debounce";
import {
    update_package_content,
    initialize_package_ui,
    update_current_file,
    update_modified_files
} from "./panels/package/package-content";


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

    saveCurrentFile() {
        saveUnsavedFile(
            ftd.get_value("ui.fifthtry.com/components/editor/vars#current-file"),
            this.documents[this.currentDocument].doc.toString()
        );
    }

    connectedCallback() {
        initialize_package_ui();

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
            if (vu.docChanged) {
                self.saveCurrentFile();
            }
        }

        function get_extensions(language, update) {
            let extensions = [
                basicSetup,
                keymap.of([
                    indentWithTab,
                    {
                        win: "Ctrl-S",
                        linux: "Ctrl-S",
                        mac: "Cmd-S",
                        run() { trigger_save_event(); return true }
                    }
                ]),
                EditorView.updateListener.of(update),
            ];
            switch (language) {
                case 'JavaScript':
                    extensions.push(javascript());
                    break;
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

const saveUnsavedFile = debounce((file_path, content) => {
    window.ide_dispatch_event("save-unsaved-file", {file_path, content});
}, 600);

customElements.define('cm-editor', CMEditor);

window.ide_dispatch_event = function (name, data) {
    console.log('ide_dispatch_event', data);
    window.dispatchEvent(new CustomEvent("ide-event", {detail: {name, data}}));
};

window.ide_clear_opfs = async function () {
    let root = await navigator.storage.getDirectory();

    for await (const key of root.keys()) {
        console.log("deleting", key);
        await root.removeEntry(key, {recursive: true});
    }

    console.log("done deleting");
}

window.ide_update_ftd_var = function (name, value) {
    value = JSON.parse(value);
    console.log('ide_update_ftd_var', name, value);
    if (name === "ui.fifthtry.com/components/editor/vars#package-data") {
        update_package_content(value.folders, value.files);
    }
    if (name === "ui.fifthtry.com/components/editor/vars#current-file") {
        update_current_file(value);
    }
    if (name === "ui.fifthtry.com/components/editor/vars#modified-files") {
        update_modified_files(value);
    }
    if (name === "ui.fifthtry.com/components/editor/vars#preview-content") {
        console.log('ide_update_ftd_var', name, "<html omitted>");
    } else {
        console.log('ide_update_ftd_var', name, value);
    }

    ftd.set_value(name, value);
}

window.ide_get_ftd_var = function (name) {
    const value = ftd.get_value(name);
    console.log('ide_get_ftd_var', name, value);
    return JSON.stringify(value);
}

