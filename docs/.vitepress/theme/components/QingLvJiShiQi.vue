<template>
  <div class="page-wrapper">
    <!-- 背景装饰元素 - 全屏覆盖 -->
    <div class="bg-decoration">
      <div class="heart-decoration" style="top: 10%; left: 5%; animation-delay: 0s;"></div>
      <div class="heart-decoration" style="top: 20%; right: 10%; animation-delay: 1s;"></div>
      <div class="heart-decoration" style="bottom: 30%; left: 15%; animation-delay: 2s;"></div>
      <div class="heart-decoration" style="bottom: 20%; right: 5%; animation-delay: 3s;"></div>
      <div class="heart-decoration" style="top: 40%; right: 20%; animation-delay: 1.5s;"></div>
    </div>

    <!-- 内容容器 - 居中且有最大宽度 -->
    <div class="content-container">
      <!-- 标题区域 -->
      <header class="header">
        <h1 class="main-title">我们的爱情计时器</h1>
        <p class="subtitle">记录从相遇的那一刻起，每一段珍贵的时光</p>
        <div class="divider">
          <div class="divider-dot"></div>
        </div>
      </header>

      <!-- 情侣头像区域 -->
      <div class="avatar-container">
        <!-- 左侧头像 -->
        <div class="avatar-wrapper left-avatar">
          <img src="https://img.onedayxyy.cn/images/hg.jpg" alt="情侣头像1" class="avatar-image">
          <div class="gender-indicator male">
            <span class="icon">♂</span>
          </div>
          <div class="nickname">hg</div>
        </div>
        
        <!-- 中间跳动的爱心 -->
        <div class="heart-connector">
          <div class="heart-pulse"></div>
          <div class="heart-icon">❤</div>
        </div>
        
        <!-- 右侧头像 -->
        <div class="avatar-wrapper right-avatar">
          <img src="https://img.onedayxyy.cn/images/fxj.jpg" alt="情侣头像2" class="avatar-image">
          <div class="gender-indicator female">
            <span class="icon">♀</span>
          </div>
          <div class="nickname">fxj</div>
        </div>
      </div>

      <!-- 相识日期展示 -->
      <div class="meet-date">
        我们相识于：<span class="highlight">2025年5月29日 17:00</span>
      </div>

      <!-- 计时器主区域 -->
      <div class="timer-grid">
        <!-- 年 -->
        <div class="timer-card">
          <div :class="{'number-change': isChanged.years}" class="time-value">{{ years }}</div>
          <div class="time-label">年</div>
        </div>
        
        <!-- 月 -->
        <div class="timer-card">
          <div :class="{'number-change': isChanged.months}" class="time-value">{{ months }}</div>
          <div class="time-label">月</div>
        </div>
        
        <!-- 日 -->
        <div class="timer-card">
          <div :class="{'number-change': isChanged.days}" class="time-value">{{ days }}</div>
          <div class="time-label">日</div>
        </div>
        
        <!-- 时 -->
        <div class="timer-card">
          <div :class="{'number-change': isChanged.hours}" class="time-value">{{ hours }}</div>
          <div class="time-label">时</div>
        </div>
        
        <!-- 分 -->
        <div class="timer-card">
          <div :class="{'number-change': isChanged.minutes}" class="time-value">{{ minutes }}</div>
          <div class="time-label">分</div>
        </div>
        
        <!-- 秒 -->
        <div class="timer-card">
          <div :class="{'number-change': isChanged.seconds}" class="time-value">{{ seconds }}</div>
          <div class="time-label">秒</div>
        </div>
      </div>

      <!-- 爱情寄语 -->
      <div class="love-message">
        <p>"时光荏苒，爱意渐浓<br>你愿意，我值得<br>每一秒都是我们爱情的见证"</p>
        <div class="message-heart">❤</div>
      </div>

      <!-- 页脚 -->
      <footer class="footer">
        愿我们的故事，永远继续下去...
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 时间数据
const years = ref(0);
const months = ref(0);
const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

// 用于检测数值变化的状态
const isChanged = ref({
  years: false,
  months: false,
  days: false,
  hours: false,
  minutes: false,
  seconds: false
});

// 存储上一次的值
let previousValues = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
};

// 相识日期：2025年5月29日17:00
const meetDate = new Date(2025, 4, 29, 17, 0, 0);
let timer = null;

// 计算时间差
function calculateTimeDifference() {
  const now = new Date();
  const diff = now - meetDate;

  // 计算总秒数
  const totalSeconds = Math.floor(diff / 1000);
  
  // 计算秒
  const seconds = totalSeconds % 60;
  
  // 计算总分钟数
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  
  // 计算总小时数
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  
  // 计算总天数
  const totalDays = Math.floor(totalHours / 24);
  
  // 计算年、月、日
  let years = 0;
  let months = 0;
  let remainingDays = totalDays;
  
  // 计算年数（按365天计算）
  years = Math.floor(remainingDays / 365);
  remainingDays = remainingDays % 365;
  
  // 计算月数（按平均30.44天计算）
  months = Math.floor(remainingDays / 30.44);
  const days = Math.floor(remainingDays % 30.44);
  
  return { years, months, days, hours, minutes, seconds };
}

// 更新计时器显示
function updateTimer() {
  const timeDiff = calculateTimeDifference();
  
  // 检查每个值是否变化，更新并添加动画
  Object.keys(timeDiff).forEach(key => {
    const value = timeDiff[key];
    const displayValue = ['hours', 'minutes', 'seconds'].includes(key) 
      ? value.toString().padStart(2, '0') 
      : value;
      
    if (previousValues[key] !== value) {
      // 更新值
      eval(`${key}.value = '${displayValue}'`);
      // 触发动画
      isChanged.value[key] = true;
      setTimeout(() => {
        isChanged.value[key] = false;
      }, 500);
      // 更新上一次的值
      previousValues[key] = value;
    }
  });
}

// 组件挂载时初始化计时器
onMounted(() => {
  updateTimer();
  timer = setInterval(updateTimer, 1000);
});

// 组件卸载时清除计时器
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style>
/* 全局样式 */
:root {
  --color-love-light: #FFD1DC; /* 浅粉色 */
  --color-love: #FF69B4; /* 粉色 */
  --color-love-dark: #C71585; /* 深粉色 */
  --color-romantic-light: #E6E6FA; /* 浅紫色 */
  --color-romantic-dark: #9370DB; /* 深紫色 */
  --shadow-soft: 0 4px 15px rgba(0, 0, 0, 0.05);
  --shadow-medium: 0 10px 25px -5px rgba(255, 105, 180, 0.3);
  --shadow-hover: 0 12px 30px -8px rgba(255, 105, 180, 0.4);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden; /* 防止横向滚动 */
}
</style>

<style scoped>
/* 页面外层容器 - 全屏覆盖 */
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  /* 粉色渐变背景 - 全屏覆盖 */
  background: linear-gradient(135deg, 
    var(--color-love-light) 20%, 
    var(--color-romantic-light) 50%, 
    var(--color-love-light) 80%);
  position: relative;
}

/* 背景装饰 - 全屏覆盖 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.heart-decoration {
  position: absolute;
  color: var(--color-love);
  font-size: 40px;
  opacity: 0.15;
  animation: float 6s ease-in-out infinite, heartbeat 1.5s ease-in-out infinite;
}

.heart-decoration::before {
  content: '❤';
}

/* 内容容器 - 居中显示，有最大宽度限制 */
.content-container {
  width: 100%;
  max-width: 1200px; /* 大屏幕最大宽度 */
  min-height: 100vh;
  margin: 0 auto; /* 水平居中 */
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* 标题区域 */
.header {
  text-align: center;
  margin: 20px 0 30px;
  width: 100%;
  max-width: 600px;
}

.main-title {
  font-family: 'Dancing Script', cursive;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 700;
  color: var(--color-love-dark);
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.15);
  line-height: 1.2;
}

.subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: #666;
  max-width: 400px;
  margin: 0 auto 20px;
  line-height: 1.5;
}

.divider {
  width: 100px;
  height: 2px;
  background: linear-gradient(to right, transparent, var(--color-love), transparent);
  margin: 0 auto;
  position: relative;
}

.divider-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-love);
  animation: pulse 4s ease-in-out infinite;
}

/* 头像区域 */
.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin-bottom: 30px;
  gap: 20px;
}

.avatar-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s ease;
}

.avatar-image {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(255, 105, 180, 0.2);
  transition: all 0.4s ease;
}

.avatar-wrapper:hover .avatar-image {
  transform: translateY(-8px) scale(1.05);
  box-shadow: var(--shadow-hover);
}

.nickname {
  margin-top: 12px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  color: var(--color-love-dark);
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
}

.avatar-wrapper:hover .nickname {
  color: var(--color-love);
  transform: translateY(-2px);
}

.gender-indicator {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
}

.avatar-wrapper:hover .gender-indicator {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.male .icon {
  color: #3B82F6;
}

.female .icon {
  color: #EC4899;
}

/* 中间爱心 - 核心优化：修复底部红色圆圈问题 */
.heart-connector {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-icon {
  font-size: 40px;
  color: var(--color-love-dark);
  animation: heartbeat 1.5s ease-in-out infinite;
  position: relative;
  z-index: 2; /* 确保爱心在圆圈上方 */
}

/* 优化红色脉冲圆圈：缩小尺寸、降低透明度、弱化效果 */
.heart-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px; /* 大幅缩小尺寸（原50px） */
  height: 20px;
  background-color: var(--color-love);
  border-radius: 50%;
  opacity: 0.15; /* 降低透明度（原0.3） */
  /* 调整动画：更柔和的缩放，避免过于明显 */
  animation: heartPulse 1.5s ease-in-out infinite;
  z-index: 1;
}

/* 相识日期 */
.meet-date {
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  margin-bottom: 30px;
  color: #666;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
}

.meet-date:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium);
}

.highlight {
  font-weight: 600;
  color: var(--color-love-dark);
}

/* 计时器网格 */
.timer-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 100%;
  margin-bottom: 40px;
}

@media (min-width: 640px) {
  .timer-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .timer-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
  }
  
  .avatar-image {
    width: 120px;
    height: 120px;
    transform: translateY(-8px);
  }
  
  .avatar-wrapper:hover .avatar-image {
    transform: translateY(-12px) scale(1.05);
  }
  
  .nickname {
    font-size: 18px;
    margin-top: 15px;
  }
  
  .heart-icon {
    font-size: 50px;
  }
  
  /* 大屏幕适配脉冲圆圈 */
  .heart-pulse {
    width: 30px;
    height: 30px;
  }
}

/* 大屏幕适配 */
@media (min-width: 1200px) {
  .content-container {
    padding: 40px;
  }
  
  .timer-grid {
    gap: 30px;
  }
}

.timer-card {
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 10px;
  padding: 15px 10px;
  text-align: center;
  box-shadow: var(--shadow-medium);
  transition: all 0.3s ease;
}

.timer-card:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-hover);
}

.time-value {
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--color-love-dark);
  margin-bottom: 5px;
  font-family: 'Montserrat', sans-serif;
}

.time-label {
  color: #666;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif;
}

/* 爱情寄语 */
.love-message {
  text-align: center;
  max-width: 500px;
  margin: 30px 0 40px;
}

.love-message p {
  font-family: 'Dancing Script', cursive;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  color: var(--color-romantic-dark);
  font-style: italic;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.love-message:hover p {
  color: var(--color-love-dark);
}

.message-heart {
  color: var(--color-love);
  font-size: 24px;
  margin-top: 20px;
  animation: heartbeat 1.5s ease-in-out infinite;
}

/* 页脚 */
.footer {
  color: #888;
  font-size: 14px;
  margin-top: auto;
  padding: 20px 0;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
}

.footer:hover {
  color: var(--color-love-dark);
  transform: translateY(-2px);
}

/* 动画定义：优化爱心脉冲动画 */
@keyframes heartbeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.1); }
  28% { transform: scale(1); }
  42% { transform: scale(1.1); }
  70% { transform: scale(1); }
}

/* 新的脉冲动画：更柔和的缩放效果 */
@keyframes heartPulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
  50% { transform: translate(-50%, -50%) scale(1.8); opacity: 0.2; } /* 缩放幅度减小 */
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes numberChange {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.number-change {
  animation: numberChange 0.5s ease-out;
  color: var(--color-love) !important;
}

/* 字体引入 */
@font-face {
  font-family: 'Dancing Script';
  font-style: normal;
  font-weight: 400;
  src: local('Dancing Script Regular'), local('DancingScript-Regular'),
       url('https://fonts.gstatic.com/s/dancingscript/v24/If2RXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Sup8hNX6p.woff2') format('woff2');
}

@font-face {
  font-family: 'Dancing Script';
  font-style: normal;
  font-weight: 700;
  src: local('Dancing Script Bold'), local('DancingScript-Bold'),
       url('https://fonts.gstatic.com/s/dancingscript/v24/If2RXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BOk3Sup8hNX6p.woff2') format('woff2');
}

@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 400;
  src: local('Montserrat Regular'), local('Montserrat-Regular'),
       url('https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXp-p7K4KLg.woff2') format('woff2');
}

@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 600;
  src: local('Montserrat SemiBold'), local('Montserrat-SemiBold'),
       url('https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu173w5aXp-p7K4KLg.woff2') format('woff2');
}
</style>