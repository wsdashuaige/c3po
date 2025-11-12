<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>社团管理中心</h1>
    </div>
    
    <!-- 数据卡片统计 -->
    <div class="stats-cards">
      <el-card class="stat-card card-gradient-red">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-s-promotion" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">待审核申请</p>
            <p class="stat-value">{{ applicationStats.pending }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-yellow">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-user" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">社团成员</p>
            <p class="stat-value">{{ memberStats.total }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-green">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-tickets" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">待审批活动修改</p>
            <p class="stat-value">{{ activityStats.pending }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-purple">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-date" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">本月活动</p>
            <p class="stat-value">8</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="dashboard-main">
      <!-- 待处理申请 -->
      <el-card class="dashboard-section">
        <div class="section-header">
          <h3>待处理申请</h3>
        </div>
        <div class="pending-applications">
          <div v-if="pendingApplications.length === 0" class="empty-message">
            暂无待处理申请
          </div>
          <template v-else>
            <div v-for="app in pendingApplications.slice(0, 3)" :key="app.id" class="application-item">
              <div class="app-info">
                <p class="app-name">{{ app.applicantName }}申请加入社团</p>
                <p class="app-time">{{ app.applicationTime }}</p>
              </div>
              <div class="app-actions">
                <el-button size="small" type="success" @click="handleApprove(app.id)">同意</el-button>
                <el-button size="small" type="danger" @click="handleReject(app.id)">拒绝</el-button>
              </div>
            </div>
          </template>
        </div>
      </el-card>
      <el-card class="dashboard-section">
        <div class="section-header">
          <h3>快捷操作</h3>
        </div>
        <div class="quick-actions">
          <div class="action-card" @click="navigateTo('activities')">
            <div class="action-icon" style="background: linear-gradient(135deg, #FF6B6B, #FFA500);">
              <el-icon><i-ep-plus /></el-icon>
            </div>
            <div class="action-text">创建活动</div>
          </div>
          <div class="action-card" @click="navigateTo('members')">
            <div class="action-icon" style="background: linear-gradient(135deg, #00C9A7, #FFD166);">
              <el-icon><i-ep-user /></el-icon>
            </div>
            <div class="action-text">管理成员</div>
          </div>
          <div class="action-card" @click="navigateTo('applications')">
            <div class="action-icon" style="background: linear-gradient(135deg, #06D6A0, #118AB2);">
              <el-icon><i-ep-document /></el-icon>
            </div>
            <div class="action-text">查看申请</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useActivitiesStore } from '../stores/activities'
import { useMembersStore } from '../stores/members'
import { useApplicationsStore } from '../stores/applications'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activitiesStore = useActivitiesStore()
const membersStore = useMembersStore()
const applicationsStore = useApplicationsStore()
const authStore = useAuthStore()

// 计算属性
const activityStats = computed(() => activitiesStore.activityStats)
const memberStats = computed(() => membersStore.memberStats)
const applicationStats = computed(() => applicationsStore.applicationStats)
const pendingApplications = computed(() => 
  applicationsStore.getAllApplications().filter(app => app.status === 'pending')
)

// 方法
const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}

const handleApprove = (appId: number) => {
  const processorName = authStore.userInfo?.username || 'admin'
  applicationsStore.processApplication(
    appId, 
    'approve', 
    `已通过审批，审批人：${processorName}`
  )
  ElMessage.success('已批准申请')
}

const handleReject = (appId: number) => {
  const processorName = authStore.userInfo?.username || 'admin'
  applicationsStore.processApplication(
    appId, 
    'reject', 
    `未通过审核，审批人：${processorName}`
  )
  ElMessage.success('已拒绝申请')
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-header h1 {
  margin-bottom: 30px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  height: 100%;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

  .stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  margin-right: 20px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0 0 5px 0;
}

.stat-value {
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.dashboard-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.dashboard-section {
  height: 100%;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  color: #303133;
  margin: 0;
  font-size: 18px;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.application-item:last-child {
  border-bottom: none;
}

.app-name {
  color: #303133;
  margin: 0 0 5px 0;
  font-weight: 500;
}

.app-time {
  color: #909399;
  font-size: 12px;
  margin: 0;
}

.app-actions {
  display: flex;
  gap: 10px;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

@media (max-width: 480px) {
  .quick-actions {
    flex-direction: column;
  }
}

.action-btn {
  padding: 15px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  width: 120px;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 12px;
}

.action-text {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.empty-message {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .application-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .app-actions {
    margin-top: 10px;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>