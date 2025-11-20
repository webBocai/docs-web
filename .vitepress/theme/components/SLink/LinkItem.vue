<template>
  <div class="link-item-card" ref="cardRef">
    <!-- 标签 -->
    <div class="link-tag" v-if="data.tag">{{ data.tag }}</div>

    <a :href="data.link" :title="data.name" target="_blank" rel="noopener">
      <!-- 头像 -->
      <div class="link-avatar">
        <img
          v-if="!imageFailed && data.avatar"
          :src="data.avatar"
          :alt="data.name"
          @error="handleImageError"
          :class="{ irregular: data.irregular }"
        />
        <span v-else class="avatar-placeholder">
          {{ data.name ? data.name.charAt(0).toUpperCase() : '?' }}
        </span>
      </div>

      <!-- 信息 -->
      <div class="link-content">
        <div class="link-name">{{ data.name }}</div>
        <div class="link-desc" :title="data.descr">
          {{ data.descr }}
        </div>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

interface LinkData {
  name: string;
  link: string;
  tag?: string;
  avatar?: string;
  descr?: string;
  irregular?: boolean;
}

defineProps<{
  data: LinkData;
}>();

const imageFailed = ref(false);
const handleImageError = () => (imageFailed.value = true);

const cardRef = ref<HTMLElement | null>(null);
let rafId: number;
const lights: any[] = [];
const lightCount = 1; // 只用一个光圈覆盖整个卡片

const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

// 预设的光圈颜色配置表
// 格式：rgba(红, 绿, 蓝, 透明度)
// 透明度 0.8 表示半透明效果
const presetColors = [
  "rgba(255, 99, 132, 0.8)", // 红色调
  "rgba(54, 162, 235, 0.8)", // 蓝色调
  "rgba(255, 159, 64, 0.8)", // 橙色调
  "rgba(75, 192, 192, 0.8)", // 青色调
  "rgba(153, 102, 255, 0.8)", // 紫色调
  "rgba(255, 159, 64, 0.8)", // 橙色调
  "rgba(255, 99, 132, 0.8)", // 红色调
  "rgba(0, 255, 255, 0.8)", // 青绿色
];

const getRandomColor = () => presetColors[Math.floor(Math.random() * presetColors.length)];

const getGradientColor = (lightColor: string) => {
  const [r, g, b] = lightColor.match(/\d+/g)!.map(Number);
  return `rgba(${r}, ${g}, ${b}, 0.6)`; // 让光圈中心更亮
};

onMounted(() => {
  if (!cardRef.value) return;
  const card = cardRef.value;
  const lightColor = getRandomColor();

  const handleMouseEnter = () => {
    for (let i = 0; i < lightCount; i++) {
      const lightEl = document.createElement("div");
      lightEl.classList.add("light");
      lightEl.style.position = "absolute";
      lightEl.style.borderRadius = "50%";
      lightEl.style.pointerEvents = "none";
      lightEl.style.background = `rgba(255,255,255,0)`;
      card.appendChild(lightEl);

      lights.push({
        el: lightEl,
        x: card.offsetWidth / 2,
        y: card.offsetHeight / 2,
        size: Math.max(card.offsetWidth, card.offsetHeight) * 1.8,
        opacity: 0,
        targetX: card.offsetWidth / 2,
        targetY: card.offsetHeight / 2,
        speed: 0.08,
        lightColor,
      });
    }
  };

  const handleMouseLeave = () => {
    lights.forEach(light => {
      light.el.style.opacity = "0";
      setTimeout(() => light.el.remove(), 300);
    });
    lights.length = 0;
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lights.forEach(light => {
      light.targetX = x;
      light.targetY = y;

      light.x = lerp(light.x, light.targetX, light.speed);
      light.y = lerp(light.y, light.targetY, light.speed);

      const maxDim = Math.max(card.offsetWidth, card.offsetHeight);
      const targetSize = maxDim * 1.8;
      light.size = lerp(light.size, targetSize, 0.1);

      light.opacity = lerp(light.opacity, 0.6, 0.1);

      const gradientColor = getGradientColor(light.lightColor);
      light.el.style.background = `radial-gradient(circle at ${light.x}px ${light.y}px, ${gradientColor} 0%, rgba(255,255,255,0) 100%)`;

      light.el.style.width = `${light.size}px`;
      light.el.style.height = `${light.size}px`;
      light.el.style.left = `${light.x - light.size / 2}px`;
      light.el.style.top = `${light.y - light.size / 2}px`;
      light.el.style.opacity = light.opacity.toString();
    });
  };

  card.addEventListener("mouseenter", handleMouseEnter);
  card.addEventListener("mouseleave", handleMouseLeave);
  card.addEventListener("mousemove", handleMouseMove);

  const animate = () => (rafId = requestAnimationFrame(animate));
  animate();

  onBeforeUnmount(() => cancelAnimationFrame(rafId));
});
</script>

<style scoped>
.link-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 8px;
  background-color: var(--vp-badge-tip-bg);
  color: var(--vp-badge-tip-text);
  letter-spacing: 0.2px;
}

.link-item-card {
  position: relative;
  height: 100px;
  border-radius: 12px;
  background: var(--vp-c-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;
  overflow: hidden;
  z-index: 0; /* 作为光圈定位参考 */
}

.link-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.link-item-card a {
  display: flex;
  align-items: center;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.link-avatar {
  flex: 0 0 100px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1; /* 在光圈之上 */
}

.link-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.link-avatar img.irregular {
  border-radius: 8px;
  object-fit: contain;
}

.link-avatar .avatar-placeholder {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #555;
  font-size: 1.2rem;
}

.link-item-card:hover .link-avatar img,
.link-item-card:hover .avatar-placeholder {
  transform: scale(1.2);
}

.link-content {
  flex: 1;
  padding: 0 16px 0 0px;
  position: relative;
  z-index: 1;
}

.link-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.link-desc {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

/* 光圈样式 */
.light {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  transition:
    width 0.1s,
    height 0.1s,
    opacity 0.1s;
}

.banner-button.primary[data-v-7a7fc354] {
    background: #0975e3;
    color: var(--vp-button-brand-text);
}
</style>
