import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  framework: '@storybook/vue3-vite',
  addons: ['@storybook/addon-actions'],
  stories: ['../src/**/*.stories.@(js|mdx)'],
}

export default config;
