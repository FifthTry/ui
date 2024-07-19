import * as ftd2 from "../../ftd2";
import * as preact from "preact";

const ROOT_ID = "package-content-placeholder";
const ROOT_DATA_KEY = "data";

export function initialize_package_ui() {
    console.log("initialize_package_ui");
    let ftd_root = document.getElementById(ROOT_ID);
    ftd2.render(
        show_package_content, {folders: [], files: [], ftd_root}, ftd_root
    );
}

export function update_package_content({folders, files}) {
    console.log("show_package_content", folders, files);
    ftd2.set_value(ROOT_ID, ROOT_DATA_KEY, {folders, files})
}

function show_package_content({folders, files, ftd_root}) {
    let data = new ftd2.FastnTik({folders, files}, ftd_root, ROOT_DATA_KEY);
    preact.h(
        show_folder, {
            folder: {
                folders: data.index("folders"),
                files: data.index("files"),
                name: "root"
            },
            show_name: false
        }
    );
}

const padding = (level) => `${level + 10}px`;

const show_file = ({file, level}) => {
    return preact.h(
        "div", {
            style: {
                "padding-top": "2px",
                "padding-bottom": "2px",
                "padding-left": padding(level),
                gap: "2px",
                "background": file.get().open ? "#f5f5f5" : "auto",
            }
        },
        file.get().name
    )
}

const show_folder = ({folder, level, show_name}) => {
    // this is okay to do because level is not a mutable variable.
    // all mutable variables should be created using Tik, and updated
    // using the set method.
    if (!level) level = 0;
    let open = folder.index("open");

    return preact.h(
        "div", {
            style: {
                "padding-top": "2px",
                "padding-bottom": "2px",
                "padding-left": padding(level),
                gap: "2px",
            }
        },
        preact.h(
            "div", null,
            show_name ? preact.h(
                "div", {style: {display: "flex", "flex-direction": "row", gap: "5px"}},
                open.get() ? preact.h("div", null, "+") : preact.h("div", null, "/"),
                preact.h("div",
                    {
                        onClick: () => open.set(!open.get()),
                        style: {cursor: "pointer"}
                    },
                    folder.get().name
                ),
            ) : null,
            open.get() ? folder.index("folders").map((f) => preact.h(show_folder, {
                folder: f,
                level: level + 1
            })).concat(folder.index("files").map((f) => preact.h(show_file, {
                file: f,
                level: level + 1
            }))) : [],
        ),
    );
}