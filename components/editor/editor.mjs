import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"

class CMEditor extends HTMLElement {
    constructor() {
        console.log('constructor');
        super();
        this.style.width = "100%";
        this.style.height = "100%";
        this.classList.add('fastn-ignore-global-keyboard');
    }

    connectedCallback() {
        console.log('connectedCallback');

        let e = new EditorView({
            extensions: [basicSetup, javascript()],
            parent: this,
            doc: "function greet(who) {\n  return 'Hello, ' + who + '!';\n}"
            // trying to set height to occupy the whole parent, but its not working
            // contentHeight: 40,
            // height: "100%",
            // viewportMargin: Infinity,
        });
    }
}

customElements.define('cm-editor', CMEditor);