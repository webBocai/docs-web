<template>
  <TkPageCard>
    <div class="card-widget" id="card-widget-schedule">
      <div class="item-headline">
        <i></i>
      </div>
      <div class="item-content">
        <div id="schedule-area-right">
          <div class="schedule-r0">
            <!-- <div class="schedule-d0">本年</div> -->
            <div class="schedule-d1">
              <span id="p_span_year" class="aside-span1"
                >{{ yearProgress }}%</span
              >
              <div class="progress-container">
                <span class="aside-span2"
                  >本年还剩<a id="year_days_left">{{ yearDaysLeft }}</a
                  >天</span
                >
                <progress
                  max="365"
                  id="pBar_year"
                  :value="yearPassedDays"
                ></progress>
              </div>
            </div>
          </div>
          <div class="schedule-r1">
            <!-- <div class="schedule-d0">本月</div> -->
            <div class="schedule-d1">
              <span id="p_span_month" class="aside-span1"
                >{{ monthProgress }}%</span
              >
              <div class="progress-container">
                <span class="aside-span2"
                  >本月还剩<a id="month_days_left">{{ monthDaysLeft }}</a
                  >天</span
                >
                <progress
                  max="31"
                  id="pBar_month"
                  :value="monthPassedDays"
                ></progress>
              </div>
            </div>
          </div>
          <div class="schedule-r2">
            <!-- <div class="schedule-d0">本周</div> -->
            <div class="schedule-d1">
              <span id="p_span_week" class="aside-span1"
                >{{ weekProgress }}%</span
              >
              <div class="progress-container">
                <span class="aside-span2"
                  >本周还剩<a id="week_days_left">{{ weekDaysLeft }}</a
                  >天</span
                >
                <progress
                  max="7"
                  id="pBar_week"
                  :value="weekDisplayValue"
                ></progress>
              </div>
            </div>
          </div>
        </div>
        <div id="schedule-area-left">
          <div id="schedule-title">距离春节</div>
          <div id="schedule-days">{{ springFestivalDays }}</div>
          <div id="schedule-date">{{ springFestivalDateText }}</div>
        </div>
      </div>
    </div>
  </TkPageCard>
</template>

<script setup>
import { TkPageCard } from "vitepress-theme-teek";
import { ref, onMounted } from "vue";

// 响应式变量
const springFestivalDays = ref("--");
const springFestivalDateText = ref("--"); // 动态春节日期文本
const yearProgress = ref("--");
const yearDaysLeft = ref("--");
const yearPassedDays = ref(0);
const monthProgress = ref("--");
const monthDaysLeft = ref("--");
const monthPassedDays = ref(0);
const weekProgress = ref("--");
const weekDaysLeft = ref("--");
const weekDisplayValue = ref(0);

/**
 * 计算指定年份春节（农历正月初一）的公历日期（1900-2100年适用）
 * @param {number} lunarYear - 农历年份
 * @returns {Date} 春节的公历日期
 */
const getSpringFestivalDate = (lunarYear) => {
  // 1900-2100年春节公历日期表（[月, 日]），已精准修正2026年（索引126）为[2,17]
  const springFestivalData = [
    [2, 19], [2, 8], [1, 28], [2, 16], [2, 5], [1, 25], [2, 13], [2, 2], [1, 22], [2, 10], // 1900-1909 (0-9)
    [1, 30], [2, 18], [2, 7], [1, 26], [2, 14], [2, 3], [1, 23], [2, 11], [1, 31], [2, 19], // 1910-1919 (10-19)
    [2, 8], [1, 28], [2, 16], [2, 5], [1, 24], [2, 12], [2, 1], [1, 21], [2, 9], [1, 28],  // 1920-1929 (20-29)
    [2, 16], [2, 5], [1, 24], [2, 12], [2, 1], [1, 21], [2, 9], [1, 29], [2, 17], [2, 6],  // 1930-1939 (30-39)
    [1, 26], [2, 14], [2, 2], [1, 22], [2, 10], [1, 29], [2, 17], [2, 6], [1, 26], [2, 13], // 1940-1949 (40-49)
    [2, 2], [1, 22], [2, 10], [1, 30], [2, 17], [2, 6], [1, 25], [2, 13], [2, 1], [1, 21], // 1950-1959 (50-59)
    [2, 8], [1, 28], [2, 15], [2, 5], [1, 24], [2, 12], [1, 31], [2, 18], [2, 7], [1, 27], // 1960-1969 (60-69)
    [2, 15], [2, 3], [1, 23], [2, 11], [1, 31], [2, 18], [2, 6], [1, 26], [2, 14], [2, 3], // 1970-1979 (70-79)
    [1, 23], [2, 10], [1, 29], [2, 16], [2, 5], [1, 24], [2, 12], [2, 1], [1, 22], [2, 9], // 1980-1989 (80-89)
    [1, 28], [2, 15], [2, 4], [1, 23], [2, 10], [1, 30], [2, 17], [2, 6], [1, 26], [2, 14], // 1990-1999 (90-99)
    [2, 2], [1, 22], [2, 10], [1, 29], [2, 17], [2, 5], [1, 24], [2, 12], [1, 31], [2, 18], // 2000-2009 (100-109)
    [2, 7], [1, 26], [2, 14], [2, 3], [1, 23], [2, 10], [1, 31], [2, 18], [2, 7], [1, 26], // 2010-2019 (110-119)
    [2, 12], [2, 1], [1, 22], [2, 10], [1, 29], [2, 17], [2, 17], [1, 24], [2, 12], [2, 1], // 2020-2029 (120-129) 
    // 索引126对应2026年，已明确设置为[2,17]
    [1, 22], [2, 10], [1, 29], [2, 17], [2, 6], [1, 26], [2, 14], [2, 3], [1, 23], [2, 10], // 2030-2039 (130-139)
    [1, 30], [2, 17], [2, 6], [1, 26], [2, 13], [2, 2], [1, 22], [2, 10], [1, 29], [2, 17], // 2040-2049 (140-149)
    [2, 5], [1, 25], [2, 13], [2, 1], [1, 21], [2, 9], [1, 28], [2, 16], [2, 5], [1, 24], // 2050-2059 (150-159)
    [2, 12], [2, 1], [1, 21], [2, 9], [1, 28], [2, 15], [2, 4], [1, 24], [2, 11], [1, 31], // 2060-2069 (160-169)
    [2, 18], [2, 7], [1, 27], [2, 15], [2, 3], [1, 23], [2, 11], [1, 31], [2, 18], [2, 6], // 2070-2079 (170-179)
    [1, 26], [2, 14], [2, 3], [1, 23], [2, 10], [1, 29], [2, 16], [2, 5], [1, 24], [2, 12], // 2080-2089 (180-189)
    [2, 1], [1, 22], [2, 9], [1, 28], [2, 15], [2, 4], [1, 23], [2, 10], [1, 30], [2, 17], // 2090-2099 (190-199)
    [2, 5] // 2100年 (200)
  ];

  const index = lunarYear - 1900;
  if (index >= 0 && index < springFestivalData.length) {
    const [month, day] = springFestivalData[index];
    return new Date(lunarYear, month - 1, day); // 月份在Date中为0基，需减1
  }
  return new Date(lunarYear, 1, 1); // 超出范围默认2月1日
};

/**
 * 动态获取目标春节日期（今年或明年）
 * @returns {Date} 目标春节日期
 */
const getTargetSpringFestival = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentYearSpring = getSpringFestivalDate(currentYear);
  // 若今天在今年春节前，目标为今年春节；否则为明年春节
  return today < currentYearSpring ? currentYearSpring : getSpringFestivalDate(currentYear + 1);
};

/**
 * 计算两个日期的天数差
 * @param {Date} date1 - 起始日期
 * @param {Date} date2 - 目标日期
 * @returns {number} 天数差（向上取整）
 */
const getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffTime = date2 - date1;
  return Math.ceil(diffTime / oneDay);
};

/**
 * 更新春节倒计时及日期显示
 */
const updateSpringFestivalCountdown = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 忽略时分秒，按整天计算
  const targetSpring = getTargetSpringFestival();
  // 计算剩余天数
  springFestivalDays.value = getDaysDifference(today, targetSpring);
  // 格式化日期为YYYY-MM-DD
  const year = targetSpring.getFullYear();
  const month = String(targetSpring.getMonth() + 1).padStart(2, '0');
  const day = String(targetSpring.getDate()).padStart(2, '0');
  springFestivalDateText.value = `${year}-${month}-${day}`;
};

/**
 * 更新年度进度
 */
const updateYearProgress = () => {
  const today = new Date();
  const year = today.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  const totalDays = getDaysDifference(startOfYear, endOfYear) + 1;
  const daysPassed = getDaysDifference(startOfYear, today);
  const daysLeft = totalDays - daysPassed;
  const progress = (daysPassed / totalDays) * 100;

  yearDaysLeft.value = daysLeft;
  yearProgress.value = progress.toFixed(1);
  yearPassedDays.value = daysPassed;
};

/**
 * 更新月度进度
 */
const updateMonthProgress = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const totalDays = getDaysDifference(startOfMonth, endOfMonth) + 1;
  const daysPassed = today.getDate() - 1; // 当月已过天数（不含今天）
  const daysLeft = totalDays - daysPassed - 1; // 剩余天数（含今天）
  const progress = (daysPassed / totalDays) * 100;

  monthDaysLeft.value = daysLeft;
  monthProgress.value = progress.toFixed(1);
  monthPassedDays.value = daysPassed;
};

/**
 * 更新本周进度（已修复0%问题）
 */
const updateWeekProgress = () => {
  const today = new Date();
  let dayOfWeek = today.getDay() || 7; // 周日转为7，周一到周六为1-6
  const daysPassed = dayOfWeek; // 已过天数（含今天：周一=1，周日=7）
  const daysLeft = 7 - dayOfWeek; // 剩余天数

  // 避免进度条完全消失（最小0.1）
  const displayValue = daysPassed === 0 ? 0.1 : daysPassed;

  weekDaysLeft.value = daysLeft;
  weekProgress.value = ((daysPassed / 7) * 100).toFixed(1);
  weekDisplayValue.value = displayValue;
};

/**
 * 统一更新所有数据
 */
const updateAllData = () => {
  updateSpringFestivalCountdown();
  updateYearProgress();
  updateMonthProgress();
  updateWeekProgress();
};

// 页面加载时初始化，并设置每天凌晨更新
onMounted(() => {
  updateAllData();

  // 计算距离次日凌晨0:00:01的毫秒数，设置定时器每天更新
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 1, 0);
  const timeToUpdate = tomorrow - now;

  setInterval(updateAllData, timeToUpdate);
});
</script>

<style scoped>
.tk-page-card {
  margin-top: 10px;
}

/* 进度条样式 */
progress {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background-color: #f0f0f0;
  border: none;
}
progress::-webkit-progress-bar {
  background-color: #f0f0f0;
  border-radius: 5px;
}
progress::-webkit-progress-value {
  background-color: var(--vp-c-brand-1);
  border-radius: 5px;
  transition: width 0.3s ease;
}

/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}

.item-headline span {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

/* 内容区域样式 */
.item-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

/* 左侧春节倒计时样式 */
#schedule-area-left {
  flex: 1;
  min-width: 200px;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid var(--vp-c-brand-1);
}
#schedule-title {
  font-size: 16px;
  color: var(--vp-c-brand-1);
  margin-bottom: 10px;
}
#schedule-days {
  font-size: 48px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin: 10px 0;
}
#schedule-date {
  font-size: 14px;
  color: #666666;
}

/* 右侧进度区域样式 */
#schedule-area-right {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.schedule-r0,
.schedule-r1,
.schedule-r2 {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.schedule-d0 {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}
.schedule-d1 {
  display: flex;
  align-items: center;
  gap: 12px;
}
.progress-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 2;
}
.aside-span1 {
  font-size: 14px;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  width: 60px;
  display: inline-block;
}
.aside-span2 {
  font-size: 13px;
  color: #666666;
  flex: 1;
}
.aside-span2 a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
}

/* 响应式样式 */
@media (max-width: 480px) {
  .item-content {
    flex-direction: column;
  }
  #schedule-days {
    font-size: 36px;
  }
}
</style>