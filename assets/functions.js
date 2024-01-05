function get_initials(name) {
    return fastn_utils.getStaticValue(name)
        .split(" ")
        .map((p) => p[0])
        .join("");
}

function callAlert(msg) {
    alert(msg)
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else {
        var expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function set_language(language) {
    eraseCookie("fastn-lang");
    createCookie("fastn-lang", language, 365 * 60);
    document.location.reload();
}


function setupRealTimeEditor() {
    // Create a CodeMirror instance
    var editor = CodeMirror(document.body, {
      mode: "javascript",
      lineNumbers: true,
      theme: "default",
    });
  
    // Create a preview container
    var preview = document.createElement("div");
    preview.id = "preview";
    document.body.appendChild(preview);
  
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
  }