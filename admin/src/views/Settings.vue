<script setup>
import { ref, reactive, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { settingsAPI } from '../services/api'

// 加载状态
const loading = ref(false)
const saving = ref(false)

// 维护窗口设置
const maintenanceWindow = reactive({
  enabled: false,
  startAt: '',
  endAt: '',
  message: ''
})

// 密码策略设置
const passwordPolicy = reactive({
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: false,
  expiryDays: null
})

// 告警阈值设置
const alertThresholds = reactive({
  loginFailure: 5,
  storageUsagePercent: 80,
  jobQueueDelayMinutes: 10
})

// 消息提示
const message = ref('')
const messageType = ref('success') // 'success' or 'error'
const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 格式化日期时间（用于显示）
const formatDateTime = (instant) => {
  if (!instant) return ''
  const date = new Date(instant)
  if (isNaN(date.getTime())) return ''
  // 格式化为 YYYY-MM-DDTHH:mm 用于 datetime-local 输入
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 解析日期时间（从 datetime-local 输入）
const parseDateTime = (dateTimeString) => {
  if (!dateTimeString) return null
  return new Date(dateTimeString).toISOString()
}

// 加载系统设置
const loadSettings = async () => {
  loading.value = true
  try {
    const response = await settingsAPI.getSettings()
    const data = response.data || response
    
    // 更新维护窗口
    if (data.maintenanceWindow) {
      maintenanceWindow.enabled = data.maintenanceWindow.enabled || false
      maintenanceWindow.startAt = formatDateTime(data.maintenanceWindow.startAt)
      maintenanceWindow.endAt = formatDateTime(data.maintenanceWindow.endAt)
      maintenanceWindow.message = data.maintenanceWindow.message || ''
    }
    
    // 更新密码策略
    if (data.passwordPolicy) {
      passwordPolicy.minLength = data.passwordPolicy.minLength || 8
      passwordPolicy.requireUppercase = data.passwordPolicy.requireUppercase !== undefined ? data.passwordPolicy.requireUppercase : true
      passwordPolicy.requireNumber = data.passwordPolicy.requireNumber !== undefined ? data.passwordPolicy.requireNumber : true
      passwordPolicy.requireSpecial = data.passwordPolicy.requireSpecial !== undefined ? data.passwordPolicy.requireSpecial : false
      passwordPolicy.expiryDays = data.passwordPolicy.expiryDays || null
    }
    
    // 更新告警阈值
    if (data.alertThresholds) {
      alertThresholds.loginFailure = data.alertThresholds.loginFailure || 5
      alertThresholds.storageUsagePercent = data.alertThresholds.storageUsagePercent || 80
      alertThresholds.jobQueueDelayMinutes = data.alertThresholds.jobQueueDelayMinutes || 10
    }
  } catch (err) {
    console.error('加载系统设置失败:', err)
    showMessage('加载设置失败: ' + (err.message || '未知错误'), 'error')
  } finally {
    loading.value = false
  }
}

// 保存系统设置
const saveSettings = async () => {
  saving.value = true
  try {
    const requestData = {
      maintenanceWindow: {
        enabled: maintenanceWindow.enabled,
        startAt: maintenanceWindow.startAt ? parseDateTime(maintenanceWindow.startAt) : null,
        endAt: maintenanceWindow.endAt ? parseDateTime(maintenanceWindow.endAt) : null,
        message: maintenanceWindow.message || null
      },
      passwordPolicy: {
        minLength: passwordPolicy.minLength,
        requireUppercase: passwordPolicy.requireUppercase,
        requireNumber: passwordPolicy.requireNumber,
        requireSpecial: passwordPolicy.requireSpecial,
        expiryDays: passwordPolicy.expiryDays || null
      },
      alertThresholds: {
        loginFailure: alertThresholds.loginFailure,
        storageUsagePercent: alertThresholds.storageUsagePercent,
        jobQueueDelayMinutes: alertThresholds.jobQueueDelayMinutes
      }
    }
    
    // 只发送有值的字段
    if (!maintenanceWindow.enabled) {
      requestData.maintenanceWindow = null
    }
    
    console.log('保存系统设置:', requestData)
    const response = await settingsAPI.updateSettings(requestData)
    console.log('保存成功:', response)
    
    showMessage('设置保存成功')
    
    // 重新加载设置以获取最新值
    await loadSettings()
  } catch (err) {
    console.error('保存系统设置失败:', err)
    const errorMsg = err?.message || err?.error || '保存失败，请稍后重试'
    showMessage('保存失败: ' + errorMsg, 'error')
  } finally {
    saving.value = false
  }
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<template>
  <MainLayout>
    <main class="main-content">
      <header class="header">
        <h1>系统设置</h1>
        <button class="btn btn-primary" @click="saveSettings" :disabled="loading || saving">
          {{ saving ? '保存中...' : '保存所有设置' }}
        </button>
      </header>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载系统设置...</p>
      </div>

      <!-- 设置内容 -->
      <div v-else>
        <!-- 维护窗口设置 -->
        <section class="card">
          <div class="card-header">
            <div class="card-title">维护窗口</div>
          </div>
          <div class="form-row">
            <label class="form-label">启用维护模式</label>
            <div class="switch">
              <input 
                type="checkbox" 
                v-model="maintenanceWindow.enabled"
              >
              <span class="desc">启用后系统将进入维护模式</span>
            </div>
          </div>
          <div v-if="maintenanceWindow.enabled" class="form-row">
            <label class="form-label">维护开始时间</label>
            <input 
              class="form-input" 
              type="datetime-local"
              v-model="maintenanceWindow.startAt"
            >
          </div>
          <div v-if="maintenanceWindow.enabled" class="form-row">
            <label class="form-label">维护结束时间</label>
            <input 
              class="form-input" 
              type="datetime-local"
              v-model="maintenanceWindow.endAt"
            >
          </div>
          <div v-if="maintenanceWindow.enabled" class="form-row">
            <label class="form-label">维护公告</label>
            <textarea 
              class="form-input form-textarea" 
              v-model="maintenanceWindow.message"
              placeholder="输入维护公告信息（最多512字符）"
              maxlength="512"
            ></textarea>
            <span class="char-count">{{ maintenanceWindow.message.length }}/512</span>
          </div>
        </section>

        <!-- 设置网格 -->
        <section class="settings-grid">
          <!-- 密码策略设置 -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">密码策略</div>
            </div>
            <div class="form-row">
              <label class="form-label">最小长度</label>
              <input 
                class="form-input" 
                type="number"
                v-model.number="passwordPolicy.minLength"
                min="6"
                max="128"
              >
              <span class="form-hint">6-128 字符</span>
            </div>
            <div class="form-row">
              <label class="form-label">要求大写字母</label>
              <div class="switch">
                <input 
                  type="checkbox" 
                  v-model="passwordPolicy.requireUppercase"
                >
                <span class="desc">密码必须包含大写字母</span>
              </div>
            </div>
            <div class="form-row">
              <label class="form-label">要求数字</label>
              <div class="switch">
                <input 
                  type="checkbox" 
                  v-model="passwordPolicy.requireNumber"
                >
                <span class="desc">密码必须包含数字</span>
              </div>
            </div>
            <div class="form-row">
              <label class="form-label">要求特殊字符</label>
              <div class="switch">
                <input 
                  type="checkbox" 
                  v-model="passwordPolicy.requireSpecial"
                >
                <span class="desc">密码必须包含特殊字符</span>
              </div>
            </div>
            <div class="form-row">
              <label class="form-label">密码过期天数</label>
              <input 
                class="form-input" 
                type="number"
                v-model.number="passwordPolicy.expiryDays"
                min="1"
                max="365"
                placeholder="留空表示永不过期"
              >
              <span class="form-hint">1-365 天，留空表示永不过期</span>
            </div>
          </div>

          <!-- 告警阈值设置 -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">告警阈值</div>
            </div>
            <div class="form-row">
              <label class="form-label">登录失败阈值</label>
              <input 
                class="form-input" 
                type="number"
                v-model.number="alertThresholds.loginFailure"
                min="1"
                max="100"
              >
              <span class="form-hint">1-100 次失败后触发告警</span>
            </div>
            <div class="form-row">
              <label class="form-label">存储使用率阈值</label>
              <input 
                class="form-input" 
                type="number"
                v-model.number="alertThresholds.storageUsagePercent"
                min="1"
                max="100"
              >
              <span class="form-hint">1-100%，超过此值触发告警</span>
            </div>
            <div class="form-row">
              <label class="form-label">任务队列延迟阈值</label>
              <input 
                class="form-input" 
                type="number"
                v-model.number="alertThresholds.jobQueueDelayMinutes"
                min="1"
                max="1440"
              >
              <span class="form-hint">1-1440 分钟，超过此值触发告警</span>
            </div>
          </div>
        </section>
      </div>

      <!-- 消息提示 -->
      <div v-if="message" :class="['message-toast', messageType === 'error' ? 'message-error' : 'message-success']">
        {{ message }}
      </div>
    </main>
  </MainLayout>
</template>

<style scoped>
.main-content {
  padding: 24px;
  min-height: 100vh;
}

/* 卡片样式 - 与 HTML 版本一致 */
.card {
  background: #ffffff;
  border-radius: 12px;
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

.form-input::placeholder {
  color: #86868b;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
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
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.switch input {
  width: 42px;
  height: 24px;
  cursor: pointer;
}

.desc {
  color: #86868b;
  font-size: 14px;
}

/* 按钮样式 - 与 HTML 版本一致 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 24px;
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

.btn-secondary {
  background-color: #ffffff;
  color: #1d1d1f;
  border: 1px solid #d1d1d6;
}

.btn-secondary:hover {
  background-color: #f2f2f7;
  transform: translateY(-1px);
}

.header {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #d1d1d6;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #86868b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-hint {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
}

.char-count {
  font-size: 12px;
  color: #86868b;
  text-align: right;
  margin-top: 4px;
}

/* 消息提示 */
.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.message-success {
  background-color: #34c759;
}

.message-error {
  background-color: #ff3b30;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
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
}
</style>

