import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    {
        // Note: there should be no other properties in this object
        ignores: [
            "**/temp.js",
            "config/*",
            "node_modules/",
            "dist/",
            "coverage/",
            ".prettierrc"
        ]
    },
    ...tseslint.configs.recommended
];
