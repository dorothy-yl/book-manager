// utils/request.js
/**
 * 网络请求工具类
 * 统一处理微信小程序的网络请求
 */

// 基础配置
const config = {
  // 开发环境API地址
  baseURL: 'http://localhost:3000', // 本地开发服务器地址
  // 请求超时时间
  timeout: 10000,
  // 请求头
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * 请求拦截器
 * @param {Object} options 请求配置
 */
function requestInterceptor(options) {
  // 添加token到请求头
  const token = wx.getStorageSync('token');
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // 添加时间戳防止缓存
  if (options.url.indexOf('?') > -1) {
    options.url += `&_t=${Date.now()}`;
  } else {
    options.url += `?_t=${Date.now()}`;
  }
  
  return options;
}

/**
 * 响应拦截器
 * @param {Object} response 响应数据
 */
function responseInterceptor(response) {
  const { statusCode, data } = response;
  
  console.log('响应拦截器:', statusCode, data);
  
  // HTTP状态码处理
  if (statusCode >= 200 && statusCode < 300) {
    // 如果响应数据是字符串，尝试解析为JSON
    let responseData = data;
    if (typeof data === 'string') {
      try {
        responseData = JSON.parse(data);
      } catch (e) {
        console.warn('响应数据不是有效的JSON:', data);
        return { code: 0, message: 'success', data: data };
      }
    }
    
    // 业务状态码处理
    if (responseData.code === 0 || responseData.code === 200 || !responseData.hasOwnProperty('code')) {
      return responseData;
    } else {
      // 业务错误处理
      handleBusinessError(responseData);
      return Promise.reject(responseData);
    }
  } else {
    // HTTP错误处理
    handleHttpError(statusCode, data);
    return Promise.reject(response);
  }
}

/**
 * 处理业务错误
 * @param {Object} data 错误数据
 */
function handleBusinessError(data) {
  const message = data.message || '请求失败';
  
  // 特殊错误码处理
  switch (data.code) {
    case 401:
      // 未授权，跳转登录
      wx.showModal({
        title: '提示',
        content: '登录已过期，请重新登录',
        showCancel: false,
        success: () => {
          // 清除本地存储
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          // 跳转到登录页或首页
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      });
      break;
    case 403:
      wx.showToast({
        title: '权限不足',
        icon: 'none'
      });
      break;
    default:
      wx.showToast({
        title: message,
        icon: 'none'
      });
  }
}

/**
 * 处理HTTP错误
 * @param {Number} statusCode HTTP状态码
 * @param {Object} data 错误数据
 */
function handleHttpError(statusCode, data) {
  let message = '网络请求失败';
  
  switch (statusCode) {
    case 400:
      message = '请求参数错误';
      break;
    case 401:
      message = '未授权访问';
      break;
    case 403:
      message = '禁止访问';
      break;
    case 404:
      message = '请求的资源不存在';
      break;
    case 500:
      message = '服务器内部错误';
      break;
    case 502:
      message = '网关错误';
      break;
    case 503:
      message = '服务不可用';
      break;
    default:
      message = `请求失败 (${statusCode})`;
  }
  
  wx.showToast({
    title: message,
    icon: 'none'
  });
}

/**
 * 统一请求方法
 * @param {Object} options 请求配置
 * @returns {Promise} 请求Promise
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 构建完整的URL
    let fullUrl = options.url;
    if (!fullUrl.startsWith('http')) {
      fullUrl = config.baseURL + fullUrl;
    }
    
    // 合并配置
    const requestOptions = {
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        ...config.headers,
        ...options.header
      },
      timeout: options.timeout || config.timeout,
      success: (res) => {
        console.log('请求成功:', fullUrl, res);
        try {
          const result = responseInterceptor(res);
          resolve(result);
        } catch (error) {
          console.error('响应处理失败:', error);
          reject(error);
        }
      },
      fail: (error) => {
        console.error('请求失败:', fullUrl, error);
        
        // 网络错误处理
        if (error.errMsg.includes('timeout')) {
          wx.showToast({
            title: '请求超时',
            icon: 'none'
          });
        } else if (error.errMsg.includes('fail')) {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: '请求失败',
            icon: 'none'
          });
        }
        
        reject(error);
      }
    };
    
    // 请求拦截
    const interceptedOptions = requestInterceptor(requestOptions);
    
    console.log('发起请求:', interceptedOptions.url, interceptedOptions);
    
    // 发起请求
    wx.request(interceptedOptions);
  });
}

/**
 * GET请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置
 */
function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
}

/**
 * POST请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

/**
 * 上传文件
 * @param {String} url 上传地址
 * @param {String} filePath 文件路径
 * @param {String} name 文件对应的key
 * @param {Object} formData 额外的表单数据
 * @param {Object} options 其他配置
 */
function uploadFile(url, filePath, name = 'file', formData = {}, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      url: url.startsWith('http') ? url : config.baseURL + url,
      filePath,
      name,
      formData,
      header: {
        ...config.headers,
        ...options.header
      },
      success: (res) => {
        try {
          const result = responseInterceptor(res);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        console.error('上传失败:', error);
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        reject(error);
      }
    };
    
    wx.uploadFile(uploadOptions);
  });
}

/**
 * 下载文件
 * @param {String} url 下载地址
 * @param {Object} options 其他配置
 */
function downloadFile(url, options = {}) {
  return new Promise((resolve, reject) => {
    const downloadOptions = {
      url: url.startsWith('http') ? url : config.baseURL + url,
      header: {
        ...config.headers,
        ...options.header
      },
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        console.error('下载失败:', error);
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
        reject(error);
      }
    };
    
    wx.downloadFile(downloadOptions);
  });
}

// 导出方法
module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  uploadFile,
  downloadFile,
  config
}; 