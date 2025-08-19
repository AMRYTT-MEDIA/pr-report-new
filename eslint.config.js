import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist", ".next", "node_modules"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly",
        module: "readonly",
        exports: "readonly",
        require: "readonly",
        global: "readonly",
        _N_E: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-extra-semi": "warn",
      "no-useless-catch": "warn",
      "no-prototype-builtins": "warn",
      "no-empty": "warn",
      "no-cond-assign": "warn",
      "no-control-regex": "warn",
      "no-redeclare": "warn",
      "no-fallthrough": "warn",
    },
  },
];
