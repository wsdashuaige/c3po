<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 成员列表数据
const members = ref([
  {
    id: 1,
    name: '张三',
    studentId: '20210001',
    grade: '2021级',
    major: '计算机科学与技术',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    role: 'admin',
    joinDate: '2021-09-01',
    status: 'active'
  },
  {
    id: 2,
    name: '李四',
    studentId: '20210002',
    grade: '2021级',
    major: '软件工程',
    phone: '13800138002',
    email: 'lisi@example.com',
    role: 'member',
    joinDate: '2021-09-01',
    status: 'active'
  },
  {
    id: 3,
    name: '王五',
    studentId: '20220001',
    grade: '2022级',
    major: '数据科学与大数据技术',
    phone: '13800138003',
    email: 'wangwu@example.com',
    role: 'member',
    joinDate: '2022-09-01',
    status: 'active'
  },
  {
    id: 4,
    name: '赵六',
    studentId: '20220002',
    grade: '2022级',
    major: '人工智能',
    phone: '13800138004',
    email: 'zhaoliu@example.com',
    role: 'member',
    joinDate: '2022-09-01',
    status: 'active'
  },
  {
    id: 5,
    name: '钱七',
    studentId: '20230001',
    grade: '2023级',
    major: '计算机科学与技术',
    phone: '13800138005',
    email: 'qianqi@example.com',
    role: 'member',
    joinDate: '2023-09-01',
    status: 'active'
  },
  {
    id: 6,
    name: '孙八',
    studentId: '20230002',
    grade: '2023级',
    major: '软件工程',
    phone: '13800138006',
    email: 'sunba@example.com',
    role: 'member',
    joinDate: '2023-09-01',
    status: 'inactive'
  }
])

// 搜索关键词
const searchKeyword = ref('')

// 筛选条件
const filters = reactive({
  role: 'all',
  status: 'all',
  grade: 'all'
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模态框状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEditMode = ref(false)

// 成员表单数据
const memberForm = reactive({
  id: '',
  name: '',
  studentId: '',
  grade: '',
  major: '',
  phone: '',
  email: '',
  role: 'member',
  joinDate: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入成员姓名', trigger: 'blur' },
    { min: 1, max: 20, message: '姓名长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d+$/, message: '学号只能包含数字', trigger: 'blur' }
  ],
  grade: [
    { required: true, message: '请输入年级', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 表单引用
const formRef = ref()

// 获取过滤后的成员列表
const getFilteredMembers = () => {
  let filtered = members.value
  
  // 按关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(member => 
      member.name.includes(searchKeyword.value) ||
      member.studentId.includes(searchKeyword.value) ||
      member.major.includes(searchKeyword.value)
    )
  }
  
  // 按角色筛选
  if (filters.role !== 'all') {
    filtered = filtered.filter(member => member.role === filters.role)
  }
  
  // 按状态筛选
  if (filters.status !== 'all') {
    filtered = filtered.filter(member => member.status === filters.status)
  }
  
  // 按年级筛选
  if (filters.grade !== 'all') {
    filtered = filtered.filter(member => member.grade === filters.grade)
  }
  
  // 更新总条数
  pagination.total = filtered.length
  
  // 分页
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filtered.slice(start, end)
}

// 处理分页
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
}

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1
}

// 重置筛选条件
const resetFilters = () => {
  searchKeyword.value = ''
  filters.role = 'all'
  filters.status = 'all'
  filters.grade = 'all'
  pagination.currentPage = 1
}

// 打开编辑成员模态框
const openEditDialog = (member: any) => {
  Object.assign(memberForm, member)
  dialogTitle.value = '编辑成员信息'
  isEditMode.value = true
  dialogVisible.value = true
}

// 查看成员详情
const viewMemberDetail = (member: any) => {
  ElMessage.info(`查看成员ID: ${member.id} 的详情`)
}

// 修改成员状态
const changeMemberStatus = (member: any) => {
  const newStatus = member.status === 'active' ? 'inactive' : 'active'
  ElMessageBox.confirm(
    `确定要将成员「${member.name}」的状态改为${newStatus === 'active' ? '激活' : '停用'}吗？`,
    '状态修改确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = members.value.findIndex(item => item.id === member.id)
    if (index !== -1) {
      members.value[index].status = newStatus
      ElMessage.success('成员状态修改成功')
    }
  }).catch(() => {
    ElMessage.info('已取消修改')
  })
}

// 修改成员权限
const changeMemberRole = (member: any, newRole: string) => {
  // 不允许修改当前登录用户的角色
  if (member.id === 1) {
    ElMessage.warning('不能修改当前管理员的角色')
    return
  }
  
  ElMessageBox.confirm(
    `确定要将成员「${member.name}」的角色改为${newRole === 'admin' ? '管理员' : '普通成员'}吗？`,
    '角色修改确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = members.value.findIndex(item => item.id === member.id)
    if (index !== -1) {
      members.value[index].role = newRole
      ElMessage.success('成员角色修改成功')
    }
  }).catch(() => {
    ElMessage.info('已取消修改')
  })
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (isEditMode.value) {
        // 编辑模式
        const index = members.value.findIndex(item => item.id === Number(memberForm.id))
        if (index !== -1) {
          members.value[index] = { ...memberForm, id: Number(memberForm.id), status: members.value[index].status }
          ElMessage.success('成员信息更新成功')
        }
      }
      dialogVisible.value = false
      resetForm()
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(memberForm, {
    id: '',
    name: '',
    studentId: '',
    grade: '',
    major: '',
    phone: '',
    email: '',
    role: 'member',
    joinDate: ''
  })
}

// 获取角色文本
const getRoleText = (role: string) => {
  return role === 'admin' ? '管理员' : '普通成员'
}

// 获取角色标签样式
const getRoleTagClass = (role: string) => {
  return role === 'admin' ? 'el-tag--primary' : 'el-tag--success'
}

// 获取状态文本
const getStatusText = (status: string) => {
  return status === 'active' ? '已激活' : '已停用'
}

// 获取状态标签样式
const getStatusTagClass = (status: string) => {
  return status === 'active' ? 'el-tag--success' : 'el-tag--danger'
}

onMounted(() => {
  pagination.total = members.value.length
})
</script>

<template>
  <div class="members-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">成员管理</h1>
        <div class="page-subtitle">管理社团成员信息，包括查看、编辑和权限管理。</div>
      </div>
    
    <!-- 操作栏 -->
    <el-card class="action-bar-card">
      <div class="action-bar">
        <div class="search-filter">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索姓名、学号或专业"
            prefix-icon="el-icon-search"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <el-select
            v-model="filters.role"
            placeholder="筛选角色"
            class="filter-select"
          >
            <el-option label="全部角色" value="all" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通成员" value="member" />
          </el-select>
          <el-select
            v-model="filters.status"
            placeholder="筛选状态"
            class="filter-select"
          >
            <el-option label="全部状态" value="all" />
            <el-option label="已激活" value="active" />
            <el-option label="已停用" value="inactive" />
          </el-select>
          <el-select
            v-model="filters.grade"
            placeholder="筛选年级"
            class="filter-select"
          >
            <el-option label="全部年级" value="all" />
            <el-option label="2021级" value="2021级" />
            <el-option label="2022级" value="2022级" />
            <el-option label="2023级" value="2023级" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>
      </div>
    </div>
    
    <!-- 成员统计卡片 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-primary">
              <el-icon name="el-icon-user" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ members.length }}</div>
              <div class="stat-label">总成员数</div>
            </div>
          </div>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-success">
              <el-icon name="el-icon-check" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ members.filter(m => m.status === 'active').length }}</div>
              <div class="stat-label">活跃成员数</div>
              </div>
            </div>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-warning">
              <el-icon name="el-icon-user-solid" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ members.filter(m => m.role === 'admin').length }}</div>
              <div class="stat-label">管理员数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-danger">
              <el-icon name="el-icon-close" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ members.filter(m => m.status === 'inactive').length }}</div>
              <div class="stat-label">停用成员数</div>
              </div>
            </div>
      </el-col>
    </el-row>
    
    <!-- 成员列表 -->
    <el-card class="members-table-card">
      <el-table :data="getFilteredMembers()" class="members-table">
        <el-table-column prop="id" label="成员ID" width="80" type="index"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120">
          <template #default="scope">
            <div class="member-name">
              <el-avatar :size="36" :text="scope.row.name[0]" />
              <span class="name-text">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
        <el-table-column prop="grade" label="年级" width="100"></el-table-column>
        <el-table-column prop="major" label="专业" min-width="150"></el-table-column>
        <el-table-column prop="joinDate" label="加入日期" width="120"></el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :class="getRoleTagClass(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :class="getStatusTagClass(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewMemberDetail(scope.row)">查看详情</el-button>
            <el-button type="warning" size="small" @click="openEditDialog(scope.row)">编辑信息</el-button>
            <el-button 
              :type="scope.row.status === 'active' ? 'danger' : 'success'" 
              size="small" 
              @click="changeMemberStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '停用' : '激活' }}
            </el-button>
            <el-dropdown trigger="click">
              <el-button type="info" size="small">修改权限</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    @click="changeMemberRole(scope.row, 'admin')"
                    :disabled="scope.row.role === 'admin' || scope.row.id === 1"
                  >设为管理员</el-dropdown-item>
                  <el-dropdown-item 
                    @click="changeMemberRole(scope.row, 'member')"
                    :disabled="scope.row.role === 'member' || scope.row.id === 1"
                  >设为普通成员</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="(size) => { pagination.pageSize = size; pagination.currentPage = 1 }"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 成员表单模态框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :before-close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="memberForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="memberForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="memberForm.studentId" placeholder="请输入学号"></el-input>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="memberForm.grade" placeholder="请输入年级"></el-input>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="memberForm.major" placeholder="请输入专业"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="memberForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="memberForm.role" placeholder="请选择角色">
            <el-option label="普通成员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false, resetForm()">取消</el-button>
        <el-button type="primary" @click="submitForm()">确定</el-button>
      </template>
    </el-dialog>
</template>

<style scoped>
.members-container {
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

/* 操作栏 */
.action-bar-card {
  margin-bottom: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 120px;
}

/* 统计卡片 */
.mb-20 {
  margin-bottom: 20px;
}

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
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
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

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

/* 成员列表 */
.members-table-card {
  margin-bottom: 20px;
}

.members-table :deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-text {
  font-weight: 500;
  color: #303133;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .members-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-filter {
    flex-direction: column;
  }
  
  .search-input,
  .filter-select {
    width: 100%;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    padding: 15px 0;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>