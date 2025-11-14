<script setup>
import { ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'

// 过滤器选项
const timeFilter = ref('最近7天')
const moduleFilter = ref('全部模块')

// KPI 数据
const kpiData = ref([
  {
    value: '2,456',
    label: '活跃用户'
  },
  {
    value: '89',
    label: '新增课程'
  },
  {
    value: '1,203',
    label: '提交作业'
  }
])

// 应用过滤器
const applyFilters = () => {
  // 在实际应用中，这里会根据过滤器重新加载数据
  console.log('应用过滤器', {
    timeFilter: timeFilter.value,
    moduleFilter: moduleFilter.value
  })
}
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
          </div>
        </div>
      </header>

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
          <div class="placeholder">折线图占位</div>
        </div>
        <div class="chart">
          <div class="title">用户角色占比</div>
          <div class="placeholder">饼图占位</div>
        </div>
      </section>

      <section class="grid" style="grid-template-columns: 1fr 1fr; margin-top: 24px; gap: 24px;">
        <div class="chart">
          <div class="title">课程访问量 TOP10</div>
          <div class="placeholder">柱状图占位</div>
        </div>
        <div class="chart">
          <div class="title">作业提交趋势</div>
          <div class="placeholder">折线图占位</div>
        </div>
      </section>
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
