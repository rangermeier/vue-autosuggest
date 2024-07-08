export default {
  framework: '@storybook/vue3-vite',
  options: {
    docgen: 'vue-component-meta',
  },
  addons: ['@storybook/addon-actions'],
  stories: ['../src/**/*.stories.@(js|mdx)'],
}
