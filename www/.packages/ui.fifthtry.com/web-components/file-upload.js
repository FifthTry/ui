// file-upload.js
class FileUpload extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Create input element for file selection
        let data = window.ftd.component_data(this);
        this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.addEventListener('change', this.handleFile.bind(this, data));

        // Append input element to shadow DOM
        this.shadowRoot.appendChild(this.input);
    }

    handleFile(data, event) {
        const file = event.target.files[0];
        // You can add your file handling logic here
        console.log('File selected:', file.name);
        data.file_name.set(file.name);

        const reader = new FileReader();

        reader.onload = function(event) {
            const arrayBuffer = event.target.result;
            const bytes = new Uint8Array(arrayBuffer);

            // Now you can work with the bytes array
            console.log('File bytes:', bytes);
            data.content.set(Array.from(bytes))
        };

        reader.readAsArrayBuffer(file);
    }
}

// Define the custom element
customElements.define('file-upload', FileUpload);
