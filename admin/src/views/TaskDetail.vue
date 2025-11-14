<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import { dashboardService } from '../services'

const route = useRoute()
const router = useRouter()

// 获取任务ID
const taskId = parseInt(route.params.id)

// 任务数据
const task = ref({
  id: taskId,
  title: '',
  description: '',
  due: '',
  priority: '',
  status: 'pending',
  count: 0,
  items: []
})

// 加载状态
const loading = ref(true)

// 加载任务详情
const loadTaskDetail = () => {
  loading.value = true
  try {
    // 在实际应用中，这里应该调用API获取任务详情
    // 这里使用模拟数据
    const mockTaskData = {
      1: {
        id: 1,
        title: '用户审核',
        description: '需要审核新注册的用户信息，确保资料完整且符合平台要求。',
        due: '今天',
        priority: 'high',
        status: 'pending',
        count: 8,
        items: [
          { id: 101, name: '张三 - 学生注册', status: 'pending' },
          { id: 102, name: '李四 - 教师注册', status: 'pending' },
          { id: 103, name: '王五 - 学生注册', status: 'pending' },
          { id: 104, name: '赵六 - 学生注册', status: 'pending' },
          { id: 105, name: '钱七 - 教师注册', status: 'pending' },
          { id: 106, name: '孙八 - 学生注册', status: 'pending' },
          { id: 107, name: '周九 - 学生注册', status: 'pending' },
          { id: 108, name: '吴十 - 学生注册', status: 'pending' }
        ]
      },
      2: {
        id: 2,
        title: '作业批改',
        description: '批改学生提交的作业，给出评分和反馈意见。',
        due: '明天',
        priority: 'medium',
        status: 'pending',
        count: 15,
        items: [
          { id: 201, name: '数据结构作业 #1', status: 'pending' },
          { id: 202, name: '算法设计作业 #2', status: 'pending' },
          // ... 更多作业项
        ]
      },
      3: {
        id: 3,
        title: '课程更新',
        description: '更新现有课程内容，添加新的学习资料和实践项目。',
        due: '3天后',
        priority: 'low',
        status: 'pending',
        count: 3,
        items: [
          { id: 301, name: 'Python基础课程', status: 'pending' },
          { id: 302, name: 'Web前端开发', status: 'pending' },
          { id: 303, name: '数据库原理', status: 'pending' }
        ]
      }
    }

    // 获取对应的任务数据，如果不存在则使用默认数据
    task.value = mockTaskData[taskId] || {
      id: taskId,
      title: '未知任务',
      description: '无法获取任务详情',
      due: '未知',
      priority: 'medium',
      status: 'unknown',
      count: 0,
      items: []
    }
  } catch (error) {
    console.error('加载任务详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 返回仪表盘
const goBack = () => {
  router.push('/dashboard')
}

// 页面挂载时加载数据
onMounted(() => {
  loadTaskDetail()
})
</script>

<template>
  <MainLayout>
    <div class="task-detail">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>{{ task.title }}</h1>
        <button class="back-btn" @click="goBack">返回仪表盘</button>
      </div>

      <!-- 任务详情卡片 -->
      <div class="task-card">
        <div class="task-header">
          <span class="task-id">任务ID: {{ task.id }}</span>
          <span 
            class="task-priority" 
            :class="`priority-${task.priority}`"
          >
            {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}优先级
          </span>
        </div>
        
        <div class="task-info">
          <div class="info-item">
            <label>截止时间:</label>
            <span>{{ task.due }}</span>
          </div>
          <div class="info-item">
            <label>任务数量:</label>
            <span>{{ task.count }} 项</span>
          </div>
          <div class="info-item">
            <label>状态:</label>
            <span :class="`status-${task.status}`">
              {{ task.status === 'pending' ? '待处理' : task.status === 'in_progress' ? '进行中' : task.status === 'completed' ? '已完成' : '未知' }}
            </span>
          </div>
        </div>

        <div class="task-description">
          <h3>任务描述</h3>
          <p>{{ task.description }}</p>
        </div>

        <div class="task-items">
          <h3>任务清单</h3>
          <div v-if="task.items.length > 0" class="items-list">
            <div 
              v-for="item in task.items" 
              :key="item.id"
              class="item-row"
            >
              <div class="item-info">
                <span class="item-id">#{{ item.id }}</span>
                <span class="item-name">{{ item.name }}</span>
              </div>
              <span 
                class="item-status" 
                :class="`status-${item.status}`"
              >
                {{ item.status === 'pending' ? '待处理' : item.status === 'completed' ? '已完成' : '未知' }}
              </span>
            </div>
          </div>
          <div v-else class="no-items">
            暂无任务项
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.task-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.back-btn {
  background: #0071e3;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background: #0066cc;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.task-id {
  font-size: 14px;
  color: #86868b;
}

.task-priority {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
}

.priority-high {
  background: #ffebee;
  color: #c62828;
}

.priority-medium {
  background: #fff3e0;
  color: #ef6c00;
}

.priority-low {
  background: #e8f5e9;
  color: #2e7d32;
}

.task-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  color: #86868b;
  min-width: 80px;
}

.info-item span {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.status-pending {
  color: #ff9500;
}

.status-in_progress {
  color: #0071e3;
}

.status-completed {
  color: #34c759;
}

.status-unknown {
  color: #86868b;
}

.task-description {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.task-description h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.task-description p {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.task-items h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 16px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f7;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.item-row:hover {
  background: #f2f2f7;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-id {
  font-size: 12px;
  color: #86868b;
  font-family: 'Monaco', 'Menlo', monospace;
}

.item-name {
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
}

.item-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.item-status.status-pending {
  background: #fff3e0;
}

.item-status.status-completed {
  background: #e8f5e9;
}

.no-items {
  text-align: center;
  padding: 40px 20px;
  color: #86868b;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .task-info {
    grid-template-columns: 1fr;
  }
  
  .item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>