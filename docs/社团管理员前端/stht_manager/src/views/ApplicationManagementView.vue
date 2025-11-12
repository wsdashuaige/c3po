<template>
  <div class="application-management">
    <div class="header">
      <h1>申请管理</h1>
    </div>
    
    <!-- 申请统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card card-gradient-blue">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="32" icon="el-icon-document" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">全部申请</p>
            <p class="stat-value">{{ applicationStats.total }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-yellow">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="32" icon="el-icon-time" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">待处理申请</p>
            <p class="stat-value">{{ applicationStats.pending }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-green">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="32" icon="el-icon-check" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">已批准申请</p>
            <p class="stat-value">{{ applicationStats.approved }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-red">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="32" icon="el-icon-close" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">已拒绝申请</p>
            <p class="stat-value">{{ applicationStats.rejected }}</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 申请列表 -->
    <el-card class="application-list-card">
      <div class="list-header">
        <div class="search-filters">
          <el-input
            v-model="searchQuery"
            placeholder="搜索申请（申请人/活动名称）"
            prefix-icon="el-icon-search"
            class="search-input"
            @input="handleSearch"
          />
          <el-select
            v-model="statusFilter"
            placeholder="全部状态"
            class="status-filter"
            @change="handleFilterChange"
          >
            <el-option label="全部状态" value="all"></el-option>
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="已批准" value="approved"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
          </el-select>
          <el-button type="primary" @click="refreshApplications" style="background: linear-gradient(135deg, #00C9A7, #FFD166); border: none;">刷新列表</el-button>
            <el-button type="warning" @click="exportApplicationList" style="background: linear-gradient(135deg, #FFD166, #FFA500); border: none;">导出申请记录</el-button>
        </div>
      </div>
      <div class="application-table-container">
        <el-table
          v-loading="loading"
          :data="paginatedApplications"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          row-key="id"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="申请ID" width="80"></el-table-column>
          <el-table-column prop="applicantName" label="申请人" width="120">
            <template #default="scope">
              <div class="applicant-name">
                <el-avatar size="small" :src="getAvatarUrl(scope.row.applicantName)" :alt="scope.row.applicantName" />
                <span style="margin-left: 8px">{{ scope.row.applicantName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="applicantId" label="申请人学号" width="120"></el-table-column>
          <el-table-column prop="eventName" label="活动名称" min-width="180">
            <template #default="scope">
              <div class="event-info">
                <span class="event-name">{{ scope.row.eventName }}</span>
                <div class="event-time">
                  {{ formatDate(scope.row.eventDate) }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="applicationTime" label="申请时间" width="140">
            <template #default="scope">
              <div style="text-align: left; padding-left: 8px;">
                {{ formatDateTime(scope.row.applicationTime) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag 
                :class="['status-tag', getStatusTagClass(scope.row.status)]"
                size="small"
              >{{ getStatusText(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <div class="operation-buttons">
                <el-button size="small" @click="viewApplicationDetail(scope.row.id)">查看详情</el-button>
                <template v-if="scope.row.status === 'pending'">
                  <el-button size="small" type="primary" @click="approveApplication(scope.row.id)" style="background: linear-gradient(135deg, #06D6A0, #118AB2); border: none;">批准</el-button>
                  <el-button size="small" type="danger" @click="rejectApplication(scope.row.id)" style="background: linear-gradient(135deg, #FF6B6B, #8338EC); border: none;">拒绝</el-button>
                </template>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredApplications.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 申请详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="申请详情"
      width="600px"
    >
      <div v-if="currentApplication" class="application-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="申请ID">{{ currentApplication.id }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentApplication.applicantName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentApplication.applicantId }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentApplication.contactInfo }}</el-descriptions-item>
          <el-descriptions-item label="活动名称">{{ currentApplication.eventName }}</el-descriptions-item>
          <el-descriptions-item label="活动日期">{{ formatDate(currentApplication.eventDate) }}</el-descriptions-item>
          <el-descriptions-item label="活动地点">{{ currentApplication.location }}</el-descriptions-item>
          <el-descriptions-item label="申请原因">{{ currentApplication.reason }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDateTime(currentApplication.applicationTime) }}</el-descriptions-item>
          <el-descriptions-item label="状态" v-if="currentApplication.status !== 'pending'">
            <el-tag :type="getStatusTagType(currentApplication.status)" size="small">
              {{ getStatusText(currentApplication.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理时间" v-if="currentApplication.processTime">
            {{ formatDateTime(currentApplication.processTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="处理人" v-if="currentApplication.processorName">
            {{ currentApplication.processorName }}
          </el-descriptions-item>
          <el-descriptions-item label="处理意见" v-if="currentApplication.processComment">
            {{ currentApplication.processComment }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <template v-if="currentApplication && currentApplication.status === 'pending'">
          <el-button type="primary" @click="approveApplication(currentApplication.id)">批准</el-button>
          <el-button type="danger" @click="rejectApplication(currentApplication.id)">拒绝</el-button>
        </template>
      </template>
    </el-dialog>
    
    <!-- 处理申请对话框 -->
    <el-dialog
      v-model="showProcessDialog"
      :title="processAction === 'approve' ? '批准申请' : '拒绝申请'"
      width="400px"
    >
      <el-form :model="processForm">
        <el-form-item label="处理意见" :label-width="80">
          <el-input
            v-model="processForm.comment"
            type="textarea"
            placeholder="请输入处理意见"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProcessDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitProcessForm"
          :loading="processing"
        >
          {{ processAction === 'approve' ? '确认批准' : '确认拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApplicationsStore } from '../stores/applications'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Application } from '../stores/applications'

const applicationStore = useApplicationsStore()
const searchQuery = ref('')
const statusFilter = ref('all')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedApplications = ref<Application[]>([])
const showDetailDialog = ref(false)
const showProcessDialog = ref(false)
const processAction = ref<'approve' | 'reject'>('approve')
const processingApplicationId = ref<number | null>(null)
const processing = ref(false)

const currentApplication = ref<Application | null>(null)
const processForm = ref({
  comment: ''
})

// 申请统计
const applicationStats = computed(() => applicationStore.applicationStats)

// 过滤后的申请列表
const filteredApplications = computed(() => {
  let result = applicationStore.searchApplications(searchQuery.value)
  
  // 状态过滤
  if (statusFilter.value !== 'all') {
    result = result.filter(app => app.status === statusFilter.value)
  }
  
  return result
})

// 分页后的申请列表
const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredApplications.value.slice(start, end)
})

// 方法
const getStatusText = (status: Application['status']) => {
  const statusMap = {
    pending: '待处理',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return statusMap[status]
}

const getStatusTagType = (status: Application['status']) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status]
}

// 添加getStatusTagClass方法，用于返回状态标签的CSS类名
const getStatusTagClass = (status: Application['status']) => {
  return getStatusTagType(status)
}

const getAvatarUrl = (name: string) => {
  // 使用姓名首字母作为头像，实际项目中可以使用真实头像URL
  return ''
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

const handleSelectionChange = (selection: Application[]) => {
  selectedApplications.value = selection
}

const refreshApplications = async () => {
  loading.value = true
  try {
    // 在实际项目中，这里应该重新从后端获取数据
    // 模拟异步加载
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('申请列表已刷新')
  } catch (error) {
    ElMessage.error('刷新失败，请重试')
  } finally {
    loading.value = false
  }
}

const viewApplicationDetail = (id: number) => {
  const application = applicationStore.getApplicationById(id)
  if (application) {
    currentApplication.value = application
    showDetailDialog.value = true
  }
}

const approveApplication = (id: number) => {
  processingApplicationId.value = id
  processAction.value = 'approve'
  processForm.value.comment = ''
  showProcessDialog.value = true
}

const rejectApplication = (id: number) => {
  processingApplicationId.value = id
  processAction.value = 'reject'
  processForm.value.comment = ''
  showProcessDialog.value = true
}

const submitProcessForm = async () => {
  if (!processingApplicationId.value) return
  
  processing.value = true
  try {
    // 模拟异步处理
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const success = applicationStore.processApplication(
      processingApplicationId.value,
      processAction.value,
      processForm.value.comment
    )
    
    if (success) {
      ElMessage.success(
        processAction.value === 'approve' ? '申请已批准' : '申请已拒绝'
      )
      
      // 关闭对话框
      showProcessDialog.value = false
      if (showDetailDialog.value) {
        showDetailDialog.value = false
      }
    } else {
      ElMessage.error('处理失败，请重试')
    }
  } catch (error) {
    ElMessage.error('处理过程中出错')
  } finally {
    processing.value = false
    processingApplicationId.value = null
  }
}

const exportApplicationList = () => {
  ElMessage.success('导出申请记录功能待实现')
}

// 初始化数据
onMounted(() => {
  // 可以在这里加载初始数据
})
</script>

<style scoped>
.application-management {
  padding: 20px;
}

.header h1 {
  margin-bottom: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  margin-right: 15px;
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

.application-list-card {
  margin-bottom: 20px;
}

.list-header {
  margin-bottom: 20px;
}

.search-filters {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.status-filter {
  width: 150px;
}

.application-table-container {
  margin-bottom: 20px;
}

.applicant-name {
  display: flex;
  align-items: center;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-name {
  color: #303133;
  font-weight: 500;
}

.event-time {
  color: #606266;
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-wrap: nowrap;
}

.operation-buttons .el-button {
  margin: 0;
  padding: 4px 8px;
  font-size: 12px;
  min-width: 60px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  :deep(.el-table) {
    font-size: 13px;
  }
}

.application-detail {
    padding: 10px 0;
  }

  /* 操作按钮样式 */
  :deep(.el-table-column--fixed-right .cell) {
    display: flex;
    gap: 8px;
    justify-content: space-around;
  }

  :deep(.el-table-column--fixed-right .cell .el-button) {
    flex: 1;
    margin: 0;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-table-column--fixed-right .cell .el-button:hover) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
  
  /* 状态标签样式 */
  :deep(.status-tag) {
    border: none;
    padding: 2px 8px;
  }
  
  :deep(.status-tag.warning) {
    background: linear-gradient(135deg, #FFD166, #FFA500);
    color: white;
  }
  
  :deep(.status-tag.success) {
    background: linear-gradient(135deg, #06D6A0, #118AB2);
    color: white;
  }
  
  :deep(.status-tag.danger) {
    background: linear-gradient(135deg, #FF6B6B, #8338EC);
    color: white;
  }

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }
}
</style>