/**
 * 错误处理服务
 * 统一处理API请求中的错误，确保错误响应格式统一
 */

// 定义错误类型
const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// 错误类型映射
const STATUS_CODE_TO_ERROR_TYPE = {
  400: ERROR_TYPES.VALIDATION_ERROR,
  401: ERROR_TYPES.UNAUTHORIZED,
  403: ERROR_TYPES.FORBIDDEN,
  404: ERROR_TYPES.NOT_FOUND,
  405: ERROR_TYPES.SERVER_ERROR, // 方法不允许
  422: ERROR_TYPES.VALIDATION_ERROR,
  500: ERROR_TYPES.SERVER_ERROR,
  501: ERROR_TYPES.SERVER_ERROR,
  502: ERROR_TYPES.SERVER_ERROR,
  503: ERROR_TYPES.SERVER_ERROR,
  504: ERROR_TYPES.TIMEOUT_ERROR
}

/**
 * 创建标准化的错误对象
 * @param {Object} error - 原始错误对象
 * @param {string} customMessage - 自定义错误消息
 * @returns {Object} 标准化的错误对象
 */
export const createStandardError = (error, customMessage = '') => {
  let errorType = ERROR_TYPES.UNKNOWN_ERROR
  let statusCode = null
  let message = '发生未知错误，请稍后重试'
  let errors = null

  // 处理网络错误
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      errorType = ERROR_TYPES.TIMEOUT_ERROR
      message = '请求超时，请稍后重试'
    } else {
      errorType = ERROR_TYPES.NETWORK_ERROR
      message = '网络连接失败，请检查网络设置'
    }
    return {
      errorType,
      message: customMessage || message,
      originalError: error
    }
  }

  // 处理HTTP错误
  const { response } = error
  statusCode = response.status
  errorType = STATUS_CODE_TO_ERROR_TYPE[statusCode] || ERROR_TYPES.SERVER_ERROR

  // 获取错误消息
  if (response.data && response.data.error) {
    if (typeof response.data.error === 'string') {
      message = response.data.error
    } else if (typeof response.data.error === 'object') {
      message = response.data.error.message || '请求失败'
      errors = response.data.error.errors || null
    }
  } else if (response.statusText) {
    message = response.statusText
  }

  // 处理特定错误类型
  switch (errorType) {
    case ERROR_TYPES.UNAUTHORIZED:
      message = customMessage || '登录已过期，请重新登录'
      break
    case ERROR_TYPES.FORBIDDEN:
      message = customMessage || '您没有权限执行此操作'
      break
    case ERROR_TYPES.NOT_FOUND:
      message = customMessage || '请求的资源不存在'
      break
    case ERROR_TYPES.VALIDATION_ERROR:
      message = customMessage || '请求参数验证失败'
      break
    case ERROR_TYPES.SERVER_ERROR:
      message = customMessage || '服务器内部错误，请稍后重试'
      break
    default:
      message = customMessage || message
  }

  return {
    errorType,
    statusCode,
    message,
    errors,
    originalError: error
  }
}

/**
 * 处理API请求错误
 * @param {Object} error - 原始错误对象
 * @param {string} operationName - 操作名称（用于日志和错误消息）
 * @returns {Promise} 拒绝的Promise，包含标准化的错误对象
 */
export const handleApiError = (error, operationName = '操作') => {
  const standardError = createStandardError(error)
  
  // 记录错误日志
  console.error(`${operationName}失败:`, standardError)
  
  // 返回标准化的错误
  return Promise.reject(standardError)
}

/**
 * 获取友好的错误消息
 * @param {Object} error - 标准化的错误对象
 * @returns {string} 友好的错误消息
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) {
    return '发生未知错误'
  }

  // 如果是标准化的错误对象
  if (error.errorType) {
    return error.message
  }

  // 如果是原始的Axios错误
  return createStandardError(error).message
}

/**
 * 检查是否是特定类型的错误
 * @param {Object} error - 错误对象
 * @param {string} errorType - 错误类型
 * @returns {boolean} 是否是特定类型的错误
 */
export const isErrorType = (error, errorType) => {
  if (!error) return false
  return error.errorType === errorType
}

/**
 * 检查是否是网络错误
 * @param {Object} error - 错误对象
 * @returns {boolean} 是否是网络错误
 */
export const isNetworkError = (error) => {
  return isErrorType(error, ERROR_TYPES.NETWORK_ERROR)
}

/**
 * 检查是否是授权错误
 * @param {Object} error - 错误对象
 * @returns {boolean} 是否是授权错误
 */
export const isUnauthorizedError = (error) => {
  return isErrorType(error, ERROR_TYPES.UNAUTHORIZED)
}

/**
 * 检查是否是验证错误
 * @param {Object} error - 错误对象
 * @returns {boolean} 是否是验证错误
 */
export const isValidationError = (error) => {
  return isErrorType(error, ERROR_TYPES.VALIDATION_ERROR)
}

export default {
  createStandardError,
  handleApiError,
  getFriendlyErrorMessage,
  isErrorType,
  isNetworkError,
  isUnauthorizedError,
  isValidationError,
  ERROR_TYPES
}