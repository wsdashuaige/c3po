<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { courseAPI, approvalAPI } from '../services/api'

const courses = ref([])
const loading = ref(false)
const error = ref('')

// 课程详情模态框
const courseDetailVisible = ref(false)
const currentCourse = ref(null)
const courseDetailLoading = ref(false)

// 添加课程模态框
const addCourseVisible = ref(false)
const newCourse = ref({
  name: '',
  semester: '',
  credit: null,
  enrollLimit: null,
  teacherId: null
})
const addCourseLoading = ref(false)

// 审核模态框
const reviewModalVisible = ref(false)
const reviewCourse = ref(null)
const reviewApprovalRequestId = ref(null)
const reviewComment = ref('')
const reviewLoading = ref(false)

const keyword = ref('')
const statusOptions = [
  { label: '全部', value: 'ALL' },
  { label: '草稿', value: 'DRAFT' },
  { label: '待审核', value: 'PENDING_REVIEW' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已归档', value: 'ARCHIVED' }
]
const statusFilter = ref(statusOptions[0].value)
const semesterFilter = ref('')
const teacherFilter = ref('')

const statusDictionary = {
  DRAFT: { text: '草稿', class: 'status-draft' },
  PENDING_REVIEW: { text: '待审核', class: 'status-pending' },
  PUBLISHED: { text: '已发布', class: 'status-published' },
  ARCHIVED: { text: '已归档', class: 'status-archived' }
}

const getStatusInfo = (status) => {
  return statusDictionary[status] || { text: status || '未知', class: 'status-draft' }
}

const filteredCourses = computed(() => {
  let result = [...courses.value]

  if (keyword.value) {
    const query = keyword.value.toLowerCase()
    result = result.filter(course =>
      (course.name || '').toLowerCase().includes(query)
    )
  }

  if (semesterFilter.value) {
    const semesterQuery = semesterFilter.value.toLowerCase()
    result = result.filter(course =>
      (course.semester || '').toLowerCase().includes(semesterQuery)
    )
  }

  if (teacherFilter.value) {
    const teacherQuery = teacherFilter.value.toLowerCase()
    result = result.filter(course =>
      (course.teacherId || '').toLowerCase().includes(teacherQuery)
    )
  }

  if (statusFilter.value !== 'ALL') {
    result = result.filter(course => course.status === statusFilter.value)
  }

  return result
})

const courseStats = computed(() => {
  const list = courses.value
  const total = list.length
  const draft = list.filter(course => course.status === 'DRAFT').length
  const pending = list.filter(course => course.status === 'PENDING_REVIEW').length
  const published = list.filter(course => course.status === 'PUBLISHED').length

  return [
    {
      label: '总课程',
      value: total,
      subtitle: '包含所有状态',
      trend: total ? `草稿 ${draft} 门` : '暂无数据',
      accent: 'primary'
    },
    {
      label: '待审核',
      value: pending,
      subtitle: '等待管理员审核',
      trend: pending ? '请尽快处理' : '暂无待审批',
      accent: 'warning'
    },
    {
      label: '已发布',
      value: published,
      subtitle: '可供学生选课',
      trend: total ? `${Math.round((published / total) * 100)}% 发布率` : '暂无数据',
      accent: 'success'
    },
    {
      label: '草稿',
      value: draft,
      subtitle: '尚未提交审核',
      trend: draft ? '可继续完善' : '全部已提交',
      accent: 'neutral'
    }
  ]
})

const formatDateTime = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }
  return date.toLocaleString('zh-CN')
}

const formatTeacherId = (value) => {
  if (!value) return '--'
  return value.length > 8 ? `${value.slice(0, 8)}...` : value
}

const loadCourses = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (keyword.value) {
      params.keyword = keyword.value.trim()
    }
    if (statusFilter.value !== 'ALL') {
      params.status = statusFilter.value
    }
    if (semesterFilter.value) {
      params.semester = semesterFilter.value.trim()
    }
    if (teacherFilter.value) {
      params.teacherId = teacherFilter.value.trim()
    }
    const response = await courseAPI.getCourses(params)
    console.log('课程列表 API 完整响应:', response)
    
    // 后端返回 ApiResponse<List<CourseResponse>>，http 拦截器已经返回了 response.data
    // 所以这里 response 就是 ApiResponse，课程列表在 response.data 中
    const payload = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
    console.log('提取的课程数据数组:', payload)
    
    courses.value = (payload || []).map(course => {
      // 确保 ID 是字符串格式，并验证格式
      let courseId = course.id
      if (courseId) {
        courseId = String(courseId)
        // UUID 格式验证（基本检查）
        if (!courseId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          console.warn('课程 ID 格式异常:', courseId, '原始课程数据:', course)
        } else {
          console.log('课程 ID 格式正确:', courseId, '课程名称:', course.name)
        }
      } else {
        console.warn('课程缺少 ID:', course)
      }
      return {
        ...course,
        id: courseId,
        metrics: course.metrics || {}
      }
    })
    console.log('映射后的课程列表（前3个）:', courses.value.slice(0, 3))
  } catch (err) {
    error.value = err?.response?.data?.message || err.message || '加载课程数据失败'
    console.error('加载课程数据失败:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadCourses()
}

const resetFilters = () => {
  keyword.value = ''
  statusFilter.value = statusOptions[0].value
  semesterFilter.value = ''
  teacherFilter.value = ''
  loadCourses()
}

const submitForPublish = async (courseId) => {
  if (!courseId) {
    console.error('提交发布失败: 课程 ID 无效')
    return
  }
  
  // 确保 ID 是字符串格式
  const courseIdStr = String(courseId).trim()
  console.log('提交发布 - courseId:', courseIdStr)
  
  // 检查课程是否在列表中
  const course = courses.value.find(c => c.id === courseIdStr)
  if (!course) {
    console.error('提交发布失败: 未找到该课程，请刷新列表后重试')
    return
  }
  
  // 确认操作
  if (!confirm(`确定要提交课程 "${course.name}" 发布审批吗？`)) {
    return
  }
  
  try {
    console.log('调用发布接口:', `/api/v1/courses/${courseIdStr}/publish`)
    const response = await courseAPI.publishCourse(courseIdStr)
    console.log('发布接口响应:', response)
    
    console.log('课程发布请求已提交，等待管理员审批')
    
    // 更新本地课程状态
    if (course) {
      course.status = 'PENDING_REVIEW'
    }
    
    // 刷新课程列表
    await loadCourses()
  } catch (err) {
    console.error('========== 提交发布失败 ==========')
    console.error('完整错误对象:', err)
    console.error('错误响应:', err.response)
    
    const errorMsg = err?.message || err?.error || '提交失败，请稍后重试'
    const errorStatus = err?.status || err?.response?.status
    
    console.error('错误状态码:', errorStatus)
    console.error('错误消息:', errorMsg)
    
    if (errorStatus === 404) {
      console.error('课程不存在（404）')
      console.error('课程 ID:', courseIdStr)
      console.error('可能原因：')
      console.error('1. 数据库中不存在该课程')
      console.error('2. 课程已被删除')
      console.error('3. 课程 ID 不正确')
      console.error('请刷新课程列表后重试')
    } else if (errorStatus === 403) {
      console.error('没有权限发布该课程（403）')
    } else {
      console.error('提交失败:', errorMsg)
    }
    
    console.error('================================')
  }
}

// 打开审核模态框
const openReviewModal = async (courseId) => {
  if (!courseId) {
    console.error('打开审核模态框失败: 课程 ID 无效')
    return
  }

  const courseIdStr = String(courseId).trim()
  const course = courses.value.find(c => c.id === courseIdStr)
  if (!course) {
    console.error('打开审核模态框失败: 未找到该课程')
    return
  }

  reviewCourse.value = course
  reviewComment.value = ''
  reviewApprovalRequestId.value = null
  reviewLoading.value = true
  reviewModalVisible.value = true

  try {
    const approvalsResponse = await approvalAPI.getApprovals({
      status: 'PENDING',
      type: 'COURSE_PUBLISH',
      pageSize: 100
    })

    const approvals = approvalsResponse.data || []
    const approval = approvals.find(apr => {
      try {
        const payload = JSON.parse(apr.payload || '{}')
        return payload.courseId === courseIdStr
      } catch {
        return false
      }
    })

    if (approval) {
      reviewApprovalRequestId.value = approval.id
      console.log('找到审批请求:', approval.id)
    } else {
      console.warn('未找到该课程的审批请求，课程 ID:', courseIdStr)
      console.error('无法审核：未找到对应的审批请求')
      reviewModalVisible.value = false
      return
    }
  } catch (err) {
    console.error('获取审批请求失败:', err)
    console.error('无法审核：获取审批请求失败')
    reviewModalVisible.value = false
    return
  } finally {
    reviewLoading.value = false
  }
}

// 关闭审核模态框
const closeReviewModal = () => {
  reviewModalVisible.value = false
  reviewCourse.value = null
  reviewApprovalRequestId.value = null
  reviewComment.value = ''
}

// 批准课程
const approveCourse = async () => {
  if (!reviewApprovalRequestId.value) {
    console.error('批准失败: 审批请求 ID 无效')
    return
  }

  reviewLoading.value = true

  try {
    await approvalAPI.decideApproval(reviewApprovalRequestId.value, {
      status: 'APPROVED',
      comment: reviewComment.value || null
    })

    console.log('课程已批准')
    closeReviewModal()
    await loadCourses()
  } catch (err) {
    console.error('========== 批准课程失败 ==========')
    console.error('完整错误对象:', err)
    console.error('错误响应:', err.response)

    const errorMsg = err?.message || err?.error || '批准失败，请稍后重试'
    const errorStatus = err?.status || err?.response?.status

    console.error('错误状态码:', errorStatus)
    console.error('错误消息:', errorMsg)
    console.error('================================')
  } finally {
    reviewLoading.value = false
  }
}

// 拒绝课程
const rejectCourse = async () => {
  if (!reviewApprovalRequestId.value) {
    console.error('拒绝失败: 审批请求 ID 无效')
    return
  }

  reviewLoading.value = true

  try {
    await approvalAPI.decideApproval(reviewApprovalRequestId.value, {
      status: 'REJECTED',
      comment: reviewComment.value || null
    })

    console.log('课程已拒绝')
    closeReviewModal()
    await loadCourses()
  } catch (err) {
    console.error('========== 拒绝课程失败 ==========')
    console.error('完整错误对象:', err)
    console.error('错误响应:', err.response)

    const errorMsg = err?.message || err?.error || '拒绝失败，请稍后重试'
    const errorStatus = err?.status || err?.response?.status

    console.error('错误状态码:', errorStatus)
    console.error('错误消息:', errorMsg)
    console.error('================================')
  } finally {
    reviewLoading.value = false
  }
}

// 打开添加课程模态框
const openAddCourseModal = () => {
  newCourse.value = {
    name: '',
    semester: '',
    credit: null,
    enrollLimit: null,
    teacherId: null
  }
  addCourseVisible.value = true
}

// 关闭添加课程模态框
const closeAddCourseModal = () => {
  addCourseVisible.value = false
  newCourse.value = {
    name: '',
    semester: '',
    credit: null,
    enrollLimit: null,
    teacherId: null
  }
}

// 验证 UUID 格式
const isValidUUID = (str) => {
  if (!str || !str.trim()) return false
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidPattern.test(str.trim())
}

// 验证教师 ID 格式（失焦时触发）
const validateTeacherId = () => {
  if (newCourse.value.teacherId && newCourse.value.teacherId.trim()) {
    const teacherIdStr = newCourse.value.teacherId.trim()
    if (!isValidUUID(teacherIdStr)) {
      console.error('教师 ID 格式不正确')
      console.error('请输入有效的 UUID 格式（例如：550e8400-e29b-41d4-a716-446655440000）')
      console.error('或者留空以使用当前登录用户作为教师')
      newCourse.value.teacherId = ''
    } else {
      newCourse.value.teacherId = teacherIdStr
    }
  }
}

// 创建课程
const createCourse = async () => {
  // 验证必填字段 - name (必填，最大128字符)
  const name = newCourse.value.name?.trim()
  if (!name) {
    console.error('创建课程失败: 请输入课程名称')
    return
  }
  if (name.length > 128) {
    console.error('创建课程失败: 课程名称不能超过 128 个字符')
    return
  }
  
  // 验证 semester (可选，最大32字符)
  const semester = newCourse.value.semester?.trim() || null
  if (semester && semester.length > 32) {
    console.error('创建课程失败: 学期不能超过 32 个字符')
    return
  }
  
  // 验证 credit (必填，正数，最大10)
  const credit = newCourse.value.credit
  if (!credit || credit <= 0) {
    console.error('创建课程失败: 请输入有效的学分（1-10）')
    return
  }
  if (credit > 10) {
    console.error('创建课程失败: 学分不能超过 10')
    return
  }
  
  // 验证 enrollLimit (必填，正数)
  const enrollLimit = newCourse.value.enrollLimit
  if (!enrollLimit || enrollLimit <= 0) {
    console.error('创建课程失败: 请输入有效的选课上限（必须大于 0）')
    return
  }
  
  // 验证 teacherId 格式（如果提供了）
  let teacherId = null
  if (newCourse.value.teacherId && newCourse.value.teacherId.trim()) {
    const teacherIdStr = newCourse.value.teacherId.trim()
    if (!isValidUUID(teacherIdStr)) {
      console.error('创建课程失败: 教师 ID 格式不正确')
      console.error('请输入有效的 UUID 格式（例如：550e8400-e29b-41d4-a716-446655440000）')
      console.error('或者留空以使用当前登录用户作为教师')
      return
    }
    teacherId = teacherIdStr
  }
  
  addCourseLoading.value = true
  
  try {
    // 构建请求数据，严格按照后端 CreateCourseRequest 的字段要求
    // 确保所有字段类型正确
    const courseData = {
      name: String(name),                    // 必填，String，最大128字符
      credit: Number(credit),                // 必填，Integer，正数，最大10
      enrollLimit: Number(enrollLimit)       // 必填，Integer，正数
    }
    
    // semester 可选，如果不为空则添加
    if (semester) {
      courseData.semester = String(semester)  // 可选，String，最大32字符
    }
    
    // teacherId 可选，如果提供了有效的 UUID 则添加
    // 如果不提供，后端会使用当前登录用户
    if (teacherId) {
      courseData.teacherId = String(teacherId)  // 可选，UUID
    }
    
    // 验证数据类型
    console.log('创建课程 - 请求数据:', JSON.stringify(courseData, null, 2))
    console.log('数据类型检查:', {
      name: typeof courseData.name,
      credit: typeof courseData.credit,
      enrollLimit: typeof courseData.enrollLimit,
      semester: courseData.semester ? typeof courseData.semester : 'undefined',
      teacherId: courseData.teacherId ? typeof courseData.teacherId : 'undefined'
    })
    
    // 确保数值类型正确
    if (isNaN(courseData.credit) || isNaN(courseData.enrollLimit)) {
      console.error('创建课程失败: 学分和选课上限必须是有效的数字')
      return
    }
    
    const response = await courseAPI.createCourse(courseData)
    console.log('创建课程响应:', response)
    
    console.log('课程创建成功！')
    closeAddCourseModal()
    await loadCourses() // 刷新列表
  } catch (err) {
    console.error('========== 创建课程失败 ==========')
    console.error('完整错误对象:', err)
    console.error('错误堆栈:', err.stack)
    console.error('错误响应:', err.response)
    
    const errorMsg = err?.message || err?.error || '创建失败，请稍后重试'
    const errorStatus = err?.status || err?.response?.status
    
    // 如果是 500 错误，可能是后端返回响应时出错，但数据可能已经保存
    // 尝试刷新列表，看看课程是否已经创建
    if (errorStatus === 500) {
      console.warn('收到 500 错误，但数据可能已保存，尝试刷新列表...')
      try {
        await loadCourses()
        // 检查是否有新创建的课程（通过名称匹配）
        const newCourse = courses.value.find(c => c.name === name)
        if (newCourse) {
          console.log(`课程可能已创建成功（虽然后端返回了错误）！课程名称：${name}，请检查课程列表确认。`)
          closeAddCourseModal()
          return
        }
      } catch (refreshErr) {
        console.error('刷新列表失败:', refreshErr)
      }
    }
    
    // 检查是否有验证错误详情
    let validationErrors = ''
    if (err?.errors && typeof err.errors === 'object') {
      const errorList = Object.entries(err.errors).map(([field, msg]) => `${field}: ${msg}`).join('\n')
      if (errorList) {
        validationErrors = '\n验证错误详情：\n' + errorList
      }
    }
    
    // 检查响应数据中的错误信息
    let responseError = ''
    if (err?.response?.data) {
      const responseData = err.response.data
      console.error('后端响应数据:', responseData)
      if (responseData.message) {
        responseError = '\n后端错误消息: ' + responseData.message
      }
      if (responseData.errors) {
        responseError += '\n后端验证错误: ' + JSON.stringify(responseData.errors)
      }
    }
    
    // 输出详细的错误信息到控制台
    console.error('错误状态码:', errorStatus)
    console.error('错误消息:', errorMsg)
    if (validationErrors) {
      console.error(validationErrors)
    }
    if (responseError) {
      console.error(responseError)
    }
    
    if (errorStatus === 500) {
      console.error('服务器内部错误（500）')
      console.error('可能的原因：')
      console.error('1. 数据库连接问题')
      console.error('2. 数据库约束违反')
      console.error('3. 后端代码异常')
      console.error('请检查后端日志获取详细错误信息')
    } else     if (errorStatus === 400) {
      console.error('请求参数错误（400）')
      if (errorMsg && errorMsg.includes('Teacher not found')) {
        console.error('提示：指定的教师 ID 不存在于系统中')
        console.error('建议：留空教师 ID 字段，系统会自动使用当前登录用户作为教师')
      }
    } else if (errorStatus === 401) {
      console.error('未授权（401），请重新登录')
    } else if (errorStatus === 403) {
      console.error('没有权限创建课程（403）')
    }
    
    console.error('================================')
  } finally {
    addCourseLoading.value = false
  }
}

// 查看课程详情（直接从列表数据中获取，不调用接口）
const viewCourse = (courseId) => {
  if (!courseId) {
    console.error('查看课程详情失败: 课程 ID 无效')
    return
  }
  
  // 确保 ID 是字符串格式
  const courseIdStr = String(courseId).trim()
  
  // 从列表中查找课程
  const course = courses.value.find(c => c.id === courseIdStr)
  
  if (!course) {
    console.error('查看课程详情失败: 未找到该课程信息，请刷新课程列表后重试')
    return
  }
  
  // 直接使用列表中的课程数据
  currentCourse.value = { ...course }
  courseDetailVisible.value = true
  courseDetailLoading.value = false
}

// 关闭课程详情模态框
const closeCourseDetail = () => {
  courseDetailVisible.value = false
  currentCourse.value = null
  courseDetailLoading.value = false
}

const debounce = (func, wait = 400) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const debouncedLoadCourses = debounce(() => loadCourses())

watch(keyword, () => debouncedLoadCourses())
watch(semesterFilter, () => debouncedLoadCourses())
watch(teacherFilter, () => debouncedLoadCourses())
watch(statusFilter, () => loadCourses())

onMounted(() => {
  loadCourses()
})
</script>

<template>
  <MainLayout>
    <main class="main-content">
      <header class="header">
        <div class="header-content">
          <h1>课程管理</h1>
          <div class="header-actions">
            <button class="btn btn-primary" @click="openAddCourseModal">
              添加课程
            </button>
            <button class="btn btn-secondary" @click="loadCourses" :disabled="loading">
              刷新
            </button>
          </div>
        </div>
      </header>

      <section class="stats-grid">
        <div
          v-for="stat in courseStats"
          :key="stat.label"
          class="stat-card"
          :class="`stat-card--${stat.accent}`"
        >
          <div class="stat-meta">
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
          </div>
          <p class="stat-subtitle">{{ stat.subtitle }}</p>
          <p class="stat-trend">{{ stat.trend }}</p>
        </div>
      </section>

      <section class="card filters-card">
        <h2 class="section-title">筛选条件</h2>
        <div class="filters">
          <div>
            <label class="form-label">关键词</label>
            <input
              class="form-input"
              placeholder="课程名称 / 关键字"
              v-model="keyword"
            >
          </div>
          <div>
            <label class="form-label">状态</label>
            <select class="form-input form-select" v-model="statusFilter">
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="form-label">学期</label>
            <input
              class="form-input"
              placeholder="例：2025春"
              v-model="semesterFilter"
            >
          </div>
          <div>
            <label class="form-label">教师 ID</label>
            <input
              class="form-input"
              placeholder="教师 UUID"
              v-model="teacherFilter"
            >
          </div>
          <div class="filters-actions">
            <button class="btn btn-primary" @click="handleSearch" :disabled="loading">
              查询
            </button>
            <button class="btn btn-secondary" @click="resetFilters" :disabled="loading">
              重置
            </button>
          </div>
        </div>
      </section>

      <section class="card table-card">
        <div class="card-header">
          <div>
            <div class="card-title">课程列表</div>
            <p class="card-subtitle">共 {{ filteredCourses.length }} 门课程</p>
          </div>
        </div>

        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载课程数据...</p>
        </div>

        <div v-else-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button class="btn btn-primary" @click="loadCourses">重新加载</button>
        </div>

        <div v-else-if="filteredCourses.length === 0" class="empty-state">
          <p>暂无符合条件的课程</p>
          <button class="btn btn-primary" @click="loadCourses">重新加载</button>
        </div>

        <div v-else class="courses-grid">
          <article
            v-for="course in filteredCourses"
            :key="course.id"
            class="course-card"
            :class="[`course-card--${(course.status || 'draft').toLowerCase()}`]"
          >
            <div class="course-card__header">
              <div>
                <h3>{{ course.name || '未命名课程' }}</h3>
                <p class="course-card__meta">
                  {{ formatTeacherId(course.teacherId) }} · {{ course.semester || '未设置学期' }} ·
                  {{ formatDateTime(course.createdAt) }}
                </p>
              </div>
              <span class="status-chip" :class="getStatusInfo(course.status).class">
                {{ getStatusInfo(course.status).text }}
              </span>
            </div>

            <div class="course-card__body">
              <div class="course-card__metrics">
                <div class="metric">
                  <label>学分</label>
                  <p>{{ course.credit ?? '--' }}</p>
                </div>
                <div class="metric">
                  <label>选课上限</label>
                  <p>{{ course.enrollLimit ?? '--' }}</p>
                </div>
                <div class="metric">
                  <label>目前选课</label>
                  <p>{{ course.metrics?.enrolledCount ?? 0 }}</p>
                </div>
                <div class="metric">
                  <label>作业数量</label>
                  <p>{{ course.metrics?.assignments ?? 0 }}</p>
                </div>
                <div class="metric">
                  <label>章节数量</label>
                  <p>{{ course.metrics?.modules ?? 0 }}</p>
                </div>
              </div>
            </div>

            <div class="course-card__footer">
              <div class="course-card__actions">
                <template v-if="course.status === 'DRAFT'">
                  <button class="btn btn-primary btn-sm" @click="submitForPublish(course.id)" :disabled="loading">
                    提交发布
                  </button>
                </template>
                <template v-else-if="course.status === 'PENDING_REVIEW'">
                  <button class="btn btn-primary btn-sm" @click="openReviewModal(course.id)" :disabled="loading">
                    审核
                  </button>
                </template>
                <template v-else>
                  <button class="btn btn-secondary btn-sm" @click="viewCourse(course.id)" :disabled="!course.id">
                    查看
                  </button>
                </template>
              </div>

              <div class="course-card__id">
                <span>课程 ID：{{ course.id || '--' }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- 课程详情模态框 -->
    <div v-if="courseDetailVisible" class="modal active" @click.self="closeCourseDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">课程详情</h2>
          <button class="modal-close" @click="closeCourseDetail">&times;</button>
        </div>
        
        <div v-if="courseDetailLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载课程详情...</p>
        </div>
        
        <div v-else-if="currentCourse" class="course-detail">
          <div class="detail-section">
            <h3 class="detail-section-title">基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">课程名称</label>
                <div class="detail-value">{{ currentCourse.name || '--' }}</div>
              </div>
              <div class="detail-item">
                <label class="detail-label">学期</label>
                <div class="detail-value">{{ currentCourse.semester || '--' }}</div>
              </div>
              <div class="detail-item">
                <label class="detail-label">学分</label>
                <div class="detail-value">{{ currentCourse.credit ?? '--' }}</div>
              </div>
              <div class="detail-item">
                <label class="detail-label">选课上限</label>
                <div class="detail-value">{{ currentCourse.enrollLimit ?? '--' }}</div>
              </div>
              <div class="detail-item">
                <label class="detail-label">状态</label>
                <div class="detail-value">
                  <span class="status-badge" :class="getStatusInfo(currentCourse.status).class">
                    {{ getStatusInfo(currentCourse.status).text }}
                  </span>
                </div>
              </div>
              <div class="detail-item">
                <label class="detail-label">教师 ID</label>
                <div class="detail-value teacher-id">{{ currentCourse.teacherId || '--' }}</div>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="currentCourse.metrics">
            <h3 class="detail-section-title">课程指标</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">已选人数</label>
                <div class="detail-value">{{ currentCourse.metrics.enrolledCount ?? 0 }}</div>
              </div>
              <div class="detail-item">
                <label class="detail-label">作业数量</label>
                <div class="detail-value">{{ currentCourse.metrics.assignments ?? 0 }}</div>
              </div>
              <div class="detail-item">
                <label class="detail-label">章节数量</label>
                <div class="detail-value">{{ currentCourse.metrics.modules ?? 0 }}</div>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3 class="detail-section-title">时间信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">创建时间</label>
                <div class="detail-value">{{ formatDateTime(currentCourse.createdAt) }}</div>
              </div>
              <div class="detail-item">
                <label class="detail-label">更新时间</label>
                <div class="detail-value">{{ formatDateTime(currentCourse.updatedAt) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCourseDetail">关闭</button>
        </div>
      </div>
    </div>

    <!-- 添加课程模态框 -->
    <div v-if="addCourseVisible" class="modal active" @click.self="closeAddCourseModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">添加课程</h2>
          <button class="modal-close" @click="closeAddCourseModal">&times;</button>
        </div>
        
        <div class="add-course-body">
          <div class="form-group">
            <label class="form-label">课程名称 <span class="required">*</span></label>
            <input
              class="form-input"
              v-model="newCourse.name"
              placeholder="请输入课程名称"
              :disabled="addCourseLoading"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">学期</label>
            <input
              class="form-input"
              v-model="newCourse.semester"
              placeholder="例：2025春（可选）"
              :disabled="addCourseLoading"
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">学分 <span class="required">*</span></label>
              <input
                type="number"
                class="form-input"
                v-model.number="newCourse.credit"
                placeholder="1-10"
                min="1"
                max="10"
                :disabled="addCourseLoading"
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">选课上限 <span class="required">*</span></label>
              <input
                type="number"
                class="form-input"
                v-model.number="newCourse.enrollLimit"
                placeholder="选课人数上限"
                min="1"
                :disabled="addCourseLoading"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">教师 ID</label>
            <input
              class="form-input"
              v-model="newCourse.teacherId"
              placeholder="教师 UUID（留空则使用当前登录用户）"
              :disabled="addCourseLoading"
              @blur="validateTeacherId"
            >
            <p class="form-hint">留空则使用当前登录用户作为教师。如果填写，必须是有效的 UUID 格式（例如：550e8400-e29b-41d4-a716-446655440000）</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeAddCourseModal" :disabled="addCourseLoading">
            取消
          </button>
          <button class="btn btn-primary" @click="createCourse" :disabled="addCourseLoading">
            {{ addCourseLoading ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 审核模态框 -->
    <div v-if="reviewModalVisible" class="modal active" @click.self="closeReviewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">审核课程发布</h2>
          <button class="modal-close" @click="closeReviewModal">&times;</button>
        </div>
        <div v-if="reviewLoading" class="modal-body loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载审批信息...</p>
        </div>
        <div v-else-if="reviewCourse" class="modal-body">
          <div class="form-group">
            <label class="form-label">课程名称</label>
            <div class="form-value">{{ reviewCourse.name || '--' }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">学期</label>
            <div class="form-value">{{ reviewCourse.semester || '--' }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">学分</label>
            <div class="form-value">{{ reviewCourse.credit ?? '--' }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">审核意见 <span class="optional">（可选）</span></label>
            <textarea
              class="form-input form-textarea"
              v-model="reviewComment"
              placeholder="请输入审核意见（可选）"
              maxlength="1024"
              :disabled="reviewLoading"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeReviewModal" :disabled="reviewLoading">
              取消
            </button>
            <button class="btn btn-warning" @click="rejectCourse" :disabled="reviewLoading">
              {{ reviewLoading ? '处理中...' : '拒绝' }}
            </button>
            <button class="btn btn-primary" @click="approveCourse" :disabled="reviewLoading">
              {{ reviewLoading ? '处理中...' : '批准' }}
            </button>
          </div>
        </div>
      </div>
    </div>
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

.header-actions {
  display: flex;
  gap: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 24px;
}

.filters-card {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 18px;
  padding: 20px;
  background: linear-gradient(145deg, #f9f9fb, #ffffff);
  border: 1px solid #eeeff4;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.08);
}

.stat-card--primary {
  border-color: rgba(0, 122, 255, 0.15);
}

.stat-card--warning {
  border-color: rgba(255, 149, 0, 0.25);
  background: linear-gradient(145deg, rgba(255, 149, 0, 0.08), #fff8f0);
}

.stat-card--success {
  border-color: rgba(52, 199, 89, 0.15);
  background: linear-gradient(145deg, rgba(52, 199, 89, 0.08), #f4fff8);
}

.stat-card--neutral {
  border-color: rgba(134, 134, 139, 0.12);
}

.stat-label {
  font-size: 14px;
  color: #8e8e93;
  margin: 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.stat-subtitle {
  font-size: 13px;
  color: #8e8e93;
  margin: 0;
}

.stat-trend {
  font-size: 12px;
  color: #007aff;
  margin: 0;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filters-actions {
  display: flex;
  gap: 12px;
  align-items: flex-end;
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
  border: 1px solid #d1d1d6;
}

.table-card {
  margin-top: 16px;
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

.card-subtitle {
  margin-top: 4px;
  color: #86868b;
  font-size: 14px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.course-card {
  border: 1px solid #e6e7eb;
  border-radius: 20px;
  padding: 24px;
  background: #fff;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.course-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.08);
}

.course-card--pending_review {
  border-color: rgba(255, 149, 0, 0.3);
  background: linear-gradient(145deg, rgba(255, 149, 0, 0.04), #fff);
}

.course-card--published {
  border-color: rgba(52, 199, 89, 0.35);
  background: linear-gradient(145deg, rgba(52, 199, 89, 0.04), #fff);
}

.course-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.course-card__header h3 {
  margin: 0;
  font-size: 20px;
  color: #1d1d1f;
}

.course-card__meta {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8e8e93;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.course-card__body {
  border-top: 1px solid #f1f2f6;
  border-bottom: 1px solid #f1f2f6;
  padding: 16px 0;
}

.course-card__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 14px;
}

.course-card__metrics .metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-card__metrics label {
  font-size: 12px;
  color: #8e8e93;
}

.course-card__metrics p {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.course-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.course-card__actions {
  display: flex;
  gap: 12px;
}

.course-card__id {
  font-size: 12px;
  color: #8e8e93;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-draft {
  background: rgba(134, 134, 139, 0.2);
  color: #1d1d1f;
}

.status-pending {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
}

.status-published {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.status-archived {
  background: rgba(99, 99, 102, 0.15);
  color: #636366;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #86868b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container,
.empty-state {
  text-align: center;
  padding: 40px;
}

.error-message {
  color: #ff3b30;
  margin-bottom: 16px;
}

.empty-state {
  color: #86868b;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-note {
  color: #ff9500;
  font-size: 13px;
}

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  table {
    display: block;
    overflow-x: auto;
  }
}

/* 模态框样式 */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  align-items: center;
  justify-content: center;
}

.modal.active {
  display: flex;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d1d1d6;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #86868b;
  cursor: pointer;
  padding: 8px;
  line-height: 1;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f2f2f7;
  color: #1d1d1f;
}

.course-detail {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f2f2f7;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
}

.detail-value {
  font-size: 16px;
  color: #1d1d1f;
  word-break: break-word;
}

.detail-value.teacher-id {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  color: #636366;
}

.form-value {
  padding: 12px 0;
  font-size: 16px;
  color: #1d1d1f;
}

.optional {
  color: #86868b;
  font-weight: normal;
  font-size: 12px;
}

.btn-warning {
  background-color: #ff9500;
  color: white;
}

.btn-warning:hover {
  background-color: #e6850e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #d1d1d6;
}

.add-course-body {
  padding: 8px 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.required {
  color: #ff3b30;
}

.form-hint {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    padding: 24px;
  }
}
</style>
