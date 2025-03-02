import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';
// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs-web/',
  title: 'My Awesome Project',
  description: 'A VitePress Site',
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
  },
  themeConfig: {
    outlineTitle: '文章目录',
    outline: [2, 6],
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
          { text: 'React', link: '/page/react/index' },
          { text: 'React-router', link: '/react-router-dom' },
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
        text: '入门',
        items: [
          { text: 'React基本介绍', link: '/page/react/basic/introduce' },
          {
            text: 'React开发环境搭建',
            items: [
              { text: '用create-react-app搭建', link: '/page/react/basic/create-react-app' },
              { text: '用vite搭建React', link: '/page/react/basic/vite' },
              { text: '配置React开发环境', link: '/page/react/basic/react-config.md' },
            ],
          },
          { text: 'tsx语法入门', link: '/page/react/basic/tsx.md' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/1494518217' }],
  },
});
