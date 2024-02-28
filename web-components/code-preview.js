function dragElement(element) {
    // Reference to the entire window
    const windowElement = element;
    const title= element.querySelector('.header');
    const cornerRB= element.querySelector('.corner-rb')
    const cornerLB= element.querySelector('.corner-lb')
    const cornerL = element.querySelector('.corner-l');
    const cornerR= element.querySelector('.corner-r')
    const cornerB= element.querySelector('.corner-b')

    title.addEventListener('mousedown', (e) => {
        title.style.background = '#202020';
        // Initialize variables for tracking drag state
        let offsetX = e.clientX - windowElement.getBoundingClientRect().left;
        let offsetY = e.clientY - windowElement.getBoundingClientRect().top;

        const drag = (e) => {
            e.preventDefault()

            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;

            windowElement.style.left = `${newX}px`;
            windowElement.style.top = `${newY}px`;
        }
        const mouseup = () => {
            title.style.background = 'black';

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', mouseup);
        }

        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousemove', drag);

    });
    cornerRB.addEventListener('mousedown', (e) => {
        let offsetX = e.clientX - windowElement.clientWidth;
        let offsetY = e.clientY - windowElement.clientHeight;

        const drag = (e) => {
            e.preventDefault()

            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;

            windowElement.style.width = `${newX}px`;
            windowElement.style.height = `${newY}px`;
        }
        const mouseup = () => {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', mouseup);
        }

        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousemove', drag);

    });
    cornerLB.addEventListener('mousedown', (e) => {
        let prevX = e.clientX;
        let prevY = e.clientY;

        const drag = (e) => {
            let rect = windowElement.getBoundingClientRect();
            e.preventDefault()

            windowElement.style.width = rect.width + (prevX - e.clientX) + "px";
            windowElement.style.height = rect.height - (prevY - e.clientY) + "px";
            windowElement.style.left = rect.left - (prevX - e.clientX) + "px";

            prevX = e.clientX;
            prevY = e.clientY;
        }
        const mouseup = () => {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', mouseup);
        }

        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousemove', drag);

    });
    cornerL.addEventListener('mousedown', (e) => {
        let prevX = e.clientX;
        const drag = (e) => {
            let rect = windowElement.getBoundingClientRect();
            e.preventDefault()

            windowElement.style.width = rect.width + (prevX - e.clientX) + "px";
            windowElement.style.left = rect.left - (prevX - e.clientX) + "px";

            prevX = e.clientX;
        }
        const mouseup = () => {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', mouseup);
        }

        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousemove', drag);

    });
    cornerR.addEventListener('mousedown', (e) => {
        let offsetX = e.clientX - windowElement.clientWidth;
        const drag = (e) => {
            e.preventDefault();
            const newX = e.clientX - offsetX;
            windowElement.style.width = `${newX}px`;
        }
        const mouseup = () => {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', mouseup);
        }

        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousemove', drag);

    });
    cornerB.addEventListener('mousedown', (e) => {
        let offsetY = e.clientY - windowElement.clientHeight;
        const drag = (e) => {
            e.preventDefault()
            const newY = e.clientY - offsetY;
            windowElement.style.height = `${newY}px`;
        }
        const mouseup = () => {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', mouseup);
        }

        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousemove', drag);

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
      <div class="header" style="cursor: move; color: white; background: black;">
        <div>Preview</div>
      </div>
      <div id="content" style="height: calc(100% - 24px)">
        <div id="iframe-container" style="height: 100%">
          <!-- You can replace 'your-url-here' with the desired URL -->
          <iframe src=${iframe_url} frameborder="0" width="100%" height="100%"></iframe>
        </div>
      </div>
      <div class="corner-rb" style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; cursor: nwse-resize"></div>
      <div class="corner-lb" style="position: absolute; bottom: 0; left: 0; width: 12px; height: 12px; cursor: nesw-resize"></div>
      <div class="corner-l" style="position: absolute; left: 0; top: 0; width: 12px; height: calc(100% - 12px); cursor: ew-resize"></div>
      <div class="corner-r" style="position: absolute; right: 0; top: 0; width: 12px; height: calc(100% - 12px); cursor: ew-resize"></div>
      <div class="corner-b" style="position: absolute; left: 12px; bottom: 0; width: calc(100% - 24px); height: 12px; cursor: ns-resize"></div>
    `;

    dragElement(container);

    // Append the container to the shadow DOM
    this.shadowRoot.appendChild(container);
  }
}

customElements.define('code-preview', CodePreview);
