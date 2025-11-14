// 认证服务
const authService = {
  // 登录函数
  async login(username, password, verificationCode) {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 固定的管理员账号和密码
    if (username === 'admin' && password === 'admin123' && verificationCode) {
      // 生成token
      const token = 'admin_token_' + Date.now()
      
      // 存储认证信息
      localStorage.setItem('token', token)
      localStorage.setItem('admin_token', token)
      localStorage.setItem('userInfo', JSON.stringify({
        username: 'admin',
        role: 'admin',
        name: '系统管理员'
      }))
      
      return {
        success: true,
        data: {
          token,
          userInfo: {
            username: 'admin',
            role: 'admin',
            name: '系统管理员'
          }
        }
      }
    }
    
    return {
      success: false,
      error: '用户名或密码错误'
    }
  },
  
  // 登出函数
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('userInfo')
  },
  
  // 检查登录状态
  checkAuth() {
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token')
    return !!token
  },
  
  // 获取当前用户信息
  getCurrentUser() {
    try {
      const userInfo = localStorage.getItem('userInfo')
      return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }
}

export default authService