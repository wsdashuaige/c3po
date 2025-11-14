<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'

const router = useRouter()

// 统计卡片数据
const statistics = ref([
  {
    label: '总用户数',
    value: '2,456',
    class: 'users'
  },
  {
    label: '教师数量',
    value: '128',
    class: 'teachers'
  },
  {
    label: '课程总数',
    value: '89',
    class: 'courses'
  },
  {
    label: '活跃用户',
    value: '1,892',
    class: 'active'
  }
])

// 最近活动数据
const recentActivities = ref([
  {
    icon: 'user',
    title: '新用户注册',
    time: '张三同学注册了账号 • 5分钟前'
  },
  {
    icon: 'course',
    title: '课程审核通过',
    time: '《人工智能基础》课程已审核通过 • 1小时前'
  },
  {
    icon: 'user',
    title: '教师账号激活',
    time: '李教授账号已激活 • 2小时前'
  },
  {
    icon: 'system',
    title: '系统维护完成',
    time: '数据库优化维护已完成 • 3小时前'
  },
  {
    icon: 'course',
    title: '课程内容更新',
    time: '《数据结构与算法》课程资料已更新 • 1天前'
  }
])

// 待处理任务数据
const pendingTasks = ref([
  {
    icon: '📋',
    title: '用户审核',
    info: '12个新用户待审核',
    actionText: '处理',
    actionClass: 'btn-primary',
    type: 'user-review'
  },
  {
    icon: '📚',
    title: '课程审核',
    info: '5门课程待审核',
    actionText: '审核',
    actionClass: 'btn-primary',
    type: 'course-review'
  },
  {
    icon: '⚠️',
    title: '系统告警',
    info: '3个系统告警需要处理',
    actionText: '查看',
    actionClass: 'btn-warning',
    type: 'system-alert'
  },
  {
    icon: '📊',
    title: '数据备份',
    info: '本周数据备份任务',
    actionText: '备份',
    actionClass: 'btn-secondary',
    type: 'data-backup'
  }
])

// 获取活动图标
const getActivityIcon = (iconType) => {
  const iconMap = {
    user: '👤',
    course: '📚',
    system: '⚙️'
  }
  return iconMap[iconType] || '📝'
}

// 模态框状态
const showModal = ref(false)
const currentTask = ref(null)

// 处理任务
const handleTask = (task) => {
  currentTask.value = task
  showModal.value = true
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
  currentTask.value = null
}

// 获取任务类型的详细内容
const getTaskModalContent = (task) => {
  const contentMap = {
    'user-review': {
      title: '用户审核',
      description: '当前有 12 个新用户等待审核，请前往用户管理页面进行审核操作。',
      confirmText: '前往审核',
      cancelText: '稍后处理'
    },
    'course-review': {
      title: '课程审核',
      description: '当前有 5 门课程等待审核，请前往课程审核页面进行审核操作。',
      confirmText: '前往审核',
      cancelText: '稍后处理'
    },
    'system-alert': {
      title: '系统告警',
      description: '检测到 3 个系统告警需要处理，请及时查看并处理相关问题。',
      confirmText: '查看详情',
      cancelText: '稍后查看'
    },
    'data-backup': {
      title: '数据备份',
      description: '本周数据备份任务，建议立即执行备份操作以确保数据安全。',
      confirmText: '立即备份',
      cancelText: '稍后备份'
    }
  }
  return contentMap[task.type] || {
    title: task.title,
    description: task.info,
    confirmText: '确认',
    cancelText: '取消'
  }
}

// 确认处理任务
const confirmTask = () => {
  if (currentTask.value) {
    // 根据任务类型执行不同的操作
    switch (currentTask.value.type) {
      case 'user-review':
        // 跳转到用户管理页面
        closeModal()
        router.push('/users')
        break
      case 'course-review':
        // 跳转到课程管理页面
        closeModal()
        router.push('/courses')
        break
      case 'system-alert':
        // 实际项目中这里会跳转到系统告警页面
        alert('正在查看系统告警详情...')
        closeModal()
        break
      case 'data-backup':
        // 实际项目中这里会执行备份操作
        alert('正在执行数据备份...')
        closeModal()
        break
      default:
        alert(`正在处理：${currentTask.value.title}`)
        closeModal()
    }
  }
}

// 数字动画效果
onMounted(() => {
  const statNumbers = document.querySelectorAll('.stat-number')
  statNumbers.forEach(stat => {
    const finalValue = stat.textContent
    stat.textContent = '0'
    
    setTimeout(() => {
      let current = 0
      const targetValue = parseInt(finalValue.replace(',', ''))
      const increment = targetValue / 50
      const timer = setInterval(() => {
        current += increment
        if (current >= targetValue) {
          stat.textContent = finalValue
          clearInterval(timer)
        } else {
          stat.textContent = Math.floor(current).toLocaleString()
        }
      }, 30)
    }, 500)
  })
})
</script>

<template>
  <MainLayout>
    <main class="main-content">
      <header class="header">
        <div class="header-content">
          <h1 class="welcome-text">系统管理后台</h1>
          <div class="user-info">
            <div class="user-avatar">管</div>
            <span>系统管理员</span>
          </div>
        </div>
      </header>

      <div class="stats-grid">
        <div 
          v-for="(stat, index) in statistics" 
          :key="index"
          class="stat-card"
        >
          <div class="stat-number" :class="stat.class">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>

      <div class="overview-grid">
        <div class="recent-activities">
          <h3 class="section-title">最近活动</h3>
          <div 
            v-for="(activity, index) in recentActivities" 
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon" :class="activity.icon">
              {{ getActivityIcon(activity.icon) }}
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>

        <div class="pending-tasks">
          <h3 class="section-title">待处理任务</h3>
          <div 
            v-for="(task, index) in pendingTasks" 
            :key="index"
            class="task-item"
          >
            <div class="task-icon">{{ task.icon }}</div>
            <div class="task-content">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-info">{{ task.info }}</div>
            </div>
            <div class="task-actions">
              <button 
                class="btn btn-sm" 
                :class="task.actionClass"
                @click="handleTask(task)"
              >
                {{ task.actionText }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">平台使用统计</h3>
        <div class="chart-placeholder">
          📈 平台使用统计图表
          <br>
          <small>(实际项目中可集成Chart.js等图表库)</small>
        </div>
      </div>
    </main>

    <!-- 任务处理模态框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title" v-if="currentTask">{{ getTaskModalContent(currentTask).title }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body" v-if="currentTask">
          <div class="task-modal-info">
            <div class="task-modal-icon">{{ currentTask.icon }}</div>
            <div class="task-modal-details">
              <h4>{{ currentTask.title }}</h4>
              <p>{{ currentTask.info }}</p>
            </div>
          </div>
          <div class="task-modal-description">
            <p>{{ getTaskModalContent(currentTask).description }}</p>
          </div>
        </div>
        <div class="modal-footer" v-if="currentTask">
          <button class="btn btn-secondary" @click="closeModal">
            {{ getTaskModalContent(currentTask).cancelText }}
          </button>
          <button 
            class="btn" 
            :class="currentTask.actionClass"
            @click="confirmTask"
          >
            {{ getTaskModalContent(currentTask).confirmText }}
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.main-content {
  padding: 24px;
  min-height: 100vh;
}

.header {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ff3b30;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-number.users {
  color: #007aff;
}

.stat-number.teachers {
  color: #5856d6;
}

.stat-number.courses {
  color: #34c759;
}

.stat-number.active {
  color: #ff9500;
}

.stat-label {
  color: #86868b;
  font-size: 14px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 24px;
}

.overview-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.recent-activities {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #d1d1d6;
  gap: 16px;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.activity-icon.user {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.activity-icon.course {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.activity-icon.system {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 14px;
  color: #86868b;
}

.pending-tasks {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #d1d1d6;
  gap: 16px;
}

.task-item:last-child {
  border-bottom: none;
}

.task-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff3b30;
  font-size: 18px;
}

.task-content {
  flex: 1;
}

.task-title {
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.task-info {
  font-size: 14px;
  color: #86868b;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.chart-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 32px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 24px;
  text-align: center;
}

.chart-placeholder {
  height: 300px;
  background: #f2f2f7;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #86868b;
  border: 2px dashed #d1d1d6;
  text-align: center;
}

.chart-placeholder small {
  font-size: 12px;
  margin-top: 8px;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 36px;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
  min-height: 32px;
}

.btn-primary {
  background-color: #007aff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056cc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background-color: #ffffff;
  color: #1d1d1f;
  border: 1px solid #d1d1d6;
}

.btn-secondary:hover {
  background-color: #f2f2f7;
  transform: translateY(-1px);
}

.btn-warning {
  background-color: #ff9500;
  color: white;
}

.btn-warning:hover {
  background-color: #e08a00;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 16px;
  }
}

/* 模态框样式 */
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
  z-index: 2000;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #d1d1d6;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #86868b;
  cursor: pointer;
  padding: 8px;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.modal-close:hover {
  background-color: #f2f2f7;
  color: #1d1d1f;
}

.modal-body {
  padding: 24px;
}

.task-modal-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.task-modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff3b30;
  font-size: 24px;
}

.task-modal-details h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.task-modal-details p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.task-modal-description {
  padding: 16px;
  background: #f2f2f7;
  border-radius: 8px;
}

.task-modal-description p {
  margin: 0;
  color: #1d1d1f;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #d1d1d6;
}
</style>
