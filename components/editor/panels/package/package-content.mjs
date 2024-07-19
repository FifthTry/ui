import * as ftd2 from "../../ftd2";
import * as preact from "preact";

const ROOT_ID = "package-content-placeholder";
const ROOT_DATA_KEY = "outer-folder";

export function initialize_package_ui() {
    console.log("initialize_package_ui");
    let ftd_root = document.getElementById(ROOT_ID);
    ftd2.render(
        show_package_content, {
            folders: [
                {
                    name: "m-blog",
                    open: false,
                    folders: [{
                        name: "m-images",
                        open: false,
                        folders: [],
                        files: [
                            {open: false, name: "m-first-image.jpg", url: "/"},
                        ],
                    }],
                    files: [
                        {open: false, name: "m-index.ftd", url: "/"},
                        {open: false, name: "m-first-post.ftd", url: "/"},
                    ],
                }
            ],
            files: [
                {open: true, name: "m-FASTN.ftd", url: "/"},
                {open: false, name: "m-index.ftd", url: "/"}
            ],
            ftd_root
        }, ftd_root
    );
}

export function update_package_content(folders, files) {
    console.log("update_package_content", folders, files);
    ftd2.set_value(ROOT_ID, ROOT_DATA_KEY, {folders, files, name: "root", open: true});
}

function show_package_content({folders, files, ftd_root}) {
    console.log("show_package_content111", folders, files);
    let folder = new ftd2.FastnTik(
        {folders, files, name: "root", open: true}, ftd_root, ROOT_DATA_KEY
    );
    console.log("folder", folder, folder.get());
    return preact.h(show_folder, {folder, hide_name: true, level: 0});
}

const padding = (level) => `${level + 10}px`;

const show_file = ({file, level}) => {
    return preact.h(
        "div", {
            style: {
                "padding-top": "2px",
                "padding-bottom": "2px",
                "padding-left": padding(level),
                width: "100%",
                gap: "2px",
                "background": file.get().open ? "#f5f5f5" : "auto",
            }
        },
        preact.h(
            "a", {
                style: { color: "black" },
                href: file.get().url
        }, file.get().name)
    )
}

const show_folder = ({folder, level, hide_name}) => {
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
                level: level + 1
            })).concat(folder.index("files").map((f) => preact.h(show_file, {
                file: f,
                level: level + 1
            }))) : [],
        ),
    );
}