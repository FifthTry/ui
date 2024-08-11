import * as ftd2 from "../../ftd2";
import * as preact from "preact";

const ROOT_ID = "package-content-placeholder";
const ROOT_DATA = "outer-folder";
const CURRENT_FILE = "current-file";
const MODIFIED_FILES = "modified-files";
const ONLY_MODIFIED_FILES = "only-modified-files";

export function initialize_package_ui() {
    let ftd_root = document.getElementById(ROOT_ID);
    ftd2.render(show_package_content, {folders: [], files: [], ftd_root}, ftd_root);
}

export function update_package_content(folders, files) {
    ftd2.set_value(ROOT_ID, ROOT_DATA, {folders, files, name: "root", open: true});
}

export function update_only_show_modified_files(value) {
    ftd2.set_value(ROOT_ID, ONLY_MODIFIED_FILES, value);
}

export function update_modified_files(files) {
    ftd2.set_value(ROOT_ID, MODIFIED_FILES, files);
}

export function update_current_file(current_file) {
    ftd2.set_value(ROOT_ID, CURRENT_FILE, current_file);
    let p = ftd2.get_value(ROOT_ID, ROOT_DATA);

    if (current_file == null) {
        console.log("current_file is null");
        return;
    }

    while (true) {
        let [folder_name, rest] = first_folder_and_rest(current_file);
        console.log(folder_name, rest);
        if (folder_name === null) {
            break;
        }
        let folder = find_folder(p.folders, folder_name);
        console.log(folder);
        if (folder === null) {
            // should not happen:
            throw new Error(`folder ${folder_name} not found`);
        }
        folder.open = true;
        current_file = rest;
        p = folder;
    }
}

function first_folder_and_rest(path) {
    let index = path.indexOf("/");
    if (index === -1) {
        return [null, path];
    }
    return [path.slice(0, index), path.slice(index + 1)];
}


function find_folder(folders, name) {
    for (let i = 0; i < folders.length; i++) {
        if (folders[i].name === name) {
            return folders[i];
        }
    }
    return null;
}

function show_package_content({folders, files, ftd_root}) {
    let folder = new ftd2.FastnTik(
        {folders, files, name: "root", open: true}, ftd_root, ROOT_DATA
    );
    let current_file = new ftd2.FastnTik(null, ftd_root, CURRENT_FILE).get();
    let modified_files = new ftd2.FastnTik([], ftd_root, MODIFIED_FILES).get();
    let only_modified_files = new ftd2.FastnTik(false, ftd_root, ONLY_MODIFIED_FILES).get();
    return preact.h(
        show_folder, {
            folder, hide_name: true, level: 0,
            current_file, modified_files, only_modified_files,
            parent_full_name: "",
        }
    );
}

const padding = (level) => `${(level - 1) * 18 + 8}px`;

const file_color = (file, is_modified) => {
    switch (file.status) {
        case "Normal":
            return "black";
        case "Deleted":
            return "red";
        case "New":
            return "green";
        default:
            return is_modified ? "blue" : "black";
    }
}

function light_icon(name) {
    return preact.h("img",
        {
            src: `//raw.githubusercontent.com/phosphor-icons/core/main/raw/light/${name}-light.svg`,
            style: {
                width: "16px",
                height: "16px",
            },
        }
    )
}

const show_file = ({
                       file,
                       level,
                       current_file,
                       modified_files,
                       only_modified_files,
                   }) => {
    // file.full-name: to be compared with modified and deleted
    // file.name: to be shown in ui
    // file.url: as click target
    // file.language: to pick the file icon
    let is_modified = modified_files.indexOf(file.full_name) >= 0
        || ["Deleted", "New"].includes(file.status);

    if (only_modified_files && !is_modified) {
        return null;
    }

    return preact.h(
        "a", {
            style: {
                "padding-top": "2px",
                "padding-bottom": "2px",
                "padding-left": padding(level),
                color: file_color(file, is_modified),
                display: "flex",
                flexDirection: "row",
                width: "100%",
                gap: "3px",
                background: file.full_name === current_file ? "#f5f5f5" : "white",
            },
            href: file.url
        },
        light_icon("file-text"),
        file.name
    )
}

const show_folder = ({
                         folder,
                         parent_full_name,
                         level,
                         hide_name,
                         current_file,
                         modified_files,
                         only_modified_files,
                     }) => {
    // this is okay to do because level is not a mutable variable.
    // all mutable variables should be created using Tik, and updated
    // using the set method.

    if (!level) level = 0;

    let full_name = parent_full_name === "" ? folder.get().name : `${parent_full_name}${folder.get().name}`;
    if (full_name === "root") {
        full_name = "";
    } else {
        full_name = `${full_name}/`;
    }

    // top level folder should be open by default and others closed
    let open = folder.index("open");

    if (only_modified_files) {
        let contains_a_modified_file = false;
        for (let i = 0; i < modified_files.length; i++) {
            if (modified_files[i].indexOf(full_name) === 0) {
                contains_a_modified_file = true;
                break
            }
        }
        contains_a_modified_file |= folder.get().modified;
        if (!contains_a_modified_file) {
            return null;
        }
    }

    return preact.h(
        "div", {
            style: {
                "padding-top": "2px",
                "padding-bottom": "2px",
                gap: "2px",
                width: "100%",
                "font-family": "monospace",
                fontSize: "12px",
            }
        },
        preact.h(
            "div", null,
            hide_name ? null : preact.h(
                "div", {
                    onClick: () => open.set(!open.get()),
                    style: {
                        display: "flex",
                        "flex-direction": "row",
                        gap: "5px",
                        width: "100%",
                        cursor: "pointer",
                        "padding-left": padding(level),
                        color: folder.get().modified ? "blue" : "black",
                    }
                },
                light_icon(open.get() ? "folder-open" : "folder"),
                folder.get().name,
            ),
            open.get() ? folder.index("folders").map((f) => preact.h(show_folder, {
                folder: f,
                level: level + 1,
                current_file,
                modified_files,
                only_modified_files,
                parent_full_name: full_name,
            })).concat(folder.index("files").map((f) => preact.h(show_file, {
                file: f.get(),
                level: level + 1,
                current_file,
                modified_files,
                only_modified_files,
            }))) : [],
        ),
    );
}
