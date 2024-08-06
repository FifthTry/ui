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

window.ide_open_command_k_s = (cmd) => {
    // we do this because we want to add a space at the end so that the user can start typing
    ide_open_command_k(cmd + " ")
}

window.ide_open_command_k = (cmd) => {
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
        keymap.of([{key: "Enter", run: run_parser}]),
        minimalSetup,
        repl(),
        EditorView.updateListener.of(update),
    ];
}

function update(vu) {
    if (!vu.docChanged) return;
    ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k-error", null);

    // update help based on partial parse
    let doc = window.command_editor.state.doc.toString().trim();

    if (doc.indexOf("add-file") === 0) {
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k-help", "add-file");
    } else if (doc.indexOf("push-file") === 0) {
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k-help", "push-file");
    } else if (doc.indexOf("clear-opfs") === 0) {
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k-help", "clear-opfs");
    } else {
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k-help", "available-commands");
    }

    let tree = repl_parser.parse(doc);
    console.log(tree);
    tree.iterate({
        enter: (node) => {
            console.log(node.type, window.command_editor.state.doc.sliceString(node.from, node.to));
        }
    })
}


function run_parser() {
    console.log("enter pressed");
    // instead of parsing can we get it from the editor state?
    let tree;
    try {
        tree = repl_parser
            .configure({strict: true})
            .parse(window.command_editor.state.doc.toString());
    } catch (e) {
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k-error", e.toString());
        return true;
    }
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

document.addEventListener("keydown", (e) => {
    console.log("asd", e, e.key, e.metaKey, e.ctrlKey);

    if (e.key === "Escape") {
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k", false);
    } else if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        ide_open_command_k("push-file " + ftd.get_value("ui.fifthtry.com/components/editor/vars#current-file"));
        e.preventDefault();
    } else if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        console.log("command-k pressed");
        e.preventDefault();
        ftd.set_value("ui.fifthtry.com/components/editor/vars#command-k", true);
        window.command_editor.focus();
    }
});
