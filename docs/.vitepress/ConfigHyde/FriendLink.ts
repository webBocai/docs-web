// FriendLink用于在首页展示一些友链
export const FriendLink = {
  enabled: true, // 是否启用友情链接卡片
  limit: 5, // 一页显示的数量
  // autoScroll: true, // 是否自动滚动
  // scrollSpeed: 2500, // 滚动间隔时间，单位：毫秒。autoScroll 为 true 时生效

  autoPage: true, // 是否自动翻页
  pageSpeed: 4000, // 翻页间隔时间，单位：毫秒。autoPage 为 true 时生效
  titleClick: (router) => router.go('/websites'), // 查看更多友链

  // 友情链接数据列表
  list: [
    {
      avatar: 'https://avatars.githubusercontent.com/u/47916225?v=4',
      name: '奈德丽的丛林',
      desc: '在丛林中狩猎技术，用代码征服每一个挑战。这里是奈德丽的技术领地，记录着每一次狩猎的收获与成长。',
      link: 'https://bitbitdown.github.io/',
    },
    {
      avatar: 'https://avatars.githubusercontent.com/u/101857530?v=4',
      name: 'vue3-request',
      desc: '小而美的Vue3异步处理解决方案',
      link: 'https://flame-00.github.io/vue3-request/',
    },
    {
      avatar: 'https://avatars.githubusercontent.com/u/74409739?v=4',
      name: 'aklry',
      desc: '代码存档，思路开源',
      link: 'https://docs.aklry.com/',
    },
    {
      avatar: 'https://avatars.githubusercontent.com/u/74751605?v=4',
      name: '秘密の花园',
      desc: '好记性不如烂笔头',
      link: 'https://coder-sunshine.github.io/notes/',
    },
    {
      avatar: 'https://avatars.githubusercontent.com/u/97007455?v=4',
      name: '弟弟森的编程小笔记',
      desc: '个人笔记存放处',
      link: 'https://zhaojisen.github.io/short-note/',
    },
  ],
  // autoScroll: true,
};
