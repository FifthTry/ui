import * as ftd2 from "../../ftd2";
import * as preact from "preact";

const ROOT_ID = "package-content-placeholder";
const ROOT_DATA = "outer-folder";
const CURRENT_FILE = "current-file";
const MODIFIED_FILES = "modified-files";

export function initialize_package_ui() {
    console.log("initialize_package_ui");
    let ftd_root = document.getElementById(ROOT_ID);
    ftd2.render(
        show_package_content, {
            folders: [
                {
                    name: "m-blog",
                    open: false,
                    full_name: "m-blog",
                    folders: [{
                        name: "m-images",
                        full_name: "m-images",
                        open: false,
                        folders: [],
                        files: [
                            {name: "m-first-image.jpg", url: "/", full_name: "m-first-image.jpg"},
                        ],
                    }],
                    files: [
                        {name: "m-index.ftd", url: "/", full_name: "m-index.ftd"},
                        {name: "m-first-post.ftd", url: "/", full_name: "m-first-post.ftd"},
                    ],
                }
            ],
            files: [
                {name: "m-FASTN.ftd", url: "/", full_name: "m-FASTN.ftd"},
                {name: "m-index.ftd", url: "/", full_name: "m-index.ftd"},
            ],
            ftd_root
        }, ftd_root
    );
}

export function update_package_content(folders, files) {
    console.log("update_package_content", folders, files);
    ftd2.set_value(ROOT_ID, ROOT_DATA, {folders, files, name: "root", open: true});
}

export function update_modified_files(modified_files) {
    console.log("update_modified_files", modified_files);
    ftd2.set_value(ROOT_ID, MODIFIED_FILES, modified_files);
}

export function update_current_file(current_file) {
    console.log("update_current_file", current_file);
    ftd2.set_value(ROOT_ID, CURRENT_FILE, current_file);
}

function show_package_content({folders, files, ftd_root}) {
    let folder = new ftd2.FastnTik(
        {folders, files, name: "root", open: true}, ftd_root, ROOT_DATA
    );
    let current_file = new ftd2.FastnTik(null, ftd_root, CURRENT_FILE).get();
    let modified_files = new ftd2.FastnTik([], ftd_root, MODIFIED_FILES).get();
    return preact.h(
        show_folder, {folder, hide_name: true, level: 0, current_file, modified_files}
    );
}

const padding = (level) => `${level + 10}px`;

const show_file = ({file, level, current_file, modified_files}) => {
    console.log("show_file", file.get(), level, current_file, modified_files);

    return preact.h(
        "div", {
            style: {
                "padding-top": "2px",
                "padding-bottom": "2px",
                "padding-left": padding(level),
                width: "100%",
                gap: "2px",
                "background": file.get().full_name === current_file ? "#f5f5f5" : "white",
            }
        },
        preact.h("a", {
            style: {
                color: modified_files.indexOf(file.get().full_name) === -1 ? "black" : "blue"
            },
            href: file.get().url
        }, file.get().name)
    )
}

const show_folder = ({folder, level, hide_name, current_file, modified_files}) => {
    // this is okay to do because level is not a mutable variable.
    // all mutable variables should be created using Tik, and updated
    // using the set method.

    console.log("show_folder", folder, folder.get(), level, hide_name);

    if (!level) level = 0;
    let open = folder.index("open");

    console.log(folder.get().name);
    console.log(folder.index("folders").get());

    return preact.h(
        "div", {
            style: {
                "padding-top": "2px",
                "padding-bottom": "2px",
                "padding-left": padding(level),
                gap: "2px",
                width: "100%",
                "font-family": "monospace",
            }
        },
        preact.h(
            "div", null,
            hide_name ? null : preact.h(
                "div", {style: {display: "flex", "flex-direction": "row", gap: "5px", width: "100%"}},
                open.get() ? preact.h("div", null, "+") : preact.h("div", null, "/"),
                preact.h("div",
                    {
                        onClick: () => open.set(!open.get()),
                        style: {cursor: "pointer"}
                    },
                    folder.get().name
                ),
            ),
            open.get() ? folder.index("folders").map((f) => preact.h(show_folder, {
                folder: f,
                level: level + 1,
                current_file,
                modified_files,
            })).concat(folder.index("files").map((f) => preact.h(show_file, {
                file: f,
                level: level + 1,
                current_file,
                modified_files,
            }))) : [],
        ),
    );
}