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
}

function getFilteredOptions(text) {
  return text 
      ? sharedData.options.filter(item => {
        return item.toLowerCase().indexOf(text.toLowerCase()) > -1;
      })
      : sharedData.options
}
function getSuggestions(text) {
  return [
    {
      data: getFilteredOptions(text)
    }
  ]
}

export const Simplest = {
  args: {
    suggestions: getSuggestions(),
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
        action('onInput')(text)
        this.args.suggestions = getSuggestions(text)
      },
      onSelected(item) {
        action('selected')(item)
        this.args.selected = item
      }
    },
    template: `
      <VueAutosuggest v-bind="args" @update:modelValue="onInput" @selected="onSelected" />
      <div v-if="args.selected">You have selected '{{args.selected.item}}'</div>
    `
  }),
}
export const WithInlineStyles = {
  args: {},
  render: (args) => ({
    components: { VueAutosuggest },
    setup() {
      return {
        suggestions: getSuggestions(),
        inputProps: {
          id: "autosuggest__input",
          style: "border-style: dotted;"
        },
      }
    },
    template: `
      <VueAutosuggest :suggestions="suggestions" :input-props="inputProps" style="padding: 4px; border: 2px dashed rebeccapurple;" />
    `
  }),
}

export const WithSections = {
  args: {
    suggestions: [],
    inputProps: {
      id: "autosuggest__input",
      placeholder: "Type 'g'"
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
        action('onInput')(text)
        if (text === null) {
          return;
        }
        const filtered = [];
        const suggestionsData = getFilteredOptions(text)

        suggestionsData.length > 0 &&
          filtered.push(
            {
              label: "Section 1",
              data: suggestionsData
            },
            {
              label: "Section 2",
              data: suggestionsData
            }
          );
          this.args.suggestions = filtered;
      },
      onSelected(item) {
        action('selected')(item)
        this.args.selected = item
      }
    },
    template: `
      <VueAutosuggest v-bind="args" @update:modelValue="onInput" @selected="onSelected" />
      <div v-if="args.selected">You have selected '{{args.selected.item}}' from {{args.selected.label}}</div>
    `
  }),
}

export const WithInitialValue = {
  args: {
    selected: "",
    initialValue: "ro"
  },
  render: (args) => ({
    components: { VueAutosuggest },
    template: `<div>
                    <div style="padding-top:10px; margin-bottom: 10px;"><span v-if="selected">You have selected {{selected}}</span></div>
                    <div>
                        <VueAutosuggest v-model="query" :suggestions="suggestions" :inputProps="inputProps" :sectionConfigs="sectionConfigs" />
                    </div>
                </div>`,
    data() {
      return {
        selected: args.selected,
        limit: 10,
        query: args.initialValue,
        suggestions: getSuggestions(args.initialValue),
        sectionConfigs: {
          default: {
            limit: 6,
            onSelected: (item, originalInput) => {
              action('Selected')(item);
            }
          }
        },
        inputProps: {
          id: "autosuggest__input",
        }
      };
    },
    watch: {
      query(q) {
        action('v-model Watcher')(q)
        this.suggestions = getSuggestions(q)
      }
    },
    methods: {
      onSelected(item) {
        action('selected')(item)
        this.args.selected = item
      }
    }
  })
}

// TODO port remaining stories from ./stories/index.js
