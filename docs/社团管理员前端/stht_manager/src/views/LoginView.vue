<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo">
        <el-avatar :size="60" icon="el-icon-user" style="background-color: #f76707" />
        <h2>社团管理员登录</h2>
        <p class="subtitle">管理员的社团管理系统</p>
      </div>
      
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px">
        <el-form-item label="用户名" prop="username" class="login-input-item">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            prefix-icon="el-icon-user"
            class="form-input"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" class="login-input-item">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            class="form-input"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            class="login-btn"
            @click="handleLogin"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <el-button type="text" @click="goToHome">返回主页面</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const loginFormRef = ref<FormInstance | null>(null)
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const loginRules = ref<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 使用localStorage模拟登录
    if (loginForm.value.username && loginForm.value.password) {
      localStorage.setItem('token', 'mock_token')
      localStorage.setItem('username', loginForm.value.username)
      localStorage.setItem('isLoggedIn', 'true')
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } else {
      ElMessage.error('登录失败，请检查用户名和密码')
    }
  } catch (error) {
    ElMessage.error('登录失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

const goToHome = () => {
  // 这里可以跳转到学校主页或其他页面
  ElMessage.info('返回主页面功能待实现')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: linear-gradient(135deg, #4ade80 0%, #facc15 100%);
  position: relative;
  overflow: hidden;
  animation: gradientBG 15s ease infinite;
  background-size: 400% 400%;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 添加装饰元素 */
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(10%, 10%) rotate(5deg);
  }
}

.login-form {
  width: 420px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-form:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.16);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.4);
}

.logo {
  text-align: center;
  margin-bottom: 40px;
}

.logo .el-avatar {
  background: linear-gradient(135deg, #4ade80 0%, #facc15 100%) !important;
  transition: all 0.3s ease;
}

.logo .el-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
}

.logo h2 {
  margin: 20px 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #4ade80, #facc15);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

/* 表单样式优化 */
:deep(.el-form) {
  width: 100%;
}

/* 登录输入框项 */
.login-input-item {
  margin-bottom: 28px;
  position: relative;
}

/* 输入框样式优化 */
:deep(.form-input) {
  width: 100%;
  height: 44px;
  transition: all 0.3s;
}

/* 优化输入框外观 */
:deep(.el-input__wrapper) {
  box-shadow: none !important;
  border-radius: 8px;
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
  overflow: visible;
}

:deep(.el-input__wrapper:hover) {
  border-color: #4ade80;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #4ade80;
  box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.2);
}

:deep(.el-input__inner) {
  padding: 12px 16px;
  font-size: 14px;
  height: 40px;
  border: none;
  box-shadow: none;
  background: transparent;
}

/* 表单标签样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
  padding: 0 12px 0 0;
}

:deep(.el-form-item__label:hover) {
  color: #1890ff;
}

:deep(.el-input__inner:focus) {
  border-color: #4ade80;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.2);
  outline: none;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #4ade80 0%, #facc15 100%);
  border-color: #4ade80;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(74, 222, 128, 0.3);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s;
}

.login-btn:hover {
  background: linear-gradient(135deg, #34d399 0%, #eab308 100%);
  border-color: #34d399;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.4);
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(24, 144, 255, 0.3);
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

:deep(.login-footer .el-button) {
  font-size: 14px;
  color: #606266;
  background: transparent;
  border: 1px solid transparent;
  padding: 6px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.login-footer .el-button:hover) {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
  border-color: rgba(24, 144, 255, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-form {
    width: 90%;
    max-width: 400px;
    padding: 36px 28px;
    margin: 0 20px;
  }
  
  .logo h2 {
    font-size: 20px;
  }
  
  :deep(.el-input__inner) {
    height: 40px;
    padding: 10px 14px;
  }
  
  .login-btn {
    height: 40px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .login-form {
    padding: 32px 24px;
  }
  
  .logo {
    margin-bottom: 32px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}
</style>