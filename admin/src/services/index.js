// API服务层入口文件
import authService from './authService.js'
import userService from './userService.js'
import courseService from './courseService.js'
import dashboardService from './dashboardService.js'
import profileService from './profileService.js'
import settingsService from './settingsService.js'
import { usersService } from './usersService.js'

// 命名导出，方便直接导入单个服务
export { authService, userService, usersService, courseService, dashboardService, profileService, settingsService }

// 默认导出所有服务
export default {
  auth: authService,
  user: userService,
  users: usersService,
  course: courseService,
  dashboard: dashboardService,
  profile: profileService,
  settings: settingsService
}