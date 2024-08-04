import {EditorView, minimalSetup} from "codemirror";
import {keymap} from "@codemirror/view";
import {insertNewlineAndIndent} from "@codemirror/commands";
import {example, p} from "./language";

export class CommandEditor extends HTMLElement {
    constructor() {
        super();
        this.style.width = "100%";
        this.style.height = "100%";
        console.log("CommandEditor constructor")
    }

    connectedCallback() {
        console.log("CommandEditor connectedCallback");
        window.command_editor = new EditorView({
            extensions: get_extensions(),
            parent: this,
        });

        window.command_editor.focus();
    }
}

function escapeKey() {
    return {
        key: "Escape", run() {
            ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k", false);
            return false;
        }
    };
}

function enterIs(keys) {
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
    window.command_editor.focus();
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
                    let tree = p.parse(window.command_editor.state.doc.toString());
                    if (!!window.ide_parse_command) {
                        window.ide_parse_command(window.command_editor.state.doc, tree);
                    } else {
                        tree.iterate({
                            enter: (node) => {
                                console.log(node.type, window.command_editor.state.doc.sliceString(node.from, node.to));
                            }
                        })
                    }
                    return true;
                }
            }
        ]),
        minimalSetup,
        example(),
    ];
}