import {EditorView, minimalSetup} from "codemirror";
import {keymap} from "@codemirror/view";
import {insertNewlineAndIndent} from "@codemirror/commands";
import {repl, repl_parser} from "./language";

export class CommandEditor extends HTMLElement {
    constructor() {
        super();
        this.style.width = "100%";
        this.style.height = "100%";
        console.log("CommandEditor constructor11")
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

function enterIs(keys) {
    return keys.map((key) => {
        return keymap.of([{key, run: insertNewlineAndIndent}]);
    });
}

window.ide_open_command_k = (cmd) => {
    if (cmd.length) {
        // we intentionally add a space at the end so that the user can start typing
        cmd = cmd + " ";
    }

    ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k", true);
    window.command_editor.dispatch({
        changes: {
            from: 0,
            to: window.command_editor.state.doc.length,
            insert: cmd
        },
        // move the focus to end of text as that is where you usually want to begin typing
        selection: {anchor: cmd.length, head: cmd.length}
    });
    window.command_editor.focus();
}

function get_extensions() {
    return [
        enterIs(["Alt-Enter", "Cmd-Enter", "Ctrl-Enter", "Shift-Enter"]),
        keymap.of([
            {
                key: "Enter",
                run() {
                    console.log("enter pressed");
                    // instead of parsing can we get it from the editor state?
                    let tree = repl_parser.parse(window.command_editor.state.doc.toString());
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
        repl(),
    ];
}

document.addEventListener("keydown", (e) => {
    console.log(e, e.key, e.metaKey, e.ctrlKey);
    if (e.key === "Escape") {
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k", false);
    }
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        console.log("command-k pressed");
        e.preventDefault();
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k", true);
    }
});
