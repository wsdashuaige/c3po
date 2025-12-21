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

// 检查是否已登录的函数
const isAuthenticated = () => {
  // 检查localStorage中的token或admin_token
  return localStorage.getItem('token') !== null || localStorage.getItem('admin_token') !== null
}

const routes = [
  {
    path: '/',
    redirect: '/admin/login'
  },
  {
    path: '/admin/home',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: false,
      title: '首页'
    }
  },
  {
    path: '/admin/login',
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
      title: '仪表板'
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
      title: '统计分析'
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
      title: '个人中心'
    }
  },
  // 捕获所有未匹配的路由，重定向到登录页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/admin/login'
  }
]

const router = createRouter({ 
  history: createWebHistory(), 
  routes, 
  // 保存滚动位置 
  scrollBehavior(to, from, savedPosition) { 
    // 如果是同一页面的导航或前进/后退，保持滚动位置 
    if (savedPosition) { 
      return savedPosition 
    } 
    // 否则滚动到顶部 
    return { top: 0 } 
  } 
})

// 全局前置守卫，检查是否需要认证并设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 管理系统`
  } else {
    document.title = '管理系统'
  }
  
  // 保存当前路由状态到localStorage
  if (from.meta.requiresAuth && from.name) {
    localStorage.setItem('previousRoute', JSON.stringify(from))
  }
  
  // 认证检查
  if (to.meta.requiresAuth && !isAuthenticated()) {
    // 需要认证但未登录，保存目标路由以便登录后跳转
    localStorage.setItem('targetRoute', JSON.stringify(to))
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated()) {
    // 已登录但访问登录页，检查是否有之前保存的目标路由
    const targetRoute = localStorage.getItem('targetRoute')
    if (targetRoute) {
      const parsedRoute = JSON.parse(targetRoute)
      localStorage.removeItem('targetRoute')
      next(parsedRoute)
    } else {
      // 默认重定向到仪表板
      next({ name: 'Dashboard' })
    }
  } else {
    // 其他情况正常跳转
    next()
  }
})

// 全局后置守卫，用于调试和额外的路由处理
router.afterEach((to, from) => {
  // 可以在这里添加路由跳转后的处理逻辑
  console.log(`已从 ${from.name || '未知页面'} 跳转到 ${to.name}`)
})

export default router