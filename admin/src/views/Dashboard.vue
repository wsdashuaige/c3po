<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import { dashboardService } from '../services'
import * as echarts from 'echarts'

const router = useRouter()

// 响应式数据
const statistics = ref([
  {
    icon: '👥',
    title: '总用户数',
    value: '1,284',
    change: 8.2,
    color: '#0071e3'
  },
  {
    icon: '👨‍🏫',
    title: '教师人数',
    value: '126',
    change: 5.4,
    color: '#5856d6'
  },
  {
    icon: '📚',
    title: '课程总数',
    value: '342',
    change: 12.8,
    color: '#34c759'
  },
  {
    icon: '🎓',
    title: '活跃学生',
    value: '958',
    change: 6.3,
    color: '#ff9500'
  }
])

const recentActivities = ref([
  {
    id: 1,
    user: '张三',
    action: '完成了课程',
    course: '高等数学基础',
    time: '2小时前',
    avatar: '张'
  },
  {
    id: 2,
    user: '李四',
    action: '提交了作业',
    course: '数据结构与算法',
    time: '3小时前',
    avatar: '李'
  },
  {
    id: 3,
    user: '王五',
    action: '创建了课程',
    course: '机器学习入门',
    time: '昨天',
    avatar: '王'
  }
])

const pendingTasks = ref([
  {
    id: 1,
    title: '用户审核',
    due: '今天',
    priority: 'high',
    count: 8
  },
  {
    id: 2,
    title: '课程审核',
    due: '明天',
    priority: 'high',
    count: 12
  },
  {
    id: 3,
    title: '课程更新',
    due: '3天后',
    priority: 'low',
    count: 3
  }
])

const popularCourses = ref([
  {
    id: 1,
    name: 'Python编程基础',
    students: 284,
    progress: 78
  },
  {
    id: 2,
    name: 'Web前端开发',
    students: 236,
    progress: 65
  },
  {
    id: 3,
    name: '数据库原理',
    students: 189,
    progress: 92
  }
])

// 时间范围选择
const timeRange = ref('week')
const timeRanges = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '全年' }
]

// 图表相关数据
const chartData = ref({
  week: {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    values: [65, 78, 92, 88, 95, 75, 82]
  },
  month: {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].slice(0, 6),
    values: [185, 210, 225, 240, 215, 260]
  },
  quarter: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    values: [650, 720, 680, 760]
  },
  year: {
    labels: ['2023', '2024'],
    values: [2850, 3120]
  }
})

// 图表实例引用
const chartRef = ref(null)
const chartInstance = ref(null)

// 切换时间范围
const changeTimeRange = (range) => {
  timeRange.value = range
  updateChart()
}

// 初始化图表
const initChart = () => {
  if (chartRef.value && !chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value)
    updateChart()
    
    // 监听窗口大小变化，自动调整图表大小
    window.addEventListener('resize', handleResize)
  }
}

// 更新图表数据和配置
const updateChart = () => {
  if (!chartInstance.value) return
  
  const data = chartData.value[timeRange.value]
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      textStyle: {
        color: '#333'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.labels,
      axisLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '活跃用户数',
        type: 'line',
        smooth: true,
        data: data.values,
        lineStyle: {
          width: 3,
          color: '#0071e3'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(0, 113, 227, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(0, 113, 227, 0.05)'
            }
          ])
        },
        itemStyle: {
          color: '#0071e3',
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          scale: true,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 113, 227, 0.5)'
          }
        }
      }
    ]
  }
  
  chartInstance.value.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance.value?.resize()
}

// 清理图表实例
const disposeChart = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
    window.removeEventListener('resize', handleResize)
  }
}

// 查看所有活动
const viewAllActivities = () => {
  alert('查看所有活动')
}

// 查看所有任务
const viewAllTasks = () => {
  alert('查看所有任务')
}

// 查看单个任务详情
const viewTaskDetail = (taskId) => {
  // 根据任务ID实现条件跳转，添加待审核状态参数
  if (taskId === 1) {
    // 用户审核跳转到用户管理页面的待审核列
    router.push({ path: '/admin/users', query: { status: 'pending' } })
  } else if (taskId === 2 || taskId === 3) {
    // 课程审核和课程更新都跳转到课程管理页面的待审核列
    router.push({ path: '/admin/courses', query: { status: 'pending' } })
  } else {
    // 其他任务保持原有逻辑
    router.push({ path: `/admin/tasks/${taskId}` })
  }
}

// 查看课程详情
const viewCourseDetail = (courseId) => {
  alert(`查看课程ID: ${courseId} 的详情`)
}

// 页面挂载时执行
onMounted(() => {
  // 这里可以添加数据加载逻辑
  console.log('Dashboard mounted')
  // 初始化图表
  setTimeout(() => {
    initChart()
  }, 100)
})

// 页面卸载时清理
onUnmounted(() => {
  disposeChart()
})
</script>

<template>
  <MainLayout>
    <div class="dashboard">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>欢迎回来</h1>
        <p>这里是你的系统概览，展示平台的关键数据和最新动态</p>
      </div>

      <!-- 统计卡片 -->
      <div class="statistics-grid">
        <div 
          v-for="(stat, index) in statistics" 
          :key="index"
          class="stat-card"
          :style="{ borderLeftColor: stat.color }"
        >
          <div class="stat-icon" :style="{ backgroundColor: `${stat.color}10`, color: stat.color }">
            {{ stat.icon }}
          </div>
          <div class="stat-content">
            <h3>{{ stat.title }}</h3>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-change" :class="stat.change > 0 ? 'positive' : 'negative'">
              {{ stat.change > 0 ? '↑' : '↓' }} {{ Math.abs(stat.change) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="dashboard-content">
        <!-- 信息面板 - 并排放置待办任务和最近活动 -->
        <div class="top-panels">
          <!-- 最近活动 -->
          <div class="panel">
            <div class="panel-header">
              <h3>最近活动</h3>
              <a href="#" class="view-all" @click.prevent="viewAllActivities">查看全部</a>
            </div>
            <div class="activity-list">
              <div 
                v-for="activity in recentActivities" 
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-avatar-placeholder" :style="{ backgroundColor: activity.color || '#0071e3' }">
                  {{ activity.avatar }}
                </div>
                <div class="activity-content">
                  <div class="activity-text">
                    {{ activity.user }} {{ activity.action }} <span class="activity-course">{{ activity.course }}</span>
                  </div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 待办任务 -->
          <div class="panel">
            <div class="panel-header">
              <h3>待办任务</h3>
              <a href="#" class="view-all" @click.prevent="viewAllTasks">查看全部</a>
            </div>
            <div class="tasks-list">
              <div 
                v-for="task in pendingTasks" 
                :key="task.id"
                class="task-item"
              >
                <div class="task-info">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-meta">
                    <span class="task-due">截止: {{ task.due }}</span>
                    <span class="task-priority" :class="`priority-${task.priority}`">
                      {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}优先级
                    </span>
                  </div>
                </div>
                <div class="task-actions">
                  <span class="task-count">{{ task.count }}</span>
                  <button 
                    class="view-task-btn"
                    @click="viewTaskDetail(task.id)"
                    title="查看任务详情"
                  >
                    查看
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图表区域 - 放在下方 -->
        <div class="chart-section">
          <div class="section-header">
            <h2>平台活跃度趋势</h2>
            <div class="chart-controls">
              <button 
                v-for="range in timeRanges" 
                :key="range.value"
                class="control-btn active"
                @click="changeTimeRange(range.value)"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
          <div class="chart-container">
            <div 
              ref="chartRef" 
              class="chart"
              style="width: 100%; height: 300px;"
            ></div>
          </div>
        </div>
      </div>

      <!-- 热门课程 -->
      <div class="popular-courses">
        <div class="panel-header">
          <h3>热门课程</h3>
          <a href="#" class="view-all">查看全部</a>
        </div>
        <div class="courses-list">
          <div 
            v-for="course in popularCourses" 
            :key="course.id"
            class="course-item"
            @click="viewCourseDetail(course.id)"
          >
            <div class="course-icon">📚</div>
            <div class="course-info">
              <h4>{{ course.name }}</h4>
              <div class="course-stats">
                <span>👥 {{ course.students }} 人学习</span>
                <span>📈 进度 {{ course.progress }}%</span>
              </div>
            </div>
            <div class="course-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${course.progress}%` }"></div>
              </div>
              <span class="progress-text">{{ course.progress }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: #86868b;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #0071e3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 32px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-content h3 {
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 14px;
  font-weight: 500;
}

.stat-change.positive {
  color: #34c759;
}

.stat-change.negative {
  color: #ff3b30;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.top-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.chart-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-top: 0;
  }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  padding: 6px 16px;
  border: 1px solid #d2d2d7;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn.active {
    background: #0071e3;
    color: #fff;
    border-color: #0071e3;
    opacity: 1;
  }

  /* 所有按钮默认都是激活状态 */
  .control-btn {
    background: #0071e3;
    color: #fff;
    border-color: #0071e3;
  }

.control-btn:hover:not(.active) {
  background: #f5f5f7;
}

.chart-container {
  height: 300px;
  border-radius: 8px;
  background: #ffffff;
}

.chart {
  width: 100%;
  height: 100%;
}

.info-panels {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.view-all {
  font-size: 14px;
  color: #0071e3;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-avatar,
.activity-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0071e3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;
  flex-shrink: 0;
}

.activity-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  line-height: 1.4;
  color: #1d1d1f;
}

.activity-course {
  color: #0071e3;
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f7;
  border-radius: 8px;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.task-due {
  font-size: 12px;
  color: #86868b;
}

.task-priority {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
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

.task-count {
  background: #0071e3;
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  min-width: 28px;
  text-align: center;
  margin-right: 8px;
}

.task-actions {
  display: flex;
  align-items: center;
}

.view-task-btn {
  background: #34c759;
  color: #fff;
  border: none;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.view-task-btn:hover {
  background: #30b755;
}

.popular-courses {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.course-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f5f5f7;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.course-item:hover {
  background: #f2f2f7;
}

.course-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.course-info {
  flex: 1;
}

.course-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.course-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #86868b;
}

.course-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 100px;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: #d2d2d7;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #0071e3;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: #0071e3;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .course-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .course-progress {
    width: 100%;
    align-items: stretch;
  }
  
  .progress-bar {
    width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>