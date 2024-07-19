import {nodeResolve} from "@rollup/plugin-node-resolve";
import terser from '@rollup/plugin-terser';

export default {
    input: "./editor.mjs",
    output: {
        file: "./editor-bundle.js",
        sourcemap: true,
        format: "iife"
    },
    // plugins: [nodeResolve(), terser()]
    plugins: [nodeResolve()]
}
