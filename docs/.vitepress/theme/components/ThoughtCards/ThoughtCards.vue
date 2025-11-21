<template>
    <div class="thought-cards-container">
      <!-- 模块标题 -->
      <div class="thought-section-title">
        <h2>生活思考</h2>
        <p>记录日常中的点滴感悟，那些不经意间的思考与领悟</p>
      </div>
      
      <!-- 思考卡片网格 -->
      <div class="thought-cards-grid">
        <ThoughtCard 
          v-for="(thought, index) in thoughts" 
          :key="index"
          :content="thought.content"
          :date="thought.date"
          :category="thought.category"
          :icon="thought.icon"
          :color="thought.color"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import ThoughtCard from './ThoughtCard.vue';
  
  // 思考卡片数据
  const thoughts = [
    {
      content: "真正的平静不是避开喧嚣，而是在喧嚣中保持内心的安定。学会与自己相处，才能更好地理解世界。",
      date: "2023-10-15",
      category: "感悟",
      icon: "fa-lightbulb-o",
      color: "blue"
    },
    {
      content: "慢下来，才能发现生活中的小美好。一杯热茶，一本好书，一个安静的午后，足矣。",
      date: "2023-10-08",
      category: "生活",
      icon: "fa-leaf",
      color: "green"
    },
    {
      content: "读书不仅是为了获取知识，更是为了遇见不同的自己。每本书都是一扇通往新世界的门。",
      date: "2023-09-28",
      category: "阅读",
      icon: "fa-book",
      color: "purple"
    },
    {
      content: "真正的连接不是时刻相伴，而是即使相隔千里，也能感受到彼此的心意。珍惜那些懂你的人。",
      date: "2023-09-15",
      category: "情感",
      icon: "fa-heart",
      color: "orange"
    }
  ];
  </script>
  
  <style scoped>
  .thought-cards-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  .thought-section-title {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .thought-section-title h2 {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }
  
  .thought-section-title p {
    color: #666;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
  
  .thought-cards-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  /* 响应式布局 */
  @media (min-width: 768px) {
    .thought-cards-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .thought-cards-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  </style>
  