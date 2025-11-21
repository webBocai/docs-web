<template>
    <div 
      class="thought-card"
      :class="`thought-card--${color}`"
    >
      <div class="thought-card__header">
        <span class="thought-card__category">
          <i :class="`fa ${icon}`"></i> {{ category }}
        </span>
        <span class="thought-card__date">{{ formattedDate }}</span>
      </div>
      <p class="thought-card__content">{{ content }}</p>
      <div class="thought-card__footer">
        <i class="fa fa-user-circle-o"></i>
        <span>自己</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  // 接收父组件传递的参数
  const props = defineProps({
    content: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true,
      validator: (value) => {
        return ['blue', 'green', 'purple', 'orange'].includes(value);
      }
    }
  });
  
  // 格式化日期
  const formattedDate = computed(() => {
    const date = new Date(props.date);
    return date.toLocaleDateString('zh-CN');
  });
  </script>
  
  <style scoped>
  .thought-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-top: 4px solid;
    transition: all 0.3s ease;
  }
  
  .thought-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .thought-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
  }
  
  .thought-card__category {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .thought-card__category i {
    margin-right: 5px;
  }
  
  .thought-card__date {
    color: #888;
    font-size: 12px;
  }
  
  .thought-card__content {
    color: #555;
    line-height: 1.6;
    margin-bottom: 20px;
    text-wrap: balance;
  }
  
  .thought-card__footer {
    display: flex;
    align-items: center;
    color: #888;
    font-size: 12px;
  }
  
  .thought-card__footer i {
    margin-right: 5px;
  }
  
  /* 颜色样式 */
  .thought-card--blue {
    border-color: #3B82F6;
  }
  
  .thought-card--blue .thought-card__category {
    background-color: #EBF4FF;
    color: #3B82F6;
  }
  
  .thought-card--green {
    border-color: #10B981;
  }
  
  .thought-card--green .thought-card__category {
    background-color: #ECFDF5;
    color: #10B981;
  }
  
  .thought-card--purple {
    border-color: #8B5CF6;
  }
  
  .thought-card--purple .thought-card__category {
    background-color: #F3EEFD;
    color: #8B5CF6;
  }
  
  .thought-card--orange {
    border-color: #F59E0B;
  }
  
  .thought-card--orange .thought-card__category {
    background-color: #FFF7ED;
    color: #F59E0B;
  }
  </style>
  