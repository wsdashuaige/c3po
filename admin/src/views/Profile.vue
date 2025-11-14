<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import profileService from '../services/profileService.js'

// 用户基本信息
const userInfo = reactive({
  id: null,
  name: '系统管理员',
  email: 'admin@example.com',
  phone: '',
  avatar: '',
  role: 'admin',
  department: '',
  position: '',
  bio: '',
  joinDate: '',
  lastLogin: '今天 10:12'
})

// 基本信息表单
const basicInfoForm = reactive({
  name: '系统管理员',
  email: 'admin@example.com',
  phone: '',
  department: '',
  position: '',
  bio: ''
})

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 用户活动日志
const activities = ref([])

// 状态管理
const message = ref('')
const messageType = ref('success') // success, error, warning, info
const loading = ref(false)
const basicInfoLoading = ref(false)
const passwordLoading = ref(false)
const avatarUploading = ref(false)
const activitiesLoading = ref(false)
const error = ref(false)

// 角色标签映射
const roleLabels = {
  'admin': '管理员',
  'teacher': '教师',
  'student': '学生'
}

// 计算属性：当前用户角色标签
const roleLabel = computed(() => {
  return roleLabels[userInfo.role] || userInfo.role
})

// 消息提示
const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 加载用户资料
const loadUserProfile = async () => {
  try {
    loading.value = true
    error.value = false
    
    // 调用服务获取用户资料
    const response = await profileService.getProfile()
    
    if (response.success) {
      Object.assign(userInfo, response.data)
      // 初始化表单数据
      initFormData()
      // 加载用户活动日志
      loadUserActivities()
    } else {
      error.value = true
      showMessage(response.error || '获取用户资料失败', 'error')
    }
  } catch (err) {
    error.value = true
    showMessage('获取用户资料失败，请稍后重试', 'error')
    console.error('加载用户资料失败:', err)
  } finally {
    loading.value = false
  }
}

// 初始化表单数据
const initFormData = () => {
  Object.assign(basicInfoForm, {
    name: userInfo.name || '',
    email: userInfo.email || '',
    phone: userInfo.phone || '',
    department: userInfo.department || '',
    position: userInfo.position || '',
    bio: userInfo.bio || ''
  })
}

// 保存基本信息
const saveBasicInfo = async () => {
  // 表单验证
  if (!basicInfoForm.name.trim()) {
    showMessage('请输入姓名', 'warning')
    return
  }
  
  if (!basicInfoForm.email.trim()) {
    showMessage('请输入邮箱', 'warning')
    return
  }
  
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(basicInfoForm.email)) {
    showMessage('请输入有效的邮箱地址', 'warning')
    return
  }

  try {
    basicInfoLoading.value = true
    
    // 调用服务更新用户资料
    const response = await profileService.updateProfile(basicInfoForm)
    
    if (response.success) {
      // 更新本地用户信息
      Object.assign(userInfo, response.data)
      showMessage(response.message || '个人信息已更新', 'success')
    } else {
      showMessage(response.error || '保存失败，请稍后重试', 'error')
    }
  } catch (err) {
    showMessage('保存失败，请稍后重试', 'error')
    console.error('保存基本信息失败:', err)
  } finally {
    basicInfoLoading.value = false
  }
}

// 重置基本信息
const resetBasicInfo = () => {
  initFormData()
}

// 更新密码
const updatePassword = async () => {
  // 表单验证
  if (!passwordForm.currentPassword) {
    showMessage('请输入当前密码', 'warning')
    return
  }
  
  if (!passwordForm.newPassword) {
    showMessage('请输入新密码', 'warning')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    showMessage('新密码长度至少为6位', 'warning')
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showMessage('新密码和确认密码不一致', 'warning')
    return
  }

  try {
    passwordLoading.value = true
    
    // 调用服务更新密码
    const response = await profileService.changePassword(
      passwordForm.currentPassword, 
      passwordForm.newPassword
    )
    
    if (response.success) {
      // 清空表单
      cancelPasswordUpdate()
      showMessage(response.message || '密码已更新', 'success')
    } else {
      showMessage(response.error || '密码更新失败', 'error')
    }
  } catch (err) {
    showMessage('密码更新失败，请稍后重试', 'error')
    console.error('更新密码失败:', err)
  } finally {
    passwordLoading.value = false
  }
}

// 取消密码修改
const cancelPasswordUpdate = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 加载用户活动日志
const loadUserActivities = async () => {
  try {
    activitiesLoading.value = true
    const response = await profileService.getUserActivityLog(10)
    
    if (response.success) {
      activities.value = response.data
    }
  } catch (err) {
    console.error('加载用户活动日志失败:', err)
  } finally {
    activitiesLoading.value = false
  }
}

// 处理头像上传
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    showMessage('请上传有效的图片文件（JPG、PNG、GIF、WebP）', 'warning')
    return
  }
  
  // 验证文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    showMessage('图片文件大小不能超过2MB', 'warning')
    return
  }
  
  try {
    avatarUploading.value = true
    
    // 调用服务上传头像
    const response = await profileService.uploadAvatar(file)
    
    if (response.success) {
      // 更新头像URL
      userInfo.avatar = response.data.url
      showMessage(response.message || '头像上传成功', 'success')
    } else {
      showMessage(response.error || '头像上传失败', 'error')
    }
  } catch (err) {
    showMessage('头像上传失败，请稍后重试', 'error')
    console.error('上传头像失败:', err)
  } finally {
    avatarUploading.value = false
    // 清空文件输入，允许重复上传同一文件
    event.target.value = ''
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (err) {
    return dateString
  }
}

// 初始化数据
onMounted(() => {
  loadUserProfile()
})
</script>

<template>
  <MainLayout>
    <div class="profile-page">
      <!-- 消息提示 -->
      <div v-if="message" :class="['message-toast', messageType]">{{ message }}</div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">加载失败</h3>
        <p class="error-message">无法获取用户信息，请稍后重试</p>
        <button class="btn btn-primary" @click="loadUserProfile">重新加载</button>
      </div>

      <template v-else>
        <!-- 用户信息头部 -->
        <section class="card">
          <div class="profile-header">
            <!-- 头像区域 -->
            <div class="avatar-container" @click="avatarUploading ? null : $refs.avatarInput.click()" :class="{ 'uploading': avatarUploading }">
              <div v-if="userInfo.avatar" class="avatar-image-wrapper">
                <img :src="userInfo.avatar" alt="用户头像" class="avatar-image" />
                <div class="avatar-upload-overlay">
                  <span>更换头像</span>
                </div>
              </div>
              <div v-else class="avatar-text"></div><!-- 头像区域：移除了文字显示，保持纯橙色背景 -->
              <div v-if="avatarUploading" class="avatar-loading">
                <div class="loading-spinner small"></div>
              </div>
              <input 
                ref="avatarInput" 
                type="file" 
                accept="image/*" 
                style="display: none" 
                @change="handleAvatarUpload"
              />
            </div>
            
            <!-- 用户基本信息 -->
            <div class="user-details">
              <div class="user-name">{{ userInfo.name }}</div>
              <div class="user-meta">
                <span class="user-email">{{ userInfo.email }}</span>
                <span class="meta-separator">•</span>
                <span class="user-role">
                  <span class="role-badge" :class="`role-${userInfo.role}`">
                    {{ roleLabel }}
                  </span>
                </span>
              </div>
              <div class="user-info-grid">
                <div class="info-item">
                  <span class="info-label">部门：</span>
                  <span class="info-value">{{ userInfo.department || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">职位：</span>
                  <span class="info-value">{{ userInfo.position || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">加入时间：</span>
                  <span class="info-value">{{ userInfo.joinDate ? formatDate(userInfo.joinDate) : '未知' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">上次登录：</span>
                  <span class="info-value">{{ userInfo.lastLogin }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- 两列布局 -->
        <div class="grid-2">
          <!-- 基本信息卡片 -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">基本信息</div>
            </div>
            <div class="form-group">
              <label class="form-label">姓名 <span class="required">*</span></label>
              <input 
                v-model="basicInfoForm.name" 
                class="form-input" 
                type="text"
                :disabled="basicInfoLoading"
                placeholder="请输入姓名"
              >
            </div>
            <div class="form-group">
              <label class="form-label">邮箱 <span class="required">*</span></label>
              <input 
                v-model="basicInfoForm.email" 
                class="form-input" 
                type="email"
                :disabled="basicInfoLoading"
                placeholder="请输入邮箱"
              >
            </div>
            <div class="form-group">
              <label class="form-label">手机号</label>
              <input 
                v-model="basicInfoForm.phone" 
                class="form-input" 
                type="tel"
                :disabled="basicInfoLoading"
                placeholder="请输入手机号"
              >
            </div>
            <div class="form-group">
              <label class="form-label">部门</label>
              <input 
                v-model="basicInfoForm.department" 
                class="form-input" 
                type="text"
                :disabled="basicInfoLoading"
                placeholder="请输入部门"
              >
            </div>
            <div class="form-group">
              <label class="form-label">职位</label>
              <input 
                v-model="basicInfoForm.position" 
                class="form-input" 
                type="text"
                :disabled="basicInfoLoading"
                placeholder="请输入职位"
              >
            </div>
            <div class="form-group">
              <label class="form-label">个人简介</label>
              <textarea 
                v-model="basicInfoForm.bio" 
                class="form-input textarea"
                :disabled="basicInfoLoading"
                placeholder="请输入个人简介"
                rows="3"
              ></textarea>
            </div>
            <div class="actions">
              <button class="btn btn-secondary" @click="resetBasicInfo" :disabled="basicInfoLoading">重置</button>
              <button class="btn btn-primary" @click="saveBasicInfo" :disabled="basicInfoLoading">
                <span v-if="basicInfoLoading" class="loading-spinner small"></span>
                保存
              </button>
            </div>
          </div>

          <!-- 修改密码卡片 -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">修改密码</div>
            </div>
            <div class="form-group">
              <label class="form-label">当前密码 <span class="required">*</span></label>
              <input 
                v-model="passwordForm.currentPassword" 
                class="form-input" 
                type="password"
                :disabled="passwordLoading"
                placeholder="当前密码"
              >
            </div>
            <div class="form-group">
              <label class="form-label">新密码 <span class="required">*</span></label>
              <input 
                v-model="passwordForm.newPassword" 
                class="form-input" 
                type="password"
                :disabled="passwordLoading"
                placeholder="新密码（至少6位）"
              >
            </div>
            <div class="form-group">
              <label class="form-label">确认新密码 <span class="required">*</span></label>
              <input 
                v-model="passwordForm.confirmPassword" 
                class="form-input" 
                type="password"
                :disabled="passwordLoading"
                placeholder="确认新密码"
              >
            </div>
            <div class="actions">
              <button class="btn btn-secondary" @click="cancelPasswordUpdate" :disabled="passwordLoading">取消</button>
              <button class="btn btn-primary" @click="updatePassword" :disabled="passwordLoading">
                <span v-if="passwordLoading" class="loading-spinner small"></span>
                更新密码
              </button>
            </div>
          </div>
        </div>

        <!-- 用户活动日志 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">最近活动</div>
            <button 
              class="btn btn-text" 
              @click="loadUserActivities" 
              :disabled="activitiesLoading"
            >
              {{ activitiesLoading ? '刷新中...' : '刷新' }}
            </button>
          </div>
          <div v-if="activities.length > 0" class="activities-list">
            <div v-for="(activity, index) in activities" :key="activity.id || index" class="activity-item">
              <div class="activity-icon"></div>
              <div class="activity-content">
                <div class="activity-action">{{ activity.action }}</div>
                <div class="activity-time">{{ activity.timestamp }}</div>
                <div v-if="activity.ip" class="activity-ip">IP: {{ activity.ip }}</div>
              </div>
            </div>
          </div>
          <div v-else-if="!activitiesLoading" class="empty-state">
            <div class="empty-icon">📋</div>
            <p class="empty-text">暂无活动记录</p>
          </div>
          <div v-else class="loading-state">
            <div class="loading-spinner"></div>
            <p class="loading-text">加载中...</p>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.profile-page {
  width: 100%;
  position: relative;
}

/* 消息提示 */
.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  color: white;
  font-size: 14px;
}

.message-toast.success {
  background-color: #34c759;
}

.message-toast.error {
  background-color: #ff3b30;
}

.message-toast.warning {
  background-color: #ffcc00;
  color: #000;
}

.message-toast.info {
  background-color: #007aff;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 加载状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.loading-text {
  margin-top: 16px;
  color: #86868b;
  font-size: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.error-message {
  color: #86868b;
  margin-bottom: 24px;
}

/* 卡片样式 */
.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #d1d1d6;
}

/* 用户信息头部 */
.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  display: inline-block;
  background-color: #ff6600 !important;
  border-radius: 50%;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.avatar-container:hover:not(.uploading) {
  transform: scale(1.1);
}

.avatar-image-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #ff8800;
  box-shadow: 0 3px 12px rgba(255, 102, 0, 0.3);
  transition: all 0.3s ease;
  background-color: #ff6600 !important;
}

.avatar-image-wrapper:hover {
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.5);
  border-color: #66b1ff;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.avatar-image-wrapper:hover .avatar-upload-overlay {
  opacity: 1;
}

.avatar-text {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ff6600 !important;
  color: white !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 32px;
  border: 3px solid #ff8800;
  box-shadow: 0 3px 12px rgba(255, 102, 0, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.avatar-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 700;
  font-size: 24px;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.user-email {
  color: #86868b;
  font-size: 16px;
}

.meta-separator {
  color: #d1d1d6;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-admin {
  background-color: #ff3b30;
  color: white;
}

.role-teacher {
  background-color: #007aff;
  color: white;
}

.role-student {
  background-color: #34c759;
  color: white;
}

.user-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: #86868b;
  font-size: 14px;
}

.info-value {
  color: #1d1d1f;
  font-size: 14px;
}

/* 网格布局 */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d1d1d6;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

/* 表单组 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #1d1d1f;
  font-size: 14px;
  margin-bottom: 8px;
}

.required {
  color: #ff3b30;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d1d6;
  border-radius: 12px;
  font-size: 16px;
  background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input:disabled {
  background-color: #f2f2f7;
  color: #86868b;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #86868b;
}

.form-input.textarea {
  resize: vertical;
  min-height: 80px;
}

/* 按钮组 */
.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background-color: #007aff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056cc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-secondary {
  background-color: #ffffff;
  color: #1d1d1f;
  border: 1px solid #d1d1d6;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f2f2f7;
  transform: translateY(-1px);
  border-color: #c7c7cc;
}

.btn-text {
  background: none;
  color: #007aff;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-text:hover:not(:disabled) {
  background-color: rgba(0, 122, 255, 0.08);
  transform: none;
}

/* 活动日志 */
.activities-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f2f2f7;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  background-color: #e3f2fd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-action {
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.activity-time {
  color: #86868b;
  font-size: 12px;
  margin-bottom: 4px;
}

.activity-ip {
  color: #86868b;
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #86868b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .grid-2 {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .user-details {
    width: 100%;
  }

  .user-meta {
    justify-content: center;
  }

  .user-info-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .card {
    padding: 16px;
    margin-bottom: 16px;
  }

  .activity-item {
    padding: 12px 0;
  }
}

@media (max-width: 480px) {
  .avatar-text {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .avatar-image-wrapper {
    width: 80px;
    height: 80px;
  }

  .user-name {
    font-size: 20px;
  }

  .user-meta {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .meta-separator {
    display: none;
  }
}
</style>