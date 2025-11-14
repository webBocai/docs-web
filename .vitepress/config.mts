import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';
import sidebar from '../page/sidebar';
import { defineTeekConfig } from 'vitepress-theme-teek/config';

import { ItemList, ListLabel } from '../config/ts';
const teekConfig = defineTeekConfig({
  teekTheme: true,
  sidebarTrigger: true,
  loading: '菠菜文档加载中...',
  homeCardListPosition: 'left',
  anchorScroll: true,
  vpHome: false,
  homeCardSort: ['topArticle', 'category', 'tag', 'friendLink', 'docAnalysis'],
  codeBlock: {
    enabled: true, // 是否启用新版代码块
    collapseHeight: 700, // 超出高度后自动折叠，设置 true 则默认折叠，false 则默认不折叠
    overlay: false, // 代码块底部是否显示展开/折叠遮罩层
    overlayHeight: 400, // 当出现遮罩层时，指定代码块显示高度，当 overlay 为 true 时生效
    langTextTransform: 'uppercase', // 语言文本显示样式，为 text-transform 的值:none, capitalize, lowercase, uppercase
    copiedDone: (TkMessage) => TkMessage.success('复制成功！'), // 复制代码完成后的回调
  },
  markdown: {
    lineNumbers: true,
    config(md) {
      ListLabel(md);
      ItemList(md);

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
  },
  // 博主信息，显示在首页左边第一个卡片。
  blogger: {
    name: '菠菜', // 博主昵称
    slogan: '努力就是你进步的方向！', // 博主签名
    avatar: '/img/tx.jpeg', // 博主头像
    shape: 'circle-rotate', // 头像风格：square 为方形头像，circle 为圆形头像，circle-rotate 可支持鼠标悬停旋转，circle-rotate-last 将会持续旋转 59s
    circleBgImg: '/img/blog.jpeg', // 背景图片
    circleBgMask: true, // 遮罩层是否显示，仅当 shape 为 circle 且 circleBgImg 配置时有效
    circleSize: 100, // 头像大小
    color: '#ffffff', // 字体颜色
    // 状态，仅当 shape 为 circle 相关值时有效
    status: {
      icon: '🥬', // 状态图标
      size: 20, // 图标大小
      title: '你好', // 鼠标悬停图标的提示语
    },
  },
  docAnalysis: {
    enabled: true, // 是否启用站点信息卡片
    createTime: '2025-04-26', // 站点创建时间
    wordCount: true, // 是否开启文章页的字数统计
    readingTime: true, // 是否开启文章页的阅读时长统计
    // 访问量、访客数统计配置
    statistics: {
      provider: 'busuanzi', // 网站流量统计提供商
      siteView: false, // 是否开启首页的访问量和排名统计
      pageView: false, // 是否开启文章页的浏览量统计
      tryRequest: false, // 如果请求网站流量统计接口失败，是否重试
      tryCount: 5, // 重试次数，仅当 tryRequest 为 true 时有效
      tryIterationTime: 2000, // 重试间隔时间，单位：毫秒，仅当 tryRequest 为 true 时有效
      permalink: true, // 是否只统计永久链接的浏览量，如果为 false，则统计 VitePress 默认的文档目录链接
    },
    // 自定义现有信息
    overrideInfo: [
      {
        key: 'lastActiveTime',
        label: '活跃时间',
        value: (_, currentValue) => (currentValue + '').replace('前', ''),
        show: true,
      },
    ],
    // 自定义额外信息
    // appendInfo: [{ key: 'index', label: '序号', value: '天客 99' }],
  },
  articleAnalyze: {
    showIcon: true, // 作者、日期、分类、标签、字数、阅读时长、浏览量等文章信息的图标是否显示
    dateFormat: 'yyyy-MM-dd', // 文章日期格式，首页和文章页解析日期时使用
    showInfo: true, // 是否展示作者、日期、分类、标签、字数、阅读时长、浏览量等文章信息，分别作用于首页和文章页
    showAuthor: true, // 是否展示作者
    showCreateDate: true, // 是否展示创建日期
    showUpdateDate: false, // 是否展示更新日期，仅在文章页显示
    showCategory: true, // 是否展示分类
    showTag: false, // 是否展示标签
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
  markdown: {
    lineNumbers: true,
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
          { text: 'webpack', link: '/page/webpack/基础/01-webpack基本介绍.md' },
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
