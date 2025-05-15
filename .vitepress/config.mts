import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';
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
      {
        text: 'hooks',
        items: [
          {
            text: '数据驱动',
            items: [
              { text: 'useState', link: '/page/react/hooks/useState.md' },
              { text: 'useReducer', link: '/page/react/hooks/useReducer.md' },
              { text: 'useSyncExternalStore', link: '/page/react/hooks/useSyncExternalStore.md' },
              { text: 'useTransition', link: '/page/react/hooks/useTransition.md' },
              { text: 'useDeferredValue', link: '/page/react/hooks/useDeferredValue.md' },
            ],
          },
          {
            text: '副作用',
            items: [
              { text: 'useEffect', link: '/page/react/hooks/useEffect.md' },
              { text: 'useLayoutEffect', link: '/page/react/hooks/useLayoutEffect.md' },
            ],
          },
          {
            text: '状态传递',
            items: [
              { text: 'useRef', link: '/page/react/hooks/useRef.md' },
              { text: 'useImperativeHandle', link: '/page/react/hooks/useImperativeHandle.md' },
              { text: 'useContext', link: '/page/react/hooks/useContext.md' },
            ],
          },
          {
            text: '状态派生',
            items: [
              { text: 'useMemo', link: '/page/react/hooks/useMemo.md' },
              { text: 'useCallback', link: '/page/react/hooks/useCallback.md' },
            ],
          },
          {
            text: '工具Hooks',
            items: [
              { text: 'useDebugValue', link: '/page/react/hooks/useDebugValue.md' },
              { text: 'useId', link: '/page/react/hooks/useId.md' },
            ],
          },
          {
            text: '其他',
            items: [{ text: '自定义hooks', link: '/page/react/hooks/customHooks.md' }],
          },
        ],
      },
    ],
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
