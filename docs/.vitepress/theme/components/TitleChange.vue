<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue';
import { useEventListener } from 'vitepress-theme-teek';

const props = defineProps({
  hiddenTitle: {
    type: String,
    default: '记得等会回来的!!',
  },
  returnTitle: {
    type: String,
    default: '♪(^∇^*)欢迎回来！',
  },
});

const originTitle = ref('');
const titleTimer = ref<ReturnType<typeof setTimeout>>();
const stopListener = ref<() => void>();

onMounted(() => {
  originTitle.value = document.title;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      document.title = props.hiddenTitle;
      clearTimeout(titleTimer.value);
    } else {
      document.title = props.returnTitle;
      titleTimer.value = setTimeout(() => {
        document.title = originTitle.value;
      }, 2000);
    }
  };

  stopListener.value = useEventListener(document, 'visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
  stopListener.value?.();
  clearTimeout(titleTimer.value);
});
</script>
