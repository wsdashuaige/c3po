<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../services'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const verificationCode = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// 登录功能所需变量

// 生成随机验证码
const generateVerificationCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const currentCode = ref(generateVerificationCode())

const refreshCode = () => {
  currentCode.value = generateVerificationCode()
}



const handleLogin = async () => {
  // 简单的表单验证
  if (!username.value.trim() || !password.value.trim() || !verificationCode.value.trim()) {
    errorMessage.value = '请填写所有必填字段'
    return
  }

  // 验证验证码
  if (verificationCode.value.toLowerCase() !== currentCode.value.toLowerCase()) {
    errorMessage.value = '验证码错误'
    refreshCode()
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // 调用登录服务，传入正确的参数格式
    const response = await authService.login(
      username.value,
      password.value,
      verificationCode.value
    )
    
    // 检查登录是否成功
    if (response.success) {
      // 登录成功后跳转到仪表盘或重定向路径
      const redirectPath = route.query.redirect || '/admin/dashboard'
      router.push(redirectPath)
    } else {
      // 登录失败，显示错误信息
      errorMessage.value = response.error || '用户名或密码错误'
      refreshCode()
    }
  } catch (error) {
    // 处理可能的异常
    console.error('登录失败:', error)
    errorMessage.value = '登录过程中出现错误，请重试'
    refreshCode()
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">管理系统 - 管理员登录</h1>
        <p class="login-subtitle">请输入管理员账号密码登录</p>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">账号</label>
          <input 
            type="text" 
            class="form-input" 
            v-model="username" 
            placeholder="请输入管理员账号" 
            required
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <input 
            type="password" 
            class="form-input" 
            v-model="password" 
            placeholder="请输入密码"
            required
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="verification-input-wrapper">
            <input 
              type="text" 
              class="form-input verification-input" 
              v-model="verificationCode" 
              placeholder="请输入验证码"
              required
              :disabled="isLoading"
            />
            <div 
              class="verification-code-display" 
              @click="refreshCode"
              title="点击刷新"
              :disabled="isLoading"
            >
              {{ currentCode }}
            </div>
          </div>
        </div>
        
        <div class="forgot-password-wrapper">
          <a href="/forgot-password" class="forgot-password">忘记密码？</a>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary w-full"
          :disabled="isLoading"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
      

    </div>
  </div>
</template>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
}

.login-container {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  margin: 16px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #86868b;
  font-size: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.verification-input-wrapper {
  display: flex;
  gap: 12px;
}

.verification-input {
  flex: 1;
}

.verification-code-display {
  min-width: 100px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.verification-code-display:hover:not([disabled]) {
  opacity: 0.9;
}

.verification-code-display[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-password-wrapper {
  text-align: right;
  margin-bottom: 16px;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  text-align: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5a67d8;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #cbd5e0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.mock-accounts-info {
  margin-top: 24px;
  padding: 16px;
  background-color: #f7fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.mock-accounts-info h4 {
  margin: 0 0 12px 0;
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
}

.mock-accounts-info ul {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #718096;
  line-height: 1.5;
}

.mock-accounts-info li {
  margin-bottom: 4px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 24px;
  }
  
  .verification-input-wrapper {
    flex-direction: column;
  }
  
  .verification-code-display {
    min-width: auto;
  }
}
</style>