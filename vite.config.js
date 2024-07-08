import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  build: {
    lib: {
      entry: "src/vue-autosuggest.js",
      name: "VueAutosuggest",
      fileName: "vue-autosuggest",
    },
    rollupOptions: {
      output: {
        exports: "named",
        name: "VueAutosuggest",
        globals: {
          vue: 'Vue',
        },
      },
      external: ["vue"]
    }
  },
  plugins: [vue({})]
});
