function get_initials(name) {
    return fastn_utils.getStaticValue(name)
        .split(" ")
        .map((p) => p[0])
        .join("");
}

function callAlert(msg) {
    alert(msg)
}

