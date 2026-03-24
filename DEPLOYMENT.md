# 部署指南

## 本地部署

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置数据库

启动 MongoDB 服务：

```bash
# 使用 Homebrew (macOS)
brew services start mongodb-community

# 使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Linux
sudo systemctl start mongodb
```

### 3. 配置环境变量

复制并编辑环境变量文件：

```bash
cd server

cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmind
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=production
```

### 4. 构建和启动

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
cd server && npm start
```

## Docker 部署

### 1. 构建镜像

```bash
docker-compose build
```

### 2. 启动服务

```bash
docker-compose up -d
```

### 3. 查看日志

```bash
docker-compose logs -f
```

### 4. 停止服务

```bash
docker-compose down
```

## 云平台部署

### Vercel + Railway

1. **后端部署 (Railway)**
   - 创建新的 Railway 项目
   - 选择 MongoDB 模板
   - 选择 Node.js 模板用于 API
   - 设置环境变量
   - 部署

2. **前端部署 (Vercel)**
   - 连接 GitHub 仓库
   - 配置构建命令: `npm run build`
   - 配置输出目录: `dist`
   - 添加环境变量: `VITE_API_URL`
   - 部署

### AWS 部署

1. **设置 ECS/EKS**
   - 创建 VPC 和子网
   - 设置 Application Load Balancer
   - 配置容器 registry (ECR)

2. **数据库设置**
   - 使用 MongoDB Atlas 或 DocumentDB
   - 配置安全组和网络访问

3. **CI/CD**
   - 设置 GitHub Actions
   - 自动构建和部署流程

## 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| PORT | 服务器端口 | 是 |
| MONGODB_URI | MongoDB 连接字符串 | 是 |
| JWT_SECRET | JWT 密钥 | 是 |
| NODE_ENV | 环境模式 | 否 |

## 监控和日志

### 使用 PM2

```bash
npm install -g pm2

# 启动后端
cd server
pm2 start "node dist/index.js" --name taskmind-server

# 启动前端
cd client
pm2 serve dist 3000 --spa --name taskmind-client

# 查看状态
pm2 status

# 查看日志
pm2 logs
```

## 健康检查

```bash
# 检查 API 状态
curl http://localhost:5000/health

# 预期输出
{"status":"ok","message":"Task Mind API is running"}
```

## 备份和恢复

### MongoDB 备份

```bash
# 备份
mongodump --uri mongodb://localhost:27017/taskmind --out ./backup

# 恢复
mongorestore --uri mongodb://localhost:27017/taskmind ./backup
```

## 安全建议

1. 生产环境使用强 JWT_SECRET
2. 启用 HTTPS
3. 配置 CORS 白名单
4. 设置速率限制
5. 定期更新依赖
6. 启用数据库认证
7. 配置防火墙规则

## 故障排查

### 常见问题

**问题**: MongoDB 连接失败
```
解决方案: 检查 MONGODB_URI 是否正确，确保 MongoDB 服务正在运行
```

**问题**: 前端无法连接到后端
```
解决方案: 检查 VITE_API_URL 配置，确保 CORS 设置正确
```

**问题**: Docker 容器无法启动
```
解决方案: 检查 docker-compose.yml 中的网络配置，清理旧容器: docker-compose down -v
```

**问题**: 认证失败
```
解决方案: 检查 JWT_SECRET 是否一致，清除浏览器 localStorage
```

## 性能优化

1. **数据库**
   - 添加索引: `title`, `status`, `priority`, `createdBy`
   - 使用聚合管道优化查询

2. **前端**
   - 启用代码分割
   - 配置 CDN
   - 优化图片和资源

3. **后端**
   - 启用响应压缩
   - 配置缓存策略
   - 使用连接池
