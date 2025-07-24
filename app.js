// app.js
App({
  // 全局数据
  globalData: {
    // 用户信息
    userInfo: null,
    // 登录状态
    isLoggedIn: false,
    // 搜索相关
    searchKeyword: '',
    searchResults: [],
    selectedCategory: null,
    // 网络请求相关
    baseURL: 'http://localhost:3000', // 本地开发服务器地址
    // 版本信息
    version: '1.0.0',
    // 配置信息
    config: {
      // 默认设置
      defaultSettings: {
        borrowReminder: true,
        returnReminder: true,
        newBookRecommend: true,
        systemNotification: true
      },
      // 隐私设置
      privacySettings: {
        publicBorrowRecord: true,
        hidePersonalInfo: false,
        limitBookVisibility: false
      }
    }
  },

  onLaunch() {
    // 小程序启动时执行
    console.log('小程序启动');
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 初始化配置
    this.initConfig();
  },

  onShow() {
    // 小程序显示时执行
    console.log('小程序显示');
  },

  onHide() {
    // 小程序隐藏时执行
    console.log('小程序隐藏');
  },

  onError(msg) {
    // 小程序错误时执行
    console.error('小程序错误:', msg);
  },

  // 检查登录状态
  checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo');
      
      if (token && userInfo) {
        this.globalData.isLoggedIn = true;
        this.globalData.userInfo = userInfo;
        console.log('用户已登录:', userInfo.nickName);
      } else {
        this.globalData.isLoggedIn = false;
        this.globalData.userInfo = null;
        console.log('用户未登录');
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
    }
  },

  // 初始化配置
  initConfig() {
    try {
      // 从本地存储读取配置
      const settings = wx.getStorageSync('settings');
      const privacy = wx.getStorageSync('privacy');
      
      if (settings) {
        this.globalData.config.defaultSettings = {
          ...this.globalData.config.defaultSettings,
          ...settings
        };
      }
      
      if (privacy) {
        this.globalData.config.privacySettings = {
          ...this.globalData.config.privacySettings,
          ...privacy
        };
      }
      
      console.log('配置初始化完成');
    } catch (error) {
      console.error('初始化配置失败:', error);
    }
  },

  // 保存配置
  saveConfig(type, config) {
    try {
      if (type === 'settings') {
        this.globalData.config.defaultSettings = {
          ...this.globalData.config.defaultSettings,
          ...config
        };
        wx.setStorageSync('settings', this.globalData.config.defaultSettings);
      } else if (type === 'privacy') {
        this.globalData.config.privacySettings = {
          ...this.globalData.config.privacySettings,
          ...config
        };
        wx.setStorageSync('privacy', this.globalData.config.privacySettings);
      }
      
      console.log('配置保存成功:', type);
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  },

  // 获取配置
  getConfig(type) {
    if (type === 'settings') {
      return this.globalData.config.defaultSettings;
    } else if (type === 'privacy') {
      return this.globalData.config.privacySettings;
    }
    return null;
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    
    try {
      wx.setStorageSync('userInfo', userInfo);
      console.log('用户信息已保存');
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  },

  // 清除用户信息
  clearUserInfo() {
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    
    try {
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('token');
      console.log('用户信息已清除');
    } catch (error) {
      console.error('清除用户信息失败:', error);
    }
  },

  // 获取用户信息
  getUserInfo() {
    return this.globalData.userInfo;
  },

  // 检查是否登录
  isUserLoggedIn() {
    return this.globalData.isLoggedIn;
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading();
  },

  // 显示成功提示
  showSuccess(title, duration = 1500) {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: duration
    });
  },

  // 显示错误提示
  showError(title, duration = 1500) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: duration
    });
  },

  // 显示确认对话框
  showConfirm(title, content, callback) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: callback
    });
  },

  // 显示操作菜单
  showActionSheet(itemList, callback) {
    wx.showActionSheet({
      itemList: itemList,
      success: callback
    });
  },

  // 网络请求封装
  request(options) {
    return new Promise((resolve, reject) => {
      // 添加token到请求头
      const token = wx.getStorageSync('token');
      if (token) {
        options.header = {
          ...options.header,
          'Authorization': `Bearer ${token}`
        };
      }

      wx.request({
        ...options,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },

  // 获取系统信息
  getSystemInfo() {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success: resolve,
        fail: reject
      });
    });
  },

  // 获取网络状态
  getNetworkType() {
    return new Promise((resolve, reject) => {
      wx.getNetworkType({
        success: resolve,
        fail: reject
      });
    });
  },

  // 检查网络状态
  async checkNetworkStatus() {
    try {
      const networkInfo = await this.getNetworkType();
      if (networkInfo.networkType === 'none') {
        this.showError('网络连接失败，请检查网络设置');
        return false;
      }
      return true;
    } catch (error) {
      console.error('检查网络状态失败:', error);
      return false;
    }
  },

  // 页面跳转
  navigateTo(url, params = {}) {
    const query = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const fullUrl = query ? `${url}?${query}` : url;
    
    wx.navigateTo({
      url: fullUrl
    });
  },

  // 页面重定向
  redirectTo(url, params = {}) {
    const query = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const fullUrl = query ? `${url}?${query}` : url;
    
    wx.redirectTo({
      url: fullUrl
    });
  },

  // 切换标签页
  switchTab(url) {
    wx.switchTab({
      url: url
    });
  },

  // 返回上一页
  navigateBack(delta = 1) {
    wx.navigateBack({
      delta: delta
    });
  },

  // 重新启动到首页
  reLaunchToHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
})
