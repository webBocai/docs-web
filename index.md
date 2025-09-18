---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "前端笔记"
  text: "文档有最前沿的技术栈"
  tagline: 持续学习持续进步
  image:
    src: /background.svg
    alt: 背景图
  actions:
    - theme: brand
      text: 框架学习
      link: /page/react/basic/introduce
    - theme: alt
      text: 基础学习
      link: /

features:
  - title: HTML+CSS+JS 前端三剑客
    details: HTML5 CSS3 JS基础 ES6+ Typescript
  - title: Vue全家桶
    details: vue源码 vue全家桶 Nuxt全家桶
  - title: React全家桶
    details: React源码 React全家桶 Next全家桶
  - title: Node全家桶
    details: Node技术栈 Express Koa Mysql Nest Redis 

tk:
  banner:
    enabled: true,
    name: BoCai's Blog
    bgStyle: "fullImg"
    pureBgColor: "#28282d"
    imgSrc:
      - /img/bg.jpeg
      - /img/bg2.jpeg
    imgInterval: 15000
    imgShuffle: false
    mask: true
    maskBg: "rgba(0, 0, 0, 0.4)"
    textColor: "#fff"
    titleFontSize: "3.2rem"
    descFontSize: "1.4rem"
    descStyle: "types"
    switchTime: 4000
    switchShuffle: false
    typesInTime: 200
    typesOutTime: 100
    typesNextTime: 800
    typesShuffle: false
  description:
    - 积跬步以至千里，致敬每个爱学习的你 —— 来自 BoCai
    - 不用与谁比较，你就是这个世界独一无二的存在 —— 来自 BoCai
  post:
    postStyle: card
    excerptPosition: bottom
    showMore: true
    moreLabel: "阅读全文 >"
    coverImgMode: full
    emptyLabel: 暂无文章
    showCapture: true
    splitSeparator: false
    transition: true
    transitionName: tk-slide-fade
    listStyleTitleTagPosition: right
    cardStyleTitleTagPosition: left
    defaultCoverImg:
      - /img/bg3.webp

   
---

