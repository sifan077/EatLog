# Eat Log - 饮食记录应用

一个专注于饮食记录的 Web 应用，支持拍照记录每日饮食，快速记录 + 电脑端完善详情。

## ✨ 功能特点

### 核心功能
- 📸 **拍照上传** - 支持摄像头拍照和文件上传
- 🖼️ **多图支持** - 一次记录可以上传多张照片
- 🗜️ **自动压缩** - 图片自动压缩，节省存储空间
- 📝 **简短描述** - 快速记录食物描述
- 🍽️ **餐次分类** - 6 种餐次类型（早餐、午餐、下午加餐、晚餐、晚上加餐、零食）
- 📅 **今日记录** - 查看今日所有饮食记录
- ⏰ **智能判断** - 根据北京时间自动判断餐次

### 移动端优化
- 📱 **PWA 支持** - 可安装为移动应用
- 📷 **摄像头调用** - 直接调用设备摄像头拍照
- 🎨 **响应式设计** - 完美适配手机和平板
- ⚡ **离线支持** - PWA 离线缓存

### 安全特性
- 🔒 **用户认证** - 基于 Supabase Auth
- 🛡️ **RLS 策略** - 用户只能访问自己的数据
- 🔐 **私有存储** - 照片存储在私有 bucket
- 🔑 **签名 URL** - 安全的图片访问机制
- 🚫 **防盗刷** - 签名 URL 24 小时有效期

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm（推荐）
- Supabase 账号

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
```

获取方式：
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → Settings → API
3. 复制 Project URL 和 anon/public key

### 配置数据库

详细步骤请参考 [doc/DATABASE_SETUP.md](./doc/DATABASE_SETUP.md)

简要步骤：
1. 在 Supabase Dashboard 的 SQL Editor 中执行 `supabase-schema.sql`
2. 创建名为 `meal-photos` 的 Storage bucket（私有）
3. 配置 Storage RLS 策略

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📦 技术栈

- **框架**: Next.js 16.1.1 (App Router)
- **UI 库**: React 19.2.3
- **后端服务**: Supabase (Database + Auth + Storage)
- **样式**: Tailwind CSS 4
- **语言**: TypeScript 5
- **包管理器**: pnpm
- **PWA**: next-pwa

## 🎨 设计理念

- 📱 **手机端快速记录**：拍照 → 简短描述 → 选择餐次 → 完成（3 步）
- 💻 **电脑端完善详情**：补充地点、标签等详细信息
- 🔄 **数据完整**：手机快速记录，电脑补充信息
- 📊 **可回顾**：方便查看历史记录和统计

## 📁 项目结构

```
eat-log/
├── src/
│   ├── app/                      # Next.js App Router 目录
│   │   ├── layout.tsx           # 根布局组件
│   │   ├── page.tsx             # 首页（重定向到 /today）
│   │   ├── globals.css          # 全局样式
│   │   ├── login/               # 登录页面
│   │   │   └── page.tsx
│   │   ├── today/               # 今日记录页面
│   │   │   └── page.tsx
│   │   └── actions.ts           # Server Actions
│   ├── components/              # React 组件
│   │   ├── QuickRecordForm.tsx  # 快速记录表单
│   │   ├── MealCard.tsx         # 记录卡片
│   │   └── LogoutButton.tsx     # 登出按钮
│   ├── lib/                     # 工具库
│   │   ├── constants.ts         # 常量定义
│   │   └── types.ts             # TypeScript 类型定义
│   └── utils/
│       ├── supabase/
│       │   ├── server.ts        # 服务端客户端
│       │   ├── client.ts        # 客户端客户端
│       │   └── storage.ts       # Storage 工具
│       └── date.ts              # 日期工具
├── public/                      # 静态资源目录
├── doc/                         # 文档目录
├── supabase-schema.sql          # 数据库表结构
└── .env.example                 # 环境变量示例
```

## 🛠️ 开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 检查代码格式
pnpm format:check
```

## 📊 餐次类型

| 值 | 标签 | Emoji | 时间范围（北京时间） |
|---|------|-------|---------------------|
| `breakfast` | 早餐 | 🌅 | 5:00 - 8:59 |
| `lunch` | 午餐 | 🍜 | 9:00 - 13:59 |
| `afternoon_snack` | 下午加餐 | ☕ | 14:00 - 16:59 |
| `dinner` | 晚餐 | 🍽️ | 17:00 - 20:59 |
| `evening_snack` | 晚上加餐 | 🌙 | 21:00 - 4:59 |
| `snack` | 零食 | 🍪 | 全天 |

## 🔐 安全说明

### 数据安全
- 所有数据存储在 Supabase
- 启用行级安全（RLS）
- 用户只能访问自己的数据
- 照片存储在私有 bucket

### 访问控制
- 签名 URL 机制
- 24 小时有效期
- 防止未授权访问
- 防止盗刷

### 部署要求
- 必须使用 HTTPS
- 正确配置环境变量
- 配置 Supabase RLS 策略

## 🚢 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### 其他平台

支持任何支持 Next.js 的平台：
- Netlify
- Railway
- Render
- 自建服务器

## 📝 开发计划

- [x] 用户认证
- [x] 今日记录页面
- [x] 拍照上传
- [x] 多图支持
- [x] 图片压缩
- [x] PWA 支持
- [ ] 编辑记录详情
- [ ] 按日期浏览
- [ ] 搜索功能
- [ ] 统计功能

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请提交 Issue。
