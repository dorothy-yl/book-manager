// pages/books/books.js
const { bookAPI, scanAPI } = require('../../utils/api.js');

Page({
  data: {
    currentTab: 'all',
    searchKeyword: '',
    books: [],
    filteredBooks: [],
    loading: false
  },

  onLoad: function() {
    this.loadBooks();
    
    // 检查是否有搜索关键词传递过来
    const app = getApp();
    if (app.globalData && app.globalData.searchKeyword) {
      this.setData({
        searchKeyword: app.globalData.searchKeyword
      });
      this.onSearch();
      // 清除全局数据
      delete app.globalData.searchKeyword;
      delete app.globalData.searchResults;
    }
    
    // 检查是否有选中的分类
    if (app.globalData && app.globalData.selectedCategory) {
      this.setData({
        currentTab: app.globalData.selectedCategory
      });
      delete app.globalData.selectedCategory;
    }
  },

  // 加载书籍列表
  async loadBooks() {
    this.setData({ loading: true });
    
    try {
      wx.showLoading({
        title: '加载中...',
      });

      const response = await bookAPI.getBookList();
      
      if (response.code === 0 || response.code === 200) {
        // 将服务器数据转换为页面需要的格式
        const books = response.data.list.map(book => ({
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
        throw new Error(response.message || '加载失败');
      }
    } catch (error) {
      console.error('加载书籍失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    } finally {
      wx.hideLoading();
    }
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
      
      if (response.code === 0 || response.code === 200) {
        const books = response.data.list.map(book => ({
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
        throw new Error(response.message || '搜索失败');
      }
    } catch (error) {
      console.error('搜索失败:', error);
      // 如果服务器搜索失败，使用本地搜索
      this.filterBooks();
      wx.showToast({
        title: `搜索"${keyword}"`,
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
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
  async viewBookDetail(book) {
    try {
      wx.showLoading({
        title: '加载中...',
      });

      const response = await bookAPI.getBookDetail(book.id);
      
      wx.hideLoading();
      
      if (response.code === 0 || response.code === 200) {
        const bookDetail = response.data;
        wx.showModal({
          title: bookDetail.title,
          content: `作者：${bookDetail.author}\n分类：${bookDetail.category || '技术'}\n评分：${bookDetail.rating || 4.5}⭐\n状态：${this.getStatusText(bookDetail.status)}\n价格：¥${bookDetail.price || 0}\n${bookDetail.description || ''}`,
          showCancel: true,
          cancelText: '关闭',
          confirmText: '借阅',
          success: (res) => {
            if (res.confirm) {
              this.borrowBook(book.id);
            }
          }
        });
      } else {
        throw new Error(response.message || '获取详情失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('获取详情失败:', error);
      // 如果请求失败，显示本地数据
      wx.showModal({
        title: book.title,
        content: `作者：${book.author}\n分类：${book.category}\n评分：${book.rating}⭐\n状态：${book.statusText}`,
        showCancel: false,
        confirmText: '确定'
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

      // 刷新数据
      this.loadBooks();

    } catch (error) {
      wx.hideLoading();
      console.error('借阅失败:', error);
      wx.showToast({
        title: '借阅失败',
        icon: 'none'
      });
    }
  },

  // 标记为已读
  async markAsFinished(book) {
    try {
      wx.showLoading({
        title: '更新中...',
      });

      await bookAPI.updateBook(book.id, {
        status: 'finished',
        progress: 100
      });
      
      wx.hideLoading();
      
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
    } catch (error) {
      wx.hideLoading();
      console.error('更新失败:', error);
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  },

  // 从书架移除
  async removeFromShelf(book) {
    wx.showModal({
      title: '确认移除',
      content: `确定要将《${book.title}》从书架移除吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '移除中...',
            });

            await bookAPI.deleteBook(book.id);
            
            wx.hideLoading();
            
            const books = this.data.books.filter(item => item.id !== book.id);
            this.setData({ books });
            this.filterBooks();
            
            wx.showToast({
              title: '已移除',
              icon: 'success'
            });
          } catch (error) {
            wx.hideLoading();
            console.error('移除失败:', error);
            wx.showToast({
              title: '移除失败',
              icon: 'none'
            });
          }
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
  async toggleFavorite(e) {
    const bookId = e.currentTarget.dataset.id;
    const book = this.data.books.find(item => item.id === bookId);
    const newFavoriteStatus = !book.isFavorite;
    
    try {
      wx.showLoading({
        title: '更新中...',
      });

      if (newFavoriteStatus) {
        await bookAPI.favoriteBook(bookId);
      } else {
        await bookAPI.unfavoriteBook(bookId);
      }
      
      wx.hideLoading();
      
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
    } catch (error) {
      wx.hideLoading();
      console.error('收藏操作失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
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
      this.loadBooks();

    } catch (error) {
      wx.hideLoading();
      console.error('扫码失败:', error);
      wx.showToast({
        title: '扫码失败',
        icon: 'none'
      });
    }
  },

  // 手动添加
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
              status: 'wishlist',
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
                cover: response.data.cover || '/images/default-cover.jpg',
                category: response.data.category || '技术',
                rating: response.data.rating || 0,
                status: response.data.status || 'wishlist',
                statusText: this.getStatusText(response.data.status || 'wishlist'),
                progress: response.data.progress || 0,
                isFavorite: response.data.isFavorite || false
              };
              
              const books = [...this.data.books, createdBook];
              this.setData({ books });
              this.filterBooks();
              
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
  async onPullDownRefresh() {
    try {
      await this.loadBooks();
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