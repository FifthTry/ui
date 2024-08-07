function addPreviewExpandable() {
    let rightPanel = document.getElementById("right-panel");
    const rightDragHandle= document.getElementById("right-drag-handle");
    const previewIframe= document.getElementById("preview-iframe");

    let isDraggingRight = false;
    let prevX = null;
    let rectWidth = null;
    let rectLeft = null;
    let inIframe = false;

    rightDragHandle.addEventListener('mousedown', (e) => {
        prevX = e.clientX;

        let rect = rightPanel.getBoundingClientRect();
        rectWidth = rect.width;
        rectLeft = rect.left;
        console.log("old width mousedown:", rectWidth, prevX);
        isDraggingRight = true;
        document.body.style.cursor = 'ew-resize';
    });

    const handleMouseMove = (e) => {
        console.log("mousemove isDraggingRight", isDraggingRight, e.clientX);
        if (isDraggingRight) {
            e.preventDefault()
            // const newWidth = window.innerWidth - e.clientX;
            console.log("old width:", rectWidth, rightPanel.getBoundingClientRect().width, rectLeft, rightPanel.getBoundingClientRect().left);
            rectWidth = rectWidth + (prevX - e.clientX);
            console.log("new width:", rectWidth, e.clientX, prevX);
            if (rectWidth > 50 && rectWidth < window.innerWidth) {
                rightPanel.style.width = `${rectWidth}px`;
                prevX = e.clientX;
                // mainContent.style.marginRight = `${newWidth + 10}px`; // Adjust main content margin
            }
        }
    }

    const handleMouseUp = (e) => {
        console.log("mouseup isDraggingRight", isDraggingRight);
        if (isDraggingRight) {
            isDraggingRight = false;
            document.body.style.cursor = 'default';
        }
    }

    document.addEventListener('mousemove', (e) => {
        if (inIframe) {
            prevX = e.clientX;
            inIframe = false;
        }
        handleMouseMove(e);
    });
    document.addEventListener('mouseup', handleMouseUp);

    previewIframe.addEventListener('load', () => {
        const iframeDocument = previewIframe.contentDocument || previewIframe.contentWindow.document;
        iframeDocument.addEventListener('mousemove', (e) => {
            if (!inIframe) {
                prevX = e.clientX;
                inIframe = true;
            }
            handleMouseMove(e);
        });
        iframeDocument.addEventListener('mouseup', handleMouseUp);
    });
}

function trigger_save_event() {
    window.ide_dispatch_event("save-current-file");
}
