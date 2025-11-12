<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 表单数据
const form = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' }
  ]
}

// 表单引用
const loginFormRef = ref()

// 提交登录
const handleLogin = () => {
  loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 在实际项目中，这里应该调用登录API
      // 模拟登录成功
      setTimeout(() => {
        // 保存登录状态（实际项目中应该使用token）
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('username', form.username)
        
        ElMessage.success('登录成功')
        router.push('/dashboard')
      }, 1000)
    } else {
      return false
    }
  })
}

// 返回主页面
const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">社</div>
          <span class="logo-text">社团管理系统</span>
        </div>
        <h2 class="login-title">管理员登录</h2>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="form"
        :rules="rules"
        class="login-form"
        label-position="left"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item class="login-btn-group">
          <el-button type="primary" @click="handleLogin" class="login-btn" :loading="false">
            登录
          </el-button>
          <el-button @click="goToHome" class="home-btn">
            返回主页面
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 32px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background-color: #1890ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.logo-text {
  margin-left: 10px;
  font-size: 22px;
  font-weight: 600;
  color: #1890ff;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  width: 80px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 6px;
  transition: all 0.3s;
}

.login-form :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.login-btn-group {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.login-btn {
  flex: 1;
  height: 40px;
  font-size: 16px;
  background-color: #1890ff;
  border-color: #1890ff;
  transition: all 0.3s;
}

.login-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-1px);
}

.home-btn {
  flex: 1;
  height: 40px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-wrapper {
    padding: 24px;
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .logo-text {
    font-size: 20px;
  }
  
  .login-title {
    font-size: 22px;
  }
  
  .login-btn-group {
    flex-direction: column;
  }
  
  .login-form :deep(.el-form-item__label) {
    width: 70px;
  }
}
</style>