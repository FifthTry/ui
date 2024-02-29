function dragElement(element, dragBG) {
    // Reference to the entire window
    const windowElement = element;
    const title= element.querySelector('.header');
    const cornerRB= element.querySelector('.corner-rb')
    const cornerLB= element.querySelector('.corner-lb')
    const cornerL = element.querySelector('.corner-l');
    const cornerR= element.querySelector('.corner-r')
    const cornerB= element.querySelector('.corner-b')
    const minimize= element.querySelector('.minimize')
    const content= element.querySelector('.content')
    let expand = true

    title.addEventListener('mousedown', (e) => {
        let oldBackground = title.style.background;
        let oldBorder = content.style.borderColor;
        title.style.background = dragBG.color;
        content.style.borderColor = dragBG.color;
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
            title.style.background = oldBackground;
            content.style.borderColor = oldBorder;

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
    minimize.addEventListener("click", (e) => {
        e.preventDefault();
        expand = !expand;
        if (expand) {
            content.style.display = "block"
        } else {
            content.style.display = "none"
        }
    })
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
    container.style.zIndex = '1000';
    let data = window.ftd.component_data(this);
    var iframe_url = data.url.get();
    let dragBG = {color: '#636161'};

    // Set up the HTML content for the shadow DOM
    container.innerHTML = `
      <div class="header" style="cursor: move; color: white; background: black; padding: 0 10px; justify-content: space-between; display: flex">
        <div>Preview</div>
        <div class="minimize" style="cursor: pointer">--</div>
      </div>
      <div class="content" style="height: calc(100% - 24px); border-width: 1px; border-style: solid; border-color: black">
        <div id="iframe-container" style="height: 100%">
          <!-- You can replace 'your-url-here' with the desired URL -->
          <iframe src=${iframe_url} frameborder="0" width="100%" height="100%"></iframe>
        </div>
      </div>
      <div class="corner-rb" style="position: absolute; bottom: 0; right: 0; width: 6px; height: 6px; cursor: nwse-resize"></div>
      <div class="corner-lb" style="position: absolute; bottom: 0; left: 0; width: 6px; height: 6px; cursor: nesw-resize"></div>
      <div class="corner-l" style="position: absolute; left: 0; top: 0; width: 6px; height: calc(100% - 6px); cursor: ew-resize"></div>
      <div class="corner-r" style="position: absolute; right: 0; top: 0; width: 6px; height: calc(100% - 6px); cursor: ew-resize"></div>
      <div class="corner-b" style="position: absolute; left: 6px; bottom: 0; width: calc(100% - 12px); height: 6px; cursor: ns-resize"></div>
    `;

      const title= container.querySelector('.header');
      const content= container.querySelector('.content');
      let headerColor = function () {
          const darkMode = data.dark_mode.get();
          if (darkMode) {
              title.style.backgroundColor = 'white';
              title.style.color = 'black';
              content.style.borderColor = 'white';
              dragBG.color = '#c5c2c2';
          } else {
              title.style.backgroundColor = 'black';
              title.style.color = 'white';
              content.style.borderColor = 'black';
              dragBG.color = '#636161';
          }
      };
      data.dark_mode.on_change(headerColor);


      headerColor();
      dragElement(container, dragBG);

    // Append the container to the shadow DOM
    this.shadowRoot.appendChild(container);
  }
}

customElements.define('code-preview', CodePreview);
