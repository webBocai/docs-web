<template>
  <div id="twikoo"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vitepress';

const route = useRoute();

const initTwikoo = async () => {
  // 判断是否在浏览器环境中
  if (typeof window !== 'undefined') {
    const twikoo = await import('twikoo');
    twikoo.init({
      envId: 'https://twlkoojs.vercel.app/', // 换成你自己配置的域名
      el: '#twikoo',
    });
  }
};

const modifyCommentButton = () => {
  nextTick(() => {
    // 精确选择评论按钮
    const commentBtn = Array.from(document.querySelectorAll('.tk-right-bottom-button__button')).find(
      (btn) => btn.getAttribute('title') === '前往评论'
    );

    if (commentBtn && !commentBtn.getAttribute('data-custom-bound')) {
      commentBtn.setAttribute('data-custom-bound', 'true');
      // 添加自定义类名，避免影响主题其他样式
      commentBtn.classList.add('twikoo-nextTick');

      commentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const twikooSection = document.getElementById('twikoo');
        if (twikooSection) {
          twikooSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    }
  });
};

// 监听路由刷新评论
watch(route, () => {
  initTwikoo();
  modifyCommentButton();
});

onMounted(() => {
  initTwikoo();
  modifyCommentButton();
});
</script>

<style>
/* 桌面端样式 */
.twikoo-nextTick {
  width: 45px !important;
  height: 45px !important;
  background-color: var(--vp-c-brand-1) !important; /* 默认背景色 */
  transition: background-color 0.3s ease !important; /* 加个过渡 */
}
/* 鼠标hover效果 */
.twikoo-nextTick:hover {
  background-color: rgb(197, 126, 255) !important; /* 鼠标hover颜色 */
}

/* 图标样式 */
.twikoo-nextTick .tk-icon {
  color: rgb(255, 255, 255) !important;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .twikoo-nextTick {
    width: 37px !important;
    height: 37px !important;
    background-color: var(--vp-c-brand-1) !important; /* 默认背景色 */
    transition: background-color 0.3s ease !important; /* 加个过渡 */
  }
  .twikoo-nextTick:hover {
    background-color: rgb(197, 126, 255) !important; /* 鼠标hover颜色，多余了？ */
  }
}
</style>
