# API 使用说明

## 概述

本项目已经集成了完整的网络请求功能，包括：

- **统一请求工具** (`utils/request.js`) - 处理所有网络请求
- **API接口定义** (`utils/api.js`) - 定义所有业务接口
- **全局配置** (`app.js`) - 应用级别的配置和工具方法

## 快速开始

### 1. 配置API地址

在 `utils/request.js` 中修改 `baseURL`：

```javascript
const config = {
  baseURL: 'http://localhost:3000', // 本地开发服务器地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
```

### 2. 在页面中使用

```javascript
// 引入API
const { bookAPI, userAPI } = require('../../utils/api.js');

Page({
  data: {
    books: []
  },

  onLoad() {
    this.loadBooks();
  },

  // 加载图书列表
  async loadBooks() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const response = await bookAPI.getBookList();
      
      if (response.code === 0) {
        this.setData({
          books: response.data.list
        });
      }
    } catch (error) {
      console.error('加载失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
});
```

## API 接口列表

### 图书相关接口

#### 获取图书列表
```javascript
const response = await bookAPI.getBookList(params);
// params: { page: 1, limit: 10, category: 'tech' }
```

#### 获取图书详情
```javascript
const response = await bookAPI.getBookDetail(bookId);
```

#### 搜索图书
```javascript
const response = await bookAPI.searchBooks(keyword, params);
```

#### 添加图书
```javascript
const bookData = {
  title: '书名',
  author: '作者',
  category: '分类',
  price: 0,
  status: 'available'
};
const response = await bookAPI.addBook(bookData);
```

#### 更新图书
```javascript
const response = await bookAPI.updateBook(bookId, updateData);
```

#### 删除图书
```javascript
const response = await bookAPI.deleteBook(bookId);
```

#### 借阅图书
```javascript
const response = await bookAPI.borrowBook(bookId);
```

#### 归还图书
```javascript
const response = await bookAPI.returnBook(bookId);
```

#### 收藏/取消收藏
```javascript
// 收藏
const response = await bookAPI.favoriteBook(bookId);

// 取消收藏
const response = await bookAPI.unfavoriteBook(bookId);
```

#### 获取收藏列表
```javascript
const response = await bookAPI.getFavorites(params);
```

#### 获取借阅历史
```javascript
const response = await bookAPI.getBorrowHistory(params);
```

#### 更新阅读进度
```javascript
const response = await bookAPI.updateProgress(bookId, 75); // 75%
```

### 用户相关接口

#### 用户登录
```javascript
const loginData = {
  username: '用户名',
  password: '密码'
};
const response = await userAPI.login(loginData);
```

#### 用户注册
```javascript
const registerData = {
  username: '用户名',
  password: '密码',
  email: '邮箱'
};
const response = await userAPI.register(registerData);
```

#### 获取用户信息
```javascript
const response = await userAPI.getUserInfo();
```

#### 更新用户信息
```javascript
const userData = {
  nickName: '昵称',
  avatarUrl: '头像地址'
};
const response = await userAPI.updateUserInfo(userData);
```

#### 上传头像
```javascript
const response = await userAPI.uploadAvatar(filePath);
```

#### 获取用户统计
```javascript
const response = await userAPI.getUserStats();
```

#### 获取用户借阅的图书
```javascript
const response = await userAPI.getUserBorrowedBooks(params);
```

#### 获取用户发布的图书
```javascript
const response = await userAPI.getUserPublishedBooks(params);
```

#### 修改密码
```javascript
const passwordData = {
  oldPassword: '旧密码',
  newPassword: '新密码'
};
const response = await userAPI.changePassword(passwordData);
```

#### 退出登录
```javascript
const response = await userAPI.logout();
```

### 分类相关接口

#### 获取分类列表
```javascript
const response = await categoryAPI.getCategories();
```

#### 获取分类下的图书
```javascript
const response = await categoryAPI.getBooksByCategory(categoryId, params);
```

### 统计相关接口

#### 获取首页统计
```javascript
const response = await statsAPI.getHomeStats();
```

#### 获取图书统计
```javascript
const response = await statsAPI.getBookStats();
```

#### 获取用户统计
```javascript
const response = await statsAPI.getUserStats();
```

### 通知相关接口

#### 获取通知列表
```javascript
const response = await notificationAPI.getNotifications(params);
```

#### 标记通知为已读
```javascript
const response = await notificationAPI.markAsRead(notificationId);
```

#### 删除通知
```javascript
const response = await notificationAPI.deleteNotification(notificationId);
```

#### 获取未读通知数量
```javascript
const response = await notificationAPI.getUnreadCount();
```

### 设置相关接口

#### 获取设置
```javascript
const response = await settingsAPI.getSettings();
```

#### 更新设置
```javascript
const settings = {
  borrowReminder: true,
  returnReminder: true,
  newBookRecommend: true,
  systemNotification: true
};
const response = await settingsAPI.updateSettings(settings);
```

#### 获取隐私设置
```javascript
const response = await settingsAPI.getPrivacySettings();
```

#### 更新隐私设置
```javascript
const privacySettings = {
  publicBorrowRecord: true,
  hidePersonalInfo: false,
  limitBookVisibility: false
};
const response = await settingsAPI.updatePrivacySettings(privacySettings);
```

### 反馈相关接口

#### 提交反馈
```javascript
const feedbackData = {
  content: '反馈内容',
  type: 'suggestion' // suggestion, bug, other
};
const response = await feedbackAPI.submitFeedback(feedbackData);
```

#### 获取反馈列表
```javascript
const response = await feedbackAPI.getFeedbackList(params);
```

### 扫码相关接口

#### 扫码添加图书
```javascript
const response = await scanAPI.scanAddBook(barcode);
```

#### 扫码借阅
```javascript
const response = await scanAPI.scanBorrow(barcode);
```

#### 扫码归还
```javascript
const response = await scanAPI.scanReturn(barcode);
```

## 错误处理

### 统一错误处理

所有API请求都包含统一的错误处理：

```javascript
try {
  const response = await bookAPI.getBookList();
  // 处理成功响应
} catch (error) {
  // 错误已经被统一处理，会显示相应的提示
  console.error('请求失败:', error);
}
```

### 错误类型

1. **网络错误** - 网络连接失败
2. **超时错误** - 请求超时
3. **HTTP错误** - 服务器返回错误状态码
4. **业务错误** - 服务器返回业务错误码

### 自定义错误处理

如果需要自定义错误处理，可以这样：

```javascript
try {
  const response = await bookAPI.getBookList();
  // 处理成功响应
} catch (error) {
  // 自定义错误处理
  if (error.code === 401) {
    // 未授权，跳转登录
    wx.navigateTo({ url: '/pages/login/login' });
  } else {
    // 其他错误
    wx.showModal({
      title: '错误',
      content: error.message || '请求失败',
      showCancel: false
    });
  }
}
```

## 请求拦截器

### Token 自动添加

所有请求会自动添加用户token（如果存在）：

```javascript
// 自动添加 Authorization 头
headers: {
  'Authorization': 'Bearer your-token-here'
}
```

### 防缓存处理

所有请求会自动添加时间戳防止缓存：

```javascript
// 自动添加 _t 参数
url: '/api/books?_t=1640995200000'
```

## 响应拦截器

### 统一响应格式

所有API响应都遵循统一格式：

```javascript
{
  code: 0,           // 状态码，0表示成功
  message: 'success', // 消息
  data: {            // 数据
    list: [],
    total: 0,
    page: 1,
    limit: 10
  }
}
```

### 状态码说明

- `0` 或 `200` - 成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

## 文件上传

### 上传头像

```javascript
// 选择图片
const res = await new Promise((resolve, reject) => {
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: resolve,
    fail: reject
  });
});

const filePath = res.tempFilePaths[0];

// 上传
const response = await userAPI.uploadAvatar(filePath);
```

### 上传图书封面

```javascript
const response = await bookAPI.uploadCover(filePath, bookId);
```

## 全局工具方法

### 应用实例方法

```javascript
const app = getApp();

// 显示加载
app.showLoading('加载中...');
app.hideLoading();

// 显示提示
app.showSuccess('操作成功');
app.showError('操作失败');

// 显示对话框
app.showConfirm('确认', '确定要删除吗？', (res) => {
  if (res.confirm) {
    // 用户点击确定
  }
});

// 显示操作菜单
app.showActionSheet(['选项1', '选项2'], (res) => {
  console.log('选择了:', res.tapIndex);
});

// 页面跳转
app.navigateTo('/pages/detail/detail', { id: 123 });
app.switchTab('/pages/books/books');
app.navigateBack();
```

### 网络状态检查

```javascript
const app = getApp();

// 检查网络状态
const isConnected = await app.checkNetworkStatus();
if (!isConnected) {
  return; // 网络未连接
}
```

## 最佳实践

### 1. 错误处理

```javascript
async function loadData() {
  try {
    wx.showLoading({ title: '加载中...' });
    
    const response = await bookAPI.getBookList();
    
    if (response.code === 0) {
      this.setData({ books: response.data.list });
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('加载失败:', error);
    wx.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    });
  } finally {
    wx.hideLoading();
  }
}
```

### 2. 并行请求

```javascript
async function loadPageData() {
  try {
    const [books, categories, stats] = await Promise.all([
      bookAPI.getBookList(),
      categoryAPI.getCategories(),
      statsAPI.getHomeStats()
    ]);
    
    this.setData({
      books: books.data.list,
      categories: categories.data,
      stats: stats.data
    });
  } catch (error) {
    console.error('加载页面数据失败:', error);
  }
}
```

### 3. 条件请求

```javascript
async function loadUserBooks() {
  const app = getApp();
  
  if (!app.isUserLoggedIn()) {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }
  
  try {
    const response = await userAPI.getUserBorrowedBooks();
    this.setData({ userBooks: response.data.list });
  } catch (error) {
    console.error('加载用户图书失败:', error);
  }
}
```

### 4. 缓存处理

```javascript
async function loadBooks() {
  // 先显示缓存数据
  const cachedBooks = wx.getStorageSync('books');
  if (cachedBooks) {
    this.setData({ books: cachedBooks });
  }
  
  try {
    // 请求最新数据
    const response = await bookAPI.getBookList();
    
    if (response.code === 0) {
      const books = response.data.list;
      
      // 更新缓存
      wx.setStorageSync('books', books);
      
      // 更新页面数据
      this.setData({ books });
    }
  } catch (error) {
    console.error('加载图书失败:', error);
  }
}
```

## 注意事项

1. **API地址配置** - 确保在 `utils/request.js` 中配置正确的API地址
2. **错误处理** - 所有API调用都应该包含错误处理
3. **加载状态** - 长时间请求应该显示加载提示
4. **网络检查** - 重要操作前检查网络状态
5. **Token管理** - 登录后保存token，退出时清除token
6. **数据缓存** - 合理使用本地缓存提升用户体验

## 调试技巧

### 1. 查看网络请求

在微信开发者工具中：
- 打开"调试器"
- 选择"Network"标签
- 查看所有网络请求

### 2. 查看控制台日志

```javascript
// 在API调用前后添加日志
console.log('开始请求:', url);
const response = await bookAPI.getBookList();
console.log('请求完成:', response);
```

### 3. 模拟网络错误

在开发环境中可以模拟网络错误来测试错误处理：

```javascript
// 在 request.js 中添加模拟错误
if (process.env.NODE_ENV === 'development') {
  // 模拟网络错误
  if (Math.random() < 0.1) {
    throw new Error('模拟网络错误');
  }
}
``` 