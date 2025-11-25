<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { userAPI } from '../services/api'
import { mockAPI } from '../services/mockData'

// 状态
const users = ref([])
const loading = ref(false)
const error = ref('')
const useMock = ref(false) // 默认使用真实接口，如需演示可切换为 mock

// 搜索和筛选
const searchQuery = ref('')
const activeFilter = ref('all')

// 模态框状态
const reviewModalVisible = ref(false)
const userModalVisible = ref(false)
const editModalVisible = ref(false)
const currentUser = ref(null)
const reviewComment = ref('')
const editForm = ref({
  username: '',
  email: '',
  role: '',
  studentNo: '',
  major: '',
  employeeId: '',
  department: ''
})

// 获取角色文本
const getRoleText = (role) => {
  if (!role) return '未知角色'
  const normalized = role.toLowerCase()
  const roleMap = {
    'student': '学生',
    'teacher': '教师',
    'admin': '管理员'
  }
  return roleMap[normalized] || role
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'active': '已激活',
    'pending': '待审核',
    'suspended': '已禁用'
  }
  return statusMap[status] || status
}

const backendStatusToUi = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'active'
    case 'LOCKED':
      return 'pending'
    case 'DISABLED':
      return 'suspended'
    default:
      return (status || '').toLowerCase() || 'pending'
  }
}

const uiStatusToBackend = (status) => {
  switch (status) {
    case 'active':
      return 'ACTIVE'
    case 'suspended':
      return 'DISABLED'
    case 'pending':
    default:
      return 'LOCKED'
  }
}

const mapApiUserToUi = (user) => {
  if (!user) {
    return null
  }
  const role = (user.role || '').toLowerCase()
  const status = backendStatusToUi(user.status)
  const studentProfile = user.studentProfile || {}
  const teacherProfile = user.teacherProfile || {}
  
  // 确保 ID 是字符串格式，并验证格式
  let userId = user.id
  if (userId) {
    userId = String(userId)
    // UUID 格式验证（基本检查）
    if (!userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.warn('用户 ID 格式异常:', userId, '原始用户数据:', user)
    }
  }
  
  return {
    id: userId,
    name: user.username || user.name || '未知用户',
    email: user.email || '',
    role,
    status,
    registerTime: user.createdAt || user.registerTime,
    lastLogin: user.lastLogin || '未登录',
    phone: user.phone,
    studentId: studentProfile.studentNo,
    major: studentProfile.major,
    employeeId: teacherProfile.teacherNo,
    department: teacherProfile.department
  }
}

const setUserStatusLocal = (userId, uiStatus) => {
  const index = users.value.findIndex(u => u.id === userId)
  if (index !== -1) {
    users.value[index] = { ...users.value[index], status: uiStatus }
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString || dateString === '未登录') return dateString || '--'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }
  return date.toLocaleDateString('zh-CN')
}

// 筛选用户
const filterUsers = (filter) => {
  activeFilter.value = filter
  if (!useMock.value) {
    fetchUsers()
  }
}

// 计算过滤后的用户列表
const filteredUsers = computed(() => {
  let result = [...users.value]

  // 状态筛选
  if (activeFilter.value !== 'all') {
    result = result.filter(user => user.status === activeFilter.value)
  }

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  return result
})

// 查看用户
const viewUser = (userId) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    currentUser.value = user
    userModalVisible.value = true
  }
}

// 编辑用户
const editUser = (userId) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    currentUser.value = user
    // 填充编辑表单
    editForm.value = {
      username: user.name || '',
      email: user.email || '',
      role: user.role || '',
      studentNo: user.studentId || '',
      major: user.major || '',
      employeeId: user.employeeId || '',
      department: user.department || ''
    }
    editModalVisible.value = true
  }
}

// 关闭编辑模态框
const closeEditModal = () => {
  editModalVisible.value = false
  currentUser.value = null
  editForm.value = {
    username: '',
    email: '',
    role: '',
    studentNo: '',
    major: '',
    employeeId: '',
    department: ''
  }
}

// 保存编辑
const saveEdit = async () => {
  if (!currentUser.value) return
  
  try {
    // 注意：后端目前没有通用的更新用户信息接口
    // 只能通过批量创建接口或直接修改数据库
    // 这里先提示用户
    alert('后端暂未提供更新用户信息的接口。\n\n当前只能修改用户状态。\n如需修改用户信息，请联系后端开发人员添加 PUT /api/v1/admin/users/{userId} 接口。')
    closeEditModal()
  } catch (err) {
    alert('保存失败: ' + (err.message || '未知错误'))
  }
}

// 打开审核模态框
const openReviewModal = (userId) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    currentUser.value = user
    reviewComment.value = ''
    reviewModalVisible.value = true
  }
}

// 关闭审核模态框
const closeReviewModal = () => {
  reviewModalVisible.value = false
  currentUser.value = null
  reviewComment.value = ''
}

// 关闭用户详情模态框
const closeUserModal = () => {
  userModalVisible.value = false
  currentUser.value = null
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    let response
    if (useMock.value) {
      response = await mockAPI.getUsers()
      users.value = (response.data || response).map(user => {
        const normalizedStatus = user.status === 'inactive'
          ? 'pending'
          : user.status === 'banned'
            ? 'suspended'
            : user.status
        return {
          ...user,
          status: normalizedStatus,
          registerTime: user.createdAt || user.registerTime,
          lastLogin: user.lastLogin || '未登录'
        }
      })
    } else {
      const params = {}
      if (searchQuery.value) {
        params.keyword = searchQuery.value
      }
      const backendStatusFilter = uiStatusToBackend(activeFilter.value)
      if (activeFilter.value !== 'all') {
        params.status = backendStatusFilter
      }
      response = await userAPI.getUsers(params)
      const payload = Array.isArray(response?.data) ? response.data : response
      console.log('获取到的用户数据:', payload)
      users.value = payload.map(mapApiUserToUi).filter(Boolean)
      console.log('映射后的用户列表:', users.value)
    }
  } catch (err) {
    error.value = err.message || '获取用户列表失败'
    console.error('获取用户列表错误:', err)
  } finally {
    loading.value = false
  }
}

// 更新用户
// 删除用户
const deleteUser = async () => {
  if (!currentUser.value) {
    return
  }
  if (!useMock.value) {
    alert('当前后台暂未开放删除用户接口。')
    return
  }
  if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) {
    return
  }
  try {
    await mockAPI.deleteUser(currentUser.value.id)
    const index = users.value.findIndex(u => u.id === currentUser.value.id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
    closeUserModal()
    alert('用户已删除')
  } catch (err) {
    alert('删除失败: ' + (err.message || '未知错误'))
  }
}

// 审核通过
const approveUser = async () => {
  if (currentUser.value) {
    try {
      await changeUserStatus(currentUser.value.id, 'ACTIVE')
      closeReviewModal()
      alert('用户审核通过')
    } catch (err) {
      alert('操作失败: ' + err.message)
    }
  }
}

// 审核驳回
const rejectUser = async () => {
  if (currentUser.value) {
    try {
      const reason = reviewComment.value || '审核未通过'
      await changeUserStatus(currentUser.value.id, 'DISABLED', reason)
      closeReviewModal()
      alert('用户审核已驳回')
    } catch (err) {
      alert('操作失败: ' + err.message)
    }
  }
}

// 切换用户状态
const toggleUserStatus = async (userId) => {
  const userToUpdate = userId 
    ? users.value.find(u => u.id === userId)
    : currentUser.value
    
  if (!userToUpdate) {
    alert('未找到要更新的用户')
    return
  }
  
  if (!userToUpdate.id) {
    console.error('用户 ID 不存在:', userToUpdate)
    alert('用户 ID 无效')
    return
  }
  
  console.log('切换用户状态 - 用户信息:', userToUpdate)
  const newStatus = userToUpdate.status === 'active' ? 'DISABLED' : 'ACTIVE'
  try {
    await changeUserStatus(userToUpdate.id, newStatus, newStatus === 'DISABLED' ? '管理员禁用账号' : undefined)
    const uiStatus = backendStatusToUi(newStatus)
    alert(`用户状态已更新为：${getStatusText(uiStatus)}`)
  } catch (err) {
    console.error('切换用户状态失败:', err)
    const errorMsg = err.message || err.error || '操作失败，请稍后重试'
    alert('操作失败: ' + errorMsg)
  }
}

const changeUserStatus = async (userId, backendStatus, reason) => {
  // 确保 userId 是字符串格式
  const userIdStr = String(userId)
  console.log('更新用户状态 - userId:', userIdStr, 'status:', backendStatus)
  
  if (useMock.value) {
    await mockAPI.updateUser(userIdStr, { status: backendStatusToUi(backendStatus) })
  } else {
    const payload = { status: backendStatus }
    if (reason) {
      payload.reason = reason
    }
    try {
      await userAPI.updateUserStatus(userIdStr, payload)
      // 更新成功后刷新列表
      await fetchUsers()
    } catch (err) {
      console.error('更新用户状态失败:', err)
      throw err
    }
  }
  setUserStatusLocal(userIdStr, backendStatusToUi(backendStatus))
}

// 搜索
const handleSearch = () => {
  fetchUsers()
}

// 生命周期
onMounted(() => {
  fetchUsers()
})
</script>
  
  <style scoped>
    .error-message {
      background-color: #ffebee;
      color: #c62828;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #ffcdd2;
    }
    
    /* 加载状态样式 */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>

<template>
  <MainLayout>
    <main class="main-content">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">用户管理</h1>
          <div class="search-bar">
            <input 
              type="text" 
              class="search-input" 
              placeholder="搜索用户..."
              v-model="searchQuery"
              @input="handleSearch"
            >
            <button class="btn btn-primary" @click="handleSearch">搜索</button>
          </div>
        </div>
      </header>

      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'all' }"
          @click="filterUsers('all')"
        >
          全部用户
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'pending' }"
          @click="filterUsers('pending')"
        >
          待审核
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'active' }"
          @click="filterUsers('active')"
        >
          已激活
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'suspended' }"
          @click="filterUsers('suspended')"
        >
          已禁用
        </button>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
        <button class="btn btn-sm btn-primary" @click="fetchUsers">重试</button>
      </div>
      
      <div class="users-table-container" style="position: relative;">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>
        
        <table class="users-table">
          <thead>
            <tr>
              <th>用户信息</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>最后登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading-row">
              <td colspan="6" class="text-center">加载中...</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0" class="empty-row">
              <td colspan="6" class="text-center">暂无用户数据</td>
            </tr>
            <tr v-else v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-info">
                  <div class="user-avatar">{{ user.name.charAt(0) }}</div>
                  <div class="user-details">
                    <h4>{{ user.name }}</h4>
                    <p>{{ user.email }}</p>
                    <p v-if="user.phone" class="user-phone">{{ user.phone }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span class="role-badge" :class="`role-${user.role}`">
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="`status-${user.status}`">
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td>{{ formatDate(user.registerTime) }}</td>
              <td>{{ user.lastLogin }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-secondary btn-sm" @click="viewUser(user.id)">查看</button>
                  <button class="btn btn-primary btn-sm" @click="editUser(user.id)">编辑</button>
                  <button 
                    v-if="user.status === 'pending'"
                    class="btn btn-primary btn-sm" 
                    @click="openReviewModal(user.id)"
                  >
                    审核
                  </button>
                  <button 
                    v-else
                    class="btn btn-warning btn-sm" 
                    @click="toggleUserStatus(user.id)"
                  >
                    {{ user.status === 'active' ? '禁用' : '激活' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- 审核用户模态框 -->
    <div v-if="reviewModalVisible" class="modal active" @click.self="closeReviewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">审核用户</h2>
          <button class="modal-close" @click="closeReviewModal">&times;</button>
        </div>
        <div v-if="currentUser" class="review-user-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">姓名</label>
              <input 
                id="reviewName" 
                class="form-input" 
                :value="currentUser.name"
                readonly
              >
            </div>
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input 
                id="reviewEmail" 
                class="form-input" 
                :value="currentUser.email"
                readonly
              >
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">角色</label>
              <input 
                id="reviewRole" 
                class="form-input" 
                :value="getRoleText(currentUser.role)"
                readonly
              >
            </div>
            <div class="form-group">
              <label class="form-label">注册时间</label>
              <input 
                id="reviewRegisterTime" 
                class="form-input" 
                :value="formatDate(currentUser.registerTime)"
                readonly
              >
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">审核意见（可选）</label>
            <textarea 
              class="form-input form-textarea" 
              placeholder="填写审核意见..."
              v-model="reviewComment"
            ></textarea>
          </div>
          <div class="text-right">
            <button class="btn btn-secondary" @click="closeReviewModal">取消</button>
            <button class="btn btn-danger" @click="rejectUser">驳回</button>
            <button class="btn btn-primary" @click="approveUser">通过</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误消息会通过全局样式或CSS模块处理 -->
      
      <!-- 编辑用户模态框 -->
    <div v-if="editModalVisible" class="modal active" @click.self="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">编辑用户</h2>
          <button class="modal-close" @click="closeEditModal">&times;</button>
        </div>
        
        <div v-if="currentUser" class="user-edit-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="editForm.username"
                :readonly="true"
                title="用户名暂不支持修改"
              >
            </div>
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input 
                type="email" 
                class="form-input" 
                v-model="editForm.email"
                :readonly="true"
                title="邮箱暂不支持修改"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">角色</label>
              <input 
                type="text" 
                class="form-input" 
                :value="getRoleText(editForm.role)"
                readonly
                title="角色暂不支持修改"
              >
            </div>
            <div class="form-group">
              <label class="form-label">状态</label>
              <select class="form-input" v-model="currentUser.status" @change="toggleUserStatus(currentUser.id)">
                <option value="active">已激活</option>
                <option value="pending">待审核</option>
                <option value="suspended">已禁用</option>
              </select>
            </div>
          </div>
          
          <div v-if="currentUser.role === 'student'" class="form-row">
            <div class="form-group">
              <label class="form-label">学号</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="editForm.studentNo"
                :readonly="true"
                title="学号暂不支持修改"
              >
            </div>
            <div class="form-group">
              <label class="form-label">专业</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="editForm.major"
                :readonly="true"
                title="专业暂不支持修改"
              >
            </div>
          </div>
          
          <div v-else-if="currentUser.role === 'teacher'" class="form-row">
            <div class="form-group">
              <label class="form-label">工号</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="editForm.employeeId"
                :readonly="true"
                title="工号暂不支持修改"
              >
            </div>
            <div class="form-group">
              <label class="form-label">部门</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="editForm.department"
                :readonly="true"
                title="部门暂不支持修改"
              >
            </div>
          </div>
          
          <div class="info-notice">
            <p>⚠️ 注意：后端暂未提供更新用户详细信息的接口。</p>
            <p>当前只能修改用户状态。如需修改其他信息，请联系后端开发人员添加相应的接口。</p>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="closeEditModal">取消</button>
          <button type="button" class="btn btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>

    <!-- 用户详情模态框 -->
      <div v-if="userModalVisible" class="modal active" @click.self="closeUserModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">用户详情</h2>
          <button class="modal-close" @click="closeUserModal">&times;</button>
        </div>
        
        <div v-if="currentUser" class="user-details">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">姓名</label>
              <input 
                type="text" 
                class="form-input" 
                :value="currentUser.name"
                readonly
              >
            </div>
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input 
                type="email" 
                class="form-input" 
                :value="currentUser.email"
                readonly
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">角色</label>
              <input 
                type="text" 
                class="form-input" 
                :value="getRoleText(currentUser.role)"
                readonly
              >
            </div>
            <div class="form-group">
              <label class="form-label">状态</label>
              <input 
                type="text" 
                class="form-input" 
                :value="getStatusText(currentUser.status)"
                readonly
              >
            </div>
          </div>
          
          <div v-if="currentUser.role === 'student'" class="form-row">
            <div class="form-group">
              <label class="form-label">学号</label>
              <input 
                type="text" 
                class="form-input" 
                :value="currentUser.studentId"
                readonly
              >
            </div>
            <div class="form-group">
              <label class="form-label">专业</label>
              <input 
                type="text" 
                class="form-input" 
                :value="currentUser.major"
                readonly
              >
            </div>
          </div>
          
          <div v-else-if="currentUser.role === 'teacher'" class="form-row">
            <div class="form-group">
              <label class="form-label">工号</label>
              <input 
                type="text" 
                class="form-input" 
                :value="currentUser.employeeId"
                readonly
              >
            </div>
            <div class="form-group">
              <label class="form-label">部门</label>
              <input 
                type="text" 
                class="form-input" 
                :value="currentUser.department"
                readonly
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">注册时间</label>
              <input 
                type="text" 
                class="form-input" 
                :value="formatDate(currentUser.registerTime)"
                readonly
              >
            </div>
            <div class="form-group">
              <label class="form-label">最后登录</label>
              <input 
                type="text" 
                class="form-input" 
                :value="currentUser.lastLogin"
                readonly
              >
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="closeUserModal">关闭</button>
          <button type="button" class="btn btn-warning" @click="toggleUserStatus">切换状态</button>
          <button type="button" class="btn btn-danger" @click="deleteUser">删除用户</button>
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

.page-header {
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

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  padding: 12px 16px;
  border: 1px solid #d1d1d6;
  border-radius: 12px;
  font-size: 16px;
  width: 300px;
}

.search-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #ffffff;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-tab {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #86868b;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
}

.filter-tab.active {
  background: #ff3b30;
  color: white;
}

.users-table-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #d1d1d6;
}

.users-table th {
  background: #f2f2f7;
  font-weight: 600;
  color: #1d1d1f;
}

.users-table td {
  color: #86868b;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007aff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details h4 {
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 4px;
  margin-top: 0;
  font-size: 14px;
}

.user-details p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.status-pending {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.status-suspended {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.role-student {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.role-teacher {
  background: rgba(88, 86, 214, 0.1);
  color: #5856d6;
}

.role-admin {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.action-buttons {
  display: flex;
  gap: 8px;
  opacity: 1 !important;
  visibility: visible !important;
}

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  align-items: center;
  justify-content: center;
}

.modal.active {
  display: flex;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
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
}

.modal-close:hover {
  color: #1d1d1f;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 8px;
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

.form-input[readonly] {
  background-color: #f2f2f7;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.text-right {
  text-align: right;
  margin-top: 24px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
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

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
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
  background-color: #e08400;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-danger {
  background-color: #ff3b30;
  color: white;
}

.btn-danger:hover {
  background-color: #d70015;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .search-input {
    width: 100%;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .users-table {
    display: block;
    overflow-x: auto;
  }
}

.info-notice {
  background: rgba(255, 149, 0, 0.1);
  border: 1px solid rgba(255, 149, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.info-notice p {
  margin: 8px 0;
  font-size: 14px;
  color: #ff9500;
  line-height: 1.5;
}

.info-notice p:first-child {
  margin-top: 0;
  font-weight: 500;
}

.info-notice p:last-child {
  margin-bottom: 0;
}
</style>
