function dragElement(element) {
    // Initialize variables for tracking drag state
    let isDragging = false;
    let offsetX, offsetY;

    // Reference to the entire window
    const windowElement = element;

    // Event listeners for starting and stopping the drag
    windowElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - windowElement.getBoundingClientRect().left;
      offsetY = e.clientY - windowElement.getBoundingClientRect().top;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Event listener for dragging the window
    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;

        windowElement.style.left = `${newX}px`;
        windowElement.style.top = `${newY}px`;
      }
    });
 }


function closeWindow() {
    // Close the window
    document.getElementById("floating-window").style.display = "none";
}

class CodePreview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Create a container div for the shadow DOM content
    const container = document.createElement('div');
    container.setAttribute('id', 'floating-window');
    container.style.position = 'absolute';  // Set the position property to 'absolute' or 'fixed'
    container.style.top = '100px';
    container.style.right = '100px';
    container.style.width = '400px';
    container.style.height = '400px';
    container.style.zIndex = '100';

    var iframe_url = "https://fastn.com";

    // Set up the HTML content for the shadow DOM
    container.innerHTML = `
      <div id="header" style="cursor: move;">
        <div style="color: white; background: black;">Preview</div>
      </div>
      <div id="content">
        <div id="iframe-container">
          <!-- You can replace 'your-url-here' with the desired URL -->
          <iframe src=${iframe_url} frameborder="0" width="100%" height="100%"></iframe>
        </div>
      </div>
    `;

    dragElement(container);

    // Append the container to the shadow DOM
    this.shadowRoot.appendChild(container);
  }
}

customElements.define('code-preview', CodePreview);

