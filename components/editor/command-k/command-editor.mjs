import {EditorView, minimalSetup} from "codemirror";
import {keymap} from "@codemirror/view";
import {insertNewlineAndIndent} from "@codemirror/commands";
import {example} from "./language";
import {EditorState} from "@codemirror/state";

export class CommandEditor extends HTMLElement {
    constructor() {
        super();
        this.style.width = "100%";
        this.style.height = "100%";
        console.log("CommandEditor constructor")
    }

    connectedCallback() {
        // let self = this;
        console.log("CommandEditor connectedCallback");
        window.command_editor = new EditorView({
            extensions: get_extensions(),
            parent: this,
        });

        window.command_editor.focus();
    }
}

function escapeKey() {
    return {key: "Escape", run() {
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k", false);
        return false;
    }};
}

function enterIs (keys) {
    return keys.map((key) => {
        return keymap.of([{key, run: insertNewlineAndIndent}]);
    });
}

window.ide_open_command_k = (cmd) => {
    ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k", true);
    window.command_editor.dispatch({
        changes: {
            from: 0,
            to: window.command_editor.state.doc.length,
            insert: cmd
        }
    });
}

function get_extensions() {
    return [
        enterIs(["Alt-Enter", "Cmd-Enter", "Ctrl-Enter", "Shift-Enter"]),
        keymap.of([
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
        example(),
    ];
}