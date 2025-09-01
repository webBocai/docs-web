import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';
import sidebar from '../page/sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs-web/',
  head: [['link', { rel: 'icon', href: '/docs-web/logo.svg' }]],
  title: '菠菜博客',
  description: 'A VitePress Site',
  lastUpdated: true,
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
  },
  themeConfig: {
    lastUpdated: {
      text: '最近更新时间',
    },
    logo: '/logo.svg',
    outlineTitle: '文章目录',
    outline: [2, 6],
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      {
        text: '前端基础',
        items: [
          { text: 'HTML基础', link: '/html' },
          { text: 'CSS基础', link: '/css' },
          { text: 'JS基础', link: '/js' },
          { text: 'ES6+', link: '/js' },
          { text: 'TypeScript', link: '/js' },
        ],
      },
      {
        text: '前端工程化',
        items: [
          { text: 'webpack', link: '/page/webpack/basic/01-webpack基本介绍.md' },
          { text: 'gulp', link: '/gulp' },
          { text: 'roullp', link: '/roullp' },
          { text: 'vite', link: '/vite' },
        ],
      },
      {
        text: 'React',
        items: [
          { text: 'React', link: '/page/react/basic/introduce.md' },
          { text: 'Router', link: '/react-router-dom' },
          { text: 'Next', link: '/next' },
        ],
      },
      {
        text: 'Vue',
        items: [
          { text: 'Vue2', link: '/vue2' },
          { text: 'Vue3', link: '/vue3' },
          { text: 'Nuxt', link: '/nuxt' },
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
    sidebar,
    socialLinks: [{ icon: 'github', link: 'https://github.com/webBocai' }],
    // 设置搜索框的样式
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
            },
          },
        },
      },
    },
  },
});
