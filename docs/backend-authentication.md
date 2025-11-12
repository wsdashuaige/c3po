# C3PO 后端认证系统

本文档概述了基于 Spring Security 与 JWT 的后端认证实现，并给出了主要接口的使用方式。

## 架构概览

- **安全框架**：Spring Security `SecurityFilterChain` 配合 `DaoAuthenticationProvider` 和自定义 `UserDetailsService`。
- **凭证颁发**：`JwtService` 使用对称密钥生产 Bearer Token，默认有效期为 1 小时（`security.jwt.expiration-ms`）。
- **持久化**：`UserAccount` 实体通过 JPA 持久化，包含角色（学生/教师/管理员）与状态（正常/锁定/禁用）。
- **请求拦截**：`JwtAuthenticationFilter` 在每次请求前验证 Authorization 头，验证通过后写入 `SecurityContext`。

## 默认账号

应用启动时会自动创建默认管理员：

- 用户名：`admin`
- 密码：`Admin123!`

> 建议在生产环境立即修改该默认密码或改用更安全的初始化方案。

## REST 接口

所有接口均以 `/api/auth` 为前缀，默认返回 JSON。

### 1. 用户注册

- **方法**：`POST /api/auth/register`
- **请求体**：

```json
{
  "username": "student01",
  "email": "student01@example.edu",
  "password": "StrongPass!123",
  "role": "STUDENT"
}
```

- **响应**：返回 `accessToken`、`tokenType`（固定为 `Bearer`）与 `expiresIn`（毫秒）。
- **校验规则**：用户名 3-64 个字符；密码 >= 8 个字符；邮箱格式校验；用户名/邮箱需唯一。

### 2. 用户登录

- **方法**：`POST /api/auth/login`
- **请求体**：

```json
{
  "identifier": "student01",
  "password": "StrongPass!123"
}
```

`identifier` 支持用户名或邮箱。

- **响应**：结构与注册成功一致，返回最新的 JWT。
- **错误码**：
  - `401`：账号不存在或密码错误；
  - `403`：账号被禁用/锁定。

### 3. 获取当前用户信息

- **方法**：`GET /api/auth/me`
- **请求头**：`Authorization: Bearer <JWT>`
- **响应示例**：

```json
{
  "id": "uuid",
  "username": "student01",
  "email": "student01@example.edu",
  "role": "STUDENT",
  "status": "ACTIVE",
  "createdAt": "2025-11-12T09:25:00Z",
  "updatedAt": "2025-11-12T09:25:00Z"
}
```

- **未登录**：返回 `401`。

## 配置要点

- 修改 `security.jwt.secret`，确保长度 ≥ 32 字符，且在生产环境使用安全的外部配置。
- 默认 profile 使用内存 H2 数据库；`local` profile 连接本地 PostgreSQL（配置于 `application-local.properties`）。
- 如需禁用默认管理员初始化，可移除或重写 `DefaultAdminInitializer` Bean。

## 测试 & 校验

- `./gradlew test`：验证上下文加载与单元测试；
- `SecurityConfig` 的 `JwtAuthenticationFilter` 已在全局 filter 链中注册；可使用 API 客户端验证 401 → 登录 → 携带 JWT → 成功访问的完整流程。


