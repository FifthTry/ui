import {nodeResolve} from "@rollup/plugin-node-resolve";
import terser from '@rollup/plugin-terser';
import {lezer} from "@lezer/generator/rollup"

export default {
    input: "./editor.mjs",
    output: {
        file: "./editor-bundle.js",
        sourcemap: true,
        format: "iife"
    },
    plugins: [lezer(), nodeResolve(), terser()]
    // plugins: [lezer(), nodeResolve()]
}
