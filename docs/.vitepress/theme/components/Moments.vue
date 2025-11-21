<template>
  <!-- 模板内容和之前保持一致 -->
  <div class="moments-container">
    <!-- 头部区域 -->
    <header class="header">
      <div class="header-content">
        <img 
          src="https://picsum.photos/200/200?random=1" 
          alt="个人头像" 
          class="avatar"
        >
        <h1 class="page-title">我的朋友圈</h1>
      </div>
      <button class="publish-btn" @click="showPublishModal = true">
        <i class="icon-add">+</i> 发布
      </button>
    </header>

    <!-- 快速发布区域 -->
    <div class="quick-publish">
      <img 
        src="https://picsum.photos/200/200?random=1" 
        alt="个人头像" 
        class="publish-avatar"
      >
      <input 
        type="text" 
        class="quick-input" 
        placeholder="分享你的想法..."
        v-model="quickContent"
        @keyup.enter="handleQuickPublish"
      >
    </div>

    <!-- 动态列表 -->
    <div class="moments-list">
      <!-- 动态项 -->
      <div 
        class="moment-item" 
        v-for="moment in sortedMoments" 
        :key="moment.id"
      >
        <div class="moment-header">
          <img 
            src="https://picsum.photos/200/200?random=1" 
            alt="用户头像" 
            class="moment-avatar"
          >
          <div class="user-info">
            <div class="username">我</div>
            <div class="post-time">{{ formatTime(moment.time) }}</div>
          </div>
        </div>

        <div class="moment-content" v-if="moment.content">
          {{ moment.content }}
        </div>

        <!-- 图片网格 -->
        <div 
          class="images-grid"
          :class="{
            'single': moment.images.length === 1,
            'double': moment.images.length === 2,
            'triple': moment.images.length === 3
          }"
          v-if="moment.images.length > 0"
        >
          <img 
            v-for="(img, index) in moment.images" 
            :key="index"
            :src="img" 
            alt="动态图片"
            class="grid-img"
            @click="openImagePreview(moment.images, index)"
          >
        </div>

        <!-- 互动按钮 -->
        <div class="moment-actions">
          <button 
            class="action-btn like-btn"
            :class="{ liked: moment.liked }"
            @click="toggleLike(moment.id)"
          >
            <i class="icon-like">{{ moment.liked ? '♥' : '♡' }}</i>
            <span>{{ moment.likes }}</span>
          </button>
          <button class="action-btn comment-btn">
            <i class="icon-comment">💬</i>
            <span>{{ moment.comments }}</span>
          </button>
          <button class="action-btn share-btn">
            <i class="icon-share">🔗</i>
            <span>分享</span>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="sortedMoments.length === 0">
        <div class="empty-icon">📝</div>
        <p>还没有动态，发布你的第一条动态吧～</p>
      </div>
    </div>

    <!-- 发布动态弹窗 -->
    <div class="modal-overlay" v-if="showPublishModal" @click="closePublishModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">发布动态</h2>
          <button class="close-btn" @click="closePublishModal">×</button>
        </div>
        <div class="modal-body">
          <textarea 
            class="post-content" 
            placeholder="分享你的想法..."
            v-model="postContent"
            @input="checkPublishable"
          ></textarea>

          <div class="image-upload">
            <div class="upload-title">添加图片（最多9张）</div>
            <div class="preview-container">
              <div 
                class="preview-item" 
                v-for="(img, index) in previewImages" 
                :key="index"
              >
                <img :src="img" alt="预览图" class="preview-img">
                <button 
                  class="remove-img" 
                  @click="removeImage(index)"
                >×</button>
              </div>

              <label class="upload-btn" v-if="previewImages.length < 9">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  @change="handleImageUpload"
                  class="upload-input"
                >
                <div class="upload-icon">+</div>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closePublishModal">取消</button>
          <button 
            class="publish-btn" 
            @click="publishMoment"
            :disabled="!isPublishable"
          >
            发布
          </button>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div class="image-preview" v-if="showImagePreview" @click="closeImagePreview">
      <div class="preview-content" @click.stop>
        <button class="preview-close" @click="closeImagePreview">×</button>
        <img 
          :src="currentPreviewImage" 
          alt="图片预览" 
          class="preview-img-large"
        >
        <div class="preview-nav" v-if="previewImagesList.length > 1">
          <button class="nav-btn prev-btn" @click="prevImage">←</button>
          <button class="nav-btn next-btn" @click="nextImage">→</button>
        </div>
        <div class="preview-counter">
          {{ currentPreviewIndex + 1 }} / {{ previewImagesList.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

// 从localStorage加载数据或使用初始数据
const loadMoments = () => {
  const saved = localStorage.getItem('momentsData');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse moments data', e);
      return [];
    }
  }
  // 初始示例数据
  return [
    {
      id: 1,
      content: "今天天气真好，去公园散步了～ 🌸",
      images: [
        "https://picsum.photos/600/400?random=10",
        "https://picsum.photos/600/400?random=11"
      ],
      time: new Date(Date.now() - 3600000).getTime(), // 1小时前
      likes: 15,
      liked: false,
      comments: 3
    },
    {
      id: 2,
      content: "分享一下新做的晚餐，味道还不错！",
      images: [
        "https://picsum.photos/600/400?random=20"
      ],
      time: new Date(Date.now() - 86400000).getTime(), // 1天前
      likes: 28,
      liked: true,
      comments: 7
    },
    {
      id: 3,
      content: "周末去看了一场精彩的电影，强烈推荐！",
      images: [],
      time: new Date(Date.now() - 172800000).getTime(), // 2天前
      likes: 12,
      liked: false,
      comments: 2
    }
  ];
};

// 保存数据到localStorage
const saveMoments = (data) => {
  try {
    localStorage.setItem('momentsData', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save moments data', e);
  }
};

// 动态数据 - 从localStorage加载
const moments = ref(loadMoments());

// 监听数据变化，自动保存到localStorage
watch(moments, (newValue) => {
  saveMoments(newValue);
}, { deep: true });

// 组件挂载时加载数据
onMounted(() => {
  moments.value = loadMoments();
});

// 按日期排序（最新的在前）
const sortedMoments = computed(() => {
  return [...moments.value].sort((a, b) => b.time - a.time);
});

// 快速发布相关
const quickContent = ref('');

// 发布弹窗相关
const showPublishModal = ref(false);
const postContent = ref('');
const previewImages = ref([]);
const isPublishable = ref(false);

// 图片预览相关
const showImagePreview = ref(false);
const previewImagesList = ref([]);
const currentPreviewIndex = ref(0);
const currentPreviewImage = computed(() => {
  return previewImagesList.value[currentPreviewIndex.value] || '';
});

// 检查是否可以发布
const checkPublishable = () => {
  isPublishable.value = !!postContent.value.trim() || previewImages.value.length > 0;
};

// 格式化时间显示
const formatTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

// 切换点赞状态
const toggleLike = (id) => {
  const moment = moments.value.find(m => m.id === id);
  if (moment) {
    if (moment.liked) {
      moment.likes--;
    } else {
      moment.likes++;
    }
    moment.liked = !moment.liked;
    // 触发watch更新
    moments.value = [...moments.value];
  }
};

// 打开发布弹窗
const openPublishModal = () => {
  showPublishModal.value = true;
  postContent.value = '';
  previewImages.value = [];
  isPublishable.value = false;
};

// 关闭发布弹窗
const closePublishModal = () => {
  showPublishModal.value = false;
};

// 处理图片上传
const handleImageUpload = (e) => {
  const files = e.target.files;
  if (!files.length) return;

  // 最多上传9张
  const maxAdd = 9 - previewImages.value.length;
  const filesToProcess = Array.from(files).slice(0, maxAdd);

  filesToProcess.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      previewImages.value.push(event.target.result);
      checkPublishable();
    };
    reader.readAsDataURL(file);
  });

  // 清空input值，允许重复选择相同文件
  e.target.value = '';
};

// 移除预览图片
const removeImage = (index) => {
  previewImages.value.splice(index, 1);
  checkPublishable();
};

// 发布动态
const publishMoment = () => {
  const content = postContent.value.trim();
  if (!content && previewImages.value.length === 0) return;

  const newMoment = {
    id: Date.now(),
    content: content,
    images: [...previewImages.value],
    time: Date.now(),
    likes: 0,
    liked: false,
    comments: 0
  };

  moments.value.unshift(newMoment);
  closePublishModal();
};

// 快速发布
const handleQuickPublish = () => {
  const content = quickContent.value.trim();
  if (!content) return;

  const newMoment = {
    id: Date.now(),
    content: content,
    images: [],
    time: Date.now(),
    likes: 0,
    liked: false,
    comments: 0
  };

  moments.value.unshift(newMoment);
  quickContent.value = '';
};

// 打开图片预览
const openImagePreview = (images, index) => {
  previewImagesList.value = images;
  currentPreviewIndex.value = index;
  showImagePreview.value = true;
  document.body.style.overflow = 'hidden';
};

// 关闭图片预览
const closeImagePreview = () => {
  showImagePreview.value = false;
  document.body.style.overflow = '';
};

// 上一张图片
const prevImage = () => {
  currentPreviewIndex.value = (currentPreviewIndex.value - 1 + previewImagesList.value.length) % previewImagesList.value.length;
};

// 下一张图片
const nextImage = () => {
  currentPreviewIndex.value = (currentPreviewIndex.value + 1) % previewImagesList.value.length;
};

// 监听键盘事件用于图片预览导航
watch(showImagePreview, (isVisible) => {
  const handleKeydown = (e) => {
    if (!isVisible) return;

    if (e.key === 'Escape') {
      closeImagePreview();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  };

  document.addEventListener('keydown', handleKeydown);
  return () => {
    document.removeEventListener('keydown', handleKeydown);
  };
});
</script>

<style scoped>
/* 样式和之前保持一致 */
.moments-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* 头部样式 */
.header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.publish-btn {
  background-color: #00c853;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.publish-btn:hover {
  background-color: #00b248;
}

.publish-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

/* 快速发布区域 */
.quick-publish {
  padding: 15px 20px;
  border-bottom: 10px solid #f5f5f5;
  display: flex;
  align-items: center;
  gap: 12px;
}

.publish-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.quick-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  outline: none;
  transition: border-color 0.2s;
  font-size: 1rem;
}

.quick-input:focus {
  border-color: #b3e5fc;
}

/* 动态列表 */
.moments-list {
  padding-bottom: 20px;
}

.moment-item {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.1s;
}

.moment-item:hover {
  background-color: #fafafa;
}

.moment-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.moment-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.username {
  font-weight: 600;
  margin-bottom: 2px;
  display: inline-block;
}

.post-time {
  font-size: 0.8rem;
  color: #999;
}

.moment-content {
  margin-bottom: 10px;
  font-size: 1rem;
  line-height: 1.6;
}

/* 图片网格 */
.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.grid-img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.grid-img:hover {
  transform: scale(1.02);
}

/* 不同图片数量的布局 */
.images-grid.single {
  grid-template-columns: 1fr;
  max-width: 300px;
}

.images-grid.double {
  grid-template-columns: repeat(2, 1fr);
}

/* 互动按钮 */
.moment-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 5px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.action-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 8px 0;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: color 0.2s, background-color 0.2s;
  border-radius: 4px;
}

.action-btn:hover {
  background-color: #f5f5f5;
  color: #007bff;
}

.like-btn.liked {
  color: #e53935;
}

/* 空状态 */
.empty-state {
  padding: 50px 20px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

/* 发布弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
}

.modal-overlay:not([v-if="false"]) {
  opacity: 1;
  visibility: visible;
}

.modal {
  background-color: white;
  width: 90%;
  max-width: 600px;
  border-radius: 10px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.post-content {
  width: 100%;
  min-height: 120px;
  border: none;
  outline: none;
  resize: none;
  font-size: 1rem;
  margin-bottom: 20px;
  line-height: 1.6;
  font-family: inherit;
}

.image-upload {
  margin-bottom: 20px;
}

.upload-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
}

.preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-item {
  width: 80px;
  height: 80px;
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-img {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  border: none;
  transition: background-color 0.2s;
}

.remove-img:hover {
  background-color: white;
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.upload-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.upload-input {
  display: none;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}

/* 图片预览弹窗 */
.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
}

.image-preview:not([v-if="false"]) {
  opacity: 1;
  visibility: visible;
}

.preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
}

.preview-img-large {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.preview-close {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.preview-nav {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
}

.nav-btn {
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.preview-counter {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 0.9rem;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .images-grid {
    gap: 3px;
  }

  .action-btn span {
    font-size: 0.8rem;
  }
}
</style>
