function get_initials(name) {
    return name
        .get("value")
        .split(" ")
        .map((p) => p[0])
        .join("");
}
