<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)
const isMobile = ref(false)
const showSidebar = ref(true)
const currentUser = ref('管理员')

// 计算当前路由是否需要认证（除登录页外都需要）
const requiresAuth = computed(() => {
  return route.path !== '/login'
})

// 检查是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isCollapse.value = true
    showSidebar.value = false
  }
}

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  if (isMobile.value) {
    showSidebar.value = !showSidebar.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}

// 退出登录
const logout = () => {
  // 在实际项目中，这里应该清除token等登录信息
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  router.push('/login')
  ElMessage.success('已退出登录')
}

// 处理下拉菜单命令
const handleDropdownCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('查看个人信息')
      break
    case 'settings':
      ElMessage.info('系统设置')
      break
    case 'logout':
      logout()
      break
  }
}

// 监听路由变化，在移动设备上自动隐藏侧边栏
watch(() => route.path, () => {
  if (isMobile.value) {
    showSidebar.value = false
  }
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>

<template>
  <!-- 登录页面路由视图 - 独立页面 -->
  <router-view v-slot="{ Component }" v-if="!requiresAuth">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  
  <!-- 主应用布局 - 仅对需要认证的页面显示 -->
  <div v-else class="app-container">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && showSidebar" 
      class="mobile-mask" 
      @click="toggleCollapse"
    ></div>
    
    <!-- 侧边栏导航 -->
    <el-aside 
      :width="isCollapse ? '64px' : '240px'" 
      class="app-sidebar"
      :class="{ 'mobile-visible': isMobile && showSidebar }"
    >
      <div class="sidebar-header">
        <div class="logo" :class="{ 'collapsed': isCollapse }">
          <div class="logo-icon">社</div>
          <span v-if="!isCollapse" class="logo-text">社团管理系统</span>
        </div>
        <el-button 
          class="collapse-btn" 
          :icon="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
          @click="toggleCollapse"
        ></el-button>
      </div>
      
      <el-scrollbar>
        <el-menu
          :default-active="route.path"
          class="sidebar-menu"
          router
          :collapse="isCollapse"
          :collapse-transition="false"
          unique-opened
        >
          <el-menu-item index="/dashboard">
            <el-icon><i-ep-home /></el-icon>
            <template #title>
              <span v-if="!isCollapse">管理概览</span>
            </template>
          </el-menu-item>
          
          <el-menu-item index="/activities">
            <el-icon><i-ep-calendar /></el-icon>
            <template #title>
              <span v-if="!isCollapse">活动管理</span>
            </template>
          </el-menu-item>
          
          <el-menu-item index="/members">
            <el-icon><i-ep-user /></el-icon>
            <template #title>
              <span v-if="!isCollapse">成员管理</span>
            </template>
          </el-menu-item>
          
          <el-menu-item index="/applications">
            <el-icon><i-ep-document /></el-icon>
            <template #title>
              <span v-if="!isCollapse">申请管理</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    
    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="main-header">
        <div class="header-left" v-if="isMobile">
          <el-button 
            class="mobile-menu-btn" 
            icon="el-icon-menu" 
            @click="toggleCollapse"
          ></el-button>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleDropdownCommand">
            <span class="user-avatar">
              <el-avatar :size="32" icon="el-icon-user" style="background: linear-gradient(135deg, #00C9A7, #FFD166); margin-right: 8px;" />
              <span v-if="!isMobile" style="background: linear-gradient(135deg, #00C9A7, #FFD166); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-right: 4px;">{{ currentUser }}</span>
              <el-icon class="arrow-icon"><i-ep-arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 页面内容 -->
      <el-main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f5f7fa;
}

/* 根容器样式 */
:deep(.fade-enter-active),
:deep(.fade-leave-active) {
  transition: opacity 0.3s ease;
}

:deep(.fade-enter-from),
:deep(.fade-leave-to) {
  opacity: 0;
}

/* 移动端遮罩层 */
.mobile-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

/* 侧边栏 */
.app-sidebar {
  height: 100vh;
  background: linear-gradient(135deg, #00C9A7, #FFD166);
  color: #fff;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 20;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.app-sidebar.mobile-visible {
  transform: translateX(0);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.25);
}

@media (max-width: 767px) {
  .app-sidebar {
    transform: translateX(-100%);
  }
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #1f2f3d;
}

.logo {
  display: flex;
  align-items: center;
  color: #fff;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #FF6B6B, #FFD166);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
}

.logo.collapsed .logo-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
  margin-left: 0;
}

.collapse-btn {
  color: #fff;
  background: transparent;
  border: none;
}

.sidebar-menu {
  background-color: transparent;
  border-right: none;
}

.sidebar-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.65);
  height: 56px;
  line-height: 56px;
  font-size: 14px;
  padding: 0 20px;
  transition: all 0.3s;
}

.sidebar-menu .el-menu-item.is-active {
  color: #fff;
  background: linear-gradient(90deg, #00C9A7, #FFD166);
  box-shadow: 0 2px 8px rgba(0, 201, 167, 0.3);
}

.sidebar-menu .el-menu-item:hover {
  color: #fff;
  background: linear-gradient(90deg, #00C9A7, #FFD166);
}

/* 主容器 */
.main-container {
  flex: 1;
  margin-left: 240px;
  height: 100vh;
  transition: margin-left 0.3s;
}

.app-container .main-container {
  margin-left: 64px;
}

.app-container .main-container {
  margin-left: 240px;
}

.app-container:deep(.isCollapse) .main-container {
  margin-left: 64px;
}

@media (max-width: 767px) {
  .main-container {
    margin-left: 0;
  }
}

/* 顶部导航栏 */
.main-header {
  height: 64px;
  background: linear-gradient(90deg, #fff, #f8f9fa);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  transition: box-shadow 0.3s;
}

.header-left {
  flex: 1;
}

.mobile-menu-btn {
  background: transparent;
  border: none;
  font-size: 20px;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #303133;
}

.user-avatar .arrow-icon {
  margin-left: 8px;
  font-size: 12px;
}

/* 页面内容 */
.page-content {
  padding: 40px;
  overflow-y: auto;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
  transition: padding 0.3s;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .page-content {
    padding: 32px;
  }
}

@media (max-width: 767px) {
  .page-content {
    padding: 20px;
  }
}

/* 通用卡片样式优化 */
:deep(.el-card) {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e6e6e6;
}

:deep(.el-card:hover) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 彩虹渐变按钮样式 */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #00C9A7, #FFD166);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 201, 167, 0.3);
  transition: all 0.3s;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #00a88c, #e6bc5c);
  box-shadow: 0 4px 12px rgba(0, 201, 167, 0.4);
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #06D6A0, #118AB2);
  border: none;
  box-shadow: 0 2px 8px rgba(6, 214, 160, 0.3);
  transition: all 0.3s;
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #05b48a, #0e7490);
  box-shadow: 0 4px 12px rgba(6, 214, 160, 0.4);
}

:deep(.el-button--warning) {
  background: linear-gradient(135deg, #FFD166, #FFA500);
  border: none;
  box-shadow: 0 2px 8px rgba(255, 209, 102, 0.3);
  transition: all 0.3s;
}

:deep(.el-button--warning:hover) {
  background: linear-gradient(135deg, #e6bc5c, #e69500);
  box-shadow: 0 4px 12px rgba(255, 209, 102, 0.4);
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #FF6B6B, #8338EC);
  border: none;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  transition: all 0.3s;
}

:deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, #e55a5a, #722ed1);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

/* 彩虹渐变统计卡片样式 */
:deep(.stat-card:nth-child(1)) {
  background: linear-gradient(135deg, #00C9A7, #06D6A0);
  color: white;
}

:deep(.stat-card:nth-child(2)) {
  background: linear-gradient(135deg, #FFD166, #FFA500);
  color: white;
}

:deep(.stat-card:nth-child(3)) {
  background: linear-gradient(135deg, #118AB2, #073B4C);
  color: white;
}

:deep(.stat-card:nth-child(4)) {
  background: linear-gradient(135deg, #8338EC, #3A86FF);
  color: white;
}

/* 表格头部渐变样式 */
:deep(.el-table__header) {
  background: linear-gradient(90deg, #fafafa, #f0f0f0);
}

/* 标签渐变样式 */
:deep(.el-tag) {
  background: linear-gradient(135deg, #00C9A7, #FFD166);
  border: none;
  color: white;
}

:deep(.el-tag--success) {
  background: linear-gradient(135deg, #06D6A0, #118AB2);
}

:deep(.el-tag--warning) {
  background: linear-gradient(135deg, #FFD166, #FFA500);
}

:deep(.el-tag--danger) {
  background: linear-gradient(135deg, #FF6B6B, #8338EC);
}

/* 按钮间距优化 */
:deep(.el-button) {
  margin-right: 12px;
  margin-bottom: 12px;
}

:deep(.el-button:last-child) {
  margin-right: 0;
}

/* 表格样式优化 */
:deep(.el-table) {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.el-table__header) {
  background-color: #fafafa;
}

:deep(.el-table__row) {
  transition: background-color 0.2s ease;
}

/* 表单样式优化 */
:deep(.el-form) {
  margin-top: 24px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

/* 统计卡片间距优化 */
:deep(.el-row > .el-col) {
  padding: 0 12px;
  margin-bottom: 24px;
}

:deep(.el-row > .el-col:first-child) {
  padding-left: 0;
}

:deep(.el-row > .el-col:last-child) {
  padding-right: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
