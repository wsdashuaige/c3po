<template>
  <div class="member-management">
    <div class="header">
      <h1>成员管理</h1>
    </div>
    
    <!-- 成员统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card card-gradient-green">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-user" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">总成员数</p>
            <p class="stat-value">{{ memberStats.total }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-blue">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-check" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">活跃成员</p>
            <p class="stat-value">{{ memberStats.active }}</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-yellow">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-time" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">待审核成员</p>
            <p class="stat-value">7</p>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card card-gradient-purple">
        <div class="stat-content">
          <div class="stat-icon">
            <el-avatar :size="40" icon="el-icon-attract" style="background: rgba(255,255,255,0.2)" />
          </div>
          <div class="stat-info">
            <p class="stat-label">平均出勤率</p>
            <p class="stat-value">{{ memberStats.averageAttendance }}%</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 成员列表 -->
    <el-card class="member-list-card">
      <div class="list-header">
        <div class="search-filters">
          <el-input
            v-model="searchQuery"
            placeholder="搜索成员（姓名/学号/专业）"
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
            <el-option label="活跃" value="active"></el-option>
            <el-option label="非活跃" value="inactive"></el-option>
            <el-option label="待审核" value="pending"></el-option>
          </el-select>
          <el-button type="primary" @click="showAddMemberDialog = true">添加成员</el-button>
          <el-button type="warning" @click="exportMemberList">导出成员列表</el-button>
        </div>
      </div>
      <div class="member-table-container">
        <el-table
          v-loading="loading"
          :data="paginatedMembers"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="name" label="姓名" width="120">
            <template #default="scope">
              <div class="member-name">
                <el-avatar 
                  size="small" 
                  :src="getAvatarUrl(scope.row.name)" 
                  :alt="scope.row.name"
                  :style="scope.row.role === 'manager' ? { border: '2px solid transparent', background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #4ade80 0%, #facc15 100%) border-box' } : ''"
                />
                <div style="margin-left: 8px;">
                  <span>
                    {{ scope.row.name }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
          <el-table-column prop="major" label="专业" width="150"></el-table-column>
          <el-table-column prop="joinDate" label="加入时间" width="120"></el-table-column>
          <el-table-column prop="attendanceRate" label="出勤率" width="120">
            <template #default="scope">
              <div class="attendance-info">
                <div class="attendance-bar">
                  <div 
                    class="attendance-progress" 
                    :style="{ width: scope.row.attendanceRate + '%' }"
                    :class="getAttendanceClass(scope.row.attendanceRate)"
                  />
                </div>
                <span class="attendance-text">{{ scope.row.attendanceRate }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag 
                :type="getStatusTagType(scope.row.status)"
                size="small"
              >{{ getStatusText(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="scope">
              <div class="operation-buttons">
                <el-button size="small" @click="viewMemberDetail(scope.row.id)">查看详情</el-button>
                <el-button size="small" type="primary" @click="editMember(scope.row.id)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteMember(scope.row.id)">删除</el-button>
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
          :total="filteredMembers.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑成员对话框 -->
    <el-dialog
      v-model="showAddMemberDialog"
      :title="editingMemberId ? '编辑成员' : '添加成员'"
      width="600px"
    >
      <el-form ref="memberFormRef" :model="memberForm" :rules="memberRules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="memberForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="memberForm.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="memberForm.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="加入时间" prop="joinDate">
          <el-date-picker
            v-model="memberForm.joinDate"
            type="date"
            placeholder="选择加入时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="memberForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="memberForm.role"
            placeholder="选择角色"
          >
            <el-option label="普通成员" value="member"></el-option>
            <el-option label="管理员" value="manager"></el-option>
            <el-option label="超级管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="memberForm.status"
            placeholder="选择状态"
          >
            <el-option label="活跃" value="active"></el-option>
            <el-option label="非活跃" value="inactive"></el-option>
            <el-option label="待审核" value="pending"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelAddMember">取消</el-button>
        <el-button type="primary" @click="submitMemberForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMembersStore } from '../stores/members'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Member } from '../stores/members'

const memberStore = useMembersStore()
const memberFormRef = ref<FormInstance | null>(null)
const showAddMemberDialog = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const editingMemberId = ref<number | null>(null)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedMembers = ref<Member[]>([])

// 成员统计
const memberStats = computed(() => memberStore.memberStats)

// 过滤后的成员列表
const filteredMembers = computed(() => {
  let result = memberStore.searchMembers(searchQuery.value)
  
  // 状态过滤
  if (statusFilter.value !== 'all') {
    result = result.filter(member => member.status === statusFilter.value)
  }
  
  return result
})

// 分页后的成员列表
const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMembers.value.slice(start, end)
})

// 成员表单
const memberForm = ref<Omit<Member, 'id'>>({
  name: '',
  studentId: '',
  major: '',
  joinDate: '',
  attendanceRate: 0,
  status: 'pending' as Member['status'],
  role: 'member' as Member['role'],
  phone: '',
  email: ''
})

// 表单验证规则
const memberRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ],
  joinDate: [
    { required: true, message: '请选择加入时间', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    { required: false }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
    { required: false }
  ]
})

// 方法
const getStatusText = (status: Member['status']) => {
  const statusMap = {
    active: '活跃',
    inactive: '非活跃',
    pending: '待审核'
  }
  return statusMap[status]
}

const getStatusTagType = (status: Member['status']) => {
  const typeMap = {
    active: 'success',
    inactive: 'info',
    pending: 'warning'
  }
  return typeMap[status]
}

const getAttendanceClass = (rate: number) => {
  if (rate >= 80) return 'high'
  if (rate >= 60) return 'medium'
  return 'low'
}

const getAvatarUrl = (name: string) => {
  // 使用姓名首字母作为头像，实际项目中可以使用真实头像URL
  return ''
}

const resetForm = () => {
  memberForm.value = {
    name: '',
    studentId: '',
    major: '',
    joinDate: '',
    attendanceRate: 0,
    status: 'pending' as Member['status'],
    role: 'member' as Member['role'],
    phone: '',
    email: ''
  }
  editingMemberId.value = null
  if (memberFormRef.value) {
    memberFormRef.value.resetFields()
  }
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

const handleSelectionChange = (selection: Member[]) => {
  selectedMembers.value = selection
}

const submitMemberForm = async () => {
  if (!memberFormRef.value) return
  
  try {
    await memberFormRef.value.validate()
    
    if (editingMemberId.value) {
      // 修改成员
      const updated = memberStore.updateMember(editingMemberId.value, memberForm.value)
      if (updated) {
        ElMessage.success('成员信息更新成功')
      }
    } else {
      // 添加成员
      memberStore.addMember(memberForm.value)
      ElMessage.success('成员添加成功')
    }
    
    cancelAddMember()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const cancelAddMember = () => {
  showAddMemberDialog.value = false
  resetForm()
}

const editMember = (id: number) => {
  const member = memberStore.getMemberById(id)
  if (member) {
    memberForm.value = { ...member }
    editingMemberId.value = id
    showAddMemberDialog.value = true
  }
}

const viewMemberDetail = (id: number) => {
  const member = memberStore.getMemberById(id)
  if (member) {
    ElMessage.info(`查看成员 ${member.name} 的详细信息功能待实现`)
  }
}

const deleteMember = (id: number) => {
  ElMessageBox.confirm('确定要删除这个成员吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const success = memberStore.removeMember(id)
    if (success) {
      ElMessage.success('成员已删除')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const exportMemberList = () => {
  ElMessage.success('导出成员列表功能待实现')
}

// 初始化数据
onMounted(() => {
  // 可以在这里加载初始数据
})
</script>

<style scoped>
.member-management {
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
  .card-gradient-green {
    background: linear-gradient(135deg, #4ade80, #22c55e);
  }

  .card-gradient-blue {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }

  .card-gradient-yellow {
    background: linear-gradient(135deg, #ffd166, #fbbf24);
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

.member-list-card {
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

.member-table-container {
  margin-bottom: 20px;
}

.member-name {
  display: flex;
  align-items: flex-start;
}

.manager-badge {
  margin-top: 2px;
  font-size: 12px;
  color: white;
  font-weight: 500;
  padding: 3px 8px;
  background: linear-gradient(135deg, #4ade80 0%, #facc15 100%);
  border-radius: 12px;
  display: inline-block;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-left: 6px;
}

.operation-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: nowrap;
  padding: 2px;
}

.operation-buttons .el-button {
  padding: 4px 8px;
  font-size: 12px;
  min-width: 60px;
}

.attendance-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attendance-bar {
  width: 100px;
  height: 8px;
  background-color: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.attendance-progress {
  height: 100%;
  transition: width 0.3s;
}

.attendance-progress.high {
  background-color: #67c23a;
}

.attendance-progress.medium {
  background-color: #e6a23c;
}

.attendance-progress.low {
  background-color: #f56c6c;
}

.attendance-text {
    font-size: 12px;
    color: #606266;
    text-align: center;
  }

  /* 操作按钮样式 */
  /* 操作按钮水平排布 */
  :deep(.el-table-column--fixed-right .cell) {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: nowrap;
    padding: 12px 0;
  }

  :deep(.el-table-column--fixed-right .cell .el-button) {
    margin: 0;
    min-width: 60px;
    padding: 4px 8px;
  }
  
  /* 管理员标识 */
  .manager-badge {
    background: linear-gradient(135deg, #4ade80 0%, #facc15 100%);
    color: white;
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 12px;
    margin-left: 6px;
    font-weight: 500;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }
}
</style>