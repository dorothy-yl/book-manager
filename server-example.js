// server-example.js
// 简单的Node.js后端服务示例，用于测试微信小程序的网络请求

const express = require('express');
const cors = require('cors');
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 模拟数据
const books = [
  {
    id: 1,
    title: 'JavaScript权威指南',
    author: 'David Flanagan',
    category: '技术',
    status: 'available',
    rating: 4.5,
    progress: 0,
    isFavorite: false,
    cover: '/images/js-guide.jpg'
  },
  {
    id: 2,
    title: '了不起的Node.js',
    author: '朴灵',
    category: '技术',
    status: 'borrowed',
    rating: 4.8,
    progress: 75,
    isFavorite: true,
    cover: '/images/JA.jpg'
  },
  {
    id: 3,
    title: '深入理解计算机系统',
    author: 'Randal E. Bryant',
    category: '技术',
    status: 'available',
    rating: 4.7,
    progress: 0,
    isFavorite: false,
    cover: '/images/CS.jpg'
  }
];

const categories = [
  { id: 1, name: '编程', icon: '💻', count: 156 },
  { id: 2, name: '文学', icon: '📚', count: 89 },
  { id: 3, name: '科技', icon: '🔬', count: 67 },
  { id: 4, name: '历史', icon: '📜', count: 45 },
  { id: 5, name: '艺术', icon: '🎨', count: 34 }
];

// 健康检查
app.get('/api/health', (req, res) => {
  console.log('健康检查请求');
  res.json({ 
    code: 0, 
    message: 'success', 
    data: { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'localhost:3000'
    } 
  });
});

// 获取图书列表
app.get('/api/books', (req, res) => {
  console.log('获取图书列表请求:', req.query);
  
  const { limit = 10, page = 1, category, sort } = req.query;
  
  let filteredBooks = [...books];
  
  // 按分类过滤
  if (category) {
    filteredBooks = filteredBooks.filter(book => book.category === category);
  }
  
  // 排序
  if (sort === 'created_at') {
    filteredBooks.sort((a, b) => b.id - a.id);
  }
  
  // 分页
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedBooks = filteredBooks.slice(start, end);
  
  res.json({
    code: 0,
    message: 'success',
    data: {
      list: paginatedBooks,
      total: filteredBooks.length,
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

// 获取图书详情
app.get('/api/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  console.log('获取图书详情请求:', bookId);
  
  const book = books.find(b => b.id === bookId);
  
  if (!book) {
    return res.status(404).json({
      code: 404,
      message: '图书不存在'
    });
  }
  
  res.json({
    code: 0,
    message: 'success',
    data: book
  });
});

// 搜索图书
app.get('/api/books/search', (req, res) => {
  const { keyword } = req.query;
  console.log('搜索图书请求:', keyword);
  
  if (!keyword) {
    return res.json({
      code: 0,
      message: 'success',
      data: {
        list: [],
        total: 0,
        page: 1,
        limit: 10
      }
    });
  }
  
  const searchResults = books.filter(book => 
    book.title.toLowerCase().includes(keyword.toLowerCase()) ||
    book.author.toLowerCase().includes(keyword.toLowerCase()) ||
    book.category.toLowerCase().includes(keyword.toLowerCase())
  );
  
  res.json({
    code: 0,
    message: 'success',
    data: {
      list: searchResults,
      total: searchResults.length,
      page: 1,
      limit: 10
    }
  });
});

// 获取分类列表
app.get('/api/categories', (req, res) => {
  console.log('获取分类列表请求');
  res.json({
    code: 0,
    message: 'success',
    data: categories
  });
});

// 获取首页统计
app.get('/api/stats/home', (req, res) => {
  console.log('获取首页统计请求');
  res.json({
    code: 0,
    message: 'success',
    data: {
      totalBooks: books.length,
      activeExchanges: Math.floor(books.length * 0.3),
      activeUsers: Math.floor(books.length * 0.5)
    }
  });
});

// 获取图书统计
app.get('/api/stats/books', (req, res) => {
  console.log('获取图书统计请求');
  res.json({
    code: 0,
    message: 'success',
    data: {
      total: books.length,
      available: books.filter(b => b.status === 'available').length,
      borrowed: books.filter(b => b.status === 'borrowed').length,
      categories: categories.length
    }
  });
});

// 获取用户统计
app.get('/api/stats/users', (req, res) => {
  console.log('获取用户统计请求');
  res.json({
    code: 0,
    message: 'success',
    data: {
      totalUsers: 150,
      activeUsers: 89,
      newUsers: 12
    }
  });
});

// 获取用户信息（需要登录）
app.get('/api/user/info', (req, res) => {
  console.log('获取用户信息请求');
  
  // 检查Authorization头
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }
  
  res.json({
    code: 0,
    message: 'success',
    data: {
      id: 1,
      nickName: 'Dorothy',
      avatarUrl: '/images/ME.jpg',
      level: '超级会员',
      email: 'dorothy@example.com'
    }
  });
});

// 获取用户统计
app.get('/api/user/stats', (req, res) => {
  console.log('获取用户统计请求');
  
  // 检查Authorization头
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }
  
  res.json({
    code: 0,
    message: 'success',
    data: {
      borrowCount: 15,
      shareCount: 8,
      points: 3000,
      favoriteCount: 12
    }
  });
});

// 获取通知列表
app.get('/api/notifications', (req, res) => {
  console.log('获取通知列表请求');
  res.json({
    code: 0,
    message: 'success',
    data: {
      list: [
        {
          id: 1,
          title: '系统通知',
          content: '欢迎使用流动图书馆小程序！',
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: '借阅提醒',
          content: '您借阅的《JavaScript权威指南》即将到期',
          type: 'borrow',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ],
      total: 2,
      unreadCount: 2
    }
  });
});

// 获取未读通知数量
app.get('/api/notifications/unread-count', (req, res) => {
  console.log('获取未读通知数量请求');
  res.json({
    code: 0,
    message: 'success',
    data: {
      count: 2
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  console.log('404请求:', req.method, req.originalUrl);
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('可用的API接口:');
  console.log('- GET  /api/health - 健康检查');
  console.log('- GET  /api/books - 获取图书列表');
  console.log('- GET  /api/books/:id - 获取图书详情');
  console.log('- GET  /api/books/search - 搜索图书');
  console.log('- GET  /api/categories - 获取分类列表');
  console.log('- GET  /api/stats/home - 获取首页统计');
  console.log('- GET  /api/stats/books - 获取图书统计');
  console.log('- GET  /api/stats/users - 获取用户统计');
  console.log('- GET  /api/user/info - 获取用户信息');
  console.log('- GET  /api/user/stats - 获取用户统计');
  console.log('- GET  /api/notifications - 获取通知列表');
  console.log('- GET  /api/notifications/unread-count - 获取未读通知数量');
}); 