// 用户服务 - 处理用户相关的API请求和数据管理
import { mockUsers } from './mockData';

// 模拟API请求延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class UsersService {
  constructor() {
    // 初始化模拟数据
    this.users = [...mockUsers];
  }

  /**
   * 获取用户列表
   * @returns {Promise<Array>} 用户列表
   */
  async getUsers() {
    try {
      // 模拟API请求
      await delay(500);
      return this.users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw new Error('获取用户列表失败');
    }
  }

  /**
   * 获取单个用户信息
   * @param {string} userId 用户ID
   * @returns {Promise<Object>} 用户信息
   */
  async getUserById(userId) {
    try {
      // 模拟API请求
      await delay(300);
      const user = this.users.find(u => u.id === userId);
      if (!user) {
        throw new Error('用户不存在');
      }
      return user;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      throw new Error('获取用户信息失败');
    }
  }

  /**
   * 创建新用户
   * @param {Object} userData 用户数据
   * @returns {Promise<Object>} 创建的用户信息
   */
  async createUser(userData) {
    try {
      // 模拟API请求
      await delay(500);
      
      // 检查邮箱是否已存在
      const exists = this.users.some(u => u.email === userData.email);
      if (exists) {
        throw new Error('该邮箱已被注册');
      }
      
      // 生成新用户ID (实际项目中应该由后端生成)
      const newUser = {
        ...userData,
        id: Date.now().toString()
      };
      
      // 添加到用户列表
      this.users.push(newUser);
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param {string} userId 用户ID
   * @param {Object} userData 要更新的用户数据
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async updateUser(userId, userData) {
    try {
      // 模拟API请求
      await delay(400);
      
      const index = this.users.findIndex(u => u.id === userId);
      if (index === -1) {
        throw new Error('用户不存在');
      }
      
      // 更新用户信息
      this.users[index] = {
        ...this.users[index],
        ...userData
      };
      
      return this.users[index];
    } catch (error) {
      console.error(`Failed to update user ${userId}:`, error);
      throw new Error('更新用户信息失败');
    }
  }

  /**
   * 更新用户状态
   * @param {string} userId 用户ID
   * @param {string} status 新状态 ('active', 'pending', 'suspended')
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async updateUserStatus(userId, status) {
    try {
      // 模拟API请求
      await delay(300);
      
      const index = this.users.findIndex(u => u.id === userId);
      if (index === -1) {
        throw new Error('用户不存在');
      }
      
      this.users[index].status = status;
      return this.users[index];
    } catch (error) {
      console.error(`Failed to update status for user ${userId}:`, error);
      throw new Error('更新用户状态失败');
    }
  }

  /**
   * 审核通过用户
   * @param {string} userId 用户ID
   * @param {string} comment 审核意见
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async approveUser(userId, comment) {
    try {
      // 模拟API请求
      await delay(400);
      
      const index = this.users.findIndex(u => u.id === userId);
      if (index === -1) {
        throw new Error('用户不存在');
      }
      
      this.users[index].status = 'active';
      this.users[index].reviewComment = comment;
      this.users[index].reviewDate = new Date().toISOString();
      
      return this.users[index];
    } catch (error) {
      console.error(`Failed to approve user ${userId}:`, error);
      throw new Error('审核用户失败');
    }
  }

  /**
   * 驳回用户申请
   * @param {string} userId 用户ID
   * @param {string} comment 驳回原因
   * @returns {Promise<Object>} 更新后的用户信息
   */
  async rejectUser(userId, comment) {
    try {
      // 模拟API请求
      await delay(400);
      
      const index = this.users.findIndex(u => u.id === userId);
      if (index === -1) {
        throw new Error('用户不存在');
      }
      
      this.users[index].status = 'suspended';
      this.users[index].reviewComment = comment;
      this.users[index].reviewDate = new Date().toISOString();
      
      return this.users[index];
    } catch (error) {
      console.error(`Failed to reject user ${userId}:`, error);
      throw new Error('驳回用户失败');
    }
  }

  /**
   * 删除用户
   * @param {string} userId 用户ID
   * @returns {Promise<boolean>} 删除成功返回true
   */
  async deleteUser(userId) {
    try {
      // 模拟API请求
      await delay(400);
      
      const index = this.users.findIndex(u => u.id === userId);
      if (index === -1) {
        throw new Error('用户不存在');
      }
      
      // 从数组中移除用户
      this.users.splice(index, 1);
      return true;
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
      throw new Error('删除用户失败');
    }
  }

  /**
   * 搜索用户
   * @param {string} query 搜索关键词
   * @returns {Promise<Array>} 匹配的用户列表
   */
  async searchUsers(query) {
    try {
      // 模拟API请求
      await delay(300);
      
      const lowerQuery = query.toLowerCase();
      return this.users.filter(user => 
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        (user.studentId && user.studentId.toLowerCase().includes(lowerQuery)) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error(`Failed to search users with query ${query}:`, error);
      throw new Error('搜索用户失败');
    }
  }

  /**
   * 获取用户统计信息
   * @returns {Promise<Object>} 统计数据
   */
  async getUserStatistics() {
    try {
      // 模拟API请求
      await delay(400);
      
      const total = this.users.length;
      const active = this.users.filter(u => u.status === 'active').length;
      const pending = this.users.filter(u => u.status === 'pending').length;
      const suspended = this.users.filter(u => u.status === 'suspended').length;
      const students = this.users.filter(u => u.role === 'student').length;
      const teachers = this.users.filter(u => u.role === 'teacher').length;
      const admins = this.users.filter(u => u.role === 'admin').length;
      
      return {
        total,
        active,
        pending,
        suspended,
        students,
        teachers,
        admins
      };
    } catch (error) {
      console.error('Failed to get user statistics:', error);
      throw new Error('获取用户统计信息失败');
    }
  }
}

// 创建服务实例并导出
export const usersService = new UsersService();
