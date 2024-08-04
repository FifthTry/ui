import {EditorView, minimalSetup} from "codemirror";
import {keymap} from "@codemirror/view";
import {insertNewlineAndIndent} from "@codemirror/commands";

export class CommandEditor extends HTMLElement {
    constructor() {
        super();
        this.style.width = "100%";
        this.style.height = "100%";
        console.log("CommandEditor constructor")
    }

    connectedCallback() {
        // let data = window.ftd.component_data(this);
        // let self = this;

        console.log("CommandEditor connectedCallback");
        this.editor = new EditorView({
            extensions: [
                keymap.of([
                    enterIs("Alt-Enter"),
                    enterIs("Cmd-Enter"),
                    enterIs("Ctrl-Enter"),
                    enterIs("Shift-Enter"),
                    escapeKey(),
                    {
                        key: "Enter",
                        run() {
                            console.log("enter pressed");
                            return true;
                        }
                    }
                ]),
                minimalSetup,
            ],
            parent: this,
        });

        this.editor.focus();
    }
}


function escapeKey() {
    return {key: "Escape", run() {
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k", false);
        return false;
    }};
}

function enterIs (key) {
    return {key, run: insertNewlineAndIndent};
}
