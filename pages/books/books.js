// pages/books/books.js
Page({
  data: {
    currentTab: 'all',
    searchKeyword: '',
    books: [],
    filteredBooks: [],
    loading: false,
    baseURL: 'http://localhost:3000' // Express 服务地址
  },
  onSearch() {
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
  
    wx.request({
      url: `http://localhost:3000/api/books/search?keyword=${this.data.searchKeyword}`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          this.setData({
            filteredBooks: res.data
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '搜索失败',
          icon: 'none'
        });
      }
    });
  },
  onSearch() {
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
  
    wx.request({
      url: `http://localhost:3000/api/books/search?keyword=${this.data.searchKeyword}`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          this.setData({
            filteredBooks: res.data
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '搜索失败',
          icon: 'none'
        });
      }
    });
  },


  onLoad: function() {
    this.loadBooks();
  },

  // 加载书籍列表
  loadBooks: function() {
    this.setData({ loading: true });
    
    wx.request({
      url: `${this.data.baseURL}/api/books`,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.data.success) {
          // 将服务器数据转换为页面需要的格式
          const books = res.data.data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            cover: book.cover || '/images/default-cover.jpg',
            category: book.category || '技术',
            rating: book.rating || 4.5,
            status: book.status || 'wishlist',
            statusText: this.getStatusText(book.status || 'wishlist'),
            progress: book.progress || 0,
            isFavorite: book.isFavorite || false,
            price: book.price || 0
          }));
          
          this.setData({ 
            books: books,
            loading: false 
          });
          this.filterBooks();
        } else {
          wx.showToast({
            title: res.data.message || '加载失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  },

  // 获取状态文本
  getStatusText: function(status) {
    const statusMap = {
      'reading': '在读',
      'finished': '已读',
      'wishlist': '想读',
      'recommend': '推荐'
    };
    return statusMap[status] || '想读';
  },

  // 切换分类标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    this.filterBooks();
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterBooks();
  },

  // 执行搜索
  onSearch() {
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

    // 发送搜索请求到服务器
    wx.request({
      url: `${this.data.baseURL}/api/books/search`,
      method: 'GET',
      data: {
        keyword: this.data.searchKeyword
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.success) {
          const books = res.data.data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            cover: book.cover || '/images/default-cover.jpg',
            category: book.category || '技术',
            rating: book.rating || 4.5,
            status: book.status || 'wishlist',
            statusText: this.getStatusText(book.status || 'wishlist'),
            progress: book.progress || 0,
            isFavorite: book.isFavorite || false
          }));
          
          this.setData({ 
            books: books,
            filteredBooks: books 
          });
          
          wx.showToast({
            title: `找到 ${books.length} 本书`,
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: res.data.message || '搜索失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        // 如果服务器不支持搜索，使用本地搜索
        this.filterBooks();
        wx.showToast({
          title: `搜索"${this.data.searchKeyword}"`,
          icon: 'none'
        });
      }
    });
  },

  // 过滤书籍
  filterBooks() {
    let filtered = this.data.books;

    // 按分类过滤
    if (this.data.currentTab !== 'all') {
      switch (this.data.currentTab) {
        case 'reading':
        case 'finished':
        case 'wishlist':
        case 'recommend':
          filtered = filtered.filter(book => book.status === this.data.currentTab);
          break;
        case 'favorite':
          filtered = filtered.filter(book => book.isFavorite);
          break;
        case 'recent':
          // 模拟最近添加的书籍（按ID倒序，取前10本）
          filtered = filtered.sort((a, b) => b.id - a.id).slice(0, 10);
          break;
      }
    }

    // 按关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword) ||
        book.category.toLowerCase().includes(keyword)
      );
    }

    this.setData({
      filteredBooks: filtered
    });
  },

  // 点击书籍
  onBookTap(e) {
    const book = e.currentTarget.dataset.book;
    wx.showActionSheet({
      itemList: ['查看详情', '标记为已读', '移除书架', '分享书籍'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.viewBookDetail(book);
            break;
          case 1:
            this.markAsFinished(book);
            break;
          case 2:
            this.removeFromShelf(book);
            break;
          case 3:
            this.shareBook(book);
            break;
        }
      }
    });
  },

  // 查看书籍详情
  viewBookDetail(book) {
    // 从服务器获取详细信息
    wx.request({
      url: `${this.data.baseURL}/api/books/${book.id}`,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.data.success) {
          const bookDetail = res.data.data;
          wx.showModal({
            title: bookDetail.title,
            content: `作者：${bookDetail.author}\n分类：${bookDetail.category || '技术'}\n评分：${bookDetail.rating || 4.5}⭐\n状态：${this.getStatusText(bookDetail.status)}\n价格：¥${bookDetail.price || 0}\n${bookDetail.description || ''}`,
            showCancel: false,
            confirmText: '确定'
          });
        } else {
          wx.showToast({
            title: '获取详情失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        // 如果请求失败，显示本地数据
        wx.showModal({
          title: book.title,
          content: `作者：${book.author}\n分类：${book.category}\n评分：${book.rating}⭐\n状态：${book.statusText}`,
          showCancel: false,
          confirmText: '确定'
        });
      }
    });
  },

  // 标记为已读
  markAsFinished(book) {
    // 更新服务器数据
    wx.request({
      url: `${this.data.baseURL}/api/books/${book.id}`,
      method: 'PUT',
      header: {
        'content-type': 'application/json'
      },
      data: {
        status: 'finished',
        progress: 100
      },
      success: (res) => {
        if (res.data.success) {
          // 更新本地数据
          const books = this.data.books.map(item => {
            if (item.id === book.id) {
              return { ...item, status: 'finished', statusText: '已读', progress: 100 };
            }
            return item;
          });
          
          this.setData({ books });
          this.filterBooks();
          
          wx.showToast({
            title: '已标记为已读',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '更新失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        // 如果服务器更新失败，只更新本地数据
        const books = this.data.books.map(item => {
          if (item.id === book.id) {
            return { ...item, status: 'finished', statusText: '已读', progress: 100 };
          }
          return item;
        });
        
        this.setData({ books });
        this.filterBooks();
        
        wx.showToast({
          title: '已标记为已读',
          icon: 'success'
        });
      }
    });
  },

  // 从书架移除
  removeFromShelf(book) {
    wx.showModal({
      title: '确认移除',
      content: `确定要将《${book.title}》从书架移除吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从服务器删除
          wx.request({
            url: `${this.data.baseURL}/api/books/${book.id}`,
            method: 'DELETE',
            header: {
              'content-type': 'application/json'
            },
            success: (res) => {
              if (res.data.success) {
                const books = this.data.books.filter(item => item.id !== book.id);
                this.setData({ books });
                this.filterBooks();
                
                wx.showToast({
                  title: '已移除',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: res.data.message || '移除失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              // 如果服务器删除失败，只更新本地数据
              const books = this.data.books.filter(item => item.id !== book.id);
              this.setData({ books });
              this.filterBooks();
              
              wx.showToast({
                title: '已移除',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 分享书籍
  shareBook(book) {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 切换收藏状态
  toggleFavorite(e) {
    const bookId = e.currentTarget.dataset.id;
    const book = this.data.books.find(item => item.id === bookId);
    const newFavoriteStatus = !book.isFavorite;
    
    // 更新服务器数据
    wx.request({
      url: `${this.data.baseURL}/api/books/${bookId}`,
      method: 'PUT',
      header: {
        'content-type': 'application/json'
      },
      data: {
        isFavorite: newFavoriteStatus
      },
      success: (res) => {
        if (res.data.success) {
          const books = this.data.books.map(item => {
            if (item.id === bookId) {
              return { ...item, isFavorite: newFavoriteStatus };
            }
            return item;
          });
          
          this.setData({ books });
          this.filterBooks();
          
          wx.showToast({
            title: newFavoriteStatus ? '已收藏' : '已取消收藏',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        // 如果服务器更新失败，只更新本地数据
        const books = this.data.books.map(item => {
          if (item.id === bookId) {
            return { ...item, isFavorite: newFavoriteStatus };
          }
          return item;
        });
        
        this.setData({ books });
        this.filterBooks();
        
        wx.showToast({
          title: newFavoriteStatus ? '已收藏' : '已取消收藏',
          icon: 'success'
        });
      }
    });
  },

  // 筛选功能
  onFilter() {
    wx.showActionSheet({
      itemList: ['按评分排序', '按阅读进度排序', '按添加时间排序', '按分类筛选'],
      success: (res) => {
        wx.showToast({
          title: '筛选功能开发中',
          icon: 'none'
        });
      }
    });
  },

  // 排序功能
  onSort() {
    wx.showActionSheet({
      itemList: ['升序排列', '降序排列', '随机排列'],
      success: (res) => {
        wx.showToast({
          title: '排序功能开发中',
          icon: 'none'
        });
      }
    });
  },

  // 添加书籍
  onAddBook() {
    wx.showActionSheet({
      itemList: ['扫码添加', '手动添加', '从推荐添加', '从相册选择'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.scanBook();
            break;
          case 1:
            this.manualAddBook();
            break;
          case 2:
            this.addFromRecommend();
            break;
          case 3:
            this.chooseFromAlbum();
            break;
        }
      }
    });
  },

  // 扫码添加
  scanBook() {
    wx.scanCode({
      success: (res) => {
        wx.showToast({
          title: '扫码成功',
          icon: 'success'
        });
        console.log('扫描结果:', res.result);
        // 这里可以根据扫码结果查询图书信息
      },
      fail: (err) => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  // 手动添加
  manualAddBook() {
    wx.showModal({
      title: '手动添加',
      content: '请输入图书信息',
      showCancel: true,
      cancelText: '取消',
      confirmText: '添加',
      success: (res) => {
        if (res.confirm) {
          // 创建新图书数据
          const newBook = {
            title: '新添加的图书',
            author: '未知作者',
            category: '技术',
            price: 0,
            status: 'wishlist',
            progress: 0,
            isFavorite: false
          };
          
          // 发送到服务器
          wx.request({
            url: `${this.data.baseURL}/api/books`,
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            data: newBook,
            success: (res) => {
              if (res.data.success) {
                const createdBook = {
                  id: res.data.data.id,
                  title: res.data.data.title,
                  author: res.data.data.author,
                  cover: res.data.data.cover || '/images/default-cover.jpg',
                  category: res.data.data.category || '技术',
                  rating: res.data.data.rating || 0,
                  status: res.data.data.status || 'wishlist',
                  statusText: this.getStatusText(res.data.data.status || 'wishlist'),
                  progress: res.data.data.progress || 0,
                  isFavorite: res.data.data.isFavorite || false
                };
                
                const books = [...this.data.books, createdBook];
                this.setData({ books });
                this.filterBooks();
                
                wx.showToast({
                  title: '添加成功',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: res.data.message || '添加失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              // 如果服务器添加失败，只更新本地数据
              const newBook = {
                id: Date.now(),
                title: '新添加的图书',
                author: '未知作者',
                cover: '/images/default-cover.jpg',
                category: '其他',
                rating: 0,
                status: 'wishlist',
                statusText: '想读',
                progress: 0,
                isFavorite: false
              };
              
              const books = [...this.data.books, newBook];
              this.setData({ books });
              this.filterBooks();
              
              wx.showToast({
                title: '添加成功',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 从推荐添加
  addFromRecommend() {
    wx.showModal({
      title: '推荐书籍',
      content: '查看推荐书籍列表',
      showCancel: false
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

  // 下拉刷新
  onPullDownRefresh() {
    this.loadBooks();
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 上拉触底
  onReachBottom() {
    wx.showToast({
      title: '加载更多功能开发中',
      icon: 'none'
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的信阅书架',
      path: '/pages/books/books'
    };
  }
})