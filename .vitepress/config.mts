import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs-web/',
  title: 'My Awesome Project',
  description: 'A VitePress Site',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Vue',
        items: [
          { text: 'Vue2', link: '/vue2' },
          { text: 'Vue3', link: '/vue3' },
          { text: 'Nuxt', link: '/nuxt' },
        ],
      },
      {
        text: 'React',
        items: [
          { text: 'React', link: '/react' },
          { text: 'React-router-dom', link: '/react-router-dom' },
          { text: 'next', link: '/next' },
        ],
      },
      {
        text: 'Node',
        items: [
          { text: 'Node基础', link: '/node' },
          { text: 'Express', link: '/express' },
          { text: 'Koa', link: '/koa' },
          { text: 'Mysql', link: '/mysql' },
          { text: 'Nest', link: '/nest' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/1494518217' }],
  },
});
