<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 统计数据
const statsData = ref({
  totalMembers: 125,
  activeMembers: 89,
  totalActivities: 42,
  pendingApplications: 7,
  approvalRate: '85%'
})

// 最近活动数据
const recentActivities = ref([
  {
    id: 1,
    name: '春季招新活动',
    date: '2024-03-15',
    participants: 68,
    status: 'completed'
  },
  {
    id: 2,
    name: '技术分享会',
    date: '2024-03-20',
    participants: 45,
    status: 'completed'
  },
  {
    id: 3,
    name: '户外团建活动',
    date: '2024-04-05',
    participants: 32,
    status: 'upcoming'
  }
])

// 活动类型分布数据
const activityTypeData = ref([
  { value: 35, name: '技术分享' },
  { value: 25, name: '团建活动' },
  { value: 20, name: '招新活动' },
  { value: 15, name: '竞赛活动' },
  { value: 5, name: '其他' }
])

// 成员增长趋势数据
const memberGrowthData = ref({
  months: ['1月', '2月', '3月', '4月', '5月', '6月'],
  numbers: [23, 35, 42, 38, 52, 68]
})

// 图表引用
let typeChart: echarts.ECharts | null = null
let growthChart: echarts.ECharts | null = null

// 初始化图表
const initCharts = () => {
  // 活动类型分布饼图
  typeChart = echarts.init(document.getElementById('activityTypeChart'))
  typeChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} \n{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '活动类型',
        type: 'pie',
        radius: '60%',
        data: activityTypeData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })

  // 成员增长趋势折线图
  growthChart = echarts.init(document.getElementById('memberGrowthChart'))
  growthChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: memberGrowthData.value.months
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增成员',
        type: 'line',
        smooth: true,
        data: memberGrowthData.value.numbers,
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#1890ff'
        },
        lineStyle: {
          width: 3
        }
      }
    ]
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    typeChart?.resize()
    growthChart?.resize()
  })
}

// 快捷操作
const quickActions = [
  { name: '创建活动', icon: 'el-icon-plus', path: '/activities/create', color: '#1890ff' },
  { name: '管理成员', icon: 'el-icon-user', path: '/members', color: '#52c41a' },
  { name: '审批申请', icon: 'el-icon-check', path: '/applications', color: '#faad14' },
  { name: '发布公告', icon: 'el-icon-bell', path: '/announcements', color: '#f5222d' }
]

// 处理快捷操作点击
const handleQuickAction = (action: { name: string; path: string }) => {
  if (action.path === '/announcements') {
    ElMessage.info('公告功能正在开发中')
  } else {
    // 在实际项目中，这里应该使用router.push(action.path)
    ElMessage.success(`跳转到${action.name}`)
  }
}

// 获取状态标签样式
const getStatusTagClass = (status: string) => {
  return status === 'completed' ? 'el-tag--success' : 'el-tag--primary'
}

// 获取状态文本
const getStatusText = (status: string) => {
  return status === 'completed' ? '已完成' : '即将开始'
}

onMounted(() => {
  initCharts()
})
</script>

<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">管理概览</h1>
      <div class="page-subtitle">欢迎回来，社团管理员！查看您的社团运营数据。</div>
    </div>
    
    <!-- 快捷操作卡片 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6" v-for="action in quickActions" :key="action.name">
        <el-card 
          class="quick-action-card"
          @click="handleQuickAction(action)"
          :style="{ cursor: 'pointer' }"
        >
          <div class="action-content">
            <div class="action-icon"
                 :style="{ background: 'linear-gradient(135deg, #4ade80 0%, #facc15 100%)' }">
              <el-icon :name="action.icon" />
            </div>
            <div class="action-text">{{ action.name }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-primary">
              <el-icon name="el-icon-user" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statsData.totalMembers }}</div>
              <div class="stat-label">总成员数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-success">
              <el-icon name="el-icon-check" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statsData.activeMembers }}</div>
              <div class="stat-label">活跃成员数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-warning">
              <el-icon name="el-icon-calendar" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statsData.totalActivities }}</div>
              <div class="stat-label">活动总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-danger">
              <el-icon name="el-icon-document" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statsData.pendingApplications }}</div>
              <div class="stat-label">待处理申请</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-info">
              <el-icon name="el-icon-goods" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statsData.approvalRate }}</div>
              <div class="stat-label">申请通过率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="card-header">
            <h3 class="card-title">活动类型分布</h3>
          </div>
          <div id="activityTypeChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="card-header">
            <h3 class="card-title">成员增长趋势</h3>
          </div>
          <div id="memberGrowthChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近活动列表 -->
    <el-card class="activity-list-card">
      <div class="card-header">
        <h3 class="card-title">最近活动</h3>
        <el-button type="text" class="view-all-btn">查看全部</el-button>
      </div>
      <el-table :data="recentActivities" class="activity-table">
        <el-table-column prop="name" label="活动名称" width="200">
          <template #default="scope">
            <span class="activity-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="活动日期" width="120"></el-table-column>
        <el-table-column prop="participants" label="参与人数" width="100">
          <template #default="scope">
            <span class="participant-count">{{ scope.row.participants }} 人</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :class="getStatusTagClass(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button type="text" size="small">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #606266;
}

/* 快捷操作卡片 */
.quick-action-card {
  height: 120px;
  transition: all 0.3s;
  overflow: hidden;
}

.quick-action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 16px 8px;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
  transition: all 0.3s ease;
}

.quick-action-card:hover .action-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.4);
}

.action-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-top: 8px;
}

/* 统计卡片 */
.stat-card {
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  margin-right: 20px;
}

.stat-icon-primary {
  background-color: #1890ff;
}

.stat-icon-success {
  background-color: #52c41a;
}

.stat-icon-warning {
  background-color: #faad14;
}

.stat-icon-danger {
  background-color: #f5222d;
}

.stat-icon-info {
  background-color: #13c2c2;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

/* 图表卡片 */
.chart-card {
  height: 400px;
  transition: all 0.3s;
}

.chart-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 20px 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.view-all-btn {
  color: #1890ff;
  font-size: 14px;
}

.chart-container {
  height: calc(100% - 80px);
  width: 100%;
}

/* 最近活动列表 */
.activity-list-card {
  transition: all 0.3s;
}

.activity-list-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.activity-table :deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
}

.activity-name {
  font-weight: 500;
  color: #303133;
}

.participant-count {
  color: #1890ff;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    padding: 15px 0;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .chart-card {
    height: 300px;
  }
  
  .action-content {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  
  .action-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}

.mb-20 {
  margin-bottom: 20px;
}
</style>