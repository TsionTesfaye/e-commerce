import antfu from "@antfu/eslint-config"
import tailwind from "eslint-plugin-tailwindcss"
import withNuxt from "./.nuxt/eslint.config.mjs"

export default withNuxt(antfu({
  stylistic: {
    quotes: "double",
    indent: 2,
  },
}, {
  files: ["**/*.vue"],
  rules: {
    "import/exports-last": "off",
    "import/first": "off",
  },
}, {
  files: ["**/*.ts", "**/*.vue"],
  rules: {
    "ts/consistent-type-definitions": ["warn", "type"],
    "node/prefer-global/process": ["error", "always"],
  },
}, {
  rules: {
    "curly": ["error", "all"],
    "style/max-statements-per-line": ["error", { max: 1 }],
    "style/brace-style": ["error", "1tbs"],
  },
}), tailwind.configs["flat/recommended"], {
  rules: {
    "tailwindcss/no-custom-classname": "off",
  },
})
