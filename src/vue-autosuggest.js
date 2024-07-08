import VueAutosuggest from "./Autosuggest.vue";
import DefaultSection from "./parts/DefaultSection.js";

const VueAutosuggestPlugin = {
  install(Vue) {
    Vue.component("VueAutosuggestDefaultSection", DefaultSection);
    Vue.component("VueAutosuggest", VueAutosuggest);
  }
};

export default VueAutosuggestPlugin;
export { VueAutosuggest, DefaultSection };

if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(VueAutosuggestPlugin);
}
