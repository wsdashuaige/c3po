# 智慧学习平台 API 设计文档

## 1. 文档概述
- **版本**：v0.9.1（与后端 JWT 实现对齐）
- **覆盖范围**：学生端、教师端、管理员端的核心功能接口；统一认证、消息通知、异步任务与运维相关接口。
- **目标读者**：后端/前端开发、QA、运维、产品经理、集成方。
- **接口前缀（当前实现）**：`/api`（认证模块为 `/api/auth/**`）
- 说明：原规划中的 `/api/v1` 版本前缀将于稳定版切换，现阶段以已实现路径为准。

## 2. 接口通用约定

### 2.1 HTTP 与数据格式
- 所有接口使用 HTTPS，默认域名为 `https://{env}.smart-learning.edu`.
- 请求与响应主体均采用 `application/json; charset=utf-8`；文件上传使用 `multipart/form-data`。
- 时间字段统一使用 ISO8601，带时区：`YYYY-MM-DDThh:mm:ssZ`。

### 2.2 认证与授权
- 当前实现基于 JWT 的无状态认证（Spring Security + OncePerRequestFilter）：
  - 登录/注册返回 `accessToken`（JWT，默认有效期由配置 `security.jwt.expiration-ms` 控制，单位毫秒）、`tokenType=Bearer`、`expiresIn`（毫秒）。
  - 客户端请求头携带 `Authorization: Bearer {accessToken}`。
  - 公开端点：`/api/auth/**`、`/actuator/health`、`/error`；其余端点默认需要认证。
  - 未认证访问返回 `401`，鉴权不足返回 `403`。
- 配置：
  - `security.jwt.secret`（HS 密钥，至少 32 字符）
  - `security.jwt.expiration-ms`（Token 过期毫秒数，默认 3600000）
- 角色模型：`ROLE_STUDENT|ROLE_TEACHER|ROLE_ADMIN`（来自用户 `role` 枚举）。

### 2.3 幂等性与重试
- PUT/DELETE 接口需幂等；敏感 POST 接口通过 `Idempotency-Key` 头（UUID）保障重复请求安全。
- 异步任务接口提供任务状态查询，避免长轮询。

### 2.4 分页与排序
- 查询列表默认分页：`page`（默认 1）`pageSize`（默认 20，最大 100）。
- 排序参数：`sort=field,(asc|desc)`，多个字段以逗号分隔。

### 2.5 响应结构（当前实现）
- 成功响应：由各接口定义自由结构。
- 失败响应（全局异常处理 `RestExceptionHandler`）：
```json
{
  "timestamp": "2025-11-12T08:00:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Not authenticated",
  "errors": {
    "field": "error message (可选)"
  }
}
```
- 后续版本计划统一为标准包装结构（见原规范 2.5），上线前将配套改造异常处理器。

### 2.6 错误码分层

| 模块 | 错误码前缀 | 示例 |
| --- | --- | --- |
| 通用 | `COMMON` | `COMMON.NOT_FOUND`, `COMMON.VALIDATION_FAILED` |
| 认证 | `AUTH` | `AUTH.INVALID_TOKEN`, `AUTH.ACCOUNT_LOCKED` |
| 课程 | `COURSE` | `COURSE.SEATS_FULL`, `COURSE.TIME_CONFLICT` |
| 作业 | `ASSIGNMENT` | `ASSIGNMENT.DEADLINE_PASSED` |
| 成绩 | `SCORE` | `SCORE.NOT_RELEASED` |
| 审批 | `AUDIT` | `AUDIT.ALREADY_PROCESSED` |

### 2.7 追踪与日志
- 后端为每次请求生成 `traceId`；调用外部服务加挂 `x-trace-id`。
- 关键操作均记录审计日志，包含操作者、时间、对象、变更前后数据摘要。

### 2.8 文件与大对象
- 所有教学资源、提交文件存储于对象存储（OSS）；API 只返回临时访问 URL（时效 10 分钟）。
- 上传策略：先获取上传凭证，再由前端直传 OSS，回调后端确认。

## 3. 核心资源与字段

| 资源 | 主键 | 关键字段 |
| --- | --- | --- |
| User | `userId` | `name`, `account`, `role`, `email`, `status`, `lastLoginAt` |
| StudentProfile | `userId` | `studentNo`, `grade`, `major`, `className` |
| TeacherProfile | `userId` | `teacherNo`, `department`, `title`, `subjects` |
| Course | `courseId` | `name`, `semester`, `credit`, `status`, `enrollLimit`, `teacherId` |
| CourseModule | `moduleId` | `courseId`, `title`, `order`, `releaseAt` |
| CourseResource | `resourceId` | `moduleId`, `type`, `name`, `fileSize`, `downloadUrl` |
| CourseSelection | `selectionId` | `courseId`, `studentId`, `status`, `selectedAt` |
| Assignment | `assignmentId` | `courseId`, `title`, `type`, `deadline`, `allowResubmit`, `gradingRubric` |
| Submission | `submissionId` | `assignmentId`, `studentId`, `status`, `score`, `submittedAt`, `attachments` |
| QuizAttempt | `attemptId` | `assignmentId`, `studentId`, `score`, `status`, `duration` |
| Score | `scoreId` | `studentId`, `courseId`, `component`, `value`, `releasedAt` |
| Notification | `notificationId` | `targetType`, `title`, `channel`, `status`, `sentAt` |
| ApprovalRequest | `requestId` | `type`, `status`, `applicantId`, `payload`, `processedBy` |
| ReportJob | `jobId` | `jobType`, `status`, `createdAt`, `completedAt`, `resultUrl` |

## 4. 接口分组说明

### 4.1 认证与会话（已实现）

#### POST `/api/auth/login`
- **角色**：全角色
- **描述**：使用标识（用户名或邮箱）+密码登录。
- **请求体（当前实现）**
```json
{
  "identifier": "alice",        // 用户名或邮箱
  "password": "********"
}
```
- **响应体（当前实现）**
```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "expiresIn": 3600000,          // 毫秒
  "refreshToken": "optional-refresh-token"
}
```
- **异常**：401（Invalid credentials）、403（Account is not active）

#### POST `/api/auth/register`
- **角色**：公开
- **描述**：用户名/邮箱/密码注册（默认角色 Student，可传 `role`）。
- **响应体**：同登录，直接返回 `accessToken`。
- **异常**：409（Username/Email already exists）

#### GET `/api/auth/me`
- **角色**：已认证
- **描述**：返回当前用户档案。
- **请求头**：`Authorization: Bearer {token}`
- **响应体（当前实现）**：
```json
{
  "id": "uuid",
  "username": "alice",
  "email": "alice@example.com",
  "role": "STUDENT",
  "status": "ACTIVE",
  "createdAt": "2025-11-12T08:00:00Z",
  "updatedAt": "2025-11-12T08:00:00Z"
}
```

#### POST `/api/auth/refresh`
- **角色**：公开
- **描述**：使用 `refreshToken` 获取新的 `accessToken`。
- **请求体**
```json
{
  "refreshToken": "string"
}
```
- **响应体**
```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "expiresIn": 3600000
}
```
- **异常**：401（Invalid/Expired refresh token）

（说明：登出如启用，将以 `/api/auth/logout` 形式提供，作废当前 access token。）

#### GET `/actuator/health`
- **角色**：公开
- **描述**：存活/健康检查，受 Spring Boot Actuator 管理。

### 4.2 用户与角色管理

#### GET `/api/v1/users/me/preferences`
- 获取个人设置（通知偏好、隐私设置、语言等）。

#### PATCH `/api/v1/users/me/preferences`
- 更新个人设置。

#### GET `/api/v1/admin/users`
- **角色**：管理员
- 支持按照角色、院系、状态搜索；分页。

#### POST `/api/v1/admin/users`
- 批量创建（支持 CSV 模板上传后返回校验结果）。

#### PUT `/api/v1/admin/users/{userId}/status`
- 启用/停用用户，记录原因。

### 4.3 课程与选课

#### GET `/api/courses`
- **角色**：学生/教师/管理员
- 支持关键词、专业、学期、课程类型、难度等筛选。
- `meta` 返回分页信息与 `facets`（分类统计）。分页参数统一为 `page` 与 `pageSize`。

#### GET `/api/courses/{courseId}`
- 课程详情、教师信息、资源统计、公告摘要。

#### POST `/api/courses`
- **角色**：教师
- 创建课程草稿，可选择复用历史课程：`copyFromCourseId`。

#### PUT `/api/courses/{courseId}`
- 更新课程信息；若字段涉及审核，状态改为 `pending_review`。

#### POST `/api/courses/{courseId}/publish`
- 提交管理员审核；管理员审核通过后课程状态改为 `published`。

#### POST `/api/courses/{courseId}/enroll`
- **角色**：学生
- 选课流程校验名额、时间冲突，返回 `selectionId`。

#### DELETE `/api/courses/{courseId}/enroll`
- 退课，若超过退课截止需管理员审批。

#### GET `/api/students/{studentId}/courses`
- 返回学生已选课程、学习进度、未完成作业数。

### 4.4 学习模块与资源

#### GET `/api/courses/{courseId}/modules`
- 按模块返回章节、资源、发布状态。

#### POST `/api/courses/{courseId}/modules`
- **角色**：教师
- 新增章节，支持批量创建。

#### POST `/api/modules/{moduleId}/resources/upload-url`
- 获取直传凭证（type：video/pdf/link）。

#### POST `/api/modules/{moduleId}/resources`
- 确认资源信息（名称、描述、转码配置、可见范围）。

#### GET `/api/resources/{resourceId}`
- 获取资源元数据及临时访问 URL。

### 4.5 作业与测验

#### GET `/api/courses/{courseId}/assignments`
- 返回作业/测验列表，附提交率、逾期率。

#### POST `/api/courses/{courseId}/assignments`
- **角色**：教师
- 创建作业或测验，关键字段：
```json
{
  "title": "函数式编程作业",
  "type": "assignment", // assignment | quiz | project
  "deadline": "2025-09-12T15:00:00+08:00",
  "allowResubmit": true,
  "maxResubmit": 3,
  "lateRule": {
    "allowLate": true,
    "deductPerDay": 5
  },
  "gradingRubric": [
    {"criterion": "正确性", "weight": 0.5},
    {"criterion": "代码规范", "weight": 0.3},
    {"criterion": "创新性", "weight": 0.2}
  ],
  "visibility": {
    "releaseAt": "2025-09-01T09:00:00+08:00",
    "visibleTo": ["class-A", "class-B"]
  }
}
```

#### GET `/api/assignments/{assignmentId}`
- 作业详情、说明文件、评分尺度。

#### PATCH `/api/assignments/{assignmentId}`
- 更新作业；若截止时间修改，需通知已发布学生。

#### POST `/api/assignments/{assignmentId}/publish`
- 发布作业并触发通知。

#### POST `/api/assignments/{assignmentId}/duplicate`
- 复制作业到其他课程或学期。

### 4.6 学生提交与批改

#### GET `/api/assignments/{assignmentId}/submissions`
- **角色**：教师
- 支持筛选状态、学生、提交时间、异常标记。

#### POST `/api/assignments/{assignmentId}/submissions`
- **角色**：学生
- 上传作业或输入文本；支持多附件、链接。

#### PUT `/api/submissions/{submissionId}`
- 学生在截止前重提或补充说明。

#### GET `/api/submissions/{submissionId}`
- 获取提交内容、回执编号、批注。

#### POST `/api/submissions/{submissionId}/grade`
- **角色**：教师
- 评分与评语，支持 Rubric 分项：
```json
{
  "score": 86,
  "rubricScores": [
    {"criterion": "正确性", "score": 45},
    {"criterion": "代码规范", "score": 26},
    {"criterion": "创新性", "score": 15}
  ],
  "feedback": "整体不错，注意异常处理。",
  "attachments": [
    {"type": "annotation", "url": "..."}
  ],
  "publish": true
}
```

#### POST `/api/submissions/{submissionId}/appeal`
- 学生发起成绩申诉；自动通知教师与管理员。

#### POST `/api/submissions/{submissionId}/ai-review`
- 调用 AI 辅助批改，生成初步反馈；教师可二次确认。

### 4.7 成绩与学习分析

#### GET `/api/students/{studentId}/scores`
- 返回成绩构成、趋势图数据、可导出链接（异步）。

#### GET `/api/courses/{courseId}/scores`
- **角色**：教师/管理员
- 支持按班级、作业、分布区间统计。

#### POST `/api/courses/{courseId}/scores/publish`
- 批量发布成绩；可设置发布时间。

#### GET `/api/courses/{courseId}/analytics/overview`
- 教学仪表盘：进度滞后名单、易错题、作业难度系数。

#### POST `/api/analytics/reminders`
- 对滞后学生批量发送提醒，可指定渠道。

### 4.8 消息、待办与 AI 助手

#### GET `/api/notifications`
- 按类型（announcement/reminder/system）筛选；返回可同步发送的渠道状态。

#### POST `/api/notifications`
- **角色**：教师/管理员
- 发布公告或提醒。支持 `sendChannels = ["inbox","email","sms"]`。

#### GET `/api/todos`
- 学生、教师待办事项列表（作业待提交、待批改、审批待处理）。

#### POST `/api/assistant/chat`
- AI 学习助手对话接口：
```json
{
  "context": {
    "courseId": "C001",
    "moduleId": "M003",
    "studentId": "U20230001"
  },
  "messages": [
    {"role": "student", "content": "帮我总结函数式编程的要点"}
  ],
  "preferences": {
    "language": "zh-CN",
    "responseStyle": "summary"
  }
}
```
- 支持 SSE 流式响应。

### 4.9 管理员审批与系统设置

#### GET `/api/admin/approvals`
- 待审批事项列表（课程发布、退课申请、成绩申诉等）。

#### POST `/api/admin/approvals/{requestId}/decision`
- 审批通过/驳回，并填写意见。

#### GET `/api/admin/metrics`
- 平台指标：用户规模、活跃数、提交成功率、访问性能。

#### GET `/api/admin/audit-logs`
- 审计日志查询，支持操作人、对象、时间范围过滤。

#### PUT `/api/admin/system/settings`
- 更新系统参数（维护窗口、密码策略、阈值告警）。

### 4.10 异步任务与报表

#### POST `/api/jobs/reports`
- 创建报表（成绩单、课程统计）。请求示例：
```json
{
  "jobType": "score_export",
  "params": {
    "courseId": "C001",
    "format": "xlsx",
    "range": {
      "from": "2025-02-01",
      "to": "2025-07-31"
    }
  },
  "notifyChannels": ["inbox","email"]
}
```

#### GET `/api/jobs/{jobId}`
- 查询任务状态：`queued|processing|succeeded|failed`；成功后返回 `resultUrl`。

#### POST `/api/jobs/{jobId}/cancel`
- 取消未完成任务。

### 4.11 系统健康与运维

#### GET `/actuator/health`
- 基础健康检查，返回应用、数据库、对象存储、消息队列状态。

#### GET `/api/health/metrics`
- 扩展指标（请求数、错误率、延迟分位数）。

#### POST `/api/admin/cache/refresh`
- 刷新缓存（课程目录、配置项等）；需要 `admin` 权限并记录审计。

## 5. 数据同步与外部集成

### 5.1 教务系统同步
- 定时任务调用 `/api/v1/integration/registrar/pull`（内部调用）同步学籍、课程基础数据。
- 支持管理员手动触发：`POST /api/v1/admin/integration/sync`。

### 5.2 统一身份认证
- SSO 回调地址：`POST /api/v1/auth/sso/callback`
- 请求体包含 `ticket`、`signature`；后端验证后创建或绑定用户。

### 5.3 通知服务
- 邮件、短信统一经 `/api/v1/integration/notifications/dispatch`；对外封装，内部调用第三方服务。

### 5.4 Python 图像服务（OSS 子系统）
- 组件位置：`oss/`（Flask 应用，默认端口 `5000`，上传目录 `./uploads`）。
- 服务职责：为前端/后台提供轻量级的图片直传与访问能力，采用文件内容 SHA-256 生成文件名，实现秒传与去重。
- **上传接口**
  - `POST https://oss.smart-learning.edu/api/v1/images/upload`
  - 请求：`multipart/form-data`，表单字段 `file`。
  - 响应：
    ```json
    {
      "success": true,
      "url": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.png"
    }
    ```
    - `url` 为文件名（含扩展名）；前端可拼接成 `https://oss.smart-learning.edu/api/v1/images/{url}` 访问。
    - 若文件已存在，会复用原文件名，保证幂等。
  - 失败示例（缺少文件）：
    ```json
    {
      "success": false,
      "error": "No file part"
    }
    ```
    - HTTP 400；如文件名为空返回 `No selected file`。
- **下载接口**
  - `GET https://oss.smart-learning.edu/api/v1/images/{filename}`
  - 成功：直接返回图片二进制内容（Content-Type 按扩展名推断）。
  - 失败：`404`
    ```json
    {
      "success": false,
      "error": "Image not found"
    }
    ```
- 部署/运行备注：
  - 需确保 `security` 层面通过网关或 Nginx 进行访问控制与限流。
  - `uploads/` 目录需挂载持久化存储，建议定期备份或接入云对象存储。
  - 可通过 `oss/test_upload.sh` 验证上传链路。

## 6. 安全与合规要点
- 所有接口强制 HTTPS，支持 TLS1.2+。
- 上传文件自动触发病毒扫描，结果回写 `Submission`。
- 高风险操作（批量删课、成绩修改）需 `X-Confirmation-Code` 双因子校验。
- 审批接口写入不可篡改日志。
- 数据访问遵循最小权限；教师仅可访问自己课程数据。

## 7. 测试与版本管理
- 每个接口提供 Postman 集合与自动化契约测试。
- 破坏性变更通过 `beta` 版本发布，旧版保留 6 个月。
- 版本进度：
  - **v1.0**：登录、课程、作业与提交、成绩、审批最小可用。
  - **v1.1**：AI 助手、异步报表、批量通知。
  - **v1.2**：扩展统计分析、细粒度权限、课程分段发布。

## 8. 附录：常见响应示例

### 8.1 分页响应
```json
{
  "traceId": "8f3d4e21",
  "success": true,
  "data": [
    {
      "courseId": "C001",
      "name": "Python 程序设计",
      "semester": "2025春",
      "status": "published",
      "tags": ["计算机", "基础"],
      "stats": {
        "enrolled": 180,
        "capacity": 200,
        "completionRate": 0.73
      }
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 134,
    "sort": "name,asc"
  },
  "error": null
}
```

### 8.4 统一响应与分页约定（社团管理子域）
- 路径前缀：`/api/v1`（例如 `/api/v1/members`、`/api/v1/activities`、`/api/v1/applications`、`/api/v1/attendance`、`/api/v1/dashboard/overview`）
- 统一响应包裹：同上（`traceId/success/data/meta/error`）
- 分页参数：`page` 与 `pageSize`（`limit` 将在一个版本周期内作为兼容别名保留）
- 错误码前缀：`CLUB.*`（如 `CLUB.MEMBER_EXISTS`, `CLUB.ACTIVITY_TIME_CONFLICT`）

### 8.2 校验失败
```json
{
  "traceId": "a0c1d2e3",
  "success": false,
  "data": null,
  "error": {
    "code": "COMMON.VALIDATION_FAILED",
    "message": "提交内容不符合要求",
    "details": [
      {"field": "attachments[0].size", "message": "文件超过最大限制 100MB"},
      {"field": "deadline", "message": "截止时间需晚于当前时间"}
    ]
  }
}
```

### 8.3 审批通过
```json
{
  "traceId": "b7e6f512",
  "success": true,
  "data": {
    "requestId": "APR-202409-0001",
    "status": "approved",
    "processedBy": "U0001",
    "processedAt": "2025-09-01T10:23:11+08:00",
    "comment": "课程资料齐全，同意上线"
  },
  "meta": null,
  "error": null
}
```

---

本文件为项目初版 API 设计，后续迭代需同步更新，并在发布前进行评审与基准测试。

