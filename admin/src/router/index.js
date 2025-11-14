import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载
const Home = () => import('../views/Home.vue')
const Login = () => import('../views/Login.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Users = () => import('../views/Users.vue')
const Courses = () => import('../views/Courses.vue')
const Statistics = () => import('../views/Statistics.vue')
const Settings = () => import('../views/Settings.vue')
const Profile = () => import('../views/Profile.vue')
const TaskDetail = () => import('../views/TaskDetail.vue')

// 检查是否已登录的函数
const isAuthenticated = () => {
  // 检查localStorage中的token或admin_token
  return localStorage.getItem('token') !== null || localStorage.getItem('admin_token') !== null
}

// 定义路由
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: '登录'
    }
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: '系统仪表盘'
    }
  },
  {
    path: '/admin/users',
    name: 'Users',
    component: Users,
    meta: {
      requiresAuth: true,
      title: '用户管理'
    }
  },
  {
    path: '/admin/courses',
    name: 'Courses',
    component: Courses,
    meta: {
      requiresAuth: true,
      title: '课程管理'
    }
  },
  {
    path: '/admin/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: {
      requiresAuth: true,
      title: '统计数据'
    }
  },
  {
    path: '/admin/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      requiresAuth: true,
      title: '系统设置'
    }
  },
  {
    path: '/admin/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true,
      title: '个人资料'
    }
  },
  {
    path: '/admin/tasks/:id',
    name: 'TaskDetail',
    component: TaskDetail,
    props: true,
    meta: {
      requiresAuth: true,
      title: '任务详情'
    }
  },

  // 捕获所有未匹配的路由，重定向到登录页
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login',
    meta: {
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫，检查是否需要认证
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    // 需要认证但未登录，重定向到登录页
    next('/login')
  } else if (to.name === 'Login' && isAuthenticated()) {
    // 已登录但访问登录页，重定向到仪表板
    next('/admin/dashboard')
  } else {
    // 其他情况正常跳转
    next()
  }
})

// 全局后置守卫，用于设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title 
    ? `${to.meta.title} - 管理员系统` 
    : '管理员系统'
})

export default router