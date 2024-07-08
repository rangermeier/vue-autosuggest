import { action } from '@storybook/addon-actions';
import VueAutosuggest from './Autosuggest.vue';

export default {
  component: VueAutosuggest,
};
 
const sharedData = {
  options: [
    "Frodo",
    "Gandalf",
    "Samwise",
    "Aragorn",
    "Galadriel",
    "Sauron",
    "Gimli",
    "Legolas",
    "Saruman",
    "Elrond",
    "Gollum",
    "Bilbo"
  ],
  methods: {
  }
}

export const Simplest = {
  args: {
    suggestions: [{data: sharedData.options}],
    inputProps: {
      id: "autosuggest__input",
      placeholder: "Type 'e'",
    },
    selected: "",
  },
  render: (args) => ({
    components: { VueAutosuggest },
    setup() {
      action('setup')(args)
      return {
        args,
      }
    },
    methods: {
      onInput(text) {
        action('input')(text)
        this.args.suggestions = [{data: sharedData.options.filter(item => {
          return item.toLowerCase().indexOf(text.toLowerCase()) > -1;
        })}]
      },
      onSelected(item) {
        action('selected')(item)
        this.args.selected = item;
      }
    },
    template: `
      <VueAutosuggest v-bind="args" @update:modelValue="onInput" @selected="onSelected" />
      <div v-if="args.selected">You have selected '{{args.selected.item}}'</div>
    `
  }),
}


// TODO port remaining stories from ./stories/index.js
