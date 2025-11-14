<script setup>
import { ref, reactive, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import settingsService from '../services/settingsService.js'

// 加载状态
const loading = ref(false)
const error = ref('')

// 基本设置
const basicSettings = reactive({
  platformName: '智慧学习平台',
  defaultSemester: '春季学期',
  announcement: ''
})

// 安全设置
const securitySettings = reactive({
  strongPassword: true,
  twoFactorAuth: false,
  sessionTimeout: '30分钟'
})

// 通知设置
const notificationSettings = reactive({
  systemNotification: true,
  courseReview: true,
  alertNotification: true
})

// 外观设置
const appearanceSettings = reactive({
  themeColor: '默认（蓝）',
  borderRadius: '默认'
})

// 导入/导出相关
const importJson = ref('')
const showImportModal = ref(false)

// 消息提示
const message = ref('')
const messageType = ref('success') // success, error, info

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 加载设置数据
const loadSettings = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await settingsService.getAllSettings()
    if (response.success) {
      // 更新所有设置
      Object.assign(basicSettings, response.data.basicSettings)
      Object.assign(securitySettings, response.data.securitySettings)
      Object.assign(notificationSettings, response.data.notificationSettings)
      Object.assign(appearanceSettings, response.data.appearanceSettings)
    }
  } catch (err) {
    error.value = '加载设置失败'
    showMessage('加载设置失败，请稍后重试', 'error')
    console.error('加载设置失败:', err)
  } finally {
    loading.value = false
  }
}

// 保存基本设置
const saveBasicSettings = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await settingsService.saveBasicSettings(basicSettings)
    if (response.success) {
      showMessage('基本设置保存成功')
    }
  } catch (err) {
    error.value = '保存设置失败'
    showMessage('保存设置失败，请稍后重试', 'error')
    console.error('保存基本设置失败:', err)
  } finally {
    loading.value = false
  }
}

// 重置基本设置
const resetBasicSettings = () => {
  basicSettings.platformName = '智慧学习平台'
  basicSettings.defaultSemester = '春季学期'
  basicSettings.announcement = ''
  showMessage('基本设置已重置', 'info')
}

// 保存安全设置
const saveSecuritySettings = async () => {
  loading.value = true
  try {
    const response = await settingsService.saveSecuritySettings(securitySettings)
    if (response.success) {
      showMessage('安全设置保存成功')
    }
  } catch (err) {
    showMessage('保存安全设置失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

// 保存通知设置
const saveNotificationSettings = async () => {
  loading.value = true
  try {
    const response = await settingsService.saveNotificationSettings(notificationSettings)
    if (response.success) {
      showMessage('通知设置保存成功')
    }
  } catch (err) {
    showMessage('保存通知设置失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

// 保存外观设置
const saveAppearanceSettings = async () => {
  loading.value = true
  try {
    const response = await settingsService.saveAppearanceSettings(appearanceSettings)
    if (response.success) {
      showMessage('外观设置保存成功')
    }
  } catch (err) {
    showMessage('保存外观设置失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

// 重置所有设置
const resetAllSettings = async () => {
  if (confirm('确定要将所有设置重置到默认值吗？此操作不可撤销。')) {
    loading.value = true
    try {
      const response = await settingsService.resetAllSettings()
      if (response.success) {
        Object.assign(basicSettings, response.data.basicSettings)
        Object.assign(securitySettings, response.data.securitySettings)
        Object.assign(notificationSettings, response.data.notificationSettings)
        Object.assign(appearanceSettings, response.data.appearanceSettings)
        showMessage('所有设置已重置到默认值')
      }
    } catch (err) {
      showMessage('重置设置失败，请稍后重试', 'error')
    } finally {
      loading.value = false
    }
  }
}

// 导出设置
const exportSettings = async () => {
  loading.value = true
  try {
    const response = await settingsService.exportSettings()
    if (response.success) {
      // 创建下载链接
      const blob = new Blob([response.data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `platform-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showMessage('设置导出成功')
    }
  } catch (err) {
    showMessage('导出设置失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

// 导入设置
const importSettings = async () => {
  if (!importJson.value.trim()) {
    showMessage('请输入有效的设置JSON数据', 'error')
    return
  }

  loading.value = true
  try {
    const response = await settingsService.importSettings(importJson.value)
    if (response.success) {
      Object.assign(basicSettings, response.data.basicSettings)
      Object.assign(securitySettings, response.data.securitySettings)
      Object.assign(notificationSettings, response.data.notificationSettings)
      Object.assign(appearanceSettings, response.data.appearanceSettings)
      showMessage('设置导入成功')
      showImportModal.value = false
      importJson.value = ''
    } else {
      showMessage(response.message, 'error')
    }
  } catch (err) {
    showMessage('导入设置失败，请检查JSON格式', 'error')
  } finally {
    loading.value = false
  }
}

// 监听主题色变化，应用到页面
const applyThemeColor = (color) => {
  document.documentElement.style.setProperty('--primary-color', 
    color === '默认（蓝）' ? '#007aff' : 
    color === '紫色' ? '#8e44ad' : 
    color === '绿色' ? '#27ae60' : '#007aff'
  )
}

// 监听圆角大小变化
const applyBorderRadius = (radius) => {
  document.documentElement.style.setProperty('--border-radius', 
    radius === '默认' ? '12px' : 
    radius === '较小' ? '8px' : 
    radius === '较大' ? '16px' : '12px'
  )
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
  
  // 监听设置变化以实时应用主题
  const originalSet = Object.getOwnPropertyDescriptor(Object.prototype, 'set')
  Object.defineProperties(appearanceSettings, {
    themeColor: {
      set(value) {
        this._themeColor = value
        applyThemeColor(value)
      },
      get() {
        return this._themeColor
      }
    },
    borderRadius: {
      set(value) {
        this._borderRadius = value
        applyBorderRadius(value)
      },
      get() {
        return this._borderRadius
      }
    }
  })
})
</script>

<template>
  <MainLayout>
    <main class="main-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-banner">
        {{ error }}
      </div>

      <!-- 操作按钮组 -->
      <div class="actions-header">
        <h1 class="page-title">系统设置</h1>
        <div class="action-buttons">
          <button class="btn btn-secondary" @click="exportSettings">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M2 8L8 14L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            导出设置
          </button>
          <button class="btn btn-secondary" @click="showImportModal = true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 14V2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M14 8L8 2L2 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            导入设置
          </button>
          <button class="btn btn-warning" @click="resetAllSettings">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8C2 4.68629 4.68629 2 8 2C9.4541 2 10.7756 2.56491 11.8284 3.53553L10.4142 4.94975C9.5754 4.17697 8.33107 3.69676 7.00001 3.69676C4.06701 3.69676 1.69699 6.06701 1.69699 9C1.69699 11.933 4.06701 14.303 7.00001 14.303C9.93301 14.303 12.303 11.933 12.303 9C12.303 7.66893 11.8227 6.42461 11.0499 5.58581L12.4645 4.17207C13.4351 5.22437 14 6.5459 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            重置所有设置
          </button>
        </div>
      </div>

      <!-- 基本设置 -->
      <section class="card">
        <h2 class="section-title">基本设置</h2>
        <div class="form-row">
          <label class="form-label">平台名称</label>
          <input 
            class="form-input" 
            v-model="basicSettings.platformName"
            type="text"
            :disabled="loading"
          >
        </div>
        <div class="form-row">
          <label class="form-label">默认学期</label>
          <select class="form-input form-select" v-model="basicSettings.defaultSemester" :disabled="loading">
            <option>春季学期</option>
            <option>秋季学期</option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">公告</label>
          <textarea 
            class="form-input form-textarea" 
            v-model="basicSettings.announcement"
            placeholder="输入平台公告..."
            :disabled="loading"
          ></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="resetBasicSettings" :disabled="loading">重置</button>
          <button class="btn btn-primary" @click="saveBasicSettings" :disabled="loading">保存</button>
        </div>
      </section>

      <!-- 设置网格 -->
      <section class="settings-grid">
        <!-- 安全设置 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">安全设置</div>
            <button class="btn btn-sm btn-primary" @click="saveSecuritySettings" :disabled="loading">保存</button>
          </div>
          <div class="form-row">
            <label class="form-label">强密码策略</label>
            <div class="switch">
              <input 
                type="checkbox" 
                v-model="securitySettings.strongPassword"
                :disabled="loading"
              >
              <span class="desc">要求包含数字与特殊字符</span>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">两步验证</label>
            <div class="switch">
              <input 
                type="checkbox" 
                v-model="securitySettings.twoFactorAuth"
                :disabled="loading"
              >
              <span class="desc">登录时短信验证码</span>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">会话超时</label>
            <select class="form-input form-select" v-model="securitySettings.sessionTimeout" :disabled="loading">
              <option>30分钟</option>
              <option>1小时</option>
              <option>2小时</option>
            </select>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">通知设置</div>
            <button class="btn btn-sm btn-primary" @click="saveNotificationSettings" :disabled="loading">保存</button>
          </div>
          <div class="form-row">
            <label class="form-label">系统通知</label>
            <div class="switch">
              <input 
                type="checkbox" 
                v-model="notificationSettings.systemNotification"
                :disabled="loading"
              >
              <span class="desc">接收系统更新通知</span>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">课程审核</label>
            <div class="switch">
              <input 
                type="checkbox" 
                v-model="notificationSettings.courseReview"
                :disabled="loading"
              >
              <span class="desc">有新课程提交时提醒</span>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">异常告警</label>
            <div class="switch">
              <input 
                type="checkbox" 
                v-model="notificationSettings.alertNotification"
                :disabled="loading"
              >
              <span class="desc">服务异常自动通知</span>
            </div>
          </div>
        </div>

        <!-- 外观设置 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">外观设置</div>
            <button class="btn btn-sm btn-primary" @click="saveAppearanceSettings" :disabled="loading">保存</button>
          </div>
          <div class="form-row">
            <label class="form-label">主题色</label>
            <select class="form-input form-select" v-model="appearanceSettings.themeColor" :disabled="loading">
              <option>默认（蓝）</option>
              <option>紫色</option>
              <option>绿色</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">圆角大小</label>
            <select class="form-input form-select" v-model="appearanceSettings.borderRadius" :disabled="loading">
              <option>默认</option>
              <option>较小</option>
              <option>较大</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 消息提示 -->
      <div 
        v-if="message" 
        class="message-toast" 
        :class="`message-${messageType}`"
      >
        {{ message }}
      </div>

      <!-- 导入设置模态框 -->
      <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>导入设置</h3>
            <button class="close-btn" @click="showImportModal = false">×</button>
          </div>
          <div class="modal-body">
            <p>请粘贴设置的JSON数据，或从文件中复制内容：</p>
            <textarea 
              v-model="importJson" 
              class="form-input form-textarea import-textarea"
              placeholder="粘贴设置JSON数据..."
              rows="10"
              :disabled="loading"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showImportModal = false" :disabled="loading">取消</button>
            <button class="btn btn-primary" @click="importSettings" :disabled="loading">导入</button>
          </div>
        </div>
      </div>
    </main>
  </MainLayout>
</template>

<style scoped>
/* CSS变量定义 */
:root {
  --primary-color: #007aff;
  --border-radius: 12px;
}

.main-content {
  padding: 24px;
  min-height: 100vh;
  position: relative;
}

/* 加载遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示条 */
.error-banner {
  background-color: #ff3b30;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

/* 操作按钮组 */
.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 卡片样式 */
.card {
  background: #ffffff;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid #d1d1d6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d1d1d6;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 24px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

/* 表单样式 */
.form-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 0;
  font-weight: 500;
  color: #1d1d1f;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d1d6;
  border-radius: var(--border-radius);
  font-size: 16px;
  background-color: #ffffff;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input::placeholder {
  color: #86868b;
}

.form-input:disabled {
  background-color: #f2f2f7;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.import-textarea {
  min-height: 200px;
  font-family: monospace;
  font-size: 14px;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
  margin-bottom: 0;
}

/* 开关样式 */
.switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.switch input[type="checkbox"] {
  position: relative;
  width: 42px;
  height: 24px;
  appearance: none;
  background-color: #d1d1d6;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 0;
}

.switch input[type="checkbox"]:checked {
  background-color: var(--primary-color);
}

.switch input[type="checkbox"]::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.switch input[type="checkbox"]:checked::before {
  transform: translateX(18px);
}

.switch input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.desc {
  color: #86868b;
  font-size: 14px;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 24px;
  border: none;
  border-radius: var(--border-radius);
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
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056cc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background-color: #ffffff;
  color: #1d1d1f;
  border: 1px solid #d1d1d6;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f2f2f7;
  transform: translateY(-1px);
}

.btn-warning {
  background-color: #ff9500;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background-color: #cc7a00;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-sm {
  padding: 6px 16px;
  font-size: 14px;
  min-height: 36px;
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
  font-weight: 500;
}

.message-success {
  background-color: #34c759;
  color: white;
}

.message-error {
  background-color: #ff3b30;
  color: white;
}

.message-info {
  background-color: #5ac8fa;
  color: white;
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

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background-color: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #d1d1d6;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #86868b;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f2f2f7;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin-bottom: 16px;
  color: #6e6e73;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 20px 24px;
  border-top: 1px solid #d1d1d6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .actions-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-title {
    text-align: center;
  }

  .action-buttons {
    justify-content: center;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .form-label {
    margin-bottom: 4px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .modal-content {
    width: 95%;
    margin: 16px;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>