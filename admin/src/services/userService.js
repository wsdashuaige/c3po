// 用户管理服务
const userService = {
  // Mock用户数据
  mockUsers: [
    {
      id: 1,
      username: 'student1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138001',
      role: 'student',
      status: 'active',
      createTime: '2024-01-01 10:00:00',
      lastLogin: '2024-01-15 14:30:00'
    },
    {
      id: 2,
      username: 'student2',
      name: '李四',
      email: 'lisi@example.com',
      phone: '13800138002',
      role: 'student',
      status: 'active',
      createTime: '2024-01-02 11:00:00',
      lastLogin: '2024-01-14 10:15:00'
    },
    {
      id: 3,
      username: 'teacher1',
      name: '王教授',
      email: 'wang@example.com',
      phone: '13800138003',
      role: 'teacher',
      status: 'active',
      createTime: '2024-01-01 09:00:00',
      lastLogin: '2024-01-15 08:45:00'
    },
    {
      id: 4,
      username: 'student3',
      name: '赵六',
      email: 'zhaoliu@example.com',
      phone: '13800138004',
      role: 'student',
      status: 'pending',
      createTime: '2024-01-15 16:00:00',
      lastLogin: null
    }
  ],

  // 获取用户列表
  async getUsers(params = {}) {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filteredUsers = [...this.mockUsers]
    
    // 处理搜索和过滤
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      )
    }
    
    if (params.role && params.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === params.role)
    }
    
    if (params.status && params.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === params.status)
    }
    
    // 处理分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      success: true,
      data: {
        list: filteredUsers.slice(startIndex, endIndex),
        total: filteredUsers.length,
        page,
        pageSize
      }
    }
  },

  // 获取用户详情
  async getUserDetail(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const user = this.mockUsers.find(user => user.id === Number(id))
    if (user) {
      return {
        success: true,
        data: user
      }
    }
    
    return {
      success: false,
      error: '用户不存在'
    }
  },

  // 添加用户
  async addUser(userData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newUser = {
      id: Date.now(),
      ...userData,
      createTime: new Date().toLocaleString('zh-CN'),
      lastLogin: null,
      status: 'pending'
    }
    
    this.mockUsers.push(newUser)
    
    return {
      success: true,
      data: newUser
    }
  },

  // 更新用户
  async updateUser(id, userData) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.mockUsers.findIndex(user => user.id === Number(id))
    if (index !== -1) {
      this.mockUsers[index] = { ...this.mockUsers[index], ...userData }
      
      return {
        success: true,
        data: this.mockUsers[index]
      }
    }
    
    return {
      success: false,
      error: '用户不存在'
    }
  },

  // 删除用户
  async deleteUser(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const index = this.mockUsers.findIndex(user => user.id === Number(id))
    if (index !== -1) {
      this.mockUsers.splice(index, 1)
      
      return {
        success: true,
        message: '删除成功'
      }
    }
    
    return {
      success: false,
      error: '用户不存在'
    }
  },

  // 批量删除用户
  async batchDeleteUsers(ids) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    this.mockUsers = this.mockUsers.filter(user => !ids.includes(user.id))
    
    return {
      success: true,
      message: `成功删除${ids.length}个用户`
    }
  },

  // 更改用户状态
  async changeUserStatus(id, status) {
    return this.updateUser(id, { status })
  }
}

export default userService