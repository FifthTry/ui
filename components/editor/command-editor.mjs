import {EditorView, minimalSetup} from "codemirror";
import {keymap} from "@codemirror/view";
import {defaultKeymap} from "@codemirror/commands";

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
                    {
                        key: "Enter",
                        run() {
                            console.log("enter pressed");
                            return true
                        }
                    }
                ]),
                minimalSetup,
            ],
            parent: this,
        });
    }
}


