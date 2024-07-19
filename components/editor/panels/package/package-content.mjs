import * as ftd2 from "../../ftd2";

export function initialize_package_ui() {
    console.log("initialize_package_ui");
    let ftd_root = document.getElementById("package-content-placeholder");

    ftd2.render(
        show_package_content, {folders: [], files: [], ftd_root}, ftd_root
    );
}

function show_package_content({folders, files, ftd_root}) {
    let data = new ftd2.FastnTik({folders, files}, ftd_root, "data");
    preact.h("div", )
}


export function update_package_content(folders, files) {
    console.log("show_package_content", folders, files);
}