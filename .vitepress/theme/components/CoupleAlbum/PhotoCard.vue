<template>
    <div class="photo-card" :data-category="photo.category">
      <div class="photo-container">
        <img 
          :src="photo.url" 
          :alt="photo.description" 
          class="photo-image"
          @click="handlePhotoClick"
        >
        <div class="photo-overlay">
          <button class="view-photo-btn" @click="handlePhotoClick">
            <i class="fa fa-search-plus"></i>
          </button>
        </div>
      </div>
      <div class="photo-info">
        <div class="photo-header">
          <span class="photo-date">{{ formattedDate }}</span>
          <span class="photo-category">{{ getCategoryName(photo.category) }}</span>
        </div>
        <p class="photo-description">{{ photo.description }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    photo: {
      type: Object,
      required: true,
      properties: {
        id: Number,
        date: String,
        description: String,
        url: String,
        category: String
      }
    },
    onPhotoClick: {
      type: Function,
      required: true
    }
  });
  
  // 格式化日期
  const formattedDate = computed(() => {
    const date = new Date(props.photo.date);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });
  
  // 获取分类名称
  const getCategoryName = (category) => {
    const categories = {
      'date': '约会时光',
      'travel': '旅行足迹',
      'festival': '节日庆典',
      'daily': '日常点滴'
    };
    return categories[category] || category;
  };
  
  // 处理照片点击
  const handlePhotoClick = () => {
    props.onPhotoClick(props.photo);
  };
  </script>
  
  <style scoped>
  .photo-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  
  .photo-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .photo-container {
    position: relative;
    overflow: hidden;
    height: 200px;
  }
  
  .photo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .photo-card:hover .photo-image {
    transform: scale(1.1);
  }
  
  .photo-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(233, 69, 96, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .photo-card:hover .photo-overlay {
    opacity: 1;
  }
  
  .view-photo-btn {
    background: white;
    color: #E94560;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transform: translateY(10px);
    transition: transform 0.3s ease;
  }
  
  .photo-card:hover .view-photo-btn {
    transform: translateY(0);
  }
  
  .photo-info {
    padding: 15px;
  }
  
  .photo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .photo-date {
    color: #E94560;
    font-weight: 600;
    font-size: 14px;
  }
  
  .photo-category {
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 12px;
    background: rgba(233, 69, 96, 0.1);
    color: #E94560;
  }
  
  .photo-description {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  </style>
  