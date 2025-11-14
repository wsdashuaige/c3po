// 路由守卫配置
import { authService } from '../services'

// 权限角色定义
export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
}

// 权限白名单，不需要登录即可访问的路由
export const WHITE_LIST = ['/', '/login', '/register', '/forgot-password']

// 路由访问权限配置
// key: 路由路径, value: 需要的角色或函数判断
export const PERMISSIONS = {
  // 管理员页面
  '/dashboard': [ROLES.ADMIN],
  '/users': [ROLES.ADMIN],
  '/courses': [ROLES.ADMIN, ROLES.TEACHER],
  
  // 教师页面
  '/teacher/dashboard': [ROLES.TEACHER],
  '/teacher/courses': [ROLES.TEACHER],
  '/teacher/assignments': [ROLES.TEACHER],
  
  // 学生页面
  '/student/dashboard': [ROLES.STUDENT],
  '/student/courses': [ROLES.STUDENT],
  '/student/assignments': [ROLES.STUDENT],
  
  // 通用页面（需登录但不限制角色）
  '/profile': true,
  '/settings': true
}

/**
 * 检查用户是否有权限访问特定路由
 * @param {string} path - 路由路径
 * @param {string} userRole - 用户角色
 * @returns {boolean} 是否有权限
 */
export function checkPermission(path, userRole) {
  // 检查是否在白名单中
  if (WHITE_LIST.some(white => path.startsWith(white))) {
    return true
  }
  
  // 检查是否有匹配的权限配置
  const permission = Object.keys(PERMISSIONS).find(perm => path.startsWith(perm))
  
  if (permission) {
    const requiredRoles = PERMISSIONS[permission]
    
    // 如果设置为true，表示需要登录但不限制角色
    if (requiredRoles === true) {
      return !!userRole // 只要有角色就可以访问
    }
    
    // 检查用户角色是否在允许列表中
    return Array.isArray(requiredRoles) && requiredRoles.includes(userRole)
  }
  
  // 默认需要登录
  return !!userRole
}

/**
 * 获取用户角色对应的重定向路径
 * @param {string} role - 用户角色
 * @returns {string} 重定向路径
 */
export function getRedirectPathByRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return '/dashboard'
    case ROLES.TEACHER:
      return '/teacher/dashboard'
    case ROLES.STUDENT:
      return '/student/dashboard'
    default:
      return '/'
  }
}

/**
 * 创建路由守卫函数
 * @param {import('vue-router').Router} router - Vue Router 实例
 */
export function setupGuards(router) {
  // 前置守卫
  router.beforeEach(async (to, from, next) => {
    const isLoginPage = to.path === '/login'
    const isRegisterPage = to.path === '/register'
    const isForgotPasswordPage = to.path === '/forgot-password'
    
    try {
      // 检查用户是否已登录
      const userInfo = await authService.getCurrentUser()
      const isLoggedIn = !!userInfo
      
      if (isLoggedIn) {
        // 已登录用户尝试访问登录/注册页面，重定向到对应角色的首页
        if (isLoginPage || isRegisterPage || isForgotPasswordPage) {
          next({ path: getRedirectPathByRole(userInfo.role) })
          return
        }
        
        // 检查用户权限
        const hasPermission = checkPermission(to.path, userInfo.role)
        
        if (hasPermission) {
          // 有权限，继续导航
          next()
        } else {
          // 没有权限，重定向到无权限页面或首页
          console.warn(`用户 ${userInfo.username}(${userInfo.role}) 没有权限访问 ${to.path}`)
          next({ path: getRedirectPathByRole(userInfo.role), replace: true })
        }
      } else {
        // 未登录用户
        if (WHITE_LIST.some(white => to.path.startsWith(white))) {
          // 在白名单中，允许访问
          next()
        } else {
          // 不在白名单中，重定向到登录页
          // 保存当前路径，登录后可以跳转回来
          next({ path: '/login', query: { redirect: to.fullPath } })
        }
      }
    } catch (error) {
      console.error('路由守卫检查失败:', error)
      
      // 如果在非白名单页面且检查失败，重定向到登录
      if (!WHITE_LIST.some(white => to.path.startsWith(white))) {
        next({ path: '/login', query: { redirect: to.fullPath } })
      } else {
        // 白名单页面允许访问
        next()
      }
    }
  })
  
  // 全局错误处理
  router.onError(error => {
    console.error('路由错误:', error)
  })
}