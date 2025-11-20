<script setup lang="ts" name="NoticeContent">
const namespace = 'notice';
</script>

<template>
  <div :class="namespace">
    <p>微信 👇</p>
    <!-- <img src=""
      alt="QR Code" /> -->
    <p class="">Teek~一款简约、唯美、丝滑且强大的VitePress主题博客(知识库&博客二合一) ，欢迎交流学习！🎉</p>
  </div>
</template>

<style lang="scss" scoped>
.notice {
  img {
    width: 100%;
    height: 120px;
    object-fit: contain;
  }

  p {
    text-align: center;
    font-size: 14px;
    padding: 10px 0;
  }
}
</style>
