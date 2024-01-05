class CodeEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      const shadow = this.shadowRoot;
      // Create a CodeMirror instance
      var editor = CodeMirror(document.body, {
        mode: "javascript",
        lineNumbers: true,
        theme: "default",
      });
    
      // Create a preview container
      var preview = document.createElement("div");
      preview.id = "preview";
    
      // Real-time update function
      function updatePreview() {
        var code = editor.getValue();
        preview.innerHTML = "";
    
        try {
          var script = document.createElement("script");
          script.appendChild(document.createTextNode(code));
          preview.appendChild(script);
        } catch (e) {
          console.error(e.message);
        }
      }
    
      // Set up real-time update on editor change
      editor.on("change", updatePreview);
      shadow.appendChild(preview);
    }

  }
  
  customElements.define('code-editor', CodeEditor);