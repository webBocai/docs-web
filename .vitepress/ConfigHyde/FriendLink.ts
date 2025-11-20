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
    // {
    //   avatar: "/teek-logo-large.png",
    //   name: "vitepress-theme-teek",
    //   desc: "Teek官网",
    //   link: "https://vp.teek.top/",
    // },
    // {
    //   name: "Teeker",
    //   desc: "朝圣的使徒，正在走向编程的至高殿堂！",
    //   link: "http://notes.teek.top/",
    //   avatar: "https://testingcf.jsdelivr.net/gh/Kele-Bingtang/static/user/avatar2.png",
    // },
    // {
    //   avatar: "https://img.onedayxyy.cn/images/Teek/Teekwebsite/hyde.webp",
    //   name: "Hyde Blog",
    //   desc: "人心中的成见是一座大山",
    //   link: "https://teek.seasir.top/",
    // },
    // {
    //   avatar: "https://wiki.eryajf.net/img/logo.png",
    //   name: "二丫讲梵",
    //   desc: "💻学习📝记录🔗分享",
    //   link: "https://wiki.eryajf.net/",
    // },
    // {
    //   avatar: "https://img.onedayxyy.cn/images/Teek/Teekwebsite/sugarat.top-logo.jpeg",
    //   name: "粥里有勺糖",
    //   desc: "你的指尖,拥有改变世界的力量",
    //   link: "https://sugarat.top/",
    // },
    // {
    //   avatar: "https://img.onedayxyy.cn/images/POETIZE-logo.jpg",
    //   name: "POETIZE",
    //   desc: "最美博客",
    //   link: "https://poetize.cn/",
    // },
    // {
    //   avatar: "https://img.onedayxyy.cn/images/image-20250220073534772.png",
    //   name: "宇阳",
    //   desc: "记录所学知识，缩短和大神的差距！",
    //   link: "https://liuyuyang.net",
    // },
    // {
    //   avatar: "https://img.onedayxyy.cn/images/Teek/Teekwebsite/blog.grtsinry43.com.jpeg",
    //   name: "Grtsinry43’s Blog",
    //   desc: "总之岁月漫长，然而值得等待 ",
    //   link: "https://blog.grtsinry43.com/",
    // },
    // {
    //   avatar: "https://img.onedayxyy.cn/images/Teek/Teekwebsite/blog.zhheo.com.png",
    //   name: "张洪Heo",
    //   desc: "分享设计与科技生活",
    //   link: "https://blog.zhheo.com/",
    // },
    // {
    //   name: "王嘉祥",
    //   desc: "唱响科普和人生兴事，分享科技与美好生活（rust写的zola主题，移植于张洪heo）",
    //   link: "https://blog.jiaxiang.wang/",
    //   avatar: "https://img.onedayxyy.cn/images/Teek/Teekwebsite/blog.jiaxiang.wang.webp",
    // },
  ],
  // autoScroll: true,
};
