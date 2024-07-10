import { mount, shallowMount, config } from "@vue/test-utils";
import { vi } from 'vitest';
import { h } from 'vue';

config.global.renderStubDefaultSlot = true

import Autosuggest from "../src/Autosuggest.vue";
import { expect } from "vitest";


//Element.prototype.scrollTo = () => {}; // https://github.com/vuejs/vue-test-utils/issues/319

// Helper to call function x number of times
const times = x => async f => {
  if (x > 0) {
    await f();
    await times(x - 1)(f);
  }
};

describe("Autosuggest", () => {
  const id = `autosuggest__input`;
  const filteredOptions = [
    {
      data: [
        "clifford kits",
        "friendly chemistry",
        "phonics",
        "life of fred",
        "life of fred math",
        "magic school bus",
        "math mammoth light blue",
        "handwriting",
        "math",
        "minecraft",
        "free worksheets",
        "4th grade",
        "snap circuits",
        "bath toys",
        "channies",
        "fred",
        "lego",
        "math life of fred",
        "multiplication",
        "thinking tree"
      ]
    }
  ];

  function getDefaultProps() {
    return {
      suggestions: JSON.parse(JSON.stringify(filteredOptions)),
      inputProps: {
        id,
        placeholder: "Type 'G'"
      },
      sectionConfigs: {
        default: {
          limit: 5,
          onSelected: () => {}
        }
      }
    }
  }

  const defaultListeners = {
    click: () => {}
  };

  it("can mount", async () => {
    const props = getDefaultProps()

    props.suggestions = [filteredOptions[0]];

    const wrapper = shallowMount(Autosuggest, {
      props: props
    });

    const input = wrapper.find('input[type="text"]')
    input.setValue('q')

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can render suggestions", async () => {
    const props = getDefaultProps()

    const wrapper = mount(Autosuggest, {
      props: props,
      attachTo: document
    });

    const input = wrapper.find("input");
    expect(input.attributes("id")).toBe(getDefaultProps().inputProps.id);

    await input.trigger("click");
    input.setValue("G");
    await input.trigger("keydown.down");

    const suggestions = wrapper.findAll('ul li')
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.length).toBeLessThanOrEqual(
      getDefaultProps().sectionConfigs.default.limit
    );

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can use escape key to exit", async () => {
    const wrapper = mount(Autosuggest, {
      props: getDefaultProps(),
      listeners: defaultListeners
    });

    const input = wrapper.find("input");
    await input.trigger("click");
    input.setValue("G");
    await input.trigger("keydown.up"); // Check it doesn't offset the selection by going up first when nothing is selected.

    // TODO: test these keys are actually returning early.
    await input.trigger("keydown", {
      keyCode: 16 // Shift
    });
    await input.trigger("keydown", {
      keyCode: 9 // Tab
    });
    await input.trigger("keydown", {
      keyCode: 18 // alt/option
    });
    await input.trigger("keydown", {
      keyCode: 91 // OS Key
    });
    await input.trigger("keydown", {
      keyCode: 93 // Right OS Key
    });

    await input.trigger("keydown.down");

    expect(wrapper.findAll(`ul li`).length).toBeGreaterThan(0)
    expect(wrapper.findAll(`ul li`).length).toBeLessThanOrEqual(
      getDefaultProps().sectionConfigs.default.limit
    );

    await input.trigger("keydown.esc");
    expect(wrapper.findAll(`ul li`).length).toEqual(0);

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can select from suggestions using keystroke", async () => {
    const wrapper = mount(Autosuggest, {
      props: getDefaultProps(),
      attachTo: document
    });

    const input = wrapper.find("input");
    await input.trigger("click");
    input.setValue("G");

    await times(5)(async () => {
      await input.trigger("keydown.down");
    });

    await times(5)(async () => {
      await input.trigger("keydown.up");
    });

    await input.trigger("keydown.enter");

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can interact with results of specific instance when multiple instances exist", async () => {
    const className = 'multi-autosuggest'
    const multipleAutosuggest = {
      components: {
        Autosuggest
      },
      data () {
        return {
          autosuggestProps: {
            ...getDefaultProps(),
            class: className,
          }
        }
      },
      render() {
        return h(
          "div",
          [
            h(
              Autosuggest,
              this.autosuggestProps,
            ),
            h(
              Autosuggest,
              this.autosuggestProps,
            )
          ]
        );
      }
    }
    const wrapper = mount(multipleAutosuggest, {
      attachTo: document
    });

    const autosuggestInstances = wrapper.findAll(`.${className}`);

    const autosuggest1 = autosuggestInstances.at(0);
    const autosuggest2 = autosuggestInstances.at(1);
    const input1 = autosuggest1.find("input");
    const input2 = autosuggest2.find("input");

    await input1.trigger("click");
    await input2.trigger("click");

    expect(autosuggest1.findAll("li.autosuggest__results-item").length).toBe(5);
    expect(autosuggest1.findAll("li.autosuggest__results-item").length).toBe(5);

    await times(2)(async () => {
      await input2.trigger("keydown.down");
    });

    expect(autosuggest1.findAll("li.autosuggest__results-item--highlighted").length).toBe(0);
    expect(autosuggest2.findAll("li.autosuggest__results-item--highlighted").length).toBe(1);
    expect(autosuggest2.findAll("li").at(1).classes()).toContain("autosuggest__results-item--highlighted");

    await input2.trigger("keydown.enter");

    expect(input1.element.value).toBe("");
    expect(input2.element.value).toBe("friendly chemistry");
  });

  it("can click outside document to trigger close", async () => {
    const props = getDefaultProps()

    const wrapper = mount(Autosuggest, {
      props: props,
      listeners: defaultListeners,
      attachTo: document
    });

    const input = wrapper.find("input");
    input.setValue("G");

    await input.trigger("click");
    input.setValue("G");
    window.document.dispatchEvent(new Event("mousedown"));
    window.document.dispatchEvent(new Event("mouseup"));

    await wrapper.vm.$nextTick(() => {});

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can display section header", async () => {
    const props = getDefaultProps()
    props.sectionConfigs = {
      default: {
        label: "Suggestions",
        limit: 5,
        onSelected: () => {}
      }
    };
    const wrapper = mount(Autosuggest, {
      props: props,
      listeners: defaultListeners,
      attachTo: document
    });

    const input = wrapper.find("input");
    input.setValue("G");

    await input.trigger("click");
    input.setValue("G");
    expect(wrapper.find("ul li:nth-child(1)").element.innerHTML).toBe(
      props.sectionConfigs.default.label
    );
    expect(wrapper.html()).toMatchSnapshot()
  });

  it("is aria complete", async () => {
    const propsData = {
      ...getDefaultProps(),
      sectionConfigs: {
        default: {
          label: "Suggestions",
          limit: 5,
          onSelected: () => {}
        }
      }
    }
    const wrapper = mount(Autosuggest, { propsData });

    const combobox = wrapper.find("[role='combobox']");
    expect(combobox.exists()).toBeTruthy();
    expect(combobox.attributes()["aria-haspopup"]).toBe("listbox");
    expect(combobox.attributes()["aria-owns"]).toBe("autosuggest-autosuggest__results");

    const input = combobox.find("input");
    expect(input.attributes()["aria-autocomplete"]).toBe("list");
    expect(input.attributes()["aria-activedescendant"]).toBe("");
    expect(input.attributes()["aria-controls"]).toBe("autosuggest-autosuggest__results");

    // aria owns needs to be an "id", #191
    let results = wrapper.find(`#${combobox.attributes()["aria-owns"]}`)
    expect(results.exists()).toBeTruthy()
    results = wrapper.find(`#${input.attributes()["aria-controls"]}`)
    expect(results.exists()).toBeTruthy()

    // TODO: Make sure aria-completeness is actually 2legit2quit.

    await input.trigger("click");
    input.setValue("G");

    expect(combobox.attributes()["aria-expanded"]).toBe("true");

    // make sure aria-labeledby references the section config label, and that it's an "id"
    const ul = wrapper.find('ul')
    expect(ul.attributes()['aria-labelledby']).toBe('autosuggest-Suggestions')
    expect(ul.find(`#${ul.attributes()['aria-labelledby']}`).exists).toBeTruthy()

    const mouseDownTimes = 3;
    await times(mouseDownTimes)(async () => {
      await input.trigger("keydown.down");
    });

    const activeDescendentString = input.attributes()["aria-activedescendant"];
    expect(parseInt(activeDescendentString[activeDescendentString.length - 1])).toBe(
      mouseDownTimes - 1
    );
    expect(input.element.value).toBe(filteredOptions[0].data[mouseDownTimes - 1]);

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can render simplest component with single onSelected", async () => {
    const props = getDefaultProps()
    props.inputProps.class = "cool-class";
    props.suggestions = filteredOptions;

    delete props.suggestions[0].name; // ensure empty component name is OK
    delete props.sectionConfigs; // ensure empty sectionConfigs is OK
    delete props.inputProps.onClick; // ensure empty onClick is OK

    props.onSelected = () => {};

    const wrapper = mount(Autosuggest, {
      props: props,
      attachTo: document
    });

    const input = wrapper.find("input");
    await input.trigger("click");
    input.setValue("G");

    await times(3)(async () => {
      await input.trigger("keydown.down");
    });

    wrapper.find("li").trigger("mouseover");
    wrapper.find("li").trigger("mouseenter");
    wrapper.find("li").trigger("mouseleave");

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can render default suggestion value by property name", async () => {
    const props = getDefaultProps()
    props.inputProps.class = "cool-class";
    props.suggestions = [
      {
        data: [
          {
            id: 1,
            name: "Frodo",
            avatar:
              "https://upload.wikimedia.org/wikipedia/en/4/4e/Elijah_Wood_as_Frodo_Baggins.png"
          }
        ]
      }
    ];

    props.onSelected = () => {};

    const wrapper = mount(Autosuggest, {
      props: props,
      attachTo: document
    });

    const input = wrapper.find("input");
    await input.trigger("click");
    input.setValue("F");

    await input.trigger("keydown.down");
    await input.trigger("keydown.enter");

    await wrapper.vm.$nextTick(() => {});

    expect(input.attributes('value')).toBe("Frodo");
    expect(input.attributes('class')).toBe("cool-class");

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("changes input attributes", () => {
    const props = getDefaultProps()
    props.inputProps = { ...props.inputProps, name: "my-input" };

    const wrapper = mount(Autosuggest, {
      props: props
    });

    const input = wrapper.find("input");
    expect(input.attributes()["name"]).toBe("my-input");
  });

  it("search input prop type handles string and integers only", async () => {
    let props = getDefaultProps()

    const mockConsole = vi.fn();
    console.error = mockConsole;

    const blurred = () => {};
    props.inputProps.onBlur = blurred;

    const wrapper = mount(Autosuggest, {
      props: props
    });

    const input = wrapper.find("input");

    // Integers
    await input.trigger("click");
    input.setValue(1);
    await wrapper.vm.$nextTick(() => {});
    await input.trigger("blur");

    // Strings
    await input.trigger("click");
    input.setValue("Hello");
    await wrapper.vm.$nextTick(() => {});
    await input.trigger("blur");

    // Should not throw any errors
    expect(mockConsole).toHaveBeenCalledTimes(0);

    // Functions
    await input.trigger("click");
    wrapper.setData({ searchInput: () => { /* BAD */ } });
    await wrapper.vm.$nextTick(() => {});
    await input.trigger("blur");

    // Should throw validation error
    expect(mockConsole).toHaveBeenCalled();
  });

  it("can render slots", async () => {
    const wrapper = mount(Autosuggest, {
      props: getDefaultProps(),
      slots: {
        'before-suggestions': '<div class="header-dude"></div>',
        'after-suggestions': '<div id="footer-dude"><span>1</span><span>2</span></div>',
        default: `
          <h1>{{ suggestion.item }}</h1>
        `
      },
      attachTo: document
    });

    const input = wrapper.find("input");
    await input.trigger("click");
    input.setValue("G");

    expect(wrapper.findAll('.header-dude').length).toEqual(1);
    expect(wrapper.findAll('#footer-dude span').length).toEqual(2);
    expect(wrapper.findAll('h1').length).toEqual(5);

    await wrapper.vm.$nextTick(() => {});

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can render section slots", async () => {
    const props = getDefaultProps()
    props.suggestions.push({ name: 'dogs', data: ['spike', 'bud', 'rover']})
    props.suggestions.push({ name: 'cats', data: ['sassy', 'tuesday', 'church']})
    props.suggestions.push({ name: 'zeu', data: ['elephant', 'lion']})
    props.suggestions.push({ name: 'Uhh', data: ['something', 'something2']})

    props.sectionConfigs = {
      default: {
        label: "Suggestions",
        limit: 5,
        onSelected: () => {}
      },
      Uhh: {
        label: "uhh"
      },
    };
    const wrapper = mount(Autosuggest, {
      props: props,
      attachTo: document,
      slots: {
        'before-section-dogs': `<li :class="className">The Dogs</li>`,
        'before-section-cats': `<li>Moar Cats is good</li>`,
        'before-section-zeu': `<li>zoo animals?</li>`
      },
    });

    const input = wrapper.find("input");
    input.setValue("G");

    await input.trigger("click");
    input.setValue("G");
    expect(wrapper.find("ul:nth-child(1) li:nth-child(1)").text()).toBe(
      props.sectionConfigs.default.label
    );
    expect(wrapper.find("ul:nth-child(2) li:nth-child(1)").text()).toBe("The Dogs");
    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can customize ids and classes for container divs", async () => {
    const wrapper = mount(Autosuggest, {
      props: {
        ...getDefaultProps(),
        class: "containerz",
        'component-attr-id-autosuggest': "automatischsuchen",
        'component-attr-class-autosuggest-results-container': 'resultz-containerz',
        'component-attr-class-autosuggest-results': 'resultz'
      },
      attachTo: document
    });

    const input = wrapper.find("input");
    await input.trigger("click");
    input.setValue("G");

    expect(wrapper.find('#automatischsuchen').exists()).toBeTruthy()
    expect(wrapper.find('.containerz').exists()).toBeTruthy()
    expect(wrapper.find('.resultz-containerz').exists()).toBeTruthy()
    expect(wrapper.find(`#${getDefaultProps().inputProps.id}`).exists()).toBeTruthy()

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can customize css prefix", async () => {
    const wrapper = mount(Autosuggest, {
      props: {
        ...getDefaultProps(),
        class: "containerz",
        'component-attr-prefix': 'v',
        'component-attr-id-autosuggest': "the-whole-thing",
        'component-attr-class-autosuggest-results-container': 'the-results-container',
        'component-attr-class-autosuggest-results': 'the-results',
        inputProps: {
          ...getDefaultProps().inputProps,
          id: 'the-input-thing',
        }
      },
      attachTo: document
    });

    const input = wrapper.find("input");
    await input.trigger("click");
    input.setValue("G");

    // Make sure the prefixes still allow for custom css/id's
    expect(wrapper.find('#the-whole-thing').exists()).toBeTruthy()
    expect(wrapper.find('#the-input-thing').exists()).toBeTruthy()
    expect(wrapper.find('.the-results-container').exists()).toBeTruthy()
    expect(wrapper.find('.the-results').exists()).toBeTruthy()

    // Prefix checks
    expect(wrapper.find('#v__results-item--0').exists()).toBeTruthy()
    expect(wrapper.find('.v__results-item').exists()).toBeTruthy()

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("@click and @selected listener events works as expected", async () => {
    let props = getDefaultProps()
    delete props['sectionConfigs']

    const mockConsole = vi.fn();

    console.warn = mockConsole;

    const wrapper = mount(Autosuggest, {
      props: props,
      attachTo: document
    });

    await wrapper.vm.$nextTick(() => {});

    const input = wrapper.find("input");
    await input.trigger("click");
    wrapper.setData({ searchInput: "F" });

    await input.trigger("keydown.down");
    await input.trigger("keydown.enter");
    await wrapper.vm.$nextTick(() => {})

    expect(input.element.value).toBe("clifford kits");

    expect(wrapper.emitted()).toHaveProperty('click')
    const clickEvents = wrapper.emitted('click')
    expect(clickEvents).toHaveLength(1)
    expect(wrapper.emitted()).toHaveProperty('selected')
    const selectedEvents = wrapper.emitted('selected')
    expect(selectedEvents).toHaveLength(1)

    expect(mockConsole).toHaveBeenCalledTimes(0);
  });

  it("tears down event listeners", async () => {
    let props = getDefaultProps()
    delete props['sectionConfigs']

    const AEL = vi.fn();
    const REL = vi.fn();

    window.document.addEventListener = AEL
    window.document.removeEventListener = REL

    const wrapper = mount(Autosuggest, {
      props: props,
      attachTo: document
    });

    wrapper.unmount()
    expect(AEL).toHaveBeenCalledTimes(2)
    expect(REL).toHaveBeenCalledTimes(2)
  });

  it("can modify input type attribute", async () => {
    const props = getDefaultProps()
    props.inputProps.type = 'search'

    props.suggestions = [filteredOptions[0]];

    const wrapper = mount(Autosuggest, {
      props: props
    });

    const input = wrapper.find('input[type="search"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes("type", 'search')).toBeTruthy();
  });

  it("can modify input props", async () => {
    const Parent = {
      template: `<div>
       <Autosuggest
        :suggestions="[{data:['Frodo']}]"
        :input-props="{id:'autosuggest', placeholder: ph}" />
      </div>
      `,
      components: { Autosuggest },
      data: () => {
        return {
          'ph': 'Type here...'
        }
      }
    }

    const wrapper = mount(Parent);
    const input = wrapper.find('input[type="text"]')
    expect(input.attributes("placeholder")).toBe('Type here...');

    wrapper.setData({ ph: 'Please type here...' })
    await wrapper.vm.$nextTick(() => {})
    expect(input.attributes("placeholder")).toBe('Please type here...')
  });

  it("can handle null data", async () => {
    const props = getDefaultProps()
    props.suggestions = [{ data: null }]

    const wrapper = mount(Autosuggest, {
      props: props
    });

    await wrapper.vm.$nextTick(() => {})

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("highlights first option on keydown when previously closed", async () => {
    const props = getDefaultProps()

    const wrapper = mount(Autosuggest, {
      props: props,
      attachTo: document
    });

    const input = wrapper.find("input");
    expect(input.attributes("id", getDefaultProps().inputProps.id)).toBeTruthy();

    await input.trigger("click");
    input.setValue("G");
    await input.trigger("keydown.down");
    await input.trigger("keydown.enter");
    await input.trigger("keydown.down");

    expect(wrapper.findAll("li.autosuggest__results-item--highlighted")).toHaveLength(1)

    const item = wrapper.find("li.autosuggest__results-item--highlighted")
    expect(item.attributes('data-suggestion-index')).toBe('0')
    expect(input.attributes('aria-activedescendant')).toBe('autosuggest__results-item--0')

    expect(wrapper.html()).toMatchSnapshot()
  });

  it("can display ul and li classNames", async () => {
    const props = getDefaultProps()
    props.sectionConfigs.default.liClass = { 'hello-li': true }
    props.sectionConfigs.default.ulClass = { 'hello-ul': true }

    const wrapper = mount(Autosuggest, {
      props: props,
      listeners: defaultListeners,
      attachTo: document
    });

    const input = wrapper.find("input");
    input.setValue("G");

    await input.trigger("click");
    input.setValue("G");

    const ul = wrapper.find("ul")
    const li = ul.find("li:nth-child(1)")

    expect(ul.classes()).toContain('hello-ul');
    expect(li.classes()).toContain('hello-li');
  });

  it("emits opened and closed events", async () => {
    const props = getDefaultProps()

    const wrapper = mount(Autosuggest, {
      props: props,
    });

    const input = wrapper.find("input");
    input.setValue("G");
    await input.trigger("keydown.down");

    await wrapper.vm.$nextTick(() => {})
    expect(wrapper.emitted().opened).toBeTruthy();

    await input.trigger("keydown.esc");
    await wrapper.vm.$nextTick(() => {})
    expect(wrapper.emitted().closed).toBeTruthy();
  });

  it("emits item-changed event", async () => {
    const props = getDefaultProps()

    const wrapper = mount(Autosuggest, {
      props: props,
    });

    const input = wrapper.find("input");
    input.setValue("G");
    await input.trigger('click')
    await input.trigger("keydown.down");
    await input.trigger("keydown.down");

    await wrapper.vm.$nextTick(() => {})
    expect(wrapper.emitted()['item-changed']).toHaveLength(2);
    const itemChanged1 = wrapper.emitted()['item-changed'][0]
    const itemChanged2 = wrapper.emitted()['item-changed'][1]

    // Emits with item and index
    expect(itemChanged1[0].item).toBe('clifford kits');
    expect(itemChanged1[1]).toBe(0);
    expect(itemChanged2[0].item).toBe('friendly chemistry');
    expect(itemChanged2[1]).toBe(1);

    await input.trigger("keydown.up");
    await wrapper.vm.$nextTick(() => {})
    await input.trigger("keydown.up");
    await wrapper.vm.$nextTick(() => {})

    // Ensure empty item-changed is emitted when user keys back
    // to the input #177
    expect(wrapper.emitted()['item-changed']).toHaveLength(4)
    const itemChangedEmpty = wrapper.emitted()['item-changed'][3]
    expect(itemChangedEmpty[0]).toBeNull();
    expect(itemChangedEmpty[1]).toBeNull();
  });

  it("current index resilient against many keyups #190", async () => {
    const props = getDefaultProps()

    const wrapper = mount(Autosuggest, {
      props: props,
    });

    const input = wrapper.find("input");
    input.setValue("G");
    await input.trigger("keydown.down");
    await wrapper.vm.$nextTick(() => {})
    expect(wrapper.vm.currentIndex).toBe(0)
    await input.trigger("keydown.up");
    expect(wrapper.vm.currentIndex).toBe(-1)

    // Go into the upside down, but make sure to come back unscathed
    await wrapper.vm.$nextTick(() => {})
    await input.trigger("keydown.up");
    await wrapper.vm.$nextTick(() => {})
    await input.trigger("keydown.up");
    await wrapper.vm.$nextTick(() => {})

    expect(wrapper.vm.currentIndex).toBe(-1)
  });
});
