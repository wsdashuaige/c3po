<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 活动列表数据
const activities = ref([
  {
    id: 1,
    name: "春季招新活动",
    date: "2024-03-15",
    location: "操场",
    maxParticipants: 100,
    currentParticipants: 68,
    status: "completed",
    description: "新学期社团招新活动，欢迎新同学加入！",
  },
  {
    id: 2,
    name: "技术分享会",
    date: "2024-03-20",
    location: "教学楼A301",
    maxParticipants: 50,
    currentParticipants: 45,
    status: "completed",
    description: "前端技术分享，包括Vue3新特性讲解。",
  },
  {
    id: 3,
    name: "户外团建活动",
    date: "2024-04-05",
    location: "城市公园",
    maxParticipants: 40,
    currentParticipants: 32,
    status: "upcoming",
    description: "促进团队凝聚力的户外团建活动。",
  },
  {
    id: 4,
    name: "编程竞赛",
    date: "2024-04-12",
    location: "计算机实验室",
    maxParticipants: 30,
    currentParticipants: 25,
    status: "upcoming",
    description: "社团内部编程竞赛，提升技术水平。",
  },
]);

// 搜索关键词
const searchKeyword = ref("");

// 筛选状态
const filterStatus = ref("all");

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 模态框状态
const dialogVisible = ref(false);
const dialogTitle = ref("");
const isEditMode = ref(false);

// 活动表单数据
const activityForm = reactive({
  id: "",
  name: "",
  date: "",
  location: "",
  maxParticipants: 0,
  description: "",
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入活动名称", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "活动名称长度在 2 到 50 个字符",
      trigger: "blur",
    },
  ],
  date: [{ required: true, message: "请选择活动日期", trigger: "change" }],
  location: [
    { required: true, message: "请输入活动地点", trigger: "blur" },
    {
      min: 1,
      max: 100,
      message: "活动地点长度在 1 到 100 个字符",
      trigger: "blur",
    },
  ],
  maxParticipants: [
    { required: true, message: "请输入最大参与人数", trigger: "blur" },
    {
      type: "number",
      min: 1,
      message: "最大参与人数至少为1人",
      trigger: "blur",
    },
  ],
  description: [
    { required: true, message: "请输入活动描述", trigger: "blur" },
    {
      min: 10,
      max: 500,
      message: "活动描述长度在 10 到 500 个字符",
      trigger: "blur",
    },
  ],
};

// 表单引用
const formRef = ref();

// 获取过滤后的活动列表
const getFilteredActivities = () => {
  let filtered = activities.value;

  // 按关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(
      (activity) =>
        activity.name
          .toLowerCase()
          .includes(searchKeyword.value.toLowerCase()) ||
        activity.location
          .toLowerCase()
          .includes(searchKeyword.value.toLowerCase())
    );
  }

  // 按状态筛选
  if (filterStatus.value !== "all") {
    filtered = filtered.filter(
      (activity) => activity.status === filterStatus.value
    );
  }

  // 更新总条数
  pagination.total = filtered.length;

  // 分页
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filtered.slice(start, end);
};

// 处理分页
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
};

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1;
};

// 打开添加活动模态框
const openAddDialog = () => {
  resetForm();
  dialogTitle.value = "添加活动";
  isEditMode.value = false;
  dialogVisible.value = true;
};

// 打开编辑活动模态框
const openEditDialog = (activity: any) => {
  Object.assign(activityForm, activity);
  dialogTitle.value = "编辑活动";
  isEditMode.value = true;
  dialogVisible.value = true;
};

// 查看活动详情
const viewActivityDetail = (activity: any) => {
  ElMessage.info(`查看活动ID: ${activity.id} 的详情`);
  // 在实际项目中，这里可以跳转到详情页面或打开详情模态框
};

// 删除活动
const deleteActivity = (activity: any) => {
  ElMessageBox.confirm(`确定要删除活动「${activity.name}」吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 模拟删除操作
      const index = activities.value.findIndex(
        (item) => item.id === activity.id
      );
      if (index !== -1) {
        activities.value.splice(index, 1);
        ElMessage.success("活动删除成功");

        // 模拟审批流程
        ElMessage.info("活动删除请求已提交，等待学校管理员审批");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (isEditMode.value) {
        // 编辑模式
        const index = activities.value.findIndex(
          (item) => item.id === Number(activityForm.id)
        );
        if (index !== -1) {
          activities.value[index] = {
            ...activityForm,
            id: Number(activityForm.id),
            currentParticipants: activities.value[index].currentParticipants,
            status: activities.value[index].status,
          };
          ElMessage.success("活动编辑成功");

          // 模拟审批流程
          ElMessage.info("活动修改请求已提交，等待学校管理员审批");
        }
      } else {
        // 添加模式
        const newActivity = {
          ...activityForm,
          id: activities.value.length + 1,
          currentParticipants: 0,
          status: "upcoming",
        };
        activities.value.unshift(newActivity);
        ElMessage.success("活动添加成功");
      }
      dialogVisible.value = false;
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(activityForm, {
    id: "",
    name: "",
    date: "",
    location: "",
    maxParticipants: 0,
    description: "",
  });
};

// 获取状态标签样式
const getStatusTagClass = (status: string) => {
  return status === "completed" ? "el-tag--success" : "el-tag--primary";
};

// 获取状态文本
const getStatusText = (status: string) => {
  return status === "completed" ? "已完成" : "即将开始";
};

// 计算参与率
const getParticipationRate = (activity: any) => {
  if (activity.maxParticipants === 0) return "0%";
  return (
    Math.round(
      (activity.currentParticipants / activity.maxParticipants) * 100
    ) + "%"
  );
};

onMounted(() => {
  pagination.total = activities.value.length;
});
</script>

<template>
  <div class="activities-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">活动管理</h1>
      <div class="page-subtitle">管理社团的所有活动，包括创建、编辑和删除活动。</div>
    </div>

    <!-- 操作栏 -->
    <el-card class="action-bar-card">
      <div class="action-bar">
        <div class="search-filter">
          <el-input v-model="searchKeyword"
                    placeholder="搜索活动名称或地点"
                    prefix-icon="el-icon-search"
                    class="search-input"
                    @keyup.enter="handleSearch" />
          <el-select v-model="filterStatus"
                     placeholder="筛选状态"
                     class="filter-select">
            <el-option label="全部状态"
                       value="all" />
            <el-option label="即将开始"
                       value="upcoming" />
            <el-option label="已完成"
                       value="completed" />
          </el-select>
          <el-button type="primary"
                     @click="handleSearch">搜索</el-button>
          <el-button @click="searchKeyword = '', filterStatus = 'all', pagination.currentPage = 1">重置</el-button>
        </div>
      </div>
  </div>
  <el-button type="primary"
             @click="openAddDialog"
             icon="el-icon-plus">添加活动</el-button>

  <!-- 活动列表 -->
  <el-card class="activities-table-card">
    <el-table :data="getFilteredActivities()"
              class="activities-table">
      <el-table-column prop="id"
                       label="活动ID"
                       width="80"
                       type="index"></el-table-column>
      <el-table-column prop="name"
                       label="活动名称"
                       min-width="200">
        <template #default="scope">
          <span class="activity-name">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="date"
                       label="活动日期"
                       width="120"></el-table-column>
      <el-table-column prop="location"
                       label="活动地点"
                       min-width="150"></el-table-column>
      <el-table-column label="参与情况"
                       width="180">
        <template #default="scope">
          <div class="participation-info">
            <span class="participation-text">
              {{ scope.row.currentParticipants }}/{{ scope.row.maxParticipants }}
            </span>
            <div class="progress-bar">
              <el-progress :percentage="Number(getParticipationRate(scope.row).replace('%', ''))"
                           :color="{
                      '0%': '#13c2c2',
                      '100%': '#1890ff'
                    }" />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status"
                       label="状态"
                       width="100">
        <template #default="scope">
          <el-tag :class="getStatusTagClass(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作"
                       width="180"
                       fixed="right">
        <template #default="scope">
          <el-button type="primary"
                     size="small"
                     @click="viewActivityDetail(scope.row)">查看</el-button>
          <el-button type="warning"
                     size="small"
                     @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger"
                     size="small"
                     @click="deleteActivity(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="pagination.currentPage"
                     v-model:page-size="pagination.pageSize"
                     :page-sizes="[10, 20, 50, 100]"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="pagination.total"
                     @size-change="(size) => { pagination.pageSize = size; pagination.currentPage = 1 }"
                     @current-change="handleCurrentChange" />
    </div>
  </el-card>
  <div>
    <!-- 活动表单模态框 -->
    <el-dialog v-model="dialogVisible"
               :title="dialogTitle"
               width="600px"
               :before-close="resetForm">
      <el-form ref="formRef"
               :model="activityForm"
               :rules="rules"
               label-width="120px">
        <el-form-item label="活动名称"
                      prop="name">
          <el-input v-model="activityForm.name"
                    placeholder="请输入活动名称"></el-input>
        </el-form-item>
        <el-form-item label="活动日期"
                      prop="date">
          <el-date-picker v-model="activityForm.date"
                          type="date"
                          placeholder="选择日期"
                          style="width: 100%"
                          value-format="YYYY-MM-DD"></el-date-picker>
        </el-form-item>
        <el-form-item label="活动地点"
                      prop="location">
          <el-input v-model="activityForm.location"
                    placeholder="请输入活动地点"></el-input>
        </el-form-item>
        <el-form-item label="最大参与人数"
                      prop="maxParticipants">
          <el-input-number v-model="activityForm.maxParticipants"
                           :min="1"
                           :max="999"
                           placeholder="请输入最大参与人数"></el-input-number>
        </el-form-item>
        <el-form-item label="活动描述"
                      prop="description">
          <el-input v-model="activityForm.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入活动描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false, resetForm()">取消</el-button>
        <el-button type="primary"
                   @click="submitForm()">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.activities-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #606266;
}

/* 操作栏 */
.action-bar-card {
  margin-bottom: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 150px;
}

/* 活动列表 */
.activities-table-card {
  margin-bottom: 20px;
}

.activities-table :deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
}

.activity-name {
  font-weight: 500;
  color: #303133;
}

.participation-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.participation-text {
  font-size: 14px;
  color: #606266;
}

.progress-bar {
  margin-top: 4px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activities-container {
    padding: 10px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-filter {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .activities-table :deep(.el-table__column) {
    font-size: 14px;
  }

  .activities-table :deep(.el-table__column--width-fixed) {
    right: 0;
  }
}
</style>