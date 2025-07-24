// pages/my/my.js
Page({
  data: {
    // 用户信息
    userInfo: {
      nickName: 'Dorothy',
      avatarUrl: '/images/ME.jpg',
      level: '超级会员',
      borrowCount: 15,
      shareCount: 8,
      points: 3000
    },
    isLoggedIn: true,
    notificationCount: 2,
    
    // 借阅的图书
    borrowedBooks: [
      {
        id: 1,
        title: 'JavaScript权威指南',
        author: 'David Flanagan',
        cover: '/images/js-guide.jpg',
        returnDate: '2024-01-15',
        remainingDays: 5,
        progress: 75
      },
      {
        id: 2,
        title: '深入理解计算机系统',
        author: 'Randal E. Bryant',
        cover: '/images/CS.jpg',
        returnDate: '2024-01-20',
        remainingDays: 10,
        progress: 50
      }
    ],
    
    // 发布的图书
    sharedBooks: [
      {
        id: 3,
        title: 'JavaScript权威指南',
        author: 'David Flanagan',
        cover: '/images/js-guide.jpg',
        status: 'borrowed',
        borrowCount: 12,
        favoriteCount: 8
      },
      {
        id: 4,
        title: '了不起的Node.js',
        author: '朴灵',
        cover: '/images/JA.jpg',
        status: 'available',
        borrowCount: 5,
        favoriteCount: 3
      }
    ],
    
    // 统计数据
    borrowedCount: 2,
    sharedCount: 2,
    overdueCount: 0
  },

  onLoad(options) {
    this.loadUserData();
  },

  onShow() {
    this.updateNotificationCount();
    this.loadBooksData();
  },

  // 加载用户数据
  loadUserData() {
    // 模拟从服务器加载用户数据
    wx.showLoading({
      title: '加载中...',
    });

    setTimeout(() => {
      wx.hideLoading();
    }, 1000);
  },

  // 加载图书数据
  loadBooksData() {
    // 这里可以从服务器获取最新的图书数据
    this.setData({
      borrowedCount: this.data.borrowedBooks.length,
      sharedCount: this.data.sharedBooks.length
    });
  },

  // 更新通知数量
  updateNotificationCount() {
    this.setData({
      notificationCount: Math.floor(Math.random() * 5)
    });
  },

  // 编辑头像
  editAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }
    });
  },

  // 查看所有借阅图书
  viewAllBorrowed() {
    wx.showModal({
      title: '我的借阅',
      content: '查看所有借阅的图书',
      showCancel: false
    });
  },

  // 查看所有发布图书
  viewAllShared() {
    wx.showModal({
      title: '我的发布',
      content: '查看所有发布的图书',
      showCancel: false
    });
  },

  // 查看图书详情
  viewBookDetail(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '图书详情',
      content: `查看图书ID: ${bookId} 的详细信息`,
      showCancel: false
    });
  },

  // 编辑图书
  editBook(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['编辑信息', '修改状态', '删除图书'],
      success: (res) => {
        wx.showToast({
          title: '编辑功能',
          icon: 'none'
        });
      }
    });
  },

  // 删除图书
  deleteBook(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这本图书吗？',
      success: (res) => {
        if (res.confirm) {
          // 从列表中移除图书
          const sharedBooks = this.data.sharedBooks.filter(book => book.id !== bookId);
          this.setData({
            sharedBooks: sharedBooks,
            sharedCount: sharedBooks.length
          });
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 去浏览图书
  goToBrowse() {
    wx.switchTab({
      url: '/pages/books/books'
    });
  },

  // 发布新图书
  addNewBook() {
    wx.showActionSheet({
      itemList: ['手动添加', '扫码添加', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.manualAddBook();
        } else if (res.tapIndex === 1) {
          this.scanBook();
        } else {
          this.chooseFromAlbum();
        }
      }
    });
  },

  // 手动添加图书
  manualAddBook() {
    wx.showModal({
      title: '手动添加',
      content: '请输入图书信息',
      showCancel: true,
      cancelText: '取消',
      confirmText: '添加',
      success: (res) => {
        if (res.confirm) {
          // 模拟添加新图书
          const newBook = {
            id: Date.now(),
            title: '新添加的图书',
            author: '未知作者',
            cover: '/pages/images/JA.jpg',
            status: 'available',
            borrowCount: 0,
            favoriteCount: 0
          };
          
          const sharedBooks = [...this.data.sharedBooks, newBook];
          this.setData({
            sharedBooks: sharedBooks,
            sharedCount: sharedBooks.length
          });
          
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 扫码添加图书
  scanBook() {
    wx.scanCode({
      success: (res) => {
        wx.showToast({
          title: '扫码成功',
          icon: 'success'
        });
        console.log('扫描结果:', res.result);
      },
      fail: (err) => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  // 从相册选择
  chooseFromAlbum() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        wx.showToast({
          title: '选择成功',
          icon: 'success'
        });
      }
    });
  },

  // 我的收藏
  myFavorites() {
    wx.showModal({
      title: '我的收藏',
      content: '查看收藏的图书列表',
      showCancel: false
    });
  },

  // 借阅历史
  borrowHistory() {
    wx.showModal({
      title: '借阅历史',
      content: '查看所有借阅记录',
      showCancel: false
    });
  },

  // 编辑个人资料
  editProfile() {
    wx.showModal({
      title: '个人资料',
      content: '编辑个人信息',
      showCancel: true,
      cancelText: '取消',
      confirmText: '保存',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 通知设置
  notificationSettings() {
    wx.showActionSheet({
      itemList: ['借阅提醒', '归还提醒', '新书推荐', '系统通知'],
      success: (res) => {
        wx.showToast({
          title: '设置已保存',
          icon: 'success'
        });
      }
    });
  },

  // 隐私设置
  privacySettings() {
    wx.showActionSheet({
      itemList: ['公开借阅记录', '隐藏个人信息', '限制图书可见性'],
      success: (res) => {
        wx.showToast({
          title: '隐私设置已更新',
          icon: 'success'
        });
      }
    });
  },

  // 帮助中心
  helpCenter() {
    wx.showModal({
      title: '帮助中心',
      content: '常见问题解答和使用指南',
      showCancel: false
    });
  },

  // 关于我们
  aboutUs() {
    wx.showModal({
      title: '关于流动图书馆',
      content: '版本 1.0.0\n让知识在流动中传递价值',
      showCancel: false
    });
  },

  // 意见反馈
  feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的宝贵意见',
      showCancel: true,
      cancelText: '取消',
      confirmText: '提交',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '反馈已提交',
            icon: 'success'
          });
        }
      }
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            isLoggedIn: false,
            userInfo: {
              nickName: '未登录用户',
              avatarUrl: '/pages/images/s.png',
              level: '普通会员',
              borrowCount: 0,
              shareCount: 0,
              points: 0
            }
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadUserData();
    this.loadBooksData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
})