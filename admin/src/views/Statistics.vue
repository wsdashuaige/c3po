<script setup>
import { ref, onMounted, computed } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { dashboardAPI, userAPI, courseAPI } from '../services/api'

// 注册必要的组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

// 过滤器选项
const timeFilter = ref('最近7天')
const moduleFilter = ref('全部模块')
const loading = ref(false)
const error = ref(null)

// KPI 数据
const kpiData = ref([])
const dashboardData = ref({})

// 图表数据
const userGrowthData = {
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  },
  yAxis: {
    type: 'value'
  },
  tooltip: {
    trigger: 'axis'
  },
  series: [
    {
      data: [120, 200, 150, 300, 280, 400, 420, 500, 580, 650, 700, 780],
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#5856d6'
      },
      areaStyle: {
        color: 'rgba(88, 86, 214, 0.1)'
      }
    }
  ]
}

const userRoleData = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      data: [
        { value: 4500, name: '学生' },
        { value: 800, name: '教师' },
        { value: 200, name: '管理员' },
        { value: 500, name: '访客' }
      ],
      type: 'pie',
      radius: '70%',
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}

const courseVisitData = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: ['高等数学', '线性代数', '程序设计', '数据结构', '数据库', '计算机网络', '操作系统', '软件工程', '人工智能', '机器学习']
  },
  series: [
    {
      data: [3200, 2800, 2600, 2400, 2200, 2000, 1800, 1600, 1400, 1200],
      type: 'bar',
      itemStyle: {
        color: function(params) {
          const colors = ['#5856d6', '#007aff', '#34c759', '#ff9500', '#ff3b30', '#5ac8fa', '#ffcc00', '#af52de', '#ff2d55', '#00c7be']
          return colors[params.dataIndex]
        }
      }
    }
  ]
}

const homeworkTrendData = {
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  tooltip: {
    trigger: 'axis'
  },
  series: [
    {
      data: [120, 190, 130, 150, 220, 290, 260],
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#34c759'
      },
      areaStyle: {
        color: 'rgba(52, 199, 89, 0.1)'
      }
    }
  ]
}

// 应用过滤器
const applyFilters = () => {
  loadDashboardData()
}

// 导出统计数据
const exportStatistics = () => {
  try {
    const dataToExport = [
      {
        '指标': '活跃用户',
        '数值': kpiData.value[0]?.value || '0'
      },
      {
        '指标': '新增课程（30天）',
        '数值': kpiData.value[1]?.value || '0'
      },
      {
        '指标': '已发布课程',
        '数值': kpiData.value[2]?.value || '0'
      },
      {
        '指标': '总用户数',
        '数值': dashboardData.value?.totalUsers || '0'
      },
      {
        '指标': '学生数',
        '数值': dashboardData.value?.studentCount || '0'
      },
      {
        '指标': '教师数',
        '数值': dashboardData.value?.teacherCount || '0'
      },
      {
        '指标': '管理员数',
        '数值': dashboardData.value?.adminCount || '0'
      },
      {
        '指标': '总课程数',
        '数值': dashboardData.value?.totalCourses || '0'
      }
    ]
    
    const csvContent = convertToCSV(dataToExport)
    downloadCSV(csvContent, '统计数据.csv')
  } catch (err) {
    alert('导出失败，请重试')
    console.error('导出统计数据失败:', err)
  }
}

// 转换为CSV格式
const convertToCSV = (data) => {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

// 下载CSV文件
const downloadCSV = (content, filename) => {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    const url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content)
    window.open(url)
  }
}

// 加载统计数据
const loadDashboardData = async () => {
  loading.value = true
  error.value = null
  try {
    // 获取用户列表（用于统计用户数据）
    const usersResponse = await userAPI.getUsers({ page: 1, pageSize: 1000 })
    const users = Array.isArray(usersResponse?.data) ? usersResponse.data : []
    const totalUsers = usersResponse?.meta?.total || users.length
    
    // 获取课程列表（用于统计课程数据）
    const coursesResponse = await courseAPI.getCourses({ page: 1, pageSize: 1000 })
    const courses = Array.isArray(coursesResponse?.data) ? coursesResponse.data : []
    const totalCourses = coursesResponse?.meta?.total || courses.length
    
    // 统计活跃用户（状态为 ACTIVE 的用户）
    const activeUsers = users.filter(u => u.status === 'ACTIVE').length
    
    // 统计各角色用户数量
    const studentCount = users.filter(u => u.role === 'STUDENT').length
    const teacherCount = users.filter(u => u.role === 'TEACHER').length
    const adminCount = users.filter(u => u.role === 'ADMIN').length
    
    // 统计最近创建的课程（最近30天）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentCourses = courses.filter(c => {
      if (!c.createdAt) return false
      const createdDate = new Date(c.createdAt)
      return createdDate >= thirtyDaysAgo
    }).length
    
    // 统计已发布的课程
    const publishedCourses = courses.filter(c => c.status === 'PUBLISHED').length
    
    // 更新KPI数据（使用实际统计数据）
    kpiData.value = [
      {
        value: formatNumber(activeUsers),
        label: '活跃用户'
      },
      {
        value: formatNumber(recentCourses),
        label: '新增课程（30天）'
      },
      {
        value: formatNumber(publishedCourses),
        label: '已发布课程'
      }
    ]
    
    // 更新图表数据
    updateChartData({
      totalUsers,
      activeUsers,
      studentCount,
      teacherCount,
      adminCount,
      totalCourses,
      publishedCourses,
      courses
    })
    
    dashboardData.value = {
      totalUsers,
      activeUsers,
      studentCount,
      teacherCount,
      adminCount,
      totalCourses,
      publishedCourses,
      courses
    }
  } catch (err) {
    error.value = '加载统计数据失败'
    console.error('加载统计数据失败:', err)
    // 使用默认数据
    setDefaultData()
  } finally {
    loading.value = false
  }
}

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 更新图表数据
const updateChartData = (data) => {
  // 用户角色分布饼图
  if (data?.studentCount !== undefined) {
    userRoleData.series[0].data = [
      { value: data.studentCount || 0, name: '学生' },
      { value: data.teacherCount || 0, name: '教师' },
      { value: data.adminCount || 0, name: '管理员' }
    ]
  }
  
  // 课程访问量 TOP10（使用课程名称和选课人数）
  if (data?.courses && Array.isArray(data.courses)) {
    const topCourses = data.courses
      .filter(c => c.metrics?.enrolledCount > 0)
      .sort((a, b) => (b.metrics?.enrolledCount || 0) - (a.metrics?.enrolledCount || 0))
      .slice(0, 10)
    
    if (topCourses.length > 0) {
      courseVisitData.yAxis.data = topCourses.map(c => c.name || '未命名课程')
      courseVisitData.series[0].data = topCourses.map(c => c.metrics?.enrolledCount || 0)
    } else {
      // 如果没有选课数据，显示所有课程
      const allCourses = data.courses.slice(0, 10)
      courseVisitData.yAxis.data = allCourses.map(c => c.name || '未命名课程')
      courseVisitData.series[0].data = allCourses.map(() => 0)
    }
  }
  
  // 用户增长趋势（暂时使用模拟数据，因为后端没有提供时间序列数据）
  // 可以后续根据实际需求从后端获取
  
  // 作业提交趋势（暂时使用模拟数据，因为后端没有提供时间序列数据）
  // 可以后续根据实际需求从后端获取
}

// 设置默认数据
const setDefaultData = () => {
  kpiData.value = [
    { value: '2,456', label: '活跃用户' },
    { value: '89', label: '新增课程' },
    { value: '1,203', label: '提交作业' }
  ]
  
  // 图表使用默认数据
  userGrowthData.series[0].data = [120, 200, 150, 300, 280, 400, 420, 500, 580, 650, 700, 780]
  userRoleData.series[0].data = [
    { value: 4500, name: '学生' },
    { value: 800, name: '教师' },
    { value: 200, name: '管理员' },
    { value: 500, name: '访客' }
  ]
  courseVisitData.series[0].data = [3200, 2800, 2600, 2400, 2200, 2000, 1800, 1600, 1400, 1200]
  homeworkTrendData.series[0].data = [120, 190, 130, 150, 220, 290, 260]
}

// 组件挂载时加载数据
onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <MainLayout>
    <main class="main-content">
      <header class="header">
        <div class="header-content">
          <h1>数据统计</h1>
          <div class="filters">
            <select class="form-input form-select" v-model="timeFilter">
              <option>最近7天</option>
              <option>最近30天</option>
              <option>最近90天</option>
            </select>
            <select class="form-input form-select" v-model="moduleFilter">
              <option>全部模块</option>
              <option>用户</option>
              <option>课程</option>
              <option>作业</option>
            </select>
            <button class="btn btn-primary" @click="applyFilters">应用</button>
            <button class="btn btn-secondary" @click="exportStatistics" :disabled="loading || kpiData.length === 0">导出数据</button>
          </div>
        </div>
      </header>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载统计数据...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" @click="loadDashboardData">重新加载</button>
      </div>
      
      <!-- 数据内容 -->
      <div v-else>
        <section class="grid-3">
          <div 
            v-for="(kpi, index) in kpiData" 
            :key="index"
            class="card kpi"
          >
            <div class="value">{{ kpi.value }}</div>
            <div class="label">{{ kpi.label }}</div>
          </div>
        </section>

      <section class="grid" style="grid-template-columns: 2fr 1fr; margin-top: 32px; gap: 24px;">
        <div class="chart">
          <div class="title">用户增长趋势</div>
          <v-chart class="chart-container" :option="userGrowthData" autoresize />
        </div>
        <div class="chart">
          <div class="title">用户角色占比</div>
          <v-chart class="chart-container" :option="userRoleData" autoresize />
        </div>
      </section>

      <section class="grid" style="grid-template-columns: 1fr 1fr; margin-top: 24px; gap: 24px;">
        <div class="chart">
          <div class="title">课程访问量 TOP10</div>
          <v-chart class="chart-container" :option="courseVisitData" autoresize />
        </div>
        <div class="chart">
          <div class="title">作业提交趋势</div>
          <v-chart class="chart-container" :option="homeworkTrendData" autoresize />
        </div>
    </section>
      </div>
    </main>
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

.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d1d6;
  border-radius: 12px;
  font-size: 16px;
  background-color: #ffffff;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  gap: 8px;
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

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid #d1d1d6;
}

.kpi {
  text-align: center;
}

.kpi .value {
  font-size: 32px;
  font-weight: 700;
  color: #5856d6;
  margin-bottom: 8px;
}

.kpi .label {
  color: #86868b;
  font-size: 14px;
}

.grid {
  display: grid;
}

.chart {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #d1d1d6;
}

.chart .title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #1d1d1f;
  font-size: 16px;
}

.chart .placeholder {
    height: 280px;
    border: 2px dashed #d1d1d6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #86868b;
    font-size: 14px;
  }

  .chart-container {
    height: 280px;
    width: 100%;
  }

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #86868b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 40px;
}

.error-message {
  color: #ff3b30;
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filters {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .grid-3 {
    grid-template-columns: 1fr;
  }

  .grid[style*="grid-template-columns: 2fr 1fr"] {
    grid-template-columns: 1fr !important;
  }

  .grid[style*="grid-template-columns: 1fr 1fr"] {
    grid-template-columns: 1fr !important;
  }
}
</style>
