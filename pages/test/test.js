// pages/test/test.js
const { bookAPI, userAPI, statsAPI } = require('../../utils/api.js');

Page({
  data: {
    testResults: [],
    loading: false
  },

  onLoad() {
    this.runTests();
  },

  // 运行所有测试
  async runTests() {
    this.setData({ 
      testResults: [],
      loading: true 
    });

    console.log('开始运行网络请求测试...');

    const tests = [
      { name: '测试基础网络连接', fn: this.testBasicConnection },
      { name: '测试获取图书列表', fn: this.testGetBooks },
      { name: '测试搜索图书', fn: this.testSearchBooks },
      { name: '测试获取统计信息', fn: this.testGetStats },
      { name: '测试获取分类列表', fn: this.testGetCategories },
      { name: '测试获取通知列表', fn: this.testGetNotifications },
      { name: '测试获取用户信息', fn: this.testGetUserInfo },
      { name: '测试添加图书', fn: this.testAddBook },
      { name: '测试借阅图书', fn: this.testBorrowBook },
      { name: '测试收藏图书', fn: this.testFavoriteBook }
    ];

    for (const test of tests) {
      try {
        console.log(`开始测试: ${test.name}`);
        await test.fn.call(this);
        console.log(`测试成功: ${test.name}`);
        this.addTestResult(test.name, '成功', 'green');
      } catch (error) {
        console.error(`测试失败: ${test.name}`, error);
        this.addTestResult(test.name, `失败: ${error.message}`, 'red');
      }
    }

    console.log('所有测试完成');
    this.setData({ loading: false });
  },

  // 添加测试结果
  addTestResult(name, result, color) {
    const testResults = [...this.data.testResults];
    testResults.push({
      name,
      result,
      color,
      time: new Date().toLocaleTimeString()
    });
    this.setData({ testResults });
  },

  // 测试基础网络连接
  async testBasicConnection() {
    console.log('测试基础网络连接...');
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:3000/api/health',
        method: 'GET',
        timeout: 5000,
        success: resolve,
        fail: reject
      });
    });
    
    console.log('基础连接测试响应:', response);
    
    if (response.statusCode !== 200) {
      throw new Error(`HTTP状态码: ${response.statusCode}`);
    }
  },

  // 测试获取图书列表
  async testGetBooks() {
    console.log('测试获取图书列表...');
    
    const response = await bookAPI.getBookList({ limit: 5 });
    
    console.log('获取图书列表响应:', response);
    
    if (!response || response.code !== 0) {
      throw new Error(response?.message || '获取图书列表失败');
    }
  },

  // 测试搜索图书
  async testSearchBooks() {
    const response = await bookAPI.searchBooks('JavaScript');
    
    if (!response || response.code !== 0) {
      throw new Error(response?.message || '搜索图书失败');
    }
  },

  // 测试获取统计信息
  async testGetStats() {
    const response = await statsAPI.getHomeStats();
    
    if (!response || response.code !== 0) {
      throw new Error(response?.message || '获取统计信息失败');
    }
  },

  // 测试获取用户信息
  async testGetUserInfo() {
    try {
      const response = await userAPI.getUserInfo();
      
      if (!response || response.code !== 0) {
        throw new Error(response?.message || '获取用户信息失败');
      }
    } catch (error) {
      // 如果用户未登录，这是正常的
      if (error.code === 401) {
        return; // 测试通过
      }
      throw error;
    }
  },

  // 测试添加图书
  async testAddBook() {
    const bookData = {
      title: '测试图书',
      author: '测试作者',
      category: '测试分类',
      price: 0,
      status: 'available'
    };

    try {
      const response = await bookAPI.addBook(bookData);
      
      if (!response || response.code !== 0) {
        throw new Error(response?.message || '添加图书失败');
      }
    } catch (error) {
      // 如果权限不足，这是正常的
      if (error.code === 401 || error.code === 403) {
        return; // 测试通过
      }
      throw error;
    }
  },

  // 测试借阅图书
  async testBorrowBook() {
    try {
      const response = await bookAPI.borrowBook(1);
      
      if (!response || response.code !== 0) {
        throw new Error(response?.message || '借阅图书失败');
      }
    } catch (error) {
      // 如果权限不足或图书不存在，这是正常的
      if (error.code === 401 || error.code === 403 || error.code === 404) {
        return; // 测试通过
      }
      throw error;
    }
  },

  // 测试收藏图书
  async testFavoriteBook() {
    try {
      const response = await bookAPI.favoriteBook(1);
      
      if (!response || response.code !== 0) {
        throw new Error(response?.message || '收藏图书失败');
      }
    } catch (error) {
      // 如果权限不足或图书不存在，这是正常的
      if (error.code === 401 || error.code === 403 || error.code === 404) {
        return; // 测试通过
      }
      throw error;
    }
  },

  // 重新运行测试
  onRetry() {
    this.runTests();
  },

  // 查看详细日志
  onViewLogs() {
    wx.showModal({
      title: '网络请求日志',
      content: '请在开发者工具的控制台中查看详细的网络请求日志',
      showCancel: false
    });
  },

  // 测试单个接口
  async testSingleAPI() {
    wx.showActionSheet({
      itemList: [
        '测试基础连接',
        '测试获取图书列表',
        '测试搜索图书',
        '测试获取统计信息',
        '测试获取用户信息'
      ],
      success: async (res) => {
        const tests = [
          this.testBasicConnection,
          this.testGetBooks,
          this.testSearchBooks,
          this.testGetStats,
          this.testGetUserInfo
        ];
        
        const testNames = [
          '基础连接',
          '获取图书列表',
          '搜索图书',
          '获取统计信息',
          '获取用户信息'
        ];

        try {
          wx.showLoading({ title: '测试中...' });
          await tests[res.tapIndex].call(this);
          wx.hideLoading();
          wx.showToast({
            title: `${testNames[res.tapIndex]}测试成功`,
            icon: 'success'
          });
        } catch (error) {
          wx.hideLoading();
          wx.showModal({
            title: '测试失败',
            content: error.message,
            showCancel: false
          });
        }
      }
    });
  }
}); 