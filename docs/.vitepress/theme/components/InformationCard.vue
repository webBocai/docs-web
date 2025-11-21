<script setup lang="ts">
import { onMounted, ref,h } from 'vue';
import { TkMessage } from "vitepress-theme-teek";

// 天气数据
const weatherData = ref({
  city: '',
  temperature: '',
  type: '',
  date: '',
  week: ''
});

// 获取天气信息的函数
const error = ref(false);
const loading = ref(false); // 控制加载中状态
// 获取天气信息的函数
const getWeatherInfo = async () => {
  loading.value = true; // 开始加载
  try {
    const response = await fetch('https://api.vvhan.com/api/weather');
    const data = await response.json();
    if (data.success) {
      weatherData.value = {
        city: data.city,
        temperature: `${data.data.low}-${data.data.high}`,
        type: data.data.type,
        date: data.data.date,
        week: data.data.week
      };
    } else {
      error.value = true;
      TkMessage.error('获取天气信息失败，请检查网络或者关闭代理'); // 显示错误提示
    }
  } catch (err) {
    console.error('获取天气信息失败', err);
  } finally {
    loading.value = false; // 加载结束
  }
};

// 储存舔狗日记内容
const diaryContent = ref('');

// 获取舔狗日记的函数
const getDiary = async () => {
  try {
    const response = await fetch('https://api.vvhan.com/api/text/dog?type=json');
    const data = await response.json();

    if (data.success) {
      diaryContent.value = data.data.content; // 获取内容
    } else {
      console.error('获取舔狗日记失败:', data.message);
    }
  } catch (fetchError) {
    console.error('获取舔狗日记失败', fetchError);
  }
};

const init = async () => {
  await getWeatherInfo(); // 获取天气信息
  await getDiary(); // 获取舔狗信息
};

// 新增：控制显示选项
const isConfigOpen = ref(false);
const showFPS = ref(true);
const showWeather = ref(true);
const showDate = ref(true);
const showTemperature = ref(true);
const showWeek = ref(true);
// const showgetDiary = ref(true);

// 新增：FPS计算
const fps = ref(0);
let frameCount = 0;
let lastTime = 0;

const updateFPS = (time: DOMHighResTimeStamp) => {
  if (lastTime === 0) {
    lastTime = time;
    requestAnimationFrame(updateFPS);
    return;
  }

  const delta = time - lastTime;
  frameCount += 1;

  if (delta > 1000) {
    fps.value = Math.round((frameCount * 1000) / delta);
    frameCount = 0;
    lastTime = time;
  }

  requestAnimationFrame(updateFPS);
};

onMounted(async () => {
  await init();
  requestAnimationFrame(updateFPS);
});

onMounted(() => {
  getWeatherInfo();
});
</script>

<template>
  <!-- 修改：欢迎卡片，包含天气信息和新功能 -->
  <ElCard class="info-card animate__animated animate__fadeIn welcome-card mobile-card" shadow="hover">
    <div class="welcome-content">
      <!-- 新增：FPS显示 -->
      <div v-if="showFPS" class="fps-display">FPS: {{ fps }}</div>

      <!-- 新增：配置开关 -->
      <El-Switch v-model="isConfigOpen" class="config-switch" active-color="#13ce66" inactive-color="#ff4949"></El-Switch>

      <!-- 配置面板 -->
      <div v-if="isConfigOpen" class="config-panel">
        <ElCheckbox v-model="showFPS">显示 FPS</ElCheckbox>
        <ElCheckbox v-model="showWeather">显示天气</ElCheckbox>
        <ElCheckbox v-model="showDate">显示日期</ElCheckbox>
        <ElCheckbox v-model="showTemperature">显示温度</ElCheckbox>
        <ElCheckbox v-model="showWeek">显示星期</ElCheckbox>
        <!-- <ElCheckbox v-model="showgetDiary">显示舔狗</ElCheckbox> -->
      </div>

      <!-- 欢迎信息 -->
      <template v-else>
        <h2 v-if="!error && weatherData.city" class="greeting">
          欢迎来自
          <span class="highlight">{{ weatherData.city }}</span>
          的小伙伴！🎉🎉🎉
        </h2>
        <div class="info-container">
          <div v-if="showTemperature" class="info-item">
            <i class="el-icon-sunny"></i>
            <span v-if="!error && weatherData.city">
              今日温度：
              <span class="highlight">{{ weatherData.temperature }}</span>
            </span>
          </div>
          <div v-if="showWeather" class="info-item">
            <i class="el-icon-cloudy"></i>
            <span v-if="!error && weatherData.city">
              天气：
              <span class="highlight">{{ weatherData.type }}</span>
            </span>
          </div>
          <div v-if="showDate" class="info-item">
            <i class="el-icon-date"></i>
            <span v-if="!error && weatherData.city">
              日期：
              <span class="highlight">{{ weatherData.date }}</span>
            </span>
          </div>
          <div v-if="showWeek" class="info-item">
            <i class="el-icon-calendar"></i>
            <span v-if="!error && weatherData.city">
              星期：
              <span class="highlight">{{ weatherData.week }}</span>
            </span>
          </div>
          <!-- <div v-if="showgetDiary" class="info-item">
            <i class="el-icon-calendar"></i>
            <h1 class="vertical-title">舔狗日记：</h1>
            <p v-if="diaryContent" class="diary-content">{{ diaryContent }}</p>
            <p v-else class="diary-content">加载中...</p>
          </div> -->
        </div>
      </template>
    </div>
  </ElCard>
</template>

<style lang="scss" scoped>
.welcome-card {
  margin: 4px;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background: var(--day-bg);
  color: var(--day-text);
  box-shadow: 0 4px 6px var(--day-shadow);
  transform: translateY(0);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0); /* 完全透明的边框 */

  &.night-mode {
    background: var(--night-bg);
    color: var(--night-text);
    box-shadow: 0 4px 6px var(--night-shadow);

    &:hover {
      box-shadow: 0 10px 20px var(--night-shadow);
    }

    .highlight {
      color: var(--vp-c-brand-1);
    }
  }

  .welcome-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .greeting {
    font-size: 1.5rem;
    margin: 0;
    font-weight: bold;
  }

  .highlight {
    color: var(--vp-c-brand-1);
  }

  .info-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      font-size: 1.2rem;
    }
  }

  .fps-display {
    font-size: 0.9rem;
    font-weight: bold;
  }

  .config-switch {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }

  .config-panel {
    display: flex;
    flex-wrap: wrap; /* 自动换行 */
    justify-content: center; /* 水平居中对齐 */
    align-items: center; /* 垂直居中对齐 */
  }

  .config-panel .el-checkbox {
    width: 15%; /* 每个元素占据 15% 宽度，PC保持1列 */
    margin: 5px; /* 元素间距 */
    display: flex;
    justify-content: center; /* 文字与复选框居中 */
    align-items: center;
  }

  @media (max-width: 768px) {
    .config-panel .el-checkbox {
      width: 40%; /* 如果屏幕更小，双列显示 */
    }
  }
}
</style>
