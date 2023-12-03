// on page load look for all elements with class="fa" and replace

let svg_cache = {};
let svg_waiting = {};

let FA_URL_PREFIX = "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/";
// let FA_URL_PREFIX = "/fa/";

function updateSVG(el, name) {
    if (!name) {
        return;
    }

    if (name in svg_cache) {
        console.log("svg_cache hit for " + name);
        el.innerHTML = svg_cache[name];
    } else {
        console.log("svg_cache miss for " + name);
        if (name in svg_waiting) {
            console.log("svg_waiting hit for " + name);
            svg_waiting[name].push(el);
            return;
        }
        svg_waiting[name] = [el];
        fetch(FA_URL_PREFIX + name + ".svg").then(function (response) {
            console.log("fetched " + name);
            return response.text();
            // replace <svg with <svg fill="currentColor"
        }).then(function (text) {
            text = text.replace(/<svg /g, '<svg fill="currentColor" ');
            svg_cache[name] = text;
            for (let el of svg_waiting[name]) {
                el.outerHTML = text;
            }
            delete svg_waiting[name];
        });
    }
}


// get class that starts with fa-
function update_all_svg() {
    console.log("update_all_svg");
    for (let el of document.getElementsByClassName("fa")) {
        updateSVG(el, el.innerText);
    }
    let observer = new MutationObserver(function (mutations) {
        for (let mutation of mutations) {
                let el = mutation.target;
                if (el.nodeName === "div" && el.classList.contains("fa")) {
                    updateSVG(el, get_fa_class(el));
                }
        }
    });
    let config = {attributes: true, childList: true, subtree: true};
    observer.observe(document.body, config);
}


window.addEventListener("load", update_all_svg);
