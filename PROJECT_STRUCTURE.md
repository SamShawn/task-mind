# 项目结构说明

## 完整目录结构

```
task-mind/                          # 项目根目录
├── README.md                       # 项目说明文档
├── DEPLOYMENT.md                   # 部署指南
├── PROJECT_STRUCTURE.md            # 本文件
├── package.json                    # 根依赖配置
├── docker-compose.yml              # Docker 编排配置
│
├── client/                         # 前端应用 (React + TypeScript)
│   ├── package.json                # 前端依赖
│   ├── tsconfig.json               # TypeScript 配置
│   ├── tsconfig.node.json          # Node TypeScript 配置
│   ├── vite.config.ts              # Vite 构建配置
│   ├── tailwind.config.js          # Tailwind CSS 配置
│   ├── postcss.config.js           # PostCSS 配置
│   ├── Dockerfile                  # 前端 Docker 配置
│   ├── nginx.conf                 # Nginx 配置
│   ├── index.html                 # HTML 入口
│   │
│   └── src/                       # 源代码目录
│       ├── main.tsx               # 应用入口
│       ├── App.tsx                # 主应用组件
│       ├── index.css              # 全局样式
│       │
│       ├── components/            # React 组件
│       │   ├── TaskCard.tsx      # 任务卡片组件
│       │   └── TaskForm.tsx      # 任务表单组件
│       │
│       ├── pages/                 # 页面组件
│       │   ├── Login.tsx         # 登录/注册页面
│       │   └── Dashboard.tsx     # 主面板页面
│       │
│       ├── services/              # API 服务
│       │   └── api.ts            # Axios API 封装
│       │
│       ├── hooks/                 # 自定义 Hooks
│       │   ├── useAuth.ts         # 认证 Hook
│       │   └── useTasks.ts       # 任务管理 Hook
│       │
│       ├── types/                 # TypeScript 类型定义
│       │   └── index.ts          # 类型声明
│       │
│       └── utils/                 # 工具函数
│           └── formatters.ts      # 格式化函数
│
├── server/                         # 后端应用 (Node.js + Express)
│   ├── package.json                # 后端依赖
│   ├── tsconfig.json               # TypeScript 配置
│   ├── Dockerfile                  # 后端 Docker 配置
│   ├── .env                       # 环境变量
│   ├── .env.example               # 环境变量示例
│   │
│   └── src/                       # 源代码目录
│       ├── index.ts               # 服务器入口
│       │
│       ├── config/                # 配置文件
│       │   └── database.ts       # 数据库连接配置
│       │
│       ├── controllers/            # 控制器
│       │   ├── authController.ts  # 认证控制器
│       │   └── taskController.ts  # 任务控制器
│       │
│       ├── models/                # 数据模型
│       │   ├── User.ts           # 用户模型
│       │   └── Task.ts           # 任务模型
│       │
│       ├── routes/                # 路由定义
│       │   ├── auth.ts           # 认证路由
│       │   └── tasks.ts          # 任务路由
│       │
│       ├── services/              # 业务服务
│       │   └── aiClassifier.ts   # AI 分类服务
│       │
│       └── middleware/            # 中间件
│           └── auth.ts           # 认证中间件
│
└── shared/                         # 共享类型定义
    └── types/                     # 类型文件
        ├── task.ts                # 任务相关类型
        └── user.ts                # 用户相关类型
```

## 核心模块说明

### 前端模块 (client/)

#### 组件 (components/)
- **TaskCard.tsx**: 显示任务信息卡片，包含标题、描述、标签、状态等
- **TaskForm.tsx**: 任务创建/编辑表单，集成 AI 分析建议

#### 页面 (pages/)
- **Login.tsx**: 用户登录和注册页面
- **Dashboard.tsx**: 主控制台，包含任务列表、筛选、统计等功能

#### 服务 (services/)
- **api.ts**: 封装所有 API 调用，包含认证和任务相关接口

#### Hooks (hooks/)
- **useAuth.ts**: 管理用户认证状态
- **useTasks.ts**: 管理任务数据和操作

### 后端模块 (server/)

#### 控制器 (controllers/)
- **authController.ts**: 处理用户注册、登录、获取用户信息
- **taskController.ts**: 处理任务的 CRUD 操作和统计分析

#### 模型 (models/)
- **User.ts**: 用户数据模型，包含密码加密
- **Task.ts**: 任务数据模型，定义任务状态和字段

#### 路由 (routes/)
- **auth.ts**: 认证相关路由配置
- **tasks.ts**: 任务相关路由配置

#### 服务 (services/)
- **aiClassifier.ts**: AI 智能分类和优先级推荐逻辑

#### 中间件 (middleware/)
- **auth.ts**: JWT 认证和权限验证

### 数据流架构

```
┌─────────────────┐
│   Frontend      │
│  (React/TS)     │
└────────┬────────┘
         │ API Calls
         ▼
┌─────────────────┐
│   API Routes    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Controllers    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Services       │
│  (AI Analysis)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Models (Mongoose) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   MongoDB       │
└─────────────────┘
```

## AI 智能分析流程

```
用户输入任务信息
       ↓
提取关键词（标题、描述、标签）
       ↓
计算各分类和优先级的匹配分数
       ↓
根据分数权重确定推荐结果
       ↓
生成置信度和推理说明
       ↓
返回 AI 分析结果
```

## 技术栈总结

| 分类 | 技术 |
|------|------|
| 前端框架 | React 18 |
| 前端语言 | TypeScript |
| 构建工具 | Vite |
| UI 框架 | Tailwind CSS |
| 路由 | React Router |
| HTTP 客户端 | Axios |
| 日期处理 | date-fns |
| 图标库 | Lucide React |
| 后端框架 | Express.js |
| 后端语言 | TypeScript |
| 数据库 | MongoDB |
| ORM | Mongoose |
| 认证 | JWT |
| 密码加密 | BCrypt |
| 容器化 | Docker |
| 反向代理 | Nginx |
