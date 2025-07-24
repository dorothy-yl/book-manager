// pages/my/my.js
const { userAPI, bookAPI, scanAPI, notificationAPI, settingsAPI, feedbackAPI } = require('../../utils/api.js');

Page({
  data: {
    // 用户信息
    userInfo: {
      nickName: 'Dorothy',
      avatarUrl: '/images/ME.jpg',
      level: '超级会员',
      borrowCount: 0,
      shareCount: 0,
      points: 0
    },
    isLoggedIn: true,
    notificationCount: 0,
    
    // 借阅的图书
    borrowedBooks: [],
    
    // 发布的图书
    sharedBooks: [],
    
    // 统计数据
    borrowedCount: 0,
    sharedCount: 0,
    overdueCount: 0,
    loading: false
  },

  onLoad(options) {
    this.loadUserData();
  },

  onShow() {
    this.updateNotificationCount();
    this.loadBooksData();
  },

  // 加载用户数据
  async loadUserData() {
    this.setData({ loading: true });
    
    try {
      wx.showLoading({
        title: '加载中...',
      });

      // 并行请求用户信息和统计数据
      const [userInfo, userStats] = await Promise.all([
        userAPI.getUserInfo(),
        userAPI.getUserStats()
      ]);

      if (userInfo.code === 0 || userInfo.code === 200) {
        this.setData({
          userInfo: {
            nickName: userInfo.data.nickName || 'Dorothy',
            avatarUrl: userInfo.data.avatarUrl || '/images/ME.jpg',
            level: userInfo.data.level || '超级会员',
            borrowCount: userStats.data.borrowCount || 0,
            shareCount: userStats.data.shareCount || 0,
            points: userStats.data.points || 0
          }
        });
      }

    } catch (error) {
      console.error('加载用户数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  // 加载图书数据
  async loadBooksData() {
    try {
      // 并行请求借阅和发布的图书
      const [borrowedBooks, sharedBooks] = await Promise.all([
        userAPI.getUserBorrowedBooks({ limit: 4 }),
        userAPI.getUserPublishedBooks({ limit: 4 })
      ]);

      if (borrowedBooks.code === 0 || borrowedBooks.code === 200) {
        const borrowed = borrowedBooks.data.list.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          cover: book.cover || '/images/js-guide.jpg',
          returnDate: book.returnDate,
          remainingDays: book.remainingDays,
          progress: book.progress || 0
        }));

        this.setData({
          borrowedBooks: borrowed,
          borrowedCount: borrowed.length
        });
      }

      if (sharedBooks.code === 0 || sharedBooks.code === 200) {
        const shared = sharedBooks.data.list.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          cover: book.cover || '/images/JA.jpg',
          status: book.status || 'available',
          borrowCount: book.borrowCount || 0,
          favoriteCount: book.favoriteCount || 0
        }));

        this.setData({
          sharedBooks: shared,
          sharedCount: shared.length
        });
      }

    } catch (error) {
      console.error('加载图书数据失败:', error);
    }
  },

  // 更新通知数量
  async updateNotificationCount() {
    try {
      const response = await notificationAPI.getUnreadCount();
      
      if (response.code === 0 || response.code === 200) {
        this.setData({
          notificationCount: response.data.count || 0
        });
      }
    } catch (error) {
      console.error('获取通知数量失败:', error);
    }
  },

  // 编辑头像
  async editAvatar() {
    try {
      const res = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        });
      });

      const tempFilePath = res.tempFilePaths[0];
      
      wx.showLoading({
        title: '上传中...',
      });

      // 上传头像
      await userAPI.uploadAvatar(tempFilePath);
      
      wx.hideLoading();
      
      this.setData({
        'userInfo.avatarUrl': tempFilePath
      });
      
      wx.showToast({
        title: '头像更新成功',
        icon: 'success'
      });

    } catch (error) {
      wx.hideLoading();
      console.error('上传头像失败:', error);
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      });
    }
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
  async viewBookDetail(e) {
    const bookId = e.currentTarget.dataset.id;
    
    try {
      wx.showLoading({
        title: '加载中...',
      });

      const response = await bookAPI.getBookDetail(bookId);
      
      wx.hideLoading();
      
      if (response.code === 0 || response.code === 200) {
        const book = response.data;
        wx.showModal({
          title: book.title,
          content: `作者：${book.author}\n分类：${book.category}\n状态：${book.status}\n借阅次数：${book.borrowCount || 0}`,
          showCancel: false
        });
      } else {
        throw new Error(response.message || '获取详情失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('获取图书详情失败:', error);
      wx.showToast({
        title: '获取详情失败',
        icon: 'none'
      });
    }
  },

  // 编辑图书
  editBook(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['编辑信息', '修改状态', '删除图书'],
      success: async (res) => {
        switch (res.tapIndex) {
          case 0:
            this.editBookInfo(bookId);
            break;
          case 1:
            this.changeBookStatus(bookId);
            break;
          case 2:
            this.deleteBook(bookId);
            break;
        }
      }
    });
  },

  // 编辑图书信息
  async editBookInfo(bookId) {
    wx.showModal({
      title: '编辑图书',
      content: '编辑图书信息功能',
      showCancel: true,
      cancelText: '取消',
      confirmText: '保存',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '保存中...',
            });

            await bookAPI.updateBook(bookId, {
              // 这里可以添加编辑的数据
            });
            
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });

            // 刷新数据
            this.loadBooksData();

          } catch (error) {
            wx.hideLoading();
            console.error('保存失败:', error);
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 修改图书状态
  async changeBookStatus(bookId) {
    wx.showActionSheet({
      itemList: ['可借阅', '已借出', '维护中'],
      success: async (res) => {
        const statusMap = ['available', 'borrowed', 'maintenance'];
        const status = statusMap[res.tapIndex];
        
        try {
          wx.showLoading({
            title: '更新中...',
          });

          await bookAPI.updateBook(bookId, { status });
          
          wx.hideLoading();
          wx.showToast({
            title: '状态已更新',
            icon: 'success'
          });

          // 刷新数据
          this.loadBooksData();

        } catch (error) {
          wx.hideLoading();
          console.error('更新状态失败:', error);
          wx.showToast({
            title: '更新失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 删除图书
  async deleteBook(bookId) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这本图书吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '删除中...',
            });

            await bookAPI.deleteBook(bookId);
            
            wx.hideLoading();
            
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
          } catch (error) {
            wx.hideLoading();
            console.error('删除失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
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
        switch (res.tapIndex) {
          case 0:
            this.manualAddBook();
            break;
          case 1:
            this.scanBook();
            break;
          case 2:
            this.chooseFromAlbum();
            break;
        }
      }
    });
  },

  // 手动添加图书
  async manualAddBook() {
    wx.showModal({
      title: '手动添加',
      content: '请输入图书信息',
      showCancel: true,
      cancelText: '取消',
      confirmText: '添加',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '添加中...',
            });

            // 创建新图书数据
            const newBook = {
              title: '新添加的图书',
              author: '未知作者',
              category: '技术',
              price: 0,
              status: 'available',
              progress: 0,
              isFavorite: false
            };
            
            const response = await bookAPI.addBook(newBook);
            
            wx.hideLoading();
            
            if (response.code === 0 || response.code === 200) {
              const createdBook = {
                id: response.data.id,
                title: response.data.title,
                author: response.data.author,
                cover: response.data.cover || '/images/JA.jpg',
                status: response.data.status || 'available',
                borrowCount: 0,
                favoriteCount: 0
              };
              
              const sharedBooks = [...this.data.sharedBooks, createdBook];
              this.setData({
                sharedBooks: sharedBooks,
                sharedCount: sharedBooks.length
              });
              
              wx.showToast({
                title: '添加成功',
                icon: 'success'
              });
            } else {
              throw new Error(response.message || '添加失败');
            }
          } catch (error) {
            wx.hideLoading();
            console.error('添加失败:', error);
            wx.showToast({
              title: '添加失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 扫码添加图书
  async scanBook() {
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
      await scanAPI.scanAddBook(scanResult.result);
      
      wx.hideLoading();
      
      wx.showToast({
        title: '扫码成功',
        icon: 'success'
      });

      // 刷新数据
      this.loadBooksData();

    } catch (error) {
      wx.hideLoading();
      console.error('扫码失败:', error);
      wx.showToast({
        title: '扫码失败',
        icon: 'none'
      });
    }
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
  async myFavorites() {
    try {
      wx.showLoading({
        title: '加载中...',
      });

      const response = await bookAPI.getFavorites();
      
      wx.hideLoading();
      
      if (response.code === 0 || response.code === 200) {
        const favorites = response.data.list || [];
        wx.showModal({
          title: '我的收藏',
          content: `共有 ${favorites.length} 本收藏的图书`,
          showCancel: false
        });
      } else {
        throw new Error(response.message || '获取收藏失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('获取收藏失败:', error);
      wx.showToast({
        title: '获取收藏失败',
        icon: 'none'
      });
    }
  },

  // 借阅历史
  async borrowHistory() {
    try {
      wx.showLoading({
        title: '加载中...',
      });

      const response = await bookAPI.getBorrowHistory();
      
      wx.hideLoading();
      
      if (response.code === 0 || response.code === 200) {
        const history = response.data.list || [];
        wx.showModal({
          title: '借阅历史',
          content: `共有 ${history.length} 条借阅记录`,
          showCancel: false
        });
      } else {
        throw new Error(response.message || '获取历史失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('获取借阅历史失败:', error);
      wx.showToast({
        title: '获取历史失败',
        icon: 'none'
      });
    }
  },

  // 编辑个人资料
  async editProfile() {
    wx.showModal({
      title: '个人资料',
      content: '编辑个人信息',
      showCancel: true,
      cancelText: '取消',
      confirmText: '保存',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '保存中...',
            });

            await userAPI.updateUserInfo({
              // 这里可以添加编辑的数据
            });
            
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });

            // 刷新用户数据
            this.loadUserData();

          } catch (error) {
            wx.hideLoading();
            console.error('保存失败:', error);
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 通知设置
  async notificationSettings() {
    wx.showActionSheet({
      itemList: ['借阅提醒', '归还提醒', '新书推荐', '系统通知'],
      success: async (res) => {
        try {
          const settings = {
            borrowReminder: res.tapIndex === 0,
            returnReminder: res.tapIndex === 1,
            newBookRecommend: res.tapIndex === 2,
            systemNotification: res.tapIndex === 3
          };

          await settingsAPI.updateSettings(settings);
          
          wx.showToast({
            title: '设置已保存',
            icon: 'success'
          });
        } catch (error) {
          console.error('保存设置失败:', error);
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 隐私设置
  async privacySettings() {
    wx.showActionSheet({
      itemList: ['公开借阅记录', '隐藏个人信息', '限制图书可见性'],
      success: async (res) => {
        try {
          const privacySettings = {
            publicBorrowRecord: res.tapIndex === 0,
            hidePersonalInfo: res.tapIndex === 1,
            limitBookVisibility: res.tapIndex === 2
          };

          await settingsAPI.updatePrivacySettings(privacySettings);
          
          wx.showToast({
            title: '隐私设置已更新',
            icon: 'success'
          });
        } catch (error) {
          console.error('更新隐私设置失败:', error);
          wx.showToast({
            title: '更新失败',
            icon: 'none'
          });
        }
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
  async feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的宝贵意见',
      showCancel: true,
      cancelText: '取消',
      confirmText: '提交',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '提交中...',
            });

            await feedbackAPI.submitFeedback({
              content: '用户反馈内容',
              type: 'suggestion'
            });
            
            wx.hideLoading();
            wx.showToast({
              title: '反馈已提交',
              icon: 'success'
            });
          } catch (error) {
            wx.hideLoading();
            console.error('提交反馈失败:', error);
            wx.showToast({
              title: '提交失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 退出登录
  async logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '退出中...',
            });

            await userAPI.logout();
            
            wx.hideLoading();
            
            // 清除本地存储
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            
            this.setData({
              isLoggedIn: false,
              userInfo: {
                nickName: '未登录用户',
                avatarUrl: '/images/S.png',
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
          } catch (error) {
            wx.hideLoading();
            console.error('退出登录失败:', error);
            wx.showToast({
              title: '退出失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 下拉刷新
  async onPullDownRefresh() {
    try {
      await Promise.all([
        this.loadUserData(),
        this.loadBooksData()
      ]);
      
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