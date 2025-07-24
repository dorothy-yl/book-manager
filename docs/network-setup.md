# 网络请求设置指南

## 概述

本项目已经完整集成了 `wx.request` 网络请求功能，所有请求都指向 `http://localhost:3000`。

## 快速开始

### 1. 启动后端服务

确保你的后端服务在 `localhost:3000` 端口运行：

```bash
# 示例：启动 Node.js 服务器
node server.js

# 或者使用其他后端框架
npm start
```

### 2. 配置微信开发者工具

在微信开发者工具中：

1. 打开项目设置
2. 勾选 **"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"**
3. 或者将 `localhost:3000` 添加到"服务器域名"列表中

### 3. 测试网络连接

访问测试页面：`pages/test/test`

这个页面会自动测试所有网络请求功能，包括：
- 基础网络连接
- 获取图书列表
- 搜索图书
- 获取统计信息
- 用户相关接口

## 项目结构

```
├── utils/
│   ├── request.js    # 网络请求工具类
│   └── api.js        # API接口定义
├── pages/
│   ├── index/        # 首页（已集成网络请求）
│   ├── books/        # 图书页面（已集成网络请求）
│   ├── my/           # 个人中心（已集成网络请求）
│   └── test/         # 测试页面（新增）
└── app.js            # 全局配置
```

## API 接口列表

### 图书相关
- `GET /api/books` - 获取图书列表
- `GET /api/books/{id}` - 获取图书详情
- `GET /api/books/search` - 搜索图书
- `POST /api/books` - 添加图书
- `PUT /api/books/{id}` - 更新图书
- `DELETE /api/books/{id}` - 删除图书
- `POST /api/books/{id}/borrow` - 借阅图书
- `POST /api/books/{id}/return` - 归还图书
- `POST /api/books/{id}/favorite` - 收藏图书
- `DELETE /api/books/{id}/favorite` - 取消收藏

### 用户相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/info` - 更新用户信息
- `POST /api/user/upload-avatar` - 上传头像
- `GET /api/user/stats` - 获取用户统计
- `GET /api/user/borrowed-books` - 获取借阅的图书
- `GET /api/user/published-books` - 获取发布的图书

### 统计相关
- `GET /api/stats/home` - 获取首页统计
- `GET /api/stats/books` - 获取图书统计
- `GET /api/stats/users` - 获取用户统计

### 其他接口
- `GET /api/categories` - 获取分类列表
- `GET /api/notifications` - 获取通知列表
- `GET /api/settings` - 获取设置
- `POST /api/feedback` - 提交反馈

## 使用示例

### 在页面中使用

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

### 错误处理

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

## 响应格式

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

## 状态码说明

- `0` 或 `200` - 成功
- `400` - 请求参数错误
- `401` - 未授权（需要登录）
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

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

### 3. 使用测试页面

访问 `pages/test/test` 页面，可以：
- 自动测试所有接口
- 查看详细的测试结果
- 单独测试特定接口

## 常见问题

### 1. 网络请求失败

**问题**：请求 `http://localhost:3000` 失败

**解决方案**：
- 确保后端服务正在运行
- 检查微信开发者工具的网络设置
- 确保勾选了"不校验合法域名"

### 2. 跨域问题

**问题**：出现跨域错误

**解决方案**：
- 后端需要设置 CORS 头
- 允许来自微信小程序的请求

### 3. 权限问题

**问题**：某些接口返回 401 或 403

**解决方案**：
- 确保用户已登录
- 检查 token 是否有效
- 确认用户有相应权限

## 后端服务示例

如果你还没有后端服务，这里是一个简单的 Node.js 示例：

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'success', data: { status: 'ok' } });
});

// 获取图书列表
app.get('/api/books', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      list: [
        {
          id: 1,
          title: 'JavaScript权威指南',
          author: 'David Flanagan',
          category: '技术',
          status: 'available'
        }
      ],
      total: 1,
      page: 1,
      limit: 10
    }
  });
});

// 搜索图书
app.get('/api/books/search', (req, res) => {
  const { keyword } = req.query;
  res.json({
    code: 0,
    message: 'success',
    data: {
      list: [],
      total: 0,
      page: 1,
      limit: 10
    }
  });
});

// 获取首页统计
app.get('/api/stats/home', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      totalBooks: 100,
      activeExchanges: 50,
      activeUsers: 200
    }
  });
});

app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

## 下一步

1. **启动后端服务** - 确保服务在 `localhost:3000` 运行
2. **测试连接** - 使用测试页面验证所有接口
3. **开发功能** - 根据需求扩展更多API接口
4. **部署** - 将后端服务部署到生产环境

现在你的小程序已经可以正常请求 `http://localhost:3000` 了！🎉 