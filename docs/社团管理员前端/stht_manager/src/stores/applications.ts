import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 申请接口定义（优化为专注于活动预约申请）
export interface Application {
  id: number
  applicantName: string
  applicantId: string // 之前是studentId，保持兼容性
  contactInfo: string // 之前是contactPhone，现在支持更多联系方式
  eventName: string // 之前是activityName
  eventDate: string
  location: string
  reason: string
  applicationTime: string
  status: 'pending' | 'approved' | 'rejected'
  processTime?: string // 之前是processedTime
  processorName?: string // 之前是processedBy
  processComment?: string // 之前是remark
}

// 申请统计接口
export interface ApplicationStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export const useApplicationsStore = defineStore('applications', () => {
  // 申请列表状态
  const applications = ref<Application[]>([
    {
      id: 1,
      applicantName: '张三',
      applicantId: '2021001',
      contactInfo: '13800138001',
      eventName: '人工智能前沿技术讲座',
      eventDate: '2024-03-20',
      location: '科技楼301会议室',
      reason: '为社团成员提供AI领域前沿知识分享',
      applicationTime: '2024-03-10T08:30:00',
      status: 'approved',
      processTime: '2024-03-10T14:20:00',
      processorName: '管理员',
      processComment: '活动主题符合社团发展方向，批准申请'
    },
    {
      id: 2,
      applicantName: '李四',
      applicantId: '2021002',
      contactInfo: '13800138002',
      eventName: '编程大赛赛前培训',
      eventDate: '2024-03-25',
      location: '教学楼B301教室',
      reason: '为参赛选手提供赛前指导和技术支持',
      applicationTime: '2024-03-12T10:15:00',
      status: 'pending'
    },
    {
      id: 3,
      applicantName: '王五',
      applicantId: '2021003',
      contactInfo: '13800138003',
      eventName: '校园科技展',
      eventDate: '2024-04-01',
      location: '学生活动中心',
      reason: '展示社团成员作品，提升社团影响力',
      applicationTime: '2024-03-14T09:45:00',
      status: 'pending'
    },
    {
      id: 4,
      applicantName: '赵六',
      applicantId: '2021004',
      contactInfo: '13800138004',
      eventName: '技术沙龙：前端框架对比',
      eventDate: '2024-03-18',
      location: '创新实验室',
      reason: '交流不同前端框架的优缺点和应用场景',
      applicationTime: '2024-03-10T16:30:00',
      status: 'rejected',
      processTime: '2024-03-11T10:00:00',
      processorName: '管理员',
      processComment: '活动时间与学校重要会议冲突，建议调整时间后重新申请'
    },
    {
      id: 5,
      applicantName: '陈七',
      applicantId: '2021005',
      contactInfo: '13800138005',
      eventName: '算法优化工作坊',
      eventDate: '2024-03-28',
      location: '计算机实验室',
      reason: '提升成员算法设计和优化能力',
      applicationTime: '2024-03-13T14:20:00',
      status: 'approved',
      processTime: '2024-03-14T09:30:00',
      processorName: '管理员',
      processComment: '活动内容对成员技能提升有帮助，批准申请'
    },
    {
      id: 6,
      applicantName: '周八',
      applicantId: '2021006',
      contactInfo: '13800138006',
      eventName: '企业参观活动',
      eventDate: '2024-04-10',
      location: 'XX科技公司',
      reason: '了解企业技术栈和工作环境，为就业做准备',
      applicationTime: '2024-03-15T11:00:00',
      status: 'pending'
    },
    {
      id: 7,
      applicantName: '吴九',
      applicantId: '2021007',
      contactInfo: '13800138007',
      eventName: '开源项目贡献指导',
      eventDate: '2024-03-22',
      location: '计算机学院会议室',
      reason: '指导成员如何参与开源项目开发',
      applicationTime: '2024-03-12T09:15:00',
      status: 'approved',
      processTime: '2024-03-13T16:45:00',
      processorName: '管理员',
      processComment: '活动有意义，鼓励成员参与开源社区'
    }
  ])
  
  // 计算申请统计信息
  const applicationStats = computed((): ApplicationStats => {
    const total = applications.value.length
    const pending = applications.value.filter(app => app.status === 'pending').length
    const approved = applications.value.filter(app => app.status === 'approved').length
    const rejected = applications.value.filter(app => app.status === 'rejected').length
    
    return {
      total,
      pending,
      approved,
      rejected
    }
  })
  
  // 获取所有申请
  function getAllApplications(): Application[] {
    return [...applications.value]
  }
  
  // 根据ID获取申请
  function getApplicationById(id: number): Application | undefined {
    return applications.value.find(app => app.id === id)
  }
  
  // 搜索申请
  function searchApplications(query: string): Application[] {
    if (!query) return getAllApplications()
    
    const lowercaseQuery = query.toLowerCase().trim()
    return applications.value.filter(app => 
      app.applicantName.toLowerCase().includes(lowercaseQuery) ||
      app.applicantId.toLowerCase().includes(lowercaseQuery) ||
      app.eventName.toLowerCase().includes(lowercaseQuery) ||
      app.location.toLowerCase().includes(lowercaseQuery)
    )
  }
  
  // 处理申请（批准或拒绝）
  function processApplication(
    id: number,
    action: 'approve' | 'reject',
    comment: string
  ): boolean {
    const application = applications.value.find(app => app.id === id)
    if (!application || application.status !== 'pending') {
      return false
    }
    
    application.status = action === 'approve' ? 'approved' : 'rejected'
    application.processTime = new Date().toISOString()
    application.processorName = '当前管理员' // 实际项目中应该从用户会话中获取
    application.processComment = comment || 
      (action === 'approve' ? '申请已批准' : '申请已拒绝')
    
    // 这里可以添加通知逻辑
    console.log(`通知申请人 ${application.applicantName}，申请 ${application.status === 'approved' ? '已批准' : '已拒绝'}`)
    
    return true
  }
  
  // 添加新申请
  function addApplication(applicationData: Omit<Application, 'id' | 'applicationTime' | 'status'>): Application {
    const newApplication: Application = {
      ...applicationData,
      id: Date.now(),
      applicationTime: new Date().toISOString(),
      status: 'pending'
    }
    applications.value.push(newApplication)
    return newApplication
  }
  
  // 删除申请
  function removeApplication(id: number): boolean {
    const index = applications.value.findIndex(app => app.id === id)
    if (index !== -1) {
      applications.value.splice(index, 1)
      return true
    }
    return false
  }
  
  return {
    applications,
    applicationStats,
    getAllApplications,
    getApplicationById,
    searchApplications,
    processApplication,
    addApplication,
    removeApplication
  }
})