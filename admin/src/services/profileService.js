// 用户个人资料服务
const profileService = {
  // 获取当前用户资料
  async getProfile() {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const userInfo = localStorage.getItem('userInfo')
      if (!userInfo) {
        return {
          success: false,
          error: '用户未登录'
        }
      }
      
      const user = JSON.parse(userInfo)
      
      // 返回用户详细资料
      return {
        success: true,
        data: {
          ...user,
          // 模拟更详细的用户信息
          avatar: user.role === 'admin' ? 'https://via.placeholder.com/100?text=Admin' : 'https://via.placeholder.com/100?text=User',
          email: user.username + '@example.com',
          phone: '138****' + Math.floor(Math.random() * 10000),
          department: user.role === 'admin' ? '系统管理部' : '教学部',
          position: user.role === 'admin' ? '系统管理员' : '教师',
          joinDate: '2024-01-01',
          lastLogin: new Date().toLocaleString('zh-CN'),
          permissions: user.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read', 'write']
        }
      }
    } catch (error) {
      console.error('获取用户资料失败:', error)
      return {
        success: false,
        error: '获取用户资料失败'
      }
    }
  },

  // 更新用户资料
  async updateProfile(profileData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    try {
      const userInfo = localStorage.getItem('userInfo')
      if (!userInfo) {
        return {
          success: false,
          error: '用户未登录'
        }
      }
      
      const user = JSON.parse(userInfo)
      const updatedUser = { ...user, ...profileData }
      
      localStorage.setItem('userInfo', JSON.stringify(updatedUser))
      
      return {
        success: true,
        data: updatedUser,
        message: '资料更新成功'
      }
    } catch (error) {
      console.error('更新用户资料失败:', error)
      return {
        success: false,
        error: '更新用户资料失败'
      }
    }
  },

  // 修改密码
  async changePassword(oldPassword, newPassword) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟密码验证逻辑
    // 在实际应用中，这里应该调用后端API进行密码验证和修改
    if (oldPassword === 'admin123' || oldPassword === '123456') {
      return {
        success: true,
        message: '密码修改成功'
      }
    }
    
    return {
      success: false,
      error: '原密码错误'
    }
  },

  // 上传头像
  async uploadAvatar(file) {
    // 模拟文件上传延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟上传成功，返回一个模拟的头像URL
    const mockAvatarUrl = 'https://via.placeholder.com/100?text=New'
    
    // 更新本地存储中的头像信息
    try {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        const user = JSON.parse(userInfo)
        user.avatar = mockAvatarUrl
        localStorage.setItem('userInfo', JSON.stringify(user))
      }
    } catch (error) {
      console.error('更新头像信息失败:', error)
    }
    
    return {
      success: true,
      data: {
        url: mockAvatarUrl
      },
      message: '头像上传成功'
    }
  },

  // 获取用户通知
  async getUserNotifications(limit = 10) {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    // 模拟用户通知数据
    const notifications = [
      {
        id: 1,
        type: 'system',
        title: '系统维护通知',
        content: '系统将于明天凌晨2点进行例行维护，预计持续2小时',
        isRead: false,
        createTime: '今天 09:30'
      },
      {
        id: 2,
        type: 'course',
        title: '课程更新提醒',
        content: '您的课程《人工智能基础》有新的章节更新',
        isRead: false,
        createTime: '昨天 16:45'
      },
      {
        id: 3,
        type: 'assignment',
        title: '作业截止提醒',
        content: '您的作业《算法实现》将于3天后截止提交',
        isRead: true,
        createTime: '2024-01-13 10:20'
      },
      {
        id: 4,
        type: 'message',
        title: '新消息',
        content: '李教授给您发送了一条新消息',
        isRead: true,
        createTime: '2024-01-12 14:10'
      }
    ]
    
    return {
      success: true,
      data: notifications.slice(0, limit),
      unreadCount: notifications.filter(n => !n.isRead).length
    }
  },

  // 标记通知为已读
  async markNotificationAsRead(notificationId) {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return {
      success: true,
      message: '通知已标记为已读'
    }
  },

  // 标记所有通知为已读
  async markAllNotificationsAsRead() {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    return {
      success: true,
      message: '所有通知已标记为已读'
    }
  },

  // 获取用户操作日志
  async getUserActivityLog(limit = 10) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 模拟用户操作日志
    const logs = [
      {
        id: 1,
        action: '登录系统',
        ip: '192.168.1.1',
        device: 'Chrome / Windows 10',
        time: '今天 08:30'
      },
      {
        id: 2,
        action: '修改个人资料',
        ip: '192.168.1.1',
        device: 'Chrome / Windows 10',
        time: '昨天 15:45'
      },
      {
        id: 3,
        action: '审核用户申请',
        ip: '192.168.1.1',
        device: 'Chrome / Windows 10',
        time: '2024-01-14 10:20'
      },
      {
        id: 4,
        action: '发布新课程',
        ip: '192.168.1.1',
        device: 'Firefox / macOS',
        time: '2024-01-13 14:10'
      }
    ]
    
    return {
      success: true,
      data: logs.slice(0, limit)
    }
  }
}

export default profileService