// 模拟数据文件 - 提供开发和测试用的模拟数据

// 模拟用户数据
export const mockUsers = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://picsum.photos/id/1/200',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    avatar: 'https://picsum.photos/id/2/200',
    role: 'teacher',
    status: 'active',
    employeeId: 'T001',
    department: '计算机科学',
    specialization: '前端开发',
    courses: ['JavaScript基础', 'Vue.js实战'],
    lastLogin: '2024-01-14T14:20:00Z',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    avatar: 'https://picsum.photos/id/3/200',
    role: 'student',
    status: 'active',
    studentId: 'S001',
    major: '计算机科学与技术',
    grade: '2021',
    enrolledCourses: 5,
    progress: '75%',
    lastLogin: '2024-01-15T09:15:00Z',
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    avatar: 'https://picsum.photos/id/4/200',
    role: 'teacher',
    status: 'pending',
    employeeId: 'T002',
    department: '数据科学',
    specialization: '机器学习',
    lastLogin: null,
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '5',
    name: '钱七',
    email: 'qianqi@example.com',
    avatar: 'https://picsum.photos/id/5/200',
    role: 'student',
    status: 'suspended',
    studentId: 'S002',
    major: '电子工程',
    grade: '2022',
    enrolledCourses: 3,
    progress: '20%',
    lastLogin: '2024-01-10T16:45:00Z',
    createdAt: '2024-01-04T00:00:00Z',
    reviewComment: '账号违规操作',
    reviewDate: '2024-01-11T10:00:00Z'
  },
  {
    id: '6',
    name: '孙八',
    email: 'sunba@example.com',
    avatar: 'https://picsum.photos/id/6/200',
    role: 'student',
    status: 'active',
    studentId: 'S003',
    major: '软件工程',
    grade: '2020',
    enrolledCourses: 8,
    progress: '90%',
    lastLogin: '2024-01-14T20:30:00Z',
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '7',
    name: '周九',
    email: 'zhoujiu@example.com',
    avatar: 'https://picsum.photos/id/7/200',
    role: 'teacher',
    status: 'active',
    employeeId: 'T003',
    department: '人工智能',
    specialization: '深度学习',
    courses: ['AI导论', '神经网络'],
    lastLogin: '2024-01-15T11:20:00Z',
    createdAt: '2024-01-06T00:00:00Z'
  },
  {
    id: '8',
    name: '吴十',
    email: 'wushi@example.com',
    avatar: 'https://picsum.photos/id/8/200',
    role: 'student',
    status: 'pending',
    studentId: 'S004',
    major: '网络工程',
    grade: '2023',
    lastLogin: null,
    createdAt: '2024-01-15T09:30:00Z'
  }
];

// 模拟统计数据
export const mockStatistics = {
  totalUsers: 8,
  activeUsers: 5,
  pendingUsers: 2,
  suspendedUsers: 1,
  totalCourses: 12,
  activeCourses: 10,
  completedCourses: 2,
  totalEnrollments: 35,
  pendingEnrollments: 8,
  recentActivityCount: 15,
  upcomingTasks: 7
};

// 模拟活动数据
export const mockActivities = [
  {
    id: '1',
    user: '李四',
    userId: '2',
    action: '创建了新课程',
    target: 'Vue.js实战',
    time: '2024-01-15T10:30:00Z',
    type: 'course_create'
  },
  {
    id: '2',
    user: '王五',
    userId: '3',
    action: '完成了学习任务',
    target: 'JavaScript基础 - 第3章',
    time: '2024-01-15T09:15:00Z',
    type: 'task_complete'
  },
  {
    id: '3',
    user: '赵六',
    userId: '4',
    action: '注册了账号',
    time: '2024-01-15T08:00:00Z',
    type: 'user_register'
  },
  {
    id: '4',
    user: '张三',
    userId: '1',
    action: '审核了用户',
    target: '孙八',
    time: '2024-01-14T16:45:00Z',
    type: 'user_review'
  },
  {
    id: '5',
    user: '孙八',
    userId: '6',
    action: '评论了课程',
    target: 'AI导论',
    time: '2024-01-14T14:20:00Z',
    type: 'course_comment'
  },
  {
    id: '6',
    user: '周九',
    userId: '7',
    action: '更新了课程内容',
    target: '神经网络',
    time: '2024-01-14T11:20:00Z',
    type: 'course_update'
  }
];

// 模拟任务数据
export const mockTasks = [
  {
    id: '1',
    title: '审核新教师注册申请',
    assignedTo: '张三',
    assignedToId: '1',
    priority: 'high',
    dueDate: '2024-01-16T00:00:00Z',
    status: 'pending',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    title: '发布下周课程安排',
    assignedTo: '李四',
    assignedToId: '2',
    priority: 'medium',
    dueDate: '2024-01-17T00:00:00Z',
    status: 'pending',
    createdAt: '2024-01-15T09:30:00Z'
  },
  {
    id: '3',
    title: '完成学生期末成绩录入',
    assignedTo: '周九',
    assignedToId: '7',
    priority: 'high',
    dueDate: '2024-01-20T00:00:00Z',
    status: 'in_progress',
    createdAt: '2024-01-14T10:00:00Z'
  },
  {
    id: '4',
    title: '准备下学期新课程大纲',
    assignedTo: '李四',
    assignedToId: '2',
    priority: 'low',
    dueDate: '2024-01-25T00:00:00Z',
    status: 'pending',
    createdAt: '2024-01-13T15:20:00Z'
  },
  {
    id: '5',
    title: '系统安全审计',
    assignedTo: '张三',
    assignedToId: '1',
    priority: 'medium',
    dueDate: '2024-01-18T00:00:00Z',
    status: 'pending',
    createdAt: '2024-01-15T11:00:00Z'
  }
];

// 模拟用户增长趋势数据
export const mockUserGrowth = [
  { month: '2023-09', users: 15 },
  { month: '2023-10', users: 22 },
  { month: '2023-11', users: 28 },
  { month: '2023-12', users: 35 },
  { month: '2024-01', users: 45 }
];

// 模拟课程分类统计数据
export const mockCourseCategories = [
  { name: '前端开发', count: 12 },
  { name: '后端开发', count: 8 },
  { name: '数据科学', count: 6 },
  { name: '人工智能', count: 5 },
  { name: '移动开发', count: 4 },
  { name: '云计算', count: 3 }
];

// 模拟登录角色数据
export const mockLoginRoles = [
  { value: 'admin', label: '管理员', demoAccount: { username: 'admin', password: 'admin123' } },
  { value: 'teacher', label: '教师', demoAccount: { username: 'teacher', password: 'teacher123' } },
  { value: 'student', label: '学生', demoAccount: { username: 'student', password: 'student123' } }
];
