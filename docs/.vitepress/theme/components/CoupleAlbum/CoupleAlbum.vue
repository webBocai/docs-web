<template>
    <div class="couple-album">
      <!-- 顶部导航 -->
      <header class="album-header" :class="{ 'scrolled': isScrolled }">
        <div class="container">
          <h1 class="album-title">
            <i class="fa fa-heart"></i> 我们的故事
          </h1>
          <div class="header-actions">
            <button class="sort-btn" @click="toggleSortOrder">
              <i class="fa fa-sort"></i>
              <span>{{ sortText }}</span>
            </button>
            <button class="add-btn" @click="openAddModal">
              <i class="fa fa-plus"></i> 添加回忆
            </button>
          </div>
        </div>
      </header>
  
      <!-- 主内容区 -->
      <main class="album-content">
        <div class="container">
          <!-- 相册介绍 -->
          <div class="album-intro">
            <h2 class="intro-title">记录我们的每一个美好瞬间</h2>
            <p class="intro-text">时光荏苒，爱意绵长。这里收藏着属于我们的点点滴滴，每一张照片都是一段珍贵的回忆。</p>
          </div>
          
          <!-- 筛选标签 -->
          <div class="filter-tags">
            <button 
              class="filter-tag" 
              :class="{ active: currentFilter === 'all' }"
              @click="setFilter('all')"
            >
              全部回忆
            </button>
            <button 
              class="filter-tag" 
              :class="{ active: currentFilter === 'date' }"
              @click="setFilter('date')"
            >
              约会时光
            </button>
            <button 
              class="filter-tag" 
              :class="{ active: currentFilter === 'travel' }"
              @click="setFilter('travel')"
            >
              旅行足迹
            </button>
            <button 
              class="filter-tag" 
              :class="{ active: currentFilter === 'festival' }"
              @click="setFilter('festival')"
            >
              节日庆典
            </button>
            <button 
              class="filter-tag" 
              :class="{ active: currentFilter === 'daily' }"
              @click="setFilter('daily')"
            >
              日常点滴
            </button>
          </div>
          
          <!-- 照片网格 -->
          <div class="photo-grid">
            <PhotoCard 
              v-for="photo in filteredPhotos" 
              :key="photo.id" 
              :photo="photo"
              :on-photo-click="openPhotoModal"
            />
          </div>
          
          <!-- 无照片提示 -->
          <div class="no-photos" v-if="filteredPhotos.length === 0">
            <i class="fa fa-image"></i>
            <p>没有找到符合条件的回忆</p>
          </div>
        </div>
      </main>
      
      <!-- 页脚 -->
      <footer class="album-footer">
        <div class="container">
          <p class="footer-quote">我们的故事，未完待续...</p>
          <p class="footer-copyright">© {{ currentYear }} 爱与回忆 | 永远在一起</p>
        </div>
      </footer>
      
      <!-- 照片查看模态框 -->
      <div class="modal-backdrop" v-if="isPhotoModalOpen" @click="closePhotoModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closePhotoModal">
            <i class="fa fa-times"></i>
          </button>
          <img 
            :src="currentPhoto.url" 
            :alt="currentPhoto.description" 
            class="modal-image"
          >
          <div class="modal-info">
            <h3 class="modal-date">{{ currentPhotoFormattedDate }}</h3>
            <p class="modal-description">{{ currentPhoto.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- 添加照片模态框 -->
      <div class="modal-backdrop" v-if="isAddModalOpen" @click="closeAddModal">
        <div class="modal-content add-modal-content" @click.stop>
          <div class="add-modal-header">
            <h3 class="add-modal-title">添加新回忆</h3>
            <button class="modal-close" @click="closeAddModal">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <form class="add-photo-form" @submit.prevent="addNewPhoto">
            <div class="form-group">
              <label for="photoDate">日期</label>
              <input type="date" id="photoDate" v-model="newPhoto.date" required>
            </div>
            <div class="form-group">
              <label for="photoDescription">描述这段回忆</label>
              <textarea 
                id="photoDescription" 
                rows="3" 
                v-model="newPhoto.description" 
                placeholder="记录下当时的心情和故事..."
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="photoCategory">分类</label>
              <select id="photoCategory" v-model="newPhoto.category" required>
                <option value="date">约会时光</option>
                <option value="travel">旅行足迹</option>
                <option value="festival">节日庆典</option>
                <option value="daily">日常点滴</option>
              </select>
            </div>
            <div class="form-group">
              <label for="photoUrl">照片地址</label>
              <input 
                type="text" 
                id="photoUrl" 
                v-model="newPhoto.url" 
                placeholder="输入照片的URL地址"
                required
              >
            </div>
            <button type="submit" class="submit-btn">保存回忆</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, reactive } from 'vue';
  import PhotoCard from './PhotoCard.vue';
  
  // 照片数据
  const photos = ref([
    {
      id: 1,
      date: '2023-10-15',
      description: '第一次一起看海，海风很轻，你的笑容很甜。我们在沙滩上写下彼此的名字，约定要一起看遍世界的每一片海。',
      url: 'https://picsum.photos/id/1039/800/600',
      category: 'date'
    },
    {
      id: 2,
      date: '2023-09-21',
      description: '中秋节一起做月饼，虽然形状不太完美，但这是我们一起完成的第一个节日美食。月光下的你，比月亮还要温柔。',
      url: 'https://picsum.photos/id/292/800/600',
      category: 'festival'
    },
    {
      id: 3,
      date: '2023-08-05',
      description: '周末一起去郊外露营，晚上躺在帐篷里看星星，你说要把最亮的那颗星星命名为我们的名字。',
      url: 'https://picsum.photos/id/883/800/600',
      category: 'travel'
    },
    {
      id: 4,
      date: '2023-07-10',
      description: '第一次一起做饭，你负责洗菜我负责炒，虽然有点手忙脚乱，但吃到嘴里的那一刻觉得无比幸福。',
      url: 'https://picsum.photos/id/431/800/600',
      category: 'daily'
    },
    {
      id: 5,
      date: '2023-06-01',
      description: '儿童节一起去了游乐园，你像个孩子一样拉着我玩遍了所有项目，旋转木马上的笑容是我见过最美的风景。',
      url: 'https://picsum.photos/id/338/800/600',
      category: 'date'
    },
    {
      id: 6,
      date: '2023-05-20',
      description: '520收到的惊喜，你说每天都要像今天一样爱我。其实有你的每一天，都是情人节。',
      url: 'https://picsum.photos/id/240/800/600',
      category: 'festival'
    }
  ]);
  
  // 状态管理
  const sortOrder = ref('desc'); // desc: 倒序, asc: 正序
  const currentFilter = ref('all');
  const isScrolled = ref(false);
  const currentYear = ref(new Date().getFullYear());
  
  // 模态框状态
  const isPhotoModalOpen = ref(false);
  const currentPhoto = ref(null);
  const isAddModalOpen = ref(false);
  
  // 新照片数据
  const newPhoto = reactive({
    date: '',
    description: '',
    category: 'date',
    url: ''
  });
  
  // 处理滚动事件
  onMounted(() => {
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
  
  // 计算属性 - 排序和筛选照片
  const filteredPhotos = computed(() => {
    // 复制照片数组以避免修改原始数据
    let result = [...photos.value];
    
    // 筛选
    if (currentFilter.value !== 'all') {
      result = result.filter(photo => photo.category === currentFilter.value);
    }
    
    // 排序
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  });
  
  // 排序文本
  const sortText = computed(() => {
    return sortOrder.value === 'desc' ? '按时间（最新在前）' : '按时间（最早在前）';
  });
  
  // 格式化当前照片日期
  const currentPhotoFormattedDate = computed(() => {
    if (!currentPhoto.value) return '';
    const date = new Date(currentPhoto.value.date);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });
  
  // 切换排序方式
  const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
  };
  
  // 设置筛选类别
  const setFilter = (category) => {
    currentFilter.value = category;
  };
  
  // 打开照片模态框
  const openPhotoModal = (photo) => {
    currentPhoto.value = photo;
    isPhotoModalOpen.value = true;
    document.body.style.overflow = 'hidden';
  };
  
  // 关闭照片模态框
  const closePhotoModal = () => {
    isPhotoModalOpen.value = false;
    document.body.style.overflow = '';
  };
  
  // 打开添加照片模态框
  const openAddModal = () => {
    isAddModalOpen.value = true;
    document.body.style.overflow = 'hidden';
    // 设置默认日期为今天
    newPhoto.date = new Date().toISOString().split('T')[0];
  };
  
  // 关闭添加照片模态框
  const closeAddModal = () => {
    isAddModalOpen.value = false;
    document.body.style.overflow = '';
    // 重置表单
    Object.keys(newPhoto).forEach(key => {
      newPhoto[key] = key === 'category' ? 'date' : '';
    });
  };
  
  // 添加新照片
  const addNewPhoto = () => {
    const newId = photos.value.length > 0 
      ? Math.max(...photos.value.map(p => p.id)) + 1 
      : 1;
    
    photos.value.unshift({
      id: newId,
      ...{...newPhoto}
    });
    
    closeAddModal();
    // 可以添加提示信息
    alert('回忆添加成功！');
  };
  </script>
  
  <style scoped>
    /* 引入Google字体 */
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
  
  /* 基础样式 */
  .couple-album {
    font-family: 'Inter', system-ui, sans-serif;
    background: linear-gradient(120deg, #fdfbfb 0%, #f7f4f7 100%);
    min-height: 100vh;
    color: #333;
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  /* 头部样式 */
  .album-header {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
    padding: 16px 0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  
  .album-header.scrolled {
    padding: 8px 0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .album-header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .album-title {
    margin: 0;
    font-size: 24px;
    font-family: 'Dancing Script', cursive;
    color: #E94560;
    display: flex;
    align-items: center;
  }
  
  .album-title i {
    margin-right: 8px;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .sort-btn {
    background: none;
    border: none;
    color: #1A1A2E;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 4px;
    transition: color 0.2s ease;
  }
  
  .sort-btn:hover {
    color: #E94560;
  }
  
  .add-btn {
    background: #E94560;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(233, 69, 96, 0.3);
    transition: all 0.2s ease;
  }
  
  .add-btn:hover {
    background: #d13b54;
    box-shadow: 0 4px 8px rgba(233, 69, 96, 0.4);
    transform: translateY(-1px);
  }
  
  /* 内容区样式 */
  .album-content {
    padding: 40px 0;
  }
  
  .album-intro {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 40px;
  }
  
  .intro-title {
    font-family: 'Dancing Script', cursive;
    font-size: 32px;
    color: #1A1A2E;
    margin: 0 0 15px;
  }
  
  .intro-text {
    color: #666;
    font-size: 16px;
    margin: 0;
  }
  
  /* 筛选标签 */
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;
  }
  
  .filter-tag {
    background: white;
    border: none;
    color: #666;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .filter-tag.active {
    background: #E94560;
    color: white;
  }
  
  .filter-tag:not(.active):hover {
    background: rgba(233, 69, 96, 0.1);
  }
  
  /* 照片网格 */
  .photo-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  @media (min-width: 768px) {
    .photo-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .photo-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  /* 无照片提示 */
  .no-photos {
    text-align: center;
    padding: 50px 0;
    color: #aaa;
  }
  
  .no-photos i {
    font-size: 60px;
    margin-bottom: 15px;
    display: block;
  }
  
  .no-photos p {
    margin: 0;
    font-size: 16px;
  }
  
  /* 页脚样式 */
  .album-footer {
    background: #1A1A2E;
    color: white;
    padding: 30px 0;
    margin-top: 50px;
  }
  
  .footer-quote {
    font-family: 'Dancing Script', cursive;
    font-size: 24px;
    text-align: center;
    margin: 0 0 10px;
  }
  
  .footer-copyright {
    text-align: center;
    color: #aaa;
    font-size: 14px;
    margin: 0;
  }
  
  /* 模态框样式 */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .modal-content {
    background: white;
    border-radius: 8px;
    max-width: 900px;
    width: 100%;
    position: relative;
  }
  
  .modal-close {
    position: absolute;
    top: -30px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  .modal-close:hover {
    color: #E94560;
  }
  
  .modal-image {
    width: 100%;
    max-height: 70vh;
    object-fit: contain;
  }
  
  .modal-info {
    padding: 20px;
  }
  
  .modal-date {
    color: #E94560;
    font-weight: 600;
    margin: 0 0 10px;
  }
  
  .modal-description {
    color: #666;
    margin: 0;
    line-height: 1.6;
  }
  
  /* 添加照片模态框 */
  .add-modal-content {
    max-width: 500px;
    width: 100%;
  }
  
  .add-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .add-modal-title {
    margin: 0;
    font-family: 'Dancing Script', cursive;
    color: #E94560;
    font-size: 22px;
  }
  
  .add-photo-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .form-group label {
    font-size: 14px;
    color: #555;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 14px;
  }
  
  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #E94560;
    box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
  }
  
  .submit-btn {
    background: #E94560;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 12px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  
  .submit-btn:hover {
    background: #d13b54;
  }
  

  </style>
  