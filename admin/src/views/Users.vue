<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 移除Element Plus依赖，使用原生JavaScript替代
import MainLayout from '../components/layout/MainLayout.vue';
import { usersService } from '../services';

const route = useRoute()

// 响应式数据
const users = ref([]);
const filteredUsers = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const isLoading = ref(false);
const error = ref(null);

// 模态框状态
const isViewModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isReviewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const currentUser = ref(null);
const reviewComment = ref('');

// 筛选逻辑
const filterUsers = () => {
  let result = [...users.value];
  
  // 排除管理员角色
  result = result.filter(user => user.role !== 'admin');
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query) ||
      (user.studentId && user.studentId.toLowerCase().includes(query)) ||
      (user.employeeId && user.employeeId.toLowerCase().includes(query))
    );
  }
  
  // 状态筛选
  if (statusFilter.value !== 'all') {
    result = result.filter(user => user.status === statusFilter.value);
  }
  
  filteredUsers.value = result;
};

// 监听搜索和筛选变化
const watchFilters = () => {
  filterUsers();
};

// 搜索处理
const handleSearch = () => {
  filterUsers();
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
  filterUsers();
};



// 获取用户列表
const fetchUsers = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    users.value = await usersService.getUsers();
    filterUsers();
  } catch (err) {
    error.value = err.message || '获取用户列表失败';
    alert('错误: ' + error.value);
  } finally {
    isLoading.value = false;
  }
};

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    teacher: '教师',
    student: '学生'
  };
  return roleMap[role] || role;
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '活跃',
    pending: '待审核',
    suspended: '已停用'
  };
  return statusMap[status] || status;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 查看用户详情
const viewUser = (user) => {
  currentUser.value = { ...user };
  isViewModalOpen.value = true;
};

// 编辑用户
const editUser = (user) => {
  currentUser.value = { ...user };
  isEditModalOpen.value = true;
};

// 保存用户编辑
const saveUserEdit = async () => {
  if (!currentUser.value) return;
  
  try {
    await usersService.updateUser(currentUser.value.id, currentUser.value);
    alert('成功: 用户信息更新成功');
    isEditModalOpen.value = false;
    await fetchUsers(); // 重新获取用户列表以更新数据
  } catch (err) {
    alert('错误: ' + (err.message || '更新用户信息失败'));
  }
};

// 打开审核模态框
const openReviewModal = (user) => {
  currentUser.value = { ...user };
  reviewComment.value = '';
  isReviewModalOpen.value = true;
};

// 审核通过用户
const approveUser = async () => {
  if (!currentUser.value) return;
  
  try {
    await usersService.approveUser(currentUser.value.id, reviewComment.value);
    alert('成功: 用户审核通过');
    isReviewModalOpen.value = false;
    await fetchUsers(); // 重新获取用户列表以更新数据
  } catch (err) {
    alert('错误: ' + (err.message || '审核用户失败'));
  }
};

// 驳回用户
const rejectUser = async () => {
  if (!currentUser.value) return;
  
  try {
    await usersService.rejectUser(currentUser.value.id, reviewComment.value);
    alert('成功: 用户已驳回');
    isReviewModalOpen.value = false;
    await fetchUsers(); // 重新获取用户列表以更新数据
  } catch (err) {
    alert('错误: ' + (err.message || '驳回用户失败'));
  }
};

// 切换用户状态
const toggleUserStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  const statusText = newStatus === 'active' ? '启用' : '停用';
  
  try {
    const confirmed = confirm(`确定要${statusText}用户「${user.name}」吗？`);
    if (!confirmed) return;
    
    await usersService.updateUserStatus(user.id, newStatus);
    alert(`成功: 用户已${statusText}成功`);
    await fetchUsers(); // 重新获取用户列表以更新数据
  } catch (err) {
    if (err !== 'cancel') {
      alert(`错误: 用户${statusText}失败`);
    }
  }
};

// 打开删除确认模态框
const openDeleteModal = (user) => {
  currentUser.value = { ...user };
  isDeleteModalOpen.value = true;
};

// 删除用户
const deleteUser = async () => {
  if (!currentUser.value) return;
  
  try {
    await usersService.deleteUser(currentUser.value.id);
    alert('成功: 用户删除成功');
    isDeleteModalOpen.value = false;
    await fetchUsers(); // 重新获取用户列表以更新数据
  } catch (err) {
    alert('错误: ' + (err.message || '删除用户失败'));
  }
};

// 刷新用户列表
const refreshUsers = () => {
  fetchUsers();
};

// 组件挂载时获取数据
onMounted(() => {
  // 检查URL中是否带有status查询参数
  const urlStatus = route.query.status
  if (urlStatus === 'pending') {
    statusFilter.value = '待审核'
  }
  fetchUsers();
});

// 计算属性：获取状态筛选器的选项
const statusFilterOptions = computed(() => [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '活跃' },
  { value: 'pending', label: '待审核' },
  { value: 'suspended', label: '已停用' }
]);
</script>

<template>
  <MainLayout>
    <div class="users-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>用户管理</h1>
        <div class="header-actions">
          <button class="btn btn-primary" @click="refreshUsers" :disabled="isLoading">
            🔄 刷新数据
          </button>
        </div>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="search-filters">
        <div class="search-input">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索用户名、邮箱、学号或工号"
            @input="handleSearch"
            class="search-input-field"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn">✕</button>
        </div>
        
        <div class="filter-tabs">
          <div class="radio-group">
            <label v-for="option in statusFilterOptions" :key="option.value" class="radio-label">
              <input
                type="radio"
                :value="option.value"
                v-model="statusFilter"
                @change="handleSearch"
              />
              {{ option.label }}
            </label>
          </div>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-alert">
        <div class="error-content">
          <span>❌ {{ error }}</span>
          <button @click="error = null" class="close-btn">✕</button>
        </div>
      </div>
      
      <!-- 用户表格 -->
      <div class="users-table-container">
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-text">加载中...</div>
        </div>
        <table
          :class="{ 'table-loading': isLoading }"
          class="users-table"
          style="width: 100%"
        >
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>最后登录</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" v-if="filteredUsers.length > 0">
              <td>
                <div class="user-info">
                  <img :src="user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
                       :alt="user.name" 
                       class="user-avatar" 
                  />
                  <span>{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="`role-badge role-${user.role}`">
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td>
                <span :class="`status-badge status-${user.status}`">
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ formatDate(user.lastLogin) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-small" @click="viewUser(user)">查看</button>
                  <button class="btn btn-small btn-primary" @click="editUser(user)">编辑</button>
                  
                  <!-- 待审核用户显示审核按钮 -->
                  <button 
                    v-if="user.status === 'pending'" 
                    class="btn btn-small btn-success" 
                    @click="openReviewModal(user)"
                  >
                    审核
                  </button>
                  
                  <!-- 活跃或停用用户显示切换状态按钮 -->
                  <button 
                    v-else 
                    class="btn btn-small" 
                    :class="user.status === 'active' ? 'btn-warning' : 'btn-success'" 
                    @click="toggleUserStatus(user)"
                  >
                    {{ user.status === 'active' ? '停用' : '启用' }}
                  </button>
                  
                  <!-- 删除按钮 -->
                  <button class="btn btn-small btn-danger" @click="openDeleteModal(user)">删除</button>
                </div>
              </td>
            </tr>
              <tr v-else>
                <td colspan="7" class="empty-state">
                  暂无用户数据
                </td>
              </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 用户详情模态框 -->
      <el-dialog
        v-model="isViewModalOpen"
        title="用户详情"
        width="600px"
        destroy-on-close
      >
        <div v-if="currentUser" class="user-detail">
          <div class="detail-header">
            <img :src="currentUser.avatar" :alt="currentUser.name" class="detail-avatar" />
            <div class="detail-basic">
              <h3>{{ currentUser.name }}</h3>
              <p class="detail-email">{{ currentUser.email }}</p>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>角色：</label>
                <span :class="`role-badge role-${currentUser.role}`">
                  {{ getRoleText(currentUser.role) }}
                </span>
              </div>
              <div class="detail-item">
                <label>状态：</label>
                <span :class="`status-badge status-${currentUser.status}`">
                  {{ getStatusText(currentUser.status) }}
                </span>
              </div>
              <div class="detail-item">
                <label>注册时间：</label>
                <span>{{ formatDate(currentUser.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <label>最后登录：</label>
                <span>{{ formatDate(currentUser.lastLogin) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 学生特有信息 -->
          <div v-if="currentUser.role === 'student'" class="detail-section">
            <h4>学生信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>学号：</label>
                <span>{{ currentUser.studentId || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>专业：</label>
                <span>{{ currentUser.major || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>年级：</label>
                <span>{{ currentUser.grade || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>已修课程：</label>
                <span>{{ currentUser.enrolledCourses || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>学习进度：</label>
                <span>{{ currentUser.progress || '-' }}</span>
              </div>
            </div>
          </div>
          
          <!-- 教师特有信息 -->
          <div v-if="currentUser.role === 'teacher'" class="detail-section">
            <h4>教师信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>工号：</label>
                <span>{{ currentUser.employeeId || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>部门：</label>
                <span>{{ currentUser.department || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>专长：</label>
                <span>{{ currentUser.specialization || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>教授课程：</label>
                <span>
                  <template v-if="currentUser.courses && currentUser.courses.length">
                    {{ currentUser.courses.join(', ') }}
                  </template>
                  <template v-else>-</template>
                </span>
              </div>
            </div>
          </div>
          
          <!-- 审核信息 -->
          <div v-if="currentUser.reviewComment" class="detail-section">
            <h4>审核信息</h4>
            <div class="detail-grid">
              <div class="detail-item full-width">
                <label>审核意见：</label>
                <span class="review-comment">{{ currentUser.reviewComment }}</span>
              </div>
              <div class="detail-item">
                <label>审核时间：</label>
                <span>{{ formatDate(currentUser.reviewDate) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="isViewModalOpen = false">关闭</el-button>
            <el-button type="primary" @click="editUser(currentUser)">编辑</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 编辑用户模态框 -->
      <el-dialog
        v-model="isEditModalOpen"
        title="编辑用户"
        width="600px"
        destroy-on-close
      >
        <div v-if="currentUser" class="user-edit-form">
          <el-form label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="currentUser.name" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="currentUser.email" placeholder="请输入邮箱" disabled />
            </el-form-item>
            <el-form-item label="角色">
              <el-select v-model="currentUser.role" disabled>
                <el-option value="teacher" label="教师" />
                <el-option value="student" label="学生" />
              </el-select>
            </el-form-item>
            
            <!-- 学生特有字段 -->
            <template v-if="currentUser.role === 'student'">
              <el-form-item label="学号">
                <el-input v-model="currentUser.studentId" placeholder="请输入学号" />
              </el-form-item>
              <el-form-item label="专业">
                <el-input v-model="currentUser.major" placeholder="请输入专业" />
              </el-form-item>
              <el-form-item label="年级">
                <el-input v-model="currentUser.grade" placeholder="请输入年级" />
              </el-form-item>
            </template>
            
            <!-- 教师特有字段 -->
            <template v-if="currentUser.role === 'teacher'">
              <el-form-item label="工号">
                <el-input v-model="currentUser.employeeId" placeholder="请输入工号" />
              </el-form-item>
              <el-form-item label="部门">
                <el-input v-model="currentUser.department" placeholder="请输入部门" />
              </el-form-item>
              <el-form-item label="专长">
                <el-input v-model="currentUser.specialization" placeholder="请输入专长" />
              </el-form-item>
            </template>
          </el-form>
        </div>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="isEditModalOpen = false">取消</el-button>
            <el-button type="primary" @click="saveUserEdit">保存</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 审核用户模态框 -->
      <el-dialog
        v-model="isReviewModalOpen"
        title="审核用户"
        width="500px"
        destroy-on-close
      >
        <div v-if="currentUser" class="user-review">
          <div class="review-user-info">
            <img :src="currentUser.avatar" :alt="currentUser.name" class="review-avatar" />
            <div class="review-user-details">
              <h4>{{ currentUser.name }}</h4>
              <p>{{ getRoleText(currentUser.role) }}</p>
              <p>{{ currentUser.email }}</p>
            </div>
          </div>
          
          <el-form label-width="100px">
            <el-form-item label="审核意见">
              <el-input
                v-model="reviewComment"
                type="textarea"
                :rows="3"
                placeholder="请输入审核意见"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="isReviewModalOpen = false">取消</el-button>
            <el-button type="danger" @click="rejectUser">驳回</el-button>
            <el-button type="success" @click="approveUser">通过</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 删除确认模态框 -->
      <el-dialog
        v-model="isDeleteModalOpen"
        title="确认删除"
        width="400px"
        destroy-on-close
      >
        <div v-if="currentUser" class="delete-confirm">
          <p class="warning-text">
            <el-icon class="warning-icon"><Warning /></el-icon>
            确定要删除用户「{{ currentUser.name }}」吗？此操作不可撤销。
          </p>
          <p class="delete-tip">删除后，该用户的所有数据将被永久移除。</p>
        </div>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="isDeleteModalOpen = false">取消</el-button>
            <el-button type="danger" @click="deleteUser">确认删除</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </MainLayout>
</template>

<style scoped>
/* 页面基本样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  margin: 0 4px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #66b1ff;
}

.btn-success {
  background-color: #67c23a;
  color: white;
}

.btn-success:hover {
  background-color: #85ce61;
}

.btn-warning {
  background-color: #e6a23c;
  color: white;
}

.btn-warning:hover {
  background-color: #ebb563;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f78989;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}

/* 搜索和筛选样式 */
.search-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.search-input {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input-field {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.search-input-field:focus {
  outline: none;
  border-color: #409eff;
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #909399;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  margin-right: 6px;
}

/* 错误提示样式 */
.error-alert {
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
}

.error-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #f56c6c;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #909399;
}

/* 表格样式 */
.users-table-container {
  position: relative;
  overflow-x: auto;
}

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
  z-index: 10;
}

.loading-text {
  font-size: 16px;
  color: #409eff;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.users-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
}

.users-table tbody tr:hover {
  background-color: #f5f7fa;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

/* 标签样式 */
.role-badge,
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.role-admin {
  background-color: #f0f9ff;
  color: #36cfc9;
}

.role-teacher {
  background-color: #f6ffed;
  color: #67c23a;
}

.role-student {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-active {
  background-color: #f0f9ff;
  color: #409eff;
}

.status-suspended {
  background-color: #f5f7fa;
  color: #909399;
}

.status-pending {
  background-color: #fdf6ec;
  color: #e6a23c;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .radio-group {
    justify-content: center;
  }
}
</style>

// 导入Element Plus图标
import { Search, Refresh, Warning } from '@element-plus/icons-vue';