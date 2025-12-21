<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSidebarOpen = ref(false) // 修改为更直观的命名：侧边栏是否打开
const isMobile = ref(false)
const sidebar = ref(null)

// 添加窗口大小调整监听
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const userInfo = ref({
  name: '管理员',
  avatar: null
})

const menuItems = [
  {
    id: 'dashboard',
    title: '仪表板',
    icon: '📊',
    path: '/admin/dashboard'
  },
  {
    id: 'users',
    title: '用户管理',
    icon: '👥',
    path: '/admin/users'
  },
  {
    id: 'courses',
    title: '课程管理',
    icon: '📚',
    path: '/admin/courses'
  },
  {
    id: 'statistics',
    title: '统计分析',
    icon: '📈',
    path: '/admin/statistics'
  },
  {
    id: 'settings',
    title: '系统设置',
    icon: '⚙️',
    path: '/admin/settings'
  },
  {
    id: 'profile',
    title: '个人中心',
    icon: '👤',
    path: '/admin/profile'
  },
  {
    id: 'logout',
    title: '退出登录',
    icon: '🚪',
    path: '#',
    isLogout: true
  }
]

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 点击内容区域关闭侧边栏（移动端）
const closeSidebarOnContentClick = () => {
  if (isMobile.value && isSidebarOpen.value) {
    isSidebarOpen.value = false
  }
}

const logout = () => {
  // 清除登录状态
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('isLoggedIn')
  // 跳转到登录页
  router.push('/admin/login')
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  // 在桌面端始终打开侧边栏，移动端默认关闭
  if (isMobile.value) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

const navigateToProfile = () => {
  router.push('/admin/profile')
}

// 计算属性：侧边栏是否折叠（桌面端）
const isSidebarCollapsed = computed(() => {
  // 桌面端根据窗口宽度自动折叠
  return window.innerWidth < 1024 && !isMobile.value
})
</script>

<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <aside 
      class="sidebar" 
      :class="{ 
        'sidebar-open': isSidebarOpen,
        'sidebar-collapsed': isSidebarCollapsed
      }"
      ref="sidebar"
    >
      <div class="sidebar-header">
        <div class="logo" :class="{ 'logo-collapsed': isSidebarCollapsed }">
          <span v-if="!isSidebarCollapsed">智能学习平台</span>
          <span v-else>智学</span>
        </div>
        <button 
          class="toggle-sidebar-btn" 
          @click="toggleSidebar"
          aria-label="切换侧边栏"
        >
          {{ isSidebarCollapsed ? '▶' : '◀' }}
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <li 
            v-for="item in menuItems" 
            :key="item.id"
            class="nav-item"
            :class="{ 
              active: $route.path === item.path,
              'logout-item': item.isLogout 
            }"
          >
            <template v-if="!item.isLogout">
              <router-link :to="item.path" class="nav-link" @click="closeSidebarOnContentClick">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-title" v-if="!isSidebarCollapsed">{{ item.title }}</span>
              </router-link>
            </template>
            <template v-else>
              <a href="#" class="nav-link logout-link" @click.prevent="logout">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-title" v-if="!isSidebarCollapsed">{{ item.title }}</span>
              </a>
            </template>
          </li>
        </ul>
      </nav>
    </aside>
    
    <!-- 遮罩层（移动端侧边栏打开时显示） -->
    <div 
      v-if="isMobile && isSidebarOpen" 
      class="sidebar-overlay" 
      @click="toggleSidebar"
    ></div>
    
    <!-- 主内容区 -->
    <main 
      class="main-content" 
      :class="{ 
        'sidebar-collapsed': isSidebarCollapsed,
        'sidebar-open': isSidebarOpen
      }"
    >
      <!-- 顶部导航栏 -->
      <header class="top-nav">
        <div class="top-nav-left">
          <button 
            class="mobile-menu-btn" 
            @click="toggleSidebar"
            aria-label="移动端菜单"
          >
            ☰
          </button>
          <div class="breadcrumb" v-if="!isSidebarCollapsed">
            <span>{{ menuItems.find(item => item.path === $route.path)?.title || '首页' }}</span>
          </div>
        </div>
        
        <div class="top-nav-right">
          <div class="search-box">
            <input type="text" placeholder="搜索..." />
          </div>
          
          <div class="notification-icon">
            <span>🔔</span>
            <span class="notification-badge">3</span>
          </div>
          
          <div class="user-profile" @click="navigateToProfile">
            <div class="avatar" v-if="userInfo.avatar">
              <img :src="userInfo.avatar" alt="用户头像" />
            </div>
            <div class="avatar-placeholder" v-else>
              {{ userInfo.name.charAt(0) }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ userInfo.name }}</span>
              <span class="user-role">管理员</span>
            </div>
          </div>
          
          <button class="logout-btn" @click="logout" aria-label="退出登录">
            退出
          </button>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <div class="page-content">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f7;
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #d2d2d7;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
}

/* 侧边栏折叠状态（桌面端） */
.sidebar.sidebar-collapsed {
  width: 64px;
}

/* 侧边栏头部 */
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f2f2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 标志样式 */
.logo {
  font-size: 20px;
  font-weight: 700;
  color: #0071e3;
  transition: all 0.3s ease;
}

.logo.logo-collapsed {
  font-size: 16px;
}

/* 切换侧边栏按钮 */
.toggle-sidebar-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #86868b;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.toggle-sidebar-btn:hover {
  background-color: #f5f5f7;
}

/* 侧边栏导航 */
.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 4px 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #86868b;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0 12px;
}

.nav-link:hover {
  background-color: #f5f5f7;
  color: #0071e3;
}

.nav-item.active .nav-link {
  background-color: #e3f2fd;
  color: #0071e3;
  font-weight: 500;
}

.nav-item.logout-item {
  margin-top: auto;
  border-top: 1px solid #f2f2f7;
  padding-top: 12px;
}

.nav-item.logout-item:hover {
  background-color: #ffebee;
}

.nav-link.logout-link {
  color: #ff3b30;
}

.nav-link.logout-link:hover {
  color: #d32f2f;
  background-color: #ffebee;
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
}

.nav-title {
  font-size: 14px;
  font-weight: 500;
}

/* 遮罩层样式 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  transition: opacity 0.3s ease;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* 侧边栏折叠时的主内容区样式 */
.main-content.sidebar-collapsed {
  margin-left: 0;
}

/* 顶部导航栏样式 */
.top-nav {
  height: 64px;
  background: white;
  border-bottom: 1px solid #d2d2d7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.top-nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #86868b;
}

.breadcrumb {
  font-size: 14px;
  color: #86868b;
}

.top-nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
}

.search-box input {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  background-color: #f5f5f7;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #0071e3;
  background-color: white;
  width: 240px;
}

.notification-icon {
  position: relative;
  cursor: pointer;
  font-size: 20px;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ff3b30;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-profile:hover {
  background-color: #f5f5f7;
}

.avatar, .avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0071e3;
  color: white;
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.user-role {
  font-size: 12px;
  color: #86868b;
}

.logout-btn {
  background-color: transparent;
  border: 1px solid #ff3b30;
  color: #ff3b30;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #ff3b30;
  color: white;
}

/* 页面内容区域 */
.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

/* 响应式设计 - 平板端 */
@media (max-width: 1024px) {
  .sidebar {
    width: 220px;
  }
  
  .sidebar.sidebar-collapsed {
    width: 72px;
  }
  
  .main-content {
    margin-left: 220px;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 72px;
  }
  
  /* 平板端顶部导航 */
  .top-nav {
    padding: 14px 20px;
  }
  
  .search-box {
    width: 200px;
  }
}

/* 响应式设计 - 小平板端 */
@media (max-width: 896px) {
  .sidebar {
    width: 200px;
  }
  
  .sidebar.sidebar-collapsed {
    width: 80px;
  }
  
  .main-content {
    margin-left: 200px;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 80px;
  }
  
  /* 小平板端顶部导航 */
  .search-box {
    width: 160px;
  }
  
  .user-info {
    display: none;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -240px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.2);
    width: 280px;
  }
  
  .sidebar.sidebar-open {
    left: 0;
  }
  
  .main-content {
    margin-left: 0;
    padding-left: 0;
  }
  
  /* 移动端侧边栏遮罩 */
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: block;
  }
  
  /* 移动端顶部导航 */
  .top-nav {
    padding: 12px 16px;
    justify-content: space-between;
  }
  
  .top-nav-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .breadcrumb {
    display: none;
  }
  
  .user-profile {
    padding: 8px;
  }
  
  .user-info {
    display: none;
  }
  
  .search-box {
    display: none;
  }
  
  .logout-btn {
    display: none;
  }
}

/* 响应式设计 - 小屏移动端 */
@media (max-width: 480px) {
  .sidebar {
    width: 240px;
  }
  
  .logo {
    font-size: 18px;
  }
  
  .logo.logo-collapsed {
    font-size: 14px;
  }
  
  /* 小屏移动端页面内容 */
  .page-content {
    padding: 16px;
  }
  
  /* 小屏移动端导航项 */
  .nav-item {
    margin: 0 8px;
  }
  
  .nav-link {
    padding: 10px 12px;
  }
}
</style>