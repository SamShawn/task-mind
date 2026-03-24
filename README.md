# Task Mind - 智能任务管理系统

一个基于 AI 的任务管理应用，支持智能分类、优先级推荐和团队协作功能。

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React (图标库)
- date-fns (日期处理)

### 后端
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- JWT (身份认证)
- BCrypt (密码加密)

### AI 功能
- 基于规则的智能任务分类
- 优先级推荐算法
- 实时任务分析

## 项目结构

```
task-mind/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   ├── hooks/         # React Hooks
│   │   ├── types/         # TypeScript 类型
│   │   └── utils/         # 工具函数
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                 # 后端应用
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── services/      # 业务逻辑
│   │   ├── middleware/    # 中间件
│   │   └── config/        # 配置文件
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
└── shared/                 # 共享类型
    └── types/
```

## 快速开始

### 前置要求

- Node.js >= 18
- MongoDB >= 6.0

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
npm install
cd client && npm install
cd ../server && npm install
```

### 2. 配置环境变量

在 `server/.env` 文件中配置：

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmind
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. 启动 MongoDB

确保 MongoDB 服务正在运行：

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# 或使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或者分别启动
npm run dev:client  # 前端运行在 http://localhost:3000
npm run dev:server  # 后端运行在 http://localhost:5000
```

### 5. 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 功能特性

### 核心功能
- ✅ 用户注册和登录
- ✅ 创建、编辑、删除任务
- ✅ 智能任务分类（自动识别开发、设计、营销等类别）
- ✅ 智能优先级推荐（基于任务内容推荐优先级）
- ✅ 任务状态管理
- ✅ 任务搜索和筛选
- ✅ 任务统计dashboard
- ✅ 团队协作（任务分配）

### AI 智能功能
- 🤖 实时任务分析
- 🤖 智能分类建议
- 🤖 优先级推荐
- 🤖 中文和英文关键词识别
- 🤖 基于标签的智能分析

## API 端点

### 认证
- `POST /api/auth/register` - 注册用户
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `GET /api/auth/users` - 获取用户列表（管理员）

### 任务
- `POST /api/tasks` - 创建任务
- `GET /api/tasks` - 获取任务列表
- `GET /api/tasks/:id` - 获取任务详情
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `GET /api/tasks/stats` - 获取任务统计
- `POST /api/tasks/analyze` - 批量分析任务

## 数据模型

### User
```typescript
{
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Task
```typescript
{
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'development' | 'design' | 'marketing' | 'operations' | 'customer_support' | 'research' | 'other';
  assignedTo?: string;
  createdBy: string;
  dueDate?: Date;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 部署

### 构建生产版本

```bash
# 构建前端
cd client && npm run build

# 构建后端
cd server && npm run build
```

### 使用 Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

## 开发指南

### 添加新的任务类别

编辑 `server/src/services/aiClassifier.ts`，在 `categoryKeywords` 中添加新的类别和关键词。

### 自定义 AI 分析逻辑

修改 `server/src/services/aiClassifier.ts` 中的 `calculateCategoryScores` 和 `calculatePriorityScores` 方法。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
