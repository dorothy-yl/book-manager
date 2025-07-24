// utils/api.js
/**
 * API接口定义
 * 统一管理所有业务接口
 */

const { get, post, put, delete: del, uploadFile } = require('./request.js');

// 图书相关接口
const bookAPI = {
  // 获取图书列表
  getBookList: (params = {}) => {
    console.log('调用获取图书列表API:', params);
    return get('/api/books', params);
  },
  
  // 获取图书详情
  getBookDetail: (bookId) => {
    console.log('调用获取图书详情API:', bookId);
    return get(`/api/books/${bookId}`);
  },
  
  // 搜索图书
  searchBooks: (keyword, params = {}) => {
    console.log('调用搜索图书API:', keyword, params);
    return get('/api/books/search', { keyword, ...params });
  },
  
  // 添加图书
  addBook: (bookData) => {
    return post('/api/books', bookData);
  },
  
  // 更新图书信息
  updateBook: (bookId, bookData) => {
    return put(`/api/books/${bookId}`, bookData);
  },
  
  // 删除图书
  deleteBook: (bookId) => {
    return del(`/api/books/${bookId}`);
  },
  
  // 借阅图书
  borrowBook: (bookId) => {
    return post(`/api/books/${bookId}/borrow`);
  },
  
  // 归还图书
  returnBook: (bookId) => {
    return post(`/api/books/${bookId}/return`);
  },
  
  // 收藏图书
  favoriteBook: (bookId) => {
    return post(`/api/books/${bookId}/favorite`);
  },
  
  // 取消收藏
  unfavoriteBook: (bookId) => {
    return del(`/api/books/${bookId}/favorite`);
  },
  
  // 获取收藏列表
  getFavorites: (params = {}) => {
    return get('/api/books/favorites', params);
  },
  
  // 获取借阅历史
  getBorrowHistory: (params = {}) => {
    return get('/api/books/borrow-history', params);
  },
  
  // 更新阅读进度
  updateProgress: (bookId, progress) => {
    return put(`/api/books/${bookId}/progress`, { progress });
  },
  
  // 上传图书封面
  uploadCover: (filePath, bookId) => {
    return uploadFile('/api/books/upload-cover', filePath, 'cover', { bookId });
  }
};

// 用户相关接口
const userAPI = {
  // 用户登录
  login: (loginData) => {
    return post('/api/auth/login', loginData);
  },
  
  // 用户注册
  register: (registerData) => {
    return post('/api/auth/register', registerData);
  },
  
  // 获取用户信息
  getUserInfo: () => {
    return get('/api/user/info');
  },
  
  // 更新用户信息
  updateUserInfo: (userData) => {
    return put('/api/user/info', userData);
  },
  
  // 上传头像
  uploadAvatar: (filePath) => {
    return uploadFile('/api/user/upload-avatar', filePath, 'avatar');
  },
  
  // 获取用户统计
  getUserStats: () => {
    return get('/api/user/stats');
  },
  
  // 获取用户借阅的图书
  getUserBorrowedBooks: (params = {}) => {
    return get('/api/user/borrowed-books', params);
  },
  
  // 获取用户发布的图书
  getUserPublishedBooks: (params = {}) => {
    return get('/api/user/published-books', params);
  },
  
  // 修改密码
  changePassword: (passwordData) => {
    return put('/api/user/change-password', passwordData);
  },
  
  // 退出登录
  logout: () => {
    return post('/api/auth/logout');
  }
};

// 分类相关接口
const categoryAPI = {
  // 获取分类列表
  getCategories: () => {
    return get('/api/categories');
  },
  
  // 获取分类下的图书
  getBooksByCategory: (categoryId, params = {}) => {
    return get(`/api/categories/${categoryId}/books`, params);
  }
};

// 统计相关接口
const statsAPI = {
  // 获取首页统计
  getHomeStats: () => {
    console.log('调用获取首页统计API');
    return get('/api/stats/home');
  },
  
  // 获取图书统计
  getBookStats: () => {
    console.log('调用获取图书统计API');
    return get('/api/stats/books');
  },
  
  // 获取用户统计
  getUserStats: () => {
    console.log('调用获取用户统计API');
    return get('/api/stats/users');
  }
};

// 通知相关接口
const notificationAPI = {
  // 获取通知列表
  getNotifications: (params = {}) => {
    return get('/api/notifications', params);
  },
  
  // 标记通知为已读
  markAsRead: (notificationId) => {
    return put(`/api/notifications/${notificationId}/read`);
  },
  
  // 删除通知
  deleteNotification: (notificationId) => {
    return del(`/api/notifications/${notificationId}`);
  },
  
  // 获取未读通知数量
  getUnreadCount: () => {
    return get('/api/notifications/unread-count');
  }
};

// 设置相关接口
const settingsAPI = {
  // 获取设置
  getSettings: () => {
    return get('/api/settings');
  },
  
  // 更新设置
  updateSettings: (settings) => {
    return put('/api/settings', settings);
  },
  
  // 获取隐私设置
  getPrivacySettings: () => {
    return get('/api/settings/privacy');
  },
  
  // 更新隐私设置
  updatePrivacySettings: (privacySettings) => {
    return put('/api/settings/privacy', privacySettings);
  }
};

// 反馈相关接口
const feedbackAPI = {
  // 提交反馈
  submitFeedback: (feedbackData) => {
    return post('/api/feedback', feedbackData);
  },
  
  // 获取反馈列表
  getFeedbackList: (params = {}) => {
    return get('/api/feedback', params);
  }
};

// 扫码相关接口
const scanAPI = {
  // 扫码添加图书
  scanAddBook: (barcode) => {
    return post('/api/scan/add-book', { barcode });
  },
  
  // 扫码借阅
  scanBorrow: (barcode) => {
    return post('/api/scan/borrow', { barcode });
  },
  
  // 扫码归还
  scanReturn: (barcode) => {
    return post('/api/scan/return', { barcode });
  }
};

// 导出所有API
module.exports = {
  bookAPI,
  userAPI,
  categoryAPI,
  statsAPI,
  notificationAPI,
  settingsAPI,
  feedbackAPI,
  scanAPI
}; 