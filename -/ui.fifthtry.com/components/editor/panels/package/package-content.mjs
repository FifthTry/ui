import * as ftd2 from "../../ftd2";
import * as preact from "preact";

const ROOT_ID = "package-content-placeholder";
const ROOT_DATA = "outer-folder";
const CURRENT_FILE = "current-file";
const CONTEXT_MENU_PATH = "context-menu-path";
const MODIFIED_FILES = "modified-files";
const ONLY_MODIFIED_FILES = "only-modified-files";

export function initialize_package_ui() {
    let ftd_root = document.getElementById(ROOT_ID);
    ftd_root.addEventListener("scroll", window.ide_clear_context_menu);
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

export function update_context_menu_path(context_menu_path) {
    console.log("update_context_menu_path", context_menu_path);
    ftd2.set_value(ROOT_ID, CONTEXT_MENU_PATH, context_menu_path);
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
    let context_menu_path = new ftd2.FastnTik("", ftd_root, CONTEXT_MENU_PATH).get();
    let modified_files = new ftd2.FastnTik([], ftd_root, MODIFIED_FILES).get();
    let only_modified_files = new ftd2.FastnTik(false, ftd_root, ONLY_MODIFIED_FILES).get();

    // saves open file state on every render
    window.dispatchEvent(new CustomEvent("ide-event", {detail: {name: "save-file-tree", data: folder.get()}}));

    return preact.h(
        show_folder, {
            folder, hide_name: true, level: 0,
            current_file, context_menu_path, modified_files, only_modified_files,
            parent_full_name: "",
        }
    );
}

const padding = (level) => `${(level - 1) * 18 + 8}px`;

const file_color = (file, is_a_modified_file) => {
    // is_modified client side info should override server's file.status
    if (is_a_modified_file) return "blue";

    switch (file.status) {
        case "Normal":
            return "black";
        case "Deleted":
            return "red";
        case "New":
            return "green";
        default: {
            console.error("unreachable state. File status must be in [Normal, Deleted, New]");
            return "black";
        }
    }
}

function triple_dot_icon(open, isFile, fullPath) {
    if (!open.get()) return null;
    return hover_icon(
        "dots-three-circle-vertical", {
            right: "5px",
            onClick: (e) => {
                let pos = e.target.getBoundingClientRect();
                ftd.set_value(
                    "ui.fifthtry.com/components/editor/vars#context-menu-visible",
                    isFile ? "file" : "folder"
                );
                ftd.set_value("ui.fifthtry.com/components/editor/vars#context-menu-left", pos.left + 16);
                ftd.set_value("ui.fifthtry.com/components/editor/vars#context-menu-top", pos.top + 16);
                console.log("ui.fifthtry.com/components/editor/vars#context-menu-path", fullPath);
                ftd.set_value("ui.fifthtry.com/components/editor/vars#context-menu-path", fullPath);
                update_context_menu_path(fullPath);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    );
}

function hover_icon(name, {right, onClick}) {
    let hover = new ftd2.FastnTik(false);

    return icon(
        name, {
            right, onClick,
            variant: hover.get() ? "regular" : "thin",
            onmouseenter: () => hover.set(true),
            onmouseleave: () => hover.set(false),
        }
    );
}

function icon(name, {variant, right, onClick, ...extra_props}) {
    variant = variant || "light";

    let style = {
        width: "16px",
        height: "16px",
        right: right ? right : "auto",
    };

    if (!!right) {
        style.right = right;
        style.position = "absolute";
    }

    let props = {
        src: (
            variant === "regular" ?
                `//raw.githubusercontent.com/phosphor-icons/core/main/raw/regular/${name}.svg`
                : `//raw.githubusercontent.com/phosphor-icons/core/main/raw/${variant}/${name}-${variant}.svg`
        ),
        style: {...style, ...extra_props.style},
        onClick,
        ...extra_props,
    };

    if (!!onClick) {
        props.onClick = onClick;
        props.style.cursor = "pointer";
    }

    return preact.h("img", props)
}

const show_file = ({
                       file,
                       level,
                       current_file,
                       context_menu_path,
                       modified_files,
                       only_modified_files,
                   }) => {
    // file.full-name: to be compared with modified and deleted
    // file.name: to be shown in ui
    // file.url: as click target
    // file.language: to pick the file icon
    let is_a_modified_file = modified_files.indexOf(file.full_name) >= 0;

    // Deleted and New are modifications
    let is_modified = is_a_modified_file || ["Deleted", "New"].includes(file.status);

    if (only_modified_files && !is_modified) {
        return null;
    }

    let triple_dot = new ftd2.FastnTik(false);

    let background = "white";
    if (file.full_name === context_menu_path) {
        background = "#f5f5f5";
    } else if (file.full_name === current_file && context_menu_path === "") {
        background = "#f0f0f0";
    }

    return preact.h(
        "a", {
            style: {
                "padding-top": "2px",
                "padding-bottom": "2px",
                "padding-left": padding(level),
                color: file_color(file, is_a_modified_file),
                display: "flex",
                flexDirection: "row",
                width: "100%",
                gap: "3px",
                background,
                position: "relative",
            },
            onmouseenter: () => triple_dot.set(true),
            onmouseleave: () => triple_dot.set(false),
            href: file.url,
        },
        icon("file-text", {}),
        file.name,
        triple_dot_icon(triple_dot, true, file.full_name),
    )
}

const show_folder = ({
                         folder,
                         parent_full_name,
                         level,
                         hide_name,
                         current_file,
                         context_menu_path,
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

    let triple_dot = new ftd2.FastnTik(false);

    return preact.h(
        "div", {
            style: {
                "padding-top": "2px",
                "padding-bottom": "2px",
                gap: "2px",
                width: "100%",
                "font-family": "monospace",
                fontSize: "12px",
                background: folder.get().full_name === context_menu_path ? "#f5f5f5" : "white",
            }
        },
        preact.h(
            "div", null,
            hide_name ? null : preact.h(
                "div", {
                    onClick: () => open.set(!open.get()),
                    onmouseenter: () => triple_dot.set(true),
                    onmouseleave: () => triple_dot.set(false),
                    style: {
                        display: "flex",
                        "flex-direction": "row",
                        gap: "5px",
                        width: "100%",
                        cursor: "pointer",
                        "padding-left": padding(level),
                        color: folder.get().modified ? "blue" : "black",
                        position: "relative",
                    }
                },
                icon(open.get() ? "folder-open" : "folder", {}),
                folder.get().name,
                triple_dot_icon(triple_dot, false, folder.get().full_name),
            ),
            open.get() ? folder.index("folders").map((f) => preact.h(show_folder, {
                folder: f,
                level: level + 1,
                current_file,
                context_menu_path,
                modified_files,
                only_modified_files,
                parent_full_name: full_name,
            })).concat(folder.index("files").map((f) => preact.h(show_file, {
                file: f.get(),
                level: level + 1,
                current_file,
                context_menu_path,
                modified_files,
                only_modified_files,
            }))) : [],
        ),
    );
}



