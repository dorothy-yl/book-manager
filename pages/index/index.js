// index.js
Page({
  data: {
    // 页面数据,
    searchKeyword: '99+',
    totalBooks: 1256,
    activeExchanges: 89,
    activeUsers: 342,
    newBooks: [
      {
        id: 1,
        title: 'JavaScript权威指南',
        author: 'David Flanagan',
        cover: '/images/js-guide.jpg',
        status: 'available'
      },
      {
        id: 2,
        title: '了不起的Node.js',
        author: '朴灵',
        cover: '/images/JA.jpg',
        status: 'borrowed'
      },
      {
        id: 3,
        title: '深入理解计算机系统',
        author: 'Randal E. Bryant',
        cover: '/images/CS.jpg',
        status: 'available'
      }
    ],
    categories: [
      { id: 1, name: '编程', icon: '💻', count: 156 },
      { id: 2, name: '文学', icon: '📚', count: 89 },
      { id: 3, name: '科技', icon: '🔬', count: 67 },
      { id: 4, name: '历史', icon: '📜', count: 45 },
      { id: 5, name: '艺术', icon: '🎨', count: 34 },
      { id: 6, name: '哲学', icon: '🤔', count: 23 },
      { id: 7, name: '经济', icon: '💰', count: 56 },
      { id: 8, name: '其他', icon: '📖', count: 78 }
    ]
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
  loadPageData: function() {
    // 模拟加载数据
    wx.showLoading({
      title: '加载中...',
    });

    setTimeout(() => {
      wx.hideLoading();
    }, 1000);
  },

  // 更新通知数量
  updateNotificationCount: function() {
    // 这里可以从服务器获取最新的通知数量
    this.setData({
      notificationCount: Math.floor(Math.random() * 5)
    });
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 执行搜索
  onSearch: function() {
    if (!this.data.searchKeyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '搜索中...',
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: `搜索"${this.data.searchKeyword}"`,
        icon: 'none'
      });
    }, 1000);
  },

  // 显示通知
  showNotifications: function() {
    wx.showActionSheet({
      itemList: ['系统通知', '借阅提醒', '新书推荐'],
      success: (res) => {
        wx.showToast({
          title: '查看通知',
          icon: 'none'
        });
      }
    });
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
  scanBook: function() {
    wx.showModal({
      title: '扫描图书',
      content: '是否使用相机扫描图书条形码？',
      success: (res) => {
        if (res.confirm) {
          wx.scanCode({
            success: (res) => {
              wx.showToast({
                title: '扫描成功',
                icon: 'success'
              });
              console.log('扫描结果:', res.result);
            },
            fail: (err) => {
              wx.showToast({
                title: '扫描失败',
                icon: 'none'
              });
            }
          });
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
  viewBookDetail: function(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '图书详情',
      content: `查看图书ID: ${bookId} 的详细信息`,
      showCancel: false
    });
  },

  // 查看分类
  viewCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    wx.showModal({
      title: category.name,
      content: `该分类共有 ${category.count} 本图书`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '查看图书',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/books/books'
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadPageData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
})
