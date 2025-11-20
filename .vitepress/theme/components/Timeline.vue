<template>
  <div class="timeline-container">
    <h1 class="timeline-title">我的时间轴</h1>
    
    <!-- 密码验证区域 -->
    <div v-if="!isAuthenticated && showAuthForm" class="auth-form">
      <h2>管理员验证</h2>
      <input 
        type="password" 
        v-model="adminPassword" 
        placeholder="输入管理员密码"
        @keyup.enter="authenticate"
        class="password-input"
      >
      <button @click="authenticate" class="auth-button">验证</button>
      <p v-if="authError" class="auth-error">密码错误，请重试</p>
    </div>
    
    <!-- 显示管理按钮（仅管理员可见） -->
    <div v-if="sortedEvents.length > 0 && !showAuthForm && !isAuthenticated" class="manage-controls">
      <button @click="showAuthForm = true" class="manage-button">管理时间轴</button>
    </div>
    
    <!-- 时间轴事件列表 -->
    <div class="timeline-events">
      <div v-if="sortedEvents.length === 0" class="no-events">
        暂无事件，请添加第一个事件吧！
      </div>
      
      <div 
        v-for="(event, index) in sortedEvents" 
        :key="index" 
        class="timeline-item"
        :class="{ 'timeline-item-left': index % 2 === 0, 'timeline-item-right': index % 2 !== 0 }"
      >
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="event-date">{{ formatDate(event.date) }}</div>
          <h3 class="event-title">{{ event.title }}</h3>
          <p class="event-description">{{ event.description }}</p>
          <!-- 仅管理员可见的删除按钮 -->
          <button 
            @click="deleteEvent(index)" 
            class="delete-button"
            v-if="isAuthenticated"
          >
            删除
          </button>
        </div>
      </div>
    </div>
    
    <!-- 添加新事件的表单（仅管理员可见） -->
    <div class="add-event-form" v-if="isAuthenticated">
      <h2>添加新事件</h2>
      <div class="form-group">
        <label for="event-date">日期:</label>
        <input type="date" id="event-date" v-model="newEvent.date">
      </div>
      <div class="form-group">
        <label for="event-title">标题:</label>
        <input type="text" id="event-title" v-model="newEvent.title" placeholder="输入事件标题">
      </div>
      <div class="form-group">
        <label for="event-description">描述:</label>
        <textarea id="event-description" v-model="newEvent.description" placeholder="输入事件描述"></textarea>
      </div>
      <button @click="addEvent" class="add-button">添加事件</button>
      <button @click="logout" class="logout-button">退出管理模式</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 管理员密码（请在部署前修改为您自己的密码）
const ADMIN_PASSWORD = 'Hg@2025'; // 这里请修改为您自己的密码

// 初始化事件列表，从本地存储加载（如果有）
const events = ref(JSON.parse(localStorage.getItem('timelineEvents')) || [
  {
    date: '2021-07-08',
    title: '初见',
    description: '茫茫人海，我们相遇。那一天，我们在一起了，我好幸福。'
  },
  {
    date: '2022-01-25',
    title: '后来',
    description: '再见竟是，再也不见。至此，我从未真正地快乐过……'
  },
]);

// 权限控制相关
const isAuthenticated = ref(false);
const showAuthForm = ref(false);
const adminPassword = ref('');
const authError = ref(false);

// 新事件的数据
const newEvent = ref({
  date: '',
  title: '',
  description: ''
});

// 按日期排序事件（从早到晚）
const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => new Date(a.date) - new Date(b.date));
});

// 验证管理员身份
const authenticate = () => {
  if (adminPassword.value === ADMIN_PASSWORD) {
    isAuthenticated.value = true;
    showAuthForm.value = false;
    authError.value = false;
    adminPassword.value = '';
  } else {
    authError.value = true;
  }
};

// 退出管理模式
const logout = () => {
  isAuthenticated.value = false;
};

// 添加新事件（仅管理员可执行）
const addEvent = () => {
  if (!newEvent.value.date || !newEvent.value.title) {
    alert('请填写日期和标题');
    return;
  }
  
  events.value.push({...newEvent.value});
  
  // 保存到本地存储
  localStorage.setItem('timelineEvents', JSON.stringify(events.value));
  
  // 重置表单
  newEvent.value = {
    date: '',
    title: '',
    description: ''
  };
};

// 删除事件（仅管理员可执行）
const deleteEvent = (index) => {
  if (confirm('确定要删除这个事件吗？')) {
    events.value.splice(index, 1);
    localStorage.setItem('timelineEvents', JSON.stringify(events.value));
  }
};

// 格式化日期显示
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.timeline-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  color: #333;
}

.timeline-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
  font-size: 2.5rem;
}

/* 权限验证样式 */
.auth-form {
  max-width: 400px;
  margin: 0 auto 40px;
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.password-input {
  width: 80%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.auth-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.auth-button:hover {
  background-color: #2980b9;
}

.auth-error {
  color: #e74c3c;
  margin-top: 10px;
  font-size: 0.9rem;
}

.manage-controls {
  text-align: center;
  margin-bottom: 30px;
}

.manage-button {
  background-color: #f1c40f;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.manage-button:hover {
  background-color: #d4ac0d;
}

.add-event-form {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-top: 50px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.add-event-form h2 {
  margin-top: 0;
  color: #34495e;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.add-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
  margin-right: 10px;
}

.add-button:hover {
  background-color: #2980b9;
}

.logout-button {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #7f8c8d;
}

.timeline-events {
  position: relative;
  padding: 20px 0;
}

/* 时间轴中心线 */
.timeline-events::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 4px;
  background-color: #e0e0e0;
  transform: translateX(-50%);
}

.timeline-item {
  margin-bottom: 40px;
  position: relative;
  width: 50%;
}

.timeline-item-left {
  left: 0;
  padding-right: 40px;
}

.timeline-item-right {
  left: 50%;
  padding-left: 40px;
}

/* 时间点 */
.timeline-dot {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #3498db;
  border-radius: 50%;
  top: 10px;
  z-index: 1;
}

.timeline-item-left .timeline-dot {
  right: -10px;
}

.timeline-item-right .timeline-dot {
  left: -10px;
}

.timeline-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

/* 鼠标悬停时轻微上浮效果 */
.timeline-item:hover .timeline-content {
  transform: translateY(-5px);
}

.event-date {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.event-title {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.event-description {
  margin: 0;
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 10px;
}

/* 删除按钮样式 */
.delete-button {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  opacity: 0;
  transform: translateY(5px);
}

.timeline-item:hover .delete-button {
  opacity: 1;
  transform: translateY(0);
}

.delete-button:hover {
  background-color: #ff5252;
}

.no-events {
  text-align: center;
  color: #7f8c8d;
  padding: 40px;
  font-size: 1.2rem;
}

/* 响应式设计 - 适配移动设备 */
@media (max-width: 768px) {
  .timeline-events::before {
    left: 30px;
  }
  
  .timeline-item {
    width: 100%;
    padding-left: 70px;
    padding-right: 25px;
  }
  
  .timeline-item-left,
  .timeline-item-right {
    left: 0;
  }
  
  .timeline-item-left .timeline-dot,
  .timeline-item-right .timeline-dot {
    left: 20px;
  }
  
  .auth-form {
    width: 90%;
  }
  
  .password-input {
    width: 90%;
  }
}
</style>
