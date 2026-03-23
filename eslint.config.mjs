import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [

    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "build/**",
            "coverage/**",
            "*.config.js",
            "debug.log"
        ]
    },

    pluginJs.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
        },
    },
];