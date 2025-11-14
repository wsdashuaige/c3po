<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import coursesService from '../services/coursesService.js'

const route = useRoute()

// 响应式数据
const courses = ref([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const statusFilter = ref('全部')
const semesterFilter = ref('全部')
const selectedCourses = ref([])

// 模态框状态
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const currentCourse = ref(null)
const isSubmitting = ref(false)

// 课程表单数据
const courseForm = ref({
  name: '',
  teacher: '',
  semester: '春季学期',
  description: '',
  credit: 3,
  schedule: [
    { day: '', time: '', location: '' }
  ]
})

// 初始化时加载课程列表
onMounted(async () => {
  // 检查URL中是否带有status查询参数
  const urlStatus = route.query.status
  if (urlStatus === 'pending') {
    statusFilter.value = '待审核'
  }
  await loadCourses()
})

// 加载课程列表
const loadCourses = async () => {
  loading.value = true
  error.value = ''
  try {
    const filters = {
      keyword: keyword.value || undefined,
      status: statusFilter.value !== '全部' ? getStatusMap()[statusFilter.value] : undefined,
      semester: semesterFilter.value !== '全部' ? semesterFilter.value : undefined
    }
    courses.value = await coursesService.getCourses(filters)
  } catch (err) {
    error.value = err.message || '加载课程列表失败'
  } finally {
    loading.value = false
    selectedCourses.value = []
  }
}

// 获取状态映射
const getStatusMap = () => {
  return {
    '待审核': 'pending',
    '已通过': 'approved',
    '已驳回': 'rejected'
  }
}

// 获取状态文本和类名
const getStatusInfo = (status) => {
  const statusMap = {
    'pending': { text: '待审核', class: 'pending' },
    'approved': { text: '已通过', class: 'approved' },
    'rejected': { text: '已驳回', class: 'rejected' }
  }
  return statusMap[status] || { text: status, class: '' }
}

// 计算过滤后的课程列表
const filteredCourses = computed(() => {
  let result = [...courses.value]

  // 关键词筛选
  if (keyword.value) {
    const query = keyword.value.toLowerCase()
    result = result.filter(course =>
      course.name.toLowerCase().includes(query) ||
      course.teacher.toLowerCase().includes(query)
    )
  }

  // 状态筛选
  if (statusFilter.value !== '全部') {
    const statusMap = getStatusMap()
    const status = statusMap[statusFilter.value]
    if (status) {
      result = result.filter(course => course.status === status)
    }
  }

  // 学期筛选
  if (semesterFilter.value !== '全部') {
    result = result.filter(course => course.semester === semesterFilter.value)
  }

  return result
})

// 切换选中状态
const toggleSelect = (courseId) => {
  const index = selectedCourses.value.indexOf(courseId)
  if (index > -1) {
    selectedCourses.value.splice(index, 1)
  } else {
    selectedCourses.value.push(courseId)
  }
}

// 全选/取消全选
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedCourses.value = filteredCourses.value.map(c => c.id)
  } else {
    selectedCourses.value = []
  }
}

// 打开创建课程模态框
const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

// 打开编辑课程模态框
const openEditModal = async (course) => {
  try {
    currentCourse.value = await coursesService.getCourse(course.id)
    courseForm.value = {
      name: currentCourse.value.name,
      teacher: currentCourse.value.teacher,
      semester: currentCourse.value.semester,
      description: currentCourse.value.description || '',
      credit: currentCourse.value.credit || 3,
      schedule: JSON.parse(JSON.stringify(currentCourse.value.schedule || [{ day: '', time: '', location: '' }]))
    }
    showEditModal.value = true
  } catch (err) {
    error.value = err.message || '获取课程详情失败'
  }
}

// 打开课程详情模态框
const openDetailModal = async (course) => {
  try {
    currentCourse.value = await coursesService.getCourse(course.id)
    showDetailModal.value = true
  } catch (err) {
    error.value = err.message || '获取课程详情失败'
  }
}

// 重置表单
const resetForm = () => {
  courseForm.value = {
    name: '',
    teacher: '',
    semester: '春季学期',
    description: '',
    credit: 3,
    schedule: [
      { day: '', time: '', location: '' }
    ]
  }
  currentCourse.value = null
}

// 提交表单
const submitForm = async () => {
  // 表单验证
  if (!courseForm.value.name.trim()) {
    error.value = '请输入课程名称'
    return
  }
  if (!courseForm.value.teacher.trim()) {
    error.value = '请输入教师姓名'
    return
  }

  isSubmitting.value = true
  error.value = ''
  try {
    if (showCreateModal.value) {
      await coursesService.createCourse(courseForm.value)
      alert('课程创建成功')
      showCreateModal.value = false
    } else if (showEditModal.value) {
      await coursesService.updateCourse(currentCourse.value.id, courseForm.value)
      alert('课程更新成功')
      showEditModal.value = false
    }
    await loadCourses()
  } catch (err) {
    error.value = err.message || '操作失败'
  } finally {
    isSubmitting.value = false
  }
}

// 审核课程
const reviewCourse = async (courseId, approve) => {
  try {
    await coursesService.reviewCourse(courseId, approve)
    alert(approve ? '课程审核通过' : '课程审核已驳回')
    await loadCourses()
  } catch (err) {
    error.value = err.message || '审核操作失败'
  }
}

// 撤回课程
const withdrawCourse = async (courseId) => {
  try {
    await coursesService.withdrawCourse(courseId)
    alert('课程已撤回')
    await loadCourses()
  } catch (err) {
    error.value = err.message || '撤回操作失败'
  }
}

// 重新提交
const resubmitCourse = async (courseId) => {
  try {
    await coursesService.resubmitCourse(courseId)
    alert('课程已重新提交')
    await loadCourses()
  } catch (err) {
    error.value = err.message || '重新提交失败'
  }
}

// 删除课程
const deleteCourse = async (courseId) => {
  if (!confirm('确定要删除这个课程吗？')) return
  
  try {
    await coursesService.deleteCourse(courseId)
    alert('课程已删除')
    await loadCourses()
  } catch (err) {
    error.value = err.message || '删除失败'
  }
}

// 批量通过
const batchApprove = async () => {
  if (selectedCourses.value.length === 0) {
    alert('请先选择要操作的课程')
    return
  }
  
  try {
    await coursesService.batchReviewCourses(selectedCourses.value, true)
    alert('批量审核通过完成')
    await loadCourses()
  } catch (err) {
    error.value = err.message || '批量操作失败'
  }
}

// 批量驳回
const batchReject = async () => {
  if (selectedCourses.value.length === 0) {
    alert('请先选择要操作的课程')
    return
  }
  
  try {
    await coursesService.batchReviewCourses(selectedCourses.value, false)
    alert('批量审核驳回完成')
    await loadCourses()
  } catch (err) {
    error.value = err.message || '批量操作失败'
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedCourses.value.length === 0) {
    alert('请先选择要删除的课程')
    return
  }
  
  if (!confirm(`确定要删除选中的 ${selectedCourses.value.length} 个课程吗？`)) return
  
  try {
    await coursesService.batchDeleteCourses(selectedCourses.value)
    alert('批量删除完成')
    await loadCourses()
  } catch (err) {
    error.value = err.message || '批量删除失败'
  }
}

// 查询
const handleSearch = () => {
  loadCourses()
}

// 添加课程表行
const addScheduleRow = () => {
  courseForm.value.schedule.push({ day: '', time: '', location: '' })
}

// 删除课程表行
const removeScheduleRow = (index) => {
  if (courseForm.value.schedule.length > 1) {
    courseForm.value.schedule.splice(index, 1)
  }
}
</script>

<template>
  <MainLayout>
    <main class="main-content">
      <header class="header">
        <div class="header-content">
          <h1>课程管理</h1>
          <div class="actions">
            <button class="btn btn-secondary" @click="batchDelete" v-if="selectedCourses.length > 0">批量删除</button>
            <button class="btn btn-secondary">导出列表</button>
            <button class="btn btn-primary" @click="openCreateModal">新建课程</button>
          </div>
        </div>
      </header>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">{{ error }}</div>

      <section class="card">
        <h2 class="section-title">筛选条件</h2>
        <div class="filters">
          <div>
            <label class="form-label">关键词</label>
            <input 
              class="form-input" 
              placeholder="课程名/教师名"
              v-model="keyword"
              @keyup.enter="handleSearch"
            >
          </div>
          <div>
            <label class="form-label">状态</label>
            <select class="form-input form-select" v-model="statusFilter">
              <option>全部</option>
              <option>待审核</option>
              <option>已通过</option>
              <option>已驳回</option>
            </select>
          </div>
          <div>
            <label class="form-label">学期</label>
            <select class="form-input form-select" v-model="semesterFilter">
              <option>全部</option>
              <option>春季学期</option>
              <option>秋季学期</option>
            </select>
          </div>
          <div class="flex items-center" style="margin-top: auto;">
            <button class="btn btn-primary" @click="handleSearch">查询</button>
          </div>
        </div>
      </section>

      <section class="card table-card">
        <div class="card-header">
          <div class="card-title">课程列表</div>
          <div class="actions">
            <button class="btn btn-secondary btn-sm" @click="batchApprove" v-if="selectedCourses.length > 0">批量通过</button>
            <button class="btn btn-secondary btn-sm" @click="batchReject" v-if="selectedCourses.length > 0">批量驳回</button>
          </div>
        </div>
        
        <div v-if="loading" class="loading">加载中...</div>
        
        <div v-else-if="filteredCourses.length === 0" class="empty-state">
          <p>暂无课程数据</p>
        </div>
        
        <div v-else style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">
                  <input 
                    type="checkbox"
                    @change="toggleSelectAll"
                    :checked="selectedCourses.length === filteredCourses.length && filteredCourses.length > 0"
                  >
                </th>
                <th>课程名</th>
                <th>教师</th>
                <th>学期</th>
                <th>申请时间</th>
                <th>状态</th>
                <th style="width: 280px;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in filteredCourses" :key="course.id">
                <td>
                  <input 
                    type="checkbox"
                    :checked="selectedCourses.includes(course.id)"
                    @change="toggleSelect(course.id)"
                  >
                </td>
                <td>{{ course.name }}</td>
                <td>{{ course.teacher }}</td>
                <td>{{ course.semester }}</td>
                <td>{{ course.applyTime }}</td>
                <td>
                  <span class="status-badge" :class="getStatusInfo(course.status).class">
                    {{ getStatusInfo(course.status).text }}
                  </span>
                </td>
                <td class="actions">
                  <!-- 待审核状态 -->
                  <template v-if="course.status === 'pending'">
                    <button class="btn btn-primary btn-sm" @click="reviewCourse(course.id, true)">通过</button>
                    <button class="btn btn-danger btn-sm" @click="reviewCourse(course.id, false)">驳回</button>
                    <button class="btn btn-secondary btn-sm" @click="openEditModal(course)">编辑</button>
                    <button class="btn btn-secondary btn-sm" @click="openDetailModal(course)">详情</button>
                    <button class="btn btn-danger btn-sm" @click="deleteCourse(course.id)">删除</button>
                  </template>
                  <!-- 已通过状态 -->
                  <template v-else-if="course.status === 'approved'">
                    <button class="btn btn-secondary btn-sm" @click="withdrawCourse(course.id)">撤回</button>
                    <button class="btn btn-secondary btn-sm" @click="openEditModal(course)">编辑</button>
                    <button class="btn btn-secondary btn-sm" @click="openDetailModal(course)">详情</button>
                    <button class="btn btn-danger btn-sm" @click="deleteCourse(course.id)">删除</button>
                  </template>
                  <!-- 已驳回状态 -->
                  <template v-else-if="course.status === 'rejected'">
                    <button class="btn btn-primary btn-sm" @click="resubmitCourse(course.id)">重新提交</button>
                    <button class="btn btn-secondary btn-sm" @click="openEditModal(course)">编辑</button>
                    <button class="btn btn-secondary btn-sm" @click="openDetailModal(course)">详情</button>
                    <button class="btn btn-danger btn-sm" @click="deleteCourse(course.id)">删除</button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 创建/编辑课程模态框 -->
      <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="showCreateModal = showEditModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ showCreateModal ? '创建课程' : '编辑课程' }}</h3>
            <button class="modal-close" @click="showCreateModal = showEditModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">课程名称 *</label>
                  <input type="text" class="form-input" v-model="courseForm.name" placeholder="请输入课程名称">
                </div>
                <div class="form-group">
                  <label class="form-label">任课教师 *</label>
                  <input type="text" class="form-input" v-model="courseForm.teacher" placeholder="请输入教师姓名">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">学期</label>
                  <select class="form-input form-select" v-model="courseForm.semester">
                    <option>春季学期</option>
                    <option>秋季学期</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">学分</label>
                  <input type="number" class="form-input" v-model.number="courseForm.credit" min="1" max="6">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">课程描述</label>
                <textarea class="form-input" v-model="courseForm.description" placeholder="请输入课程描述" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">课程表</label>
                <div v-for="(item, index) in courseForm.schedule" :key="index" class="schedule-item">
                  <input type="text" class="form-input" v-model="item.day" placeholder="星期">
                  <input type="text" class="form-input" v-model="item.time" placeholder="时间">
                  <input type="text" class="form-input" v-model="item.location" placeholder="地点">
                  <button type="button" class="btn btn-danger btn-sm" @click="removeScheduleRow(index)" v-if="courseForm.schedule.length > 1">删除</button>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" @click="addScheduleRow">添加时间</button>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="showCreateModal = showEditModal = false">取消</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">{{ isSubmitting ? '提交中...' : '提交' }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 课程详情模态框 -->
      <div v-if="showDetailModal && currentCourse" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>课程详情</h3>
            <button class="modal-close" @click="showDetailModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="detail-info">
              <h4>{{ currentCourse.name }}</h4>
              <div class="detail-row">
                <span class="detail-label">任课教师：</span>
                <span class="detail-value">{{ currentCourse.teacher }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">学期：</span>
                <span class="detail-value">{{ currentCourse.semester }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">学分：</span>
                <span class="detail-value">{{ currentCourse.credit }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">申请时间：</span>
                <span class="detail-value">{{ currentCourse.applyTime }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">状态：</span>
                <span class="status-badge" :class="getStatusInfo(currentCourse.status).class">
                  {{ getStatusInfo(currentCourse.status).text }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">已选学生：</span>
                <span class="detail-value">{{ currentCourse.students }}人</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">课程描述：</span>
                <p class="detail-value">{{ currentCourse.description || '暂无描述' }}</p>
              </div>
              <div class="detail-row">
                <span class="detail-label">课程安排：</span>
                <div class="schedule-detail">
                  <div v-for="(item, index) in currentCourse.schedule || []" :key="index" class="schedule-detail-item">
                    {{ item.day }} {{ item.time }} {{ item.location }}
                  </div>
                  <div v-if="!currentCourse.schedule || currentCourse.schedule.length === 0" class="no-schedule">
                    暂无课程安排
                  </div>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" @click="showDetailModal = false">关闭</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </MainLayout>
</template>

<style scoped>
.main-content {
  padding: 24px;
  min-height: 100vh;
}

.header {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 24px;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 0;
}

.flex.items-center {
  display: flex;
  align-items: center;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d1d6;
  border-radius: 12px;
  font-size: 16px;
  background-color: #ffffff;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input::placeholder {
  color: #86868b;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid #d1d1d6;
}

.table-card {
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d1d1d6;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 16px;
  border-bottom: 1px solid #d1d1d6;
  text-align: left;
}

th {
  color: #86868b;
  font-weight: 600;
  background: #f2f2f7;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.status-badge.approved {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.status-badge.rejected {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.actions {
  display: flex;
  gap: 8px;
  opacity: 1 !important;
  visibility: visible !important;
  flex-wrap: wrap;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  gap: 8px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.btn-primary {
  background-color: #007aff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056cc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background-color: #ffffff;
  color: #1d1d1f;
  border: 1px solid #d1d1d6;
}

.btn-secondary:hover {
  background-color: #f2f2f7;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #ff3b30;
  color: white;
}

.btn-danger:hover {
  background-color: #d70015;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #d1d1d6;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #86868b;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.modal-close:hover {
  background-color: #f2f2f7;
  color: #1d1d1f;
}

.modal-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.schedule-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 8px;
  margin-bottom: 8px;
  align-items: end;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 详情页样式 */
.detail-info h4 {
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 20px;
  color: #1d1d1f;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-start;
}

.detail-label {
  font-weight: 500;
  width: 100px;
  flex-shrink: 0;
  color: #86868b;
}

.detail-value {
  color: #1d1d1f;
  flex: 1;
}

.detail-value p {
  margin: 0;
  line-height: 1.6;
}

.schedule-detail {
  flex: 1;
}

.schedule-detail-item {
  margin-bottom: 4px;
  padding: 4px 0;
}

.no-schedule {
  color: #86868b;
  font-style: italic;
}

/* 错误提示 */
.error-message {
  background-color: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 40px 20px;
  color: #86868b;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  table {
    display: block;
    overflow-x: auto;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .schedule-item {
    grid-template-columns: 1fr;
  }

  .detail-row {
    flex-direction: column;
  }

  .detail-label {
    width: auto;
    margin-bottom: 4px;
  }
}
</style>