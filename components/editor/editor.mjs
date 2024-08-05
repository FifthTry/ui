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
    update_modified_files,
    update_only_show_modified_files,
} from "./panels/package/package-content";
import {indentationMarkers} from '@replit/codemirror-indentation-markers';
import {CommandEditor} from "./command-k/command-editor";


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
                indentationMarkers(),
                EditorState.tabSize.of(4),
                keymap.of([
                    indentWithTab,
                    {
                        key: "Mod-s",
                        run() {
                            trigger_save_event();
                            return true
                        }
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
customElements.define('command-editor', CommandEditor);

window.ide_dispatch_event = function (name, data) {
    console.log('ide_dispatch_event', data);
    window.dispatchEvent(new CustomEvent("ide-event", {detail: {name, data}}));
};

function v(name) {
    return `ui.fifthtry.com/components/editor/vars#${name[0]}`;
}

const VAR_PACKAGE_DATA = v`package-data`;
const VAR_CURRENT_FILE = v`current-file`;
const VAR_ADDED_FILES = v`added-files`;
const VAR_MODIFIED_FILES = v`modified-files`;
const VAR_DELETED_FILES = v`deleted-files`;
const VAR_ONLY_MODIFIED_FILES = v`only-show-modified-files`;
const VAR_PREVIEW_CONTENT = v`preview-content`;

window.ide_update_ftd_var = function (name, value) {
    value = JSON.parse(value);

    if (name === VAR_PACKAGE_DATA) update_package_content(value.folders, value.files);
    if (name === VAR_CURRENT_FILE) update_current_file(value);
    if (name === VAR_ADDED_FILES) update_added_files(value);
    if (name === VAR_MODIFIED_FILES) update_modified_files(value);
    if (name === VAR_DELETED_FILES) update_deleted_files(value);

    if (name === VAR_PREVIEW_CONTENT) {
        console.log('ide_update_ftd_var', name, "<html omitted>");
    } else {
        console.log('ide_update_ftd_var', name, value);
    }

    ftd.set_value(name, value);
    const g = ftd.get_value;

    if (
        g(VAR_ONLY_MODIFIED_FILES)
        && g(VAR_MODIFIED_FILES).length === 0
        && g(VAR_DELETED_FILES).length === 0
        && g(VAR_ADDED_FILES).length === 0
    ) {
        ftd.set_value(VAR_ONLY_MODIFIED_FILES, false);
        update_only_show_modified_files(false);
    }
}

window.ide_toggle_only_show_modified_files = () => {
    let name = "ui.fifthtry.com/components/editor/vars#only-show-modified-files";
    let current = ftd.get_value(name);
    ftd.set_value(name, !current);
    update_only_show_modified_files(!current);
}

window.ide_get_ftd_var = function (name) {
    const value = ftd.get_value(name);
    console.log('ide_get_ftd_var', name, value);
    return JSON.stringify(value);
}

