// 仪表盘数据服务
import { mockStatistics, mockActivities, mockTasks, mockUserGrowth, mockCourseCategories } from './mockData.js'

const dashboardService = {
  // 获取统计卡片数据
  async getStatistics() {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 返回仪表盘统计数据
    return {
      success: true,
      data: mockStatistics
    }
  },

  // 获取最近活动数据
  async getRecentActivities(limit = 5) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 使用mockData中的活动数据并转换格式
    const activities = mockActivities.slice(0, limit).map(activity => ({
      id: activity.id,
      type: activity.type,
      user: activity.user,
      action: activity.action,
      time: activity.time || '刚刚',
      icon: this.getTypeIcon(activity.type),
      target: activity.target
    }))
    
    return {
      success: true,
      data: activities
    }
  },
  
  // 添加一个辅助方法来根据活动类型获取图标
  getTypeIcon(type) {
    const iconMap = {
      'user_register': 'user-plus',
      'course_create': 'book',
      'task_complete': 'check',
      'user_review': 'shield-check',
      'course_comment': 'comment',
      'course_update': 'refresh',
      'course_review': 'check-circle',
      'assignment_submit': 'file-alt',
      'user_login': 'sign-in-alt'
    }
    
    return iconMap[type] || 'circle-info'
  },

  // 获取待处理任务
  async getPendingTasks() {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    // 使用mockData中的任务数据
    return {
      success: true,
      data: mockTasks
    }
  },

  // 获取用户增长趋势数据（用于图表）
  async getUserGrowthTrend() {
    await new Promise(resolve => setTimeout(resolve, 350))
    
    // 使用mockData中的用户增长数据
    return {
      success: true,
      data: mockUserGrowth
    }
  },
  
  // 兼容旧方法名
  async getUserGrowthData() {
    return this.getUserGrowthTrend();
  },

  // 获取课程分类统计数据（用于图表）
  async getCourseCategoryStats() {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 使用mockData中的课程分类数据
    return {
      success: true,
      data: mockCourseCategories
    }
  },
  
  // 兼容旧方法名
  async getCourseCategoryData() {
    return this.getCourseCategoryStats();
  },

  // 获取系统状态数据
  async getSystemStatus() {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 模拟系统状态
    return {
      success: true,
      data: {
        uptime: '24小时45分钟',
        cpuUsage: '15.2%',
        memoryUsage: '42.8%',
        diskUsage: '67.3%',
        onlineUsers: 148,
        recentBackups: [
          {
            time: '今天 03:00',
            status: '成功'
          },
          {
            time: '昨天 03:00',
            status: '成功'
          }
        ]
      }
    }
  }
}

export default dashboardService