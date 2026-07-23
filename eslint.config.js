import js from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "off",
        { allowConstantExport: true },
       ],
       "@typescript-eslint/no-unused-vars": [
           "error",
           {
             "argsIgnorePattern": "^_",
             "varsIgnorePattern": "^_"
           }
         ]
    },
  },

  globalIgnores(["dist", "build", "node_modules"]),
])

export default eslintConfig
