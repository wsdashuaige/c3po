// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟存储设置的对象
let mockSettings = {
  basicSettings: {
    platformName: '智慧学习平台',
    defaultSemester: '春季学期',
    announcement: ''
  },
  securitySettings: {
    strongPassword: true,
    twoFactorAuth: false,
    sessionTimeout: '30分钟'
  },
  notificationSettings: {
    systemNotification: true,
    courseReview: true,
    alertNotification: true
  },
  appearanceSettings: {
    themeColor: '默认（蓝）',
    borderRadius: '默认'
  }
};

/**
 * 设置管理服务类
 * 负责处理平台设置的获取和保存
 */
class SettingsService {
  /**
   * 获取所有设置
   * @returns {Promise<Object>} 包含所有设置的对象
   */
  async getAllSettings() {
    await delay(300); // 模拟网络延迟
    return {
      success: true,
      data: { ...mockSettings }
    };
  }

  /**
   * 获取基本设置
   * @returns {Promise<Object>} 基本设置对象
   */
  async getBasicSettings() {
    await delay(200);
    return {
      success: true,
      data: { ...mockSettings.basicSettings }
    };
  }

  /**
   * 保存基本设置
   * @param {Object} settings 基本设置对象
   * @returns {Promise<Object>} 操作结果
   */
  async saveBasicSettings(settings) {
    await delay(400);
    mockSettings.basicSettings = { ...settings };
    return {
      success: true,
      message: '基本设置保存成功',
      data: { ...mockSettings.basicSettings }
    };
  }

  /**
   * 获取安全设置
   * @returns {Promise<Object>} 安全设置对象
   */
  async getSecuritySettings() {
    await delay(200);
    return {
      success: true,
      data: { ...mockSettings.securitySettings }
    };
  }

  /**
   * 保存安全设置
   * @param {Object} settings 安全设置对象
   * @returns {Promise<Object>} 操作结果
   */
  async saveSecuritySettings(settings) {
    await delay(400);
    mockSettings.securitySettings = { ...settings };
    return {
      success: true,
      message: '安全设置保存成功',
      data: { ...mockSettings.securitySettings }
    };
  }

  /**
   * 获取通知设置
   * @returns {Promise<Object>} 通知设置对象
   */
  async getNotificationSettings() {
    await delay(200);
    return {
      success: true,
      data: { ...mockSettings.notificationSettings }
    };
  }

  /**
   * 保存通知设置
   * @param {Object} settings 通知设置对象
   * @returns {Promise<Object>} 操作结果
   */
  async saveNotificationSettings(settings) {
    await delay(400);
    mockSettings.notificationSettings = { ...settings };
    return {
      success: true,
      message: '通知设置保存成功',
      data: { ...mockSettings.notificationSettings }
    };
  }

  /**
   * 获取外观设置
   * @returns {Promise<Object>} 外观设置对象
   */
  async getAppearanceSettings() {
    await delay(200);
    return {
      success: true,
      data: { ...mockSettings.appearanceSettings }
    };
  }

  /**
   * 保存外观设置
   * @param {Object} settings 外观设置对象
   * @returns {Promise<Object>} 操作结果
   */
  async saveAppearanceSettings(settings) {
    await delay(400);
    mockSettings.appearanceSettings = { ...settings };
    return {
      success: true,
      message: '外观设置保存成功',
      data: { ...mockSettings.appearanceSettings }
    };
  }

  /**
   * 重置所有设置到默认值
   * @returns {Promise<Object>} 操作结果
   */
  async resetAllSettings() {
    await delay(500);
    mockSettings = {
      basicSettings: {
        platformName: '智慧学习平台',
        defaultSemester: '春季学期',
        announcement: ''
      },
      securitySettings: {
        strongPassword: true,
        twoFactorAuth: false,
        sessionTimeout: '30分钟'
      },
      notificationSettings: {
        systemNotification: true,
        courseReview: true,
        alertNotification: true
      },
      appearanceSettings: {
        themeColor: '默认（蓝）',
        borderRadius: '默认'
      }
    };
    return {
      success: true,
      message: '所有设置已重置到默认值',
      data: { ...mockSettings }
    };
  }

  /**
   * 导出设置配置
   * @returns {Promise<Object>} 导出结果
   */
  async exportSettings() {
    await delay(300);
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      settings: { ...mockSettings }
    };
    return {
      success: true,
      message: '设置导出成功',
      data: JSON.stringify(exportData, null, 2)
    };
  }

  /**
   * 导入设置配置
   * @param {string} jsonData JSON格式的设置数据
   * @returns {Promise<Object>} 导入结果
   */
  async importSettings(jsonData) {
    await delay(600);
    try {
      const importedData = JSON.parse(jsonData);
      if (importedData.settings) {
        mockSettings = { ...importedData.settings };
        return {
          success: true,
          message: '设置导入成功',
          data: { ...mockSettings }
        };
      } else {
        throw new Error('无效的设置数据格式');
      }
    } catch (error) {
      return {
        success: false,
        message: `导入失败: ${error.message}`,
        error: error.message
      };
    }
  }
}

export default new SettingsService();