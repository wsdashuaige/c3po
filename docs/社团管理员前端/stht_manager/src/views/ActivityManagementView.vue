<template>
  <div class="activity-management">
    <div class="header">
      <h1>活动管理</h1>
    </div>
    
    <!-- 活动统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card card-gradient-red">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-document" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">活动总数</p>
            <p class="stat-value">{{ activityStats.total }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-yellow">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-check" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">已审核</p>
            <p class="stat-value">{{ activityStats.approved }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-green">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-time" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">审核中</p>
            <p class="stat-value">{{ activityStats.pending }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-purple">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-user" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">累计参与人数</p>
            <p class="stat-value">156</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="activity-content">
      <!-- 活动列表 -->
      <el-card class="activity-list-card">
        <div class="list-header">
          <div class="search-filters">
            <el-input
              v-model="searchQuery"
              placeholder="搜索活动"
              prefix-icon="el-icon-search"
              class="search-input"
            />
            <el-select
              v-model="statusFilter"
              placeholder="全部状态"
              class="status-filter"
            >
              <el-option label="全部状态" value="all"></el-option>
              <el-option label="草稿" value="draft"></el-option>
              <el-option label="审核中" value="pending"></el-option>
              <el-option label="已通过" value="approved"></el-option>
              <el-option label="已完成" value="completed"></el-option>
            </el-select>
            <el-button type="primary" @click="showCreateActivity = true">+ 添加活动</el-button>
          </div>
        </div>
        <div class="activity-list">
          <template v-if="filteredActivities.length === 0">
            <div class="empty-message">暂无活动数据</div>
          </template>
          <template v-else>
            <div v-for="activity in filteredActivities" :key="activity.id" class="activity-item">
              <div class="activity-info">
                <div class="activity-header">
                  <h4 class="activity-name">{{ activity.name }}</h4>
                  <el-tag 
                    :type="getStatusTagType(activity.status)"
                    size="small"
                  >{{ getStatusText(activity.status) }}</el-tag>
                </div>
                <p class="activity-desc">{{ activity.description }}</p>
                <div class="activity-meta">
                  <span class="meta-item"><el-icon name="el-icon-time" /> {{ activity.startTime }}</span>
                  <span class="meta-item"><el-icon name="el-icon-location" /> {{ activity.location }}</span>
                  <span class="meta-item"><el-icon name="el-icon-user" /> {{ activity.currentParticipants }}/{{ activity.maxParticipants }}</span>
                </div>
              </div>
              <div class="activity-actions">
                <el-button size="small" @click="editActivity(activity.id)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteActivity(activity.id)">删除</el-button>
              </div>
            </div>
          </template>
        </div>
      </el-card>
      <!-- 创建/编辑活动表单 -->
      <el-drawer
        v-model="showCreateActivity"
        title="创建活动"
        size="500px"
        direction="rtl"
      >
        <el-form ref="activityFormRef" :model="activityForm" :rules="activityRules" label-width="100px">
          <el-form-item label="活动名称" prop="name">
            <el-input v-model="activityForm.name" placeholder="请输入活动名称" />
          </el-form-item>
          <el-form-item label="活动描述" prop="description">
            <el-input v-model="activityForm.description" type="textarea" rows="3" placeholder="请输入活动描述" />
          </el-form-item>
          <el-form-item label="活动时间" prop="startTime">
            <el-date-picker
              v-model="activityForm.startTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="activityForm.endTime"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="活动地点" prop="location">
            <el-input v-model="activityForm.location" placeholder="请输入活动地点" />
          </el-form-item>
          <el-form-item label="参与人数" prop="maxParticipants">
            <el-input-number v-model="activityForm.maxParticipants" :min="1" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="activityForm.status"
              placeholder="选择活动状态"
            >
              <el-option label="草稿" value="draft"></el-option>
              <el-option label="提交审核" value="pending"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitActivityForm">保存</el-button>
            <el-button @click="cancelCreateActivity">取消</el-button>
          </el-form-item>
        </el-form>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useActivitiesStore } from '../stores/activities'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Activity } from '../stores/activities'

const activityStore = useActivitiesStore()
const activityFormRef = ref<FormInstance | null>(null)
const showCreateActivity = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const editingActivityId = ref<number | null>(null)

// 活动统计
const activityStats = computed(() => activityStore.activityStats)

// 过滤后的活动列表
const filteredActivities = computed(() => {
  let result = [...activityStore.activities]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(activity => 
      activity.name.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query) ||
      activity.location.toLowerCase().includes(query)
    )
  }
  
  // 状态过滤
  if (statusFilter.value !== 'all') {
    result = result.filter(activity => activity.status === statusFilter.value)
  }
  
  return result
})

// 活动表单
const activityForm = ref({
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  location: '',
  maxParticipants: 30,
  currentParticipants: 0,
  status: 'draft' as Activity['status'],
  createdBy: 'admin'
})

// 表单验证规则
const activityRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 50, message: '活动名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' },
    { min: 5, message: '活动描述不能少于 5 个字符', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择活动开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择活动结束时间', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入活动地点', trigger: 'blur' }
  ],
  maxParticipants: [
    { required: true, message: '请输入最大参与人数', trigger: 'change' },
    { type: 'number', min: 1, message: '最大参与人数至少为 1', trigger: 'change' }
  ]
})

// 方法
const getStatusText = (status: Activity['status']) => {
  const statusMap = {
    draft: '草稿',
    pending: '审核中',
    approved: '已通过',
    completed: '已完成',
    canceled: '已取消'
  }
  return statusMap[status]
}

const getStatusTagType = (status: Activity['status']) => {
  const typeMap = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    completed: 'primary',
    canceled: 'danger'
  }
  return typeMap[status]
}

const resetForm = () => {
  activityForm.value = {
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: 30,
    currentParticipants: 0,
    status: 'draft',
    createdBy: 'admin'
  }
  editingActivityId.value = null
  if (activityFormRef.value) {
    activityFormRef.value.resetFields()
  }
}

const submitActivityForm = async () => {
  if (!activityFormRef.value) return
  
  try {
    await activityFormRef.value.validate()
    
    if (editingActivityId.value) {
      // 修改活动
      const updated = activityStore.updateActivity(editingActivityId.value, activityForm.value)
      if (updated) {
        ElMessage.success('活动更新成功')
        if (activityForm.value.status === 'pending') {
          ElMessage.info('活动变更已提交审核，请等待学校管理员批准')
        }
      }
    } else {
      // 创建活动
      activityStore.createActivity(activityForm.value)
      ElMessage.success('活动创建成功')
      if (activityForm.value.status === 'pending') {
        ElMessage.info('活动已提交审核，请等待学校管理员批准')
      }
    }
    
    cancelCreateActivity()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const cancelCreateActivity = () => {
  showCreateActivity.value = false
  resetForm()
}

const editActivity = (id: number) => {
  const activity = activityStore.getActivityById(id)
  if (activity) {
    activityForm.value = { ...activity }
    editingActivityId.value = id
    showCreateActivity.value = true
  }
}

const deleteActivity = (id: number) => {
  ElMessageBox.confirm('确定要删除这个活动吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const success = activityStore.deleteActivity(id)
    if (success) {
      ElMessage.success('活动已删除')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
</script>

<style scoped>
.activity-management {
  padding: 20px;
}

.header h1 {
  color: #303133;
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

  /* 渐变卡片背景 */
  .card-gradient-red {
    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  }

  .card-gradient-yellow {
    background: linear-gradient(135deg, #ffd166, #fbbf24);
  }

  .card-gradient-green {
    background: linear-gradient(135deg, #06d6a0, #118ab2);
  }

  .card-gradient-purple {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  }

  @media (max-width: 768px) {
    .stats-cards {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 480px) {
    .stats-cards {
      grid-template-columns: 1fr;
    }
  }

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-list-card {
  flex: 1;
}

.list-header {
  margin-bottom: 20px;
}

.search-filters {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.status-filter {
  width: 150px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  transition: all 0.3s;
}

.activity-item:hover {
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-info {
  flex: 1;
  margin-right: 20px;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.activity-name {
  color: #303133;
  margin: 0;
  font-size: 18px;
}

.activity-desc {
  color: #606266;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.activity-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.activity-actions {
  display: flex;
  gap: 10px;
}

.empty-message {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

@media (max-width: 768px) {
  .search-filters {
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
  }
  
  .activity-item {
    flex-direction: column;
  }
  
  .activity-actions {
    margin-top: 15px;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>