import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';
import sidebar from '../page/sidebar';
import { defineTeekConfig } from 'vitepress-theme-teek/config';
import { ListLabel } from '../config/ts';
const teekConfig = defineTeekConfig({
  teekTheme: true,
  loading: '菠菜文档加载中...',
  homeCardListPosition: 'left',
  anchorScroll: true,
  vpHome: false,
  codeBlock: {
    enabled: true, // 是否启用新版代码块
    collapseHeight: 700, // 超出高度后自动折叠，设置 true 则默认折叠，false 则默认不折叠
    overlay: false, // 代码块底部是否显示展开/折叠遮罩层
    overlayHeight: 400, // 当出现遮罩层时，指定代码块显示高度，当 overlay 为 true 时生效
    langTextTransform: 'uppercase', // 语言文本显示样式，为 text-transform 的值:none, capitalize, lowercase, uppercase
    copiedDone: (TkMessage) => TkMessage.success('复制成功！'), // 复制代码完成后的回调
  },
  markdown: {
    config(md) {
      ListLabel(md);
      md.use(groupIconMdPlugin);
    },

    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息',
    },
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true,
    },
    lineNumbers: true,
  },
});
// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: teekConfig,
  base: '/docs-web/',
  head: [['link', { rel: 'icon', href: '/docs-web/logo.svg' }]],
  title: `BoCai's Blog`,
  description: 'A VitePress Site',
  lastUpdated: true,

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
