function get_initials(name) {
    return fastn_utils.getStaticValue(name)
        .split(" ")
        .map((p) => p[0])
        .join("");
}

function callAlert(msg) {
    alert(msg)
}


function presentation_data_to_slide(d) {
    let presentation_data = fastn_utils.getStaticValue(d)
    return fastn.recordInstance({
        "code": presentation_data.get("current-slide-code"),
        "preview-url": presentation_data.get("current-slide-preview"),
    });
}
