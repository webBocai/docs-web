// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Teek from 'vitepress-theme-teek';
import 'vitepress-theme-teek/index.css';
import 'virtual:group-icons.css';
import '../../config/assets/index.scss';
import imageViewer from 'vitepress-plugin-image-viewer';
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue'; // 可选组件
import { useRoute } from 'vitepress';

export default {
  extends: Teek,
  Layout: () => {
    return h(Teek.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  // Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  },
  setup() {
    // 获取当前路由信息
    // const route = useRoute();
    // // 使用图片预览器，并传入当前路由
    // imageViewer(route);
  },
} satisfies Theme;
