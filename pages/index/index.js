// index.js
const { statsAPI, bookAPI, scanAPI } = require('../../utils/api.js');

Page({
  data: {
    // 页面数据
    searchKeyword: '',
    totalBooks: 0,
    activeExchanges: 0,
    activeUsers: 0,
    newBooks: [],
    categories: [],
    loading: false
  },

  onLoad: function() {
    // 页面加载时执行
    this.loadPageData();
  },

  onShow: function() {
    // 页面显示时执行
    this.updateNotificationCount();
  },

  // 加载页面数据
  async loadPageData() {
    this.setData({ loading: true });
    
    try {
      // 显示加载提示
      wx.showLoading({
        title: '加载中...',
      });

      console.log('开始加载页面数据...');

      // 并行请求多个接口
      const [homeStats, newBooks, categories] = await Promise.all([
        statsAPI.getHomeStats().catch(err => {
          console.warn('获取首页统计失败:', err);
          return { code: 0, data: { totalBooks: 0, activeExchanges: 0, activeUsers: 0 } };
        }),
        bookAPI.getBookList({ limit: 6, sort: 'created_at' }).catch(err => {
          console.warn('获取新书列表失败:', err);
          return { code: 0, data: { list: [] } };
        }),
        bookAPI.getCategories().catch(err => {
          console.warn('获取分类列表失败:', err);
          return { code: 0, data: [] };
        })
      ]);

      console.log('页面数据加载完成:', { homeStats, newBooks, categories });

      // 更新页面数据
      this.setData({
        totalBooks: homeStats.data?.totalBooks || 0,
        activeExchanges: homeStats.data?.activeExchanges || 0,
        activeUsers: homeStats.data?.activeUsers || 0,
        newBooks: newBooks.data?.list || [],
        categories: categories.data || []
      });

    } catch (error) {
      console.error('加载页面数据失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  // 更新通知数量
  async updateNotificationCount() {
    try {
      const response = await wx.request({
        url: 'http://localhost:3000/api/notifications/unread-count',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        }
      });
      
      if (response.statusCode === 200 && response.data.code === 0) {
        this.setData({
          notificationCount: response.data.data.count || 0
        });
      }
    } catch (error) {
      console.error('获取通知数量失败:', error);
    }
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 执行搜索
  async onSearch() {
    const keyword = this.data.searchKeyword.trim();
    
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({
        title: '搜索中...',
      });

      const response = await bookAPI.searchBooks(keyword);
      
      // 跳转到图书页面并传递搜索结果
      wx.switchTab({
        url: '/pages/books/books',
        success: () => {
          // 通过全局数据传递搜索结果
          getApp().globalData = getApp().globalData || {};
          getApp().globalData.searchResults = response.data.list;
          getApp().globalData.searchKeyword = keyword;
        }
      });

    } catch (error) {
      console.error('搜索失败:', error);
      wx.showToast({
        title: '搜索失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 显示通知
  async showNotifications() {
    try {
      const response = await wx.request({
        url: 'http://localhost:3000/api/notifications',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        }
      });

      if (response.statusCode === 200 && response.data.code === 0) {
        const notifications = response.data.data.list || [];
        const itemList = notifications.map(item => item.title);
        
        if (itemList.length === 0) {
          wx.showToast({
            title: '暂无通知',
            icon: 'none'
          });
          return;
        }

        wx.showActionSheet({
          itemList: itemList,
          success: (res) => {
            const selectedNotification = notifications[res.tapIndex];
            wx.showModal({
              title: selectedNotification.title,
              content: selectedNotification.content,
              showCancel: false
            });
          }
        });
      }
    } catch (error) {
      console.error('获取通知失败:', error);
      wx.showToast({
        title: '获取通知失败',
        icon: 'none'
      });
    }
  },

  // 显示设置
  showSettings: function() {
    wx.showActionSheet({
      itemList: ['个人设置', '隐私设置', '通知设置', '关于我们'],
      success: (res) => {
        wx.showToast({
          title: '设置功能',
          icon: 'none'
        });
      }
    });
  },

  // 扫描图书功能
  async scanBook() {
    wx.showModal({
      title: '扫描图书',
      content: '是否使用相机扫描图书条形码？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const scanResult = await new Promise((resolve, reject) => {
              wx.scanCode({
                success: resolve,
                fail: reject
              });
            });

            wx.showLoading({
              title: '处理中...',
            });

            // 调用扫码API
            const response = await scanAPI.scanAddBook(scanResult.result);
            
            wx.hideLoading();
            wx.showToast({
              title: '扫描成功',
              icon: 'success'
            });

            // 刷新页面数据
            this.loadPageData();

          } catch (error) {
            wx.hideLoading();
            console.error('扫描失败:', error);
            wx.showToast({
              title: '扫描失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 添加图书
  addBook: function() {
    wx.showModal({
      title: '添加图书',
      content: '选择添加图书的方式',
      showCancel: true,
      cancelText: '手动添加',
      confirmText: '扫码添加',
      success: (res) => {
        if (res.confirm) {
          this.scanBook();
        } else {
          wx.showToast({
            title: '手动添加功能',
            icon: 'none'
          });
        }
      }
    });
  },

  // 浏览书架
  browseBooks: function() {
    wx.switchTab({
      url: '/pages/books/books'
    });
  },

  // 我的图书
  myBooks: function() {
    wx.switchTab({
      url: '/pages/my/my'
    });
  },

  // 查看更多图书
  viewMoreBooks: function() {
    wx.switchTab({
      url: '/pages/books/books'
    });
  },

  // 查看图书详情
  async viewBookDetail(e) {
    const bookId = e.currentTarget.dataset.id;
    
    try {
      wx.showLoading({
        title: '加载中...',
      });

      const response = await bookAPI.getBookDetail(bookId);
      
      wx.hideLoading();
      
      // 显示图书详情
      const book = response.data;
      wx.showModal({
        title: book.title,
        content: `作者：${book.author}\n分类：${book.category}\n状态：${book.status}\n简介：${book.description || '暂无简介'}`,
        showCancel: true,
        cancelText: '关闭',
        confirmText: '借阅',
        success: (res) => {
          if (res.confirm) {
            this.borrowBook(bookId);
          }
        }
      });

    } catch (error) {
      wx.hideLoading();
      console.error('获取图书详情失败:', error);
      wx.showToast({
        title: '获取详情失败',
        icon: 'none'
      });
    }
  },

  // 借阅图书
  async borrowBook(bookId) {
    try {
      wx.showLoading({
        title: '借阅中...',
      });

      await bookAPI.borrowBook(bookId);
      
      wx.hideLoading();
      wx.showToast({
        title: '借阅成功',
        icon: 'success'
      });

      // 刷新页面数据
      this.loadPageData();

    } catch (error) {
      wx.hideLoading();
      console.error('借阅失败:', error);
      wx.showToast({
        title: '借阅失败',
        icon: 'none'
      });
    }
  },

  // 查看分类
  async viewCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      wx.showToast({
        title: '分类不存在',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: category.name,
      content: `该分类共有 ${category.count} 本图书`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '查看图书',
      success: (res) => {
        if (res.confirm) {
          // 跳转到图书页面并传递分类ID
          wx.switchTab({
            url: '/pages/books/books',
            success: () => {
              getApp().globalData = getApp().globalData || {};
              getApp().globalData.selectedCategory = categoryId;
            }
          });
        }
      }
    });
  },

  // 下拉刷新
  async onPullDownRefresh() {
    try {
      await this.loadPageData();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '刷新失败',
        icon: 'none'
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  }
})
