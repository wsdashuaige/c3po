import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  username: string
  role: string
 社团管理员?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<User | null>(null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  function login(username: string, password: string): Promise<boolean> {
    // 模拟登录验证
    return new Promise((resolve) => {
      // 在实际应用中，这里应该调用API进行验证
      setTimeout(() => {
        if (username === 'admin' && password === 'password') {
          const mockToken = 'mock-jwt-token-' + Date.now()
          token.value = mockToken
          localStorage.setItem('token', mockToken)
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('username', username)
          userInfo.value = {
            username: 'admin',
            role: '管理员',
            社团管理员: '街舞社'
          }
          resolve(true)
        } else {
          resolve(false)
        }
      }, 500)
    })
  }
  
  function logout() {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
  }
  
  function checkAuth() {
    if (token.value) {
      // 模拟验证token有效性
      userInfo.value = {
        username: 'admin',
        role: '管理员',
        社团管理员: '街舞社'
      }
      return true
    }
    return false
  }
  
  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})