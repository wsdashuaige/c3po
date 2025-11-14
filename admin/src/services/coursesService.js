// 模拟课程管理服务
// 用于模拟API请求延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 课程服务类
class CoursesService {
  constructor() {
    // 初始化课程数据
    this.courses = [
      {
        id: 1,
        name: '人工智能基础',
        teacher: '王老师',
        teacherId: 2,
        semester: '春季学期',
        applyTime: '2025-03-01',
        status: 'pending',
        description: '本课程介绍人工智能的基本概念、原理和应用领域。',
        credit: 3,
        students: 45,
        schedule: [
          { day: '周一', time: '14:00-16:00', location: 'A301' },
          { day: '周三', time: '14:00-16:00', location: 'A301' }
        ]
      },
      {
        id: 2,
        name: '数据可视化',
        teacher: '李教授',
        teacherId: 3,
        semester: '秋季学期',
        applyTime: '2025-03-02',
        status: 'approved',
        description: '学习数据可视化的理论基础和实践技术，掌握常用可视化工具。',
        credit: 2,
        students: 62,
        schedule: [
          { day: '周二', time: '09:00-11:00', location: 'B205' },
          { day: '周四', time: '09:00-11:00', location: 'B205' }
        ]
      },
      {
        id: 3,
        name: '云计算导论',
        teacher: '陈老师',
        teacherId: 4,
        semester: '春季学期',
        applyTime: '2025-03-03',
        status: 'rejected',
        description: '介绍云计算的基本概念、体系架构和主要技术。',
        credit: 3,
        students: 0,
        schedule: [
          { day: '周五', time: '10:00-12:00', location: 'C102' }
        ]
      },
      {
        id: 4,
        name: '机器学习',
        teacher: '张教授',
        teacherId: 5,
        semester: '秋季学期',
        applyTime: '2025-03-04',
        status: 'approved',
        description: '深入学习机器学习算法原理与应用。',
        credit: 4,
        students: 58,
        schedule: [
          { day: '周一', time: '08:00-10:00', location: 'D401' },
          { day: '周三', time: '08:00-10:00', location: 'D401' },
          { day: '周五', time: '14:00-16:00', location: 'E203' }
        ]
      },
      {
        id: 5,
        name: '区块链技术',
        teacher: '刘老师',
        teacherId: 6,
        semester: '春季学期',
        applyTime: '2025-03-05',
        status: 'pending',
        description: '探索区块链技术的原理、应用与发展趋势。',
        credit: 3,
        students: 0,
        schedule: [
          { day: '周二', time: '16:00-18:00', location: 'F301' },
          { day: '周四', time: '16:00-18:00', location: 'F301' }
        ]
      }
    ];
    this.nextId = 6;
  }

  // 获取课程列表
  async getCourses(filters = {}) {
    await delay(300); // 模拟网络延迟
    let result = [...this.courses];

    // 应用筛选条件
    if (filters.keyword) {
      const query = filters.keyword.toLowerCase();
      result = result.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.teacher.toLowerCase().includes(query)
      );
    }

    if (filters.status) {
      result = result.filter(course => course.status === filters.status);
    }

    if (filters.semester) {
      result = result.filter(course => course.semester === filters.semester);
    }

    return result;
  }

  // 获取单个课程
  async getCourse(id) {
    await delay(200);
    const course = this.courses.find(c => c.id === Number(id));
    if (!course) {
      throw new Error('课程不存在');
    }
    return course;
  }

  // 创建课程
  async createCourse(courseData) {
    await delay(400);
    const newCourse = {
      id: this.nextId++,
      ...courseData,
      status: 'pending',
      applyTime: new Date().toISOString().split('T')[0],
      students: 0
    };
    this.courses.push(newCourse);
    return newCourse;
  }

  // 更新课程
  async updateCourse(id, courseData) {
    await delay(300);
    const index = this.courses.findIndex(c => c.id === Number(id));
    if (index === -1) {
      throw new Error('课程不存在');
    }
    
    // 保留原始状态和申请时间
    const original = this.courses[index];
    this.courses[index] = {
      ...this.courses[index],
      ...courseData,
      id: Number(id),
      status: original.status,
      applyTime: original.applyTime
    };
    return this.courses[index];
  }

  // 删除课程
  async deleteCourse(id) {
    await delay(200);
    const index = this.courses.findIndex(c => c.id === Number(id));
    if (index === -1) {
      throw new Error('课程不存在');
    }
    this.courses.splice(index, 1);
    return true;
  }

  // 批量删除课程
  async batchDeleteCourses(ids) {
    await delay(300);
    ids.forEach(id => {
      const index = this.courses.findIndex(c => c.id === Number(id));
      if (index !== -1) {
        this.courses.splice(index, 1);
      }
    });
    return true;
  }

  // 审核课程
  async reviewCourse(id, approve) {
    await delay(200);
    const course = this.courses.find(c => c.id === Number(id));
    if (!course) {
      throw new Error('课程不存在');
    }
    course.status = approve ? 'approved' : 'rejected';
    return course;
  }

  // 批量审核课程
  async batchReviewCourses(ids, approve) {
    await delay(300);
    ids.forEach(id => {
      const course = this.courses.find(c => c.id === Number(id));
      if (course) {
        course.status = approve ? 'approved' : 'rejected';
      }
    });
    return true;
  }

  // 撤回课程
  async withdrawCourse(id) {
    await delay(200);
    const course = this.courses.find(c => c.id === Number(id));
    if (!course) {
      throw new Error('课程不存在');
    }
    if (course.status === 'approved') {
      course.status = 'pending';
    }
    return course;
  }

  // 重新提交课程
  async resubmitCourse(id) {
    await delay(200);
    const course = this.courses.find(c => c.id === Number(id));
    if (!course) {
      throw new Error('课程不存在');
    }
    if (course.status === 'rejected') {
      course.status = 'pending';
      course.applyTime = new Date().toISOString().split('T')[0];
    }
    return course;
  }

  // 获取课程统计信息
  async getCourseStats() {
    await delay(200);
    const total = this.courses.length;
    const approved = this.courses.filter(c => c.status === 'approved').length;
    const pending = this.courses.filter(c => c.status === 'pending').length;
    const rejected = this.courses.filter(c => c.status === 'rejected').length;
    
    return {
      total,
      approved,
      pending,
      rejected,
      semesterStats: this.getSemesterStats()
    };
  }

  // 获取学期统计
  getSemesterStats() {
    const stats = {};
    this.courses.forEach(course => {
      if (!stats[course.semester]) {
        stats[course.semester] = 0;
      }
      stats[course.semester]++;
    });
    return stats;
  }

  // 更新课程学生数量
  async updateStudentCount(courseId, count) {
    await delay(100);
    const course = this.courses.find(c => c.id === Number(courseId));
    if (course) {
      course.students = count;
    }
    return course;
  }
}

// 导出单例实例
export default new CoursesService();
