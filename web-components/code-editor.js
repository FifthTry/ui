// This editor will need these js/css dependencies
//
// CSS
// Include CodeMirror stylesheet
// https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.0/codemirror.min.css
// Include CodeMirror theme (optional)
// https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.0/theme/dracula.min.css
//
// JS
// Include CodeMirror library
// https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.0/codemirror.min.js
// Include CodeMirror mode (e.g., JavaScript)
// https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.0/mode/javascript/javascript.min.js

class CodeEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const shadow = this.shadowRoot;
    let data = window.ftd.component_data(this);
    let initial_content = data.content.get();

    // Import CodeMirror CSS
    const codemirrorCss = document.createElement('link');
    codemirrorCss.rel = 'stylesheet';
    codemirrorCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.0/codemirror.min.css';
    shadow.appendChild(codemirrorCss);

    // Import CodeMirror theme (optional)
    const draculaCss = document.createElement('link');
    draculaCss.rel = 'stylesheet';
    draculaCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.0/theme/dracula.min.css';
    shadow.appendChild(draculaCss);

    // Import CodeMirror library
    const codemirrorJs = document.createElement('script');
    codemirrorJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.0/codemirror.min.js';
    shadow.appendChild(codemirrorJs);

    // Import CodeMirror mode (e.g., JavaScript)
    const javascriptJs = document.createElement('script');
    javascriptJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.0/mode/javascript/javascript.min.js';
    shadow.appendChild(javascriptJs);

    // Create textarea
    const codeEditor = document.createElement('textarea');
    codeEditor.value = data.content.get();
    shadow.appendChild(codeEditor);

    // Wait for CodeMirror library to be loaded before initializing the editor
    codemirrorJs.onload = () => {
      var editor = CodeMirror.fromTextArea(codeEditor, {
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true,
        autofocus: true,
        showCursorWhenSelecting: true,
      })
      editor.setSize("100%", "100%");
      editor.on('change', editor => {
        let content = editor.getValue().trim();
        let file_name = data.filename.get().trim();
        let index = get_index(file_name, data.filecontents.get());
        if (initial_content !== content) {
          if (index === null) {
            data.filecontents.insertAt(0, {
              "file-path": file_name,
              "content": content
            });
          } else {
            data.filecontents.set(index, {
              "file-path": file_name,
              "content": content
            });
          }
          initial_content = content;
        }
      });
    };
  }
}

customElements.define('code-editor', CodeEditor);


function get_index(file_name, file_contents) {
  for(let i in file_contents) {
    let i_file_path = fastn_utils.getStaticValue(file_contents[i].item.get("file-path"))
    if (i_file_path === file_name) {
      return i;
    }
  }
  return null;
}
