import pluginVue from 'eslint-plugin-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  {
  rules: {
    "vue/valid-v-if": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }]
  },
  ignores: [
    "node_modules",
    "coverage",
    "dist",
    "docs",
  ]
}];
