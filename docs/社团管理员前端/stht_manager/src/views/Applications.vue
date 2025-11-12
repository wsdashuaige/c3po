<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 申请列表数据
const applications = ref([
  {
    id: 1,
    applicantName: "张三",
    studentId: "20210001",
    activityName: "春季招新活动",
    applicationDate: "2024-03-01",
    status: "pending",
    description: "希望参加春季招新活动，了解社团情况。",
    approvalDate: null,
    approver: null,
    comments: "",
  },
  {
    id: 2,
    applicantName: "李四",
    studentId: "20210002",
    activityName: "技术分享会",
    applicationDate: "2024-03-15",
    status: "approved",
    description: "对前端技术很感兴趣，希望参加分享会。",
    approvalDate: "2024-03-16",
    approver: "管理员",
    comments: "批准参加",
  },
  {
    id: 3,
    applicantName: "王五",
    studentId: "20220001",
    activityName: "户外团建活动",
    applicationDate: "2024-03-25",
    status: "pending",
    description: "想通过团建活动认识更多社团成员。",
    approvalDate: null,
    approver: null,
    comments: "",
  },
  {
    id: 4,
    applicantName: "赵六",
    studentId: "20220002",
    activityName: "编程竞赛",
    applicationDate: "2024-03-28",
    status: "pending",
    description: "检验自己的编程能力，希望得到锻炼。",
    approvalDate: null,
    approver: null,
    comments: "",
  },
  {
    id: 5,
    applicantName: "钱七",
    studentId: "20230001",
    activityName: "技术分享会",
    applicationDate: "2024-03-10",
    status: "rejected",
    description: "想学习前端开发知识。",
    approvalDate: "2024-03-12",
    approver: "管理员",
    comments: "活动人数已满",
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
const detailDialogVisible = ref(false);
const approveDialogVisible = ref(false);
const currentApplication = ref<any>(null);

// 审批表单数据
const approveForm = reactive({
  comments: "",
});

// 表单验证规则
const rules = {
  comments: [{ required: true, message: "请输入审批意见", trigger: "blur" }],
};

// 表单引用
const formRef = ref();

// 获取过滤后的申请列表
const getFilteredApplications = () => {
  let filtered = applications.value;

  // 按关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(
      (app) =>
        app.applicantName.includes(searchKeyword.value) ||
        app.studentId.includes(searchKeyword.value) ||
        app.activityName.includes(searchKeyword.value)
    );
  }

  // 按状态筛选
  if (filterStatus.value !== "all") {
    filtered = filtered.filter((app) => app.status === filterStatus.value);
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

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = "";
  filterStatus.value = "all";
  pagination.currentPage = 1;
};

// 查看申请详情
const viewApplicationDetail = (application: any) => {
  currentApplication.value = { ...application };
  detailDialogVisible.value = true;
};

// 打开审批对话框
const openApproveDialog = (application: any) => {
  currentApplication.value = { ...application };
  approveForm.comments = "";
  approveDialogVisible.value = true;
};

// 批准申请
const approveApplication = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const index = applications.value.findIndex(
        (app) => app.id === currentApplication.value.id
      );
      if (index !== -1) {
        applications.value[index] = {
          ...applications.value[index],
          status: "approved",
          approvalDate: new Date().toISOString().split("T")[0],
          approver: "管理员",
          comments: approveForm.comments,
        };
        ElMessage.success("申请已批准");
        simulateNotification(currentApplication.value, "approved");
        approveDialogVisible.value = false;
      }
    }
  });
};

// 拒绝申请
const rejectApplication = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const index = applications.value.findIndex(
        (app) => app.id === currentApplication.value.id
      );
      if (index !== -1) {
        applications.value[index] = {
          ...applications.value[index],
          status: "rejected",
          approvalDate: new Date().toISOString().split("T")[0],
          approver: "管理员",
          comments: approveForm.comments,
        };
        ElMessage.success("申请已拒绝");
        simulateNotification(currentApplication.value, "rejected");
        approveDialogVisible.value = false;
      }
    }
  });
};

// 模拟通知申请人
const simulateNotification = (application: any, action: string) => {
  setTimeout(() => {
    ElMessage.info(
      `已通知申请人 ${application.applicantName}，其申请已${
        action === "approved" ? "批准" : "拒绝"
      }`
    );
  }, 1000);
};

// 获取状态标签样式
const getStatusTagClass = (status: string) => {
  switch (status) {
    case "pending":
      return "el-tag--warning";
    case "approved":
      return "el-tag--success";
    case "rejected":
      return "el-tag--danger";
    default:
      return "";
  }
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "待处理";
    case "approved":
      return "已批准";
    case "rejected":
      return "已拒绝";
    default:
      return "未知状态";
  }
};

// 统计数据
const getStats = () => {
  return {
    total: applications.value.length,
    pending: applications.value.filter((app) => app.status === "pending")
      .length,
    approved: applications.value.filter((app) => app.status === "approved")
      .length,
    rejected: applications.value.filter((app) => app.status === "rejected")
      .length,
    approvalRate:
      applications.value.length === 0
        ? "0%"
        : Math.round(
            (applications.value.filter((app) => app.status === "approved")
              .length /
              (applications.value.length -
                applications.value.filter((app) => app.status === "pending")
                  .length)) *
              100
          ) + "%",
  };
};

onMounted(() => {
  pagination.total = applications.value.length;
});
</script>

<template>
  <el-col :span="4">
    <div class="applications-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">申请管理</h1>
        <div class="page-subtitle">管理活动预约申请，包括审批和查看申请记录。</div>
      </div>

      <!-- 操作栏 -->
      <el-card class="action-bar-card">
        <div class="action-bar">
          <div class="search-filter">
            <el-input v-model="searchKeyword"
                      placeholder="搜索申请人、学号或活动名称"
                      prefix-icon="el-icon-search"
                      class="search-input"
                      @keyup.enter="handleSearch" />
            <el-select v-model="filterStatus"
                       placeholder="筛选状态"
                       class="filter-select">
              <el-option label="全部状态"
                         value="all" />
              <el-option label="待处理"
                         value="pending" />
              <el-option label="已批准"
                         value="approved" />
              <el-option label="已拒绝"
                         value="rejected" />
            </el-select>
            <el-button type="primary"
                       @click="handleSearch">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </div>
        </div>
      </el-card>

      <!-- 统计卡片 -->
      <el-row :gutter="20"
              class="mb-20">
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon stat-icon-primary">
                <el-icon name="el-icon-document" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ getStats().total }}</div>
                <div class="stat-label">申请总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
  <el-col :span="4">
    <el-card class="stat-card">
      <div class="stat-content">
        <div class="stat-icon stat-icon-warning">
          <el-icon name="el-icon-time" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ getStats().pending }}</div>
          <div class="stat-label">待处理申请</div>
        </div>
      </div>
      </el-card>
    </el-col>
  <el-col :span="4">
    <el-card class="stat-card">
      <div class="stat-content">
        <div class="stat-icon stat-icon-success">
          <el-icon name="el-icon-check" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ getStats().approved }}</div>
          <div class="stat-label">已批准申请</div>
        </div>
      </div>
      </el-card>
    </el-col>
  <el-col :span="4">
    <el-card class="stat-card">
      <div class="stat-content">
        <div class="stat-icon stat-icon-danger">
          <el-icon name="el-icon-close" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ getStats().rejected }}</div>
          <div class="stat-label">已拒绝申请</div>
        </div>
      </div>
      </el-card>
    </el-col>
  <el-col :span="4">
    <el-card class="stat-card">
      <div class="stat-content">
        <div class="stat-icon stat-icon-info">
          <el-icon name="el-icon-goods" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ getStats().approvalRate }}</div>
          <div class="stat-label">申请通过率</div>
        </div>
      </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 申请列表 -->
  <el-card class="applications-table-card">
    <el-table :data="getFilteredApplications()"
              class="applications-table">
      <el-table-column prop="id"
                       label="申请ID"
                       width="80"
                       type="index"></el-table-column>
      <el-table-column prop="applicantName"
                       label="申请人"
                       width="120">
        <template #default="scope">
          <div class="applicant-info">
            <el-avatar :size="32"
                       :text="scope.row.applicantName[0]" />
            <span class="applicant-name">{{ scope.row.applicantName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="studentId"
                       label="学号"
                       width="120"></el-table-column>
      <el-table-column prop="activityName"
                       label="申请活动"
                       min-width="200"></el-table-column>
      <el-table-column prop="applicationDate"
                       label="申请日期"
                       width="120"></el-table-column>
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
                       width="200"
                       fixed="right">
        <template #default="scope">
          <el-button type="primary"
                     size="small"
                     @click="viewApplicationDetail(scope.row)">查看详情</el-button>
          <el-button v-if="scope.row.status === 'pending'"
                     type="success"
                     size="small"
                     @click="openApproveDialog(scope.row)">审批</el-button>
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
  <!-- 申请详情模态框 -->
  <el-dialog v-model="detailDialogVisible"
             title="申请详情"
             width="700px">
    <div v-if="currentApplication"
         class="application-detail">
      <div class="detail-section">
        <h3 class="section-title">申请人信息</h3>
        <el-descriptions border
                         column="2">
          <el-descriptions-item label="申请人姓名">{{ currentApplication.applicantName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentApplication.studentId }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="detail-section">
        <h3 class="section-title">申请信息</h3>
        <el-descriptions border
                         column="2">
          <el-descriptions-item label="申请活动">{{ currentApplication.activityName }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentApplication.applicationDate }}</el-descriptions-item>
          <el-descriptions-item label="申请状态"
                                :span="2">
            <el-tag :class="getStatusTagClass(currentApplication.status)">
              {{ getStatusText(currentApplication.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请描述"
                                :span="2">{{ currentApplication.description }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-if="currentApplication.status !== 'pending'"
           class="detail-section">
        <h3 class="section-title">审批信息</h3>
        <el-descriptions border
                         column="2">
          <el-descriptions-item label="审批人">{{ currentApplication.approver }}</el-descriptions-item>
          <el-descriptions-item label="审批日期">{{ currentApplication.approvalDate }}</el-descriptions-item>
          <el-descriptions-item label="审批意见"
                                :span="2">{{ currentApplication.comments }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </el-dialog>

  <!-- 审批模态框 -->
  <div>
    <el-dialog v-model="approveDialogVisible"
               title="审批申请"
               width="600px">
      <div v-if="currentApplication"
           class="approve-dialog-content">
        <p class="dialog-info">
          申请人：{{ currentApplication.applicantName }} ({{ currentApplication.studentId }})
        </p>
        <p class="dialog-info">
          申请活动：{{ currentApplication.activityName }}
        </p>
        <el-form ref="formRef"
                 :model="approveForm"
                 :rules="rules"
                 label-width="100px"
                 class="mt-20">
          <el-form-item label="审批意见"
                        prop="comments">
            <el-input v-model="approveForm.comments"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入审批意见" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="rejectApplication()">拒绝</el-button>
        <el-button type="success" @click="approveApplication()">批准</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.applications-container {
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

/* 统计卡片 */
.mb-20 {
  margin-bottom: 20px;
}

.stat-card {
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  margin-right: 20px;
}

.stat-icon-primary {
  background-color: #1890ff;
}

.stat-icon-success {
  background-color: #52c41a;
}

.stat-icon-warning {
  background-color: #faad14;
}

.stat-icon-danger {
  background-color: #f5222d;
}

.stat-icon-info {
  background-color: #13c2c2;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

/* 申请列表 */
.applications-table-card {
  margin-bottom: 20px;
}

.applications-table :deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.applicant-name {
  font-weight: 500;
  color: #303133;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 申请详情 */
.application-detail {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

/* 审批对话框 */
.approve-dialog-content {
  padding: 10px 0;
}

.dialog-info {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.mt-20 {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .applications-container {
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

  .stat-content {
    flex-direction: column;
    text-align: center;
    padding: 15px 0;
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>