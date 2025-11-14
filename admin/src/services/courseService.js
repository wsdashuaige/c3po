// 课程管理服务
const courseService = {
  // Mock课程数据
  mockCourses: [
    {
      id: 1,
      title: '人工智能基础',
      teacher: '王教授',
      teacherId: 3,
      category: '计算机科学',
      description: '本课程介绍人工智能的基本概念、原理和应用，包括机器学习、深度学习等内容。',
      credit: 3,
      students: 120,
      status: 'published',
      createTime: '2024-01-01 10:00:00',
      updateTime: '2024-01-10 14:30:00'
    },
    {
      id: 2,
      title: '数据结构与算法',
      teacher: '李教授',
      teacherId: null,
      category: '计算机科学',
      description: '本课程深入讲解数据结构和算法设计，包括常见数据结构、排序算法、图算法等。',
      credit: 4,
      students: 150,
      status: 'published',
      createTime: '2024-01-02 11:00:00',
      updateTime: '2024-01-12 09:15:00'
    },
    {
      id: 3,
      title: 'web前端开发',
      teacher: '张老师',
      teacherId: null,
      category: '软件工程',
      description: '本课程教授现代Web前端开发技术，包括HTML5、CSS3、JavaScript、Vue.js等框架。',
      credit: 3,
      students: 0,
      status: 'pending',
      createTime: '2024-01-15 16:00:00',
      updateTime: '2024-01-15 16:00:00'
    },
    {
      id: 4,
      title: '数据库原理与应用',
      teacher: '陈教授',
      teacherId: null,
      category: '计算机科学',
      description: '本课程介绍数据库系统的基本原理、设计方法和应用技术，包括SQL语言、数据库设计等。',
      credit: 3,
      students: 135,
      status: 'published',
      createTime: '2024-01-03 14:00:00',
      updateTime: '2024-01-14 11:20:00'
    }
  ],

  // 获取课程列表
  async getCourses(params = {}) {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filteredCourses = [...this.mockCourses]
    
    // 处理搜索和过滤
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(keyword) ||
        course.teacher.toLowerCase().includes(keyword) ||
        course.category.toLowerCase().includes(keyword)
      )
    }
    
    if (params.category && params.category !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.category === params.category)
    }
    
    if (params.status && params.status !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.status === params.status)
    }
    
    // 处理分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      success: true,
      data: {
        list: filteredCourses.slice(startIndex, endIndex),
        total: filteredCourses.length,
        page,
        pageSize
      }
    }
  },

  // 获取课程详情
  async getCourseDetail(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const course = this.mockCourses.find(course => course.id === Number(id))
    if (course) {
      return {
        success: true,
        data: course
      }
    }
    
    return {
      success: false,
      error: '课程不存在'
    }
  },

  // 添加课程
  async addCourse(courseData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newCourse = {
      id: Date.now(),
      ...courseData,
      students: 0,
      status: 'pending',
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN')
    }
    
    this.mockCourses.push(newCourse)
    
    return {
      success: true,
      data: newCourse
    }
  },

  // 更新课程
  async updateCourse(id, courseData) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.mockCourses.findIndex(course => course.id === Number(id))
    if (index !== -1) {
      this.mockCourses[index] = { 
        ...this.mockCourses[index], 
        ...courseData,
        updateTime: new Date().toLocaleString('zh-CN')
      }
      
      return {
        success: true,
        data: this.mockCourses[index]
      }
    }
    
    return {
      success: false,
      error: '课程不存在'
    }
  },

  // 删除课程
  async deleteCourse(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const index = this.mockCourses.findIndex(course => course.id === Number(id))
    if (index !== -1) {
      this.mockCourses.splice(index, 1)
      
      return {
        success: true,
        message: '删除成功'
      }
    }
    
    return {
      success: false,
      error: '课程不存在'
    }
  },

  // 批量删除课程
  async batchDeleteCourses(ids) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    this.mockCourses = this.mockCourses.filter(course => !ids.includes(course.id))
    
    return {
      success: true,
      message: `成功删除${ids.length}门课程`
    }
  },

  // 更新课程状态
  async changeCourseStatus(id, status) {
    return this.updateCourse(id, { status })
  },

  // 获取课程分类
  async getCategories() {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const categories = [...new Set(this.mockCourses.map(course => course.category))]
    return {
      success: true,
      data: categories
    }
  }
}

export default courseService