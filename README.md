# ByUsi Studio

一个现代化的开源项目展示网站，展示开发者的Gitee项目和统计数据。

## 功能特性

- 🎨 **响应式设计** - 完美适配桌面端和移动端
- ✨ **丰富动画效果** - 包含弹簧动画、波浪动画、扫描线、呼吸效果等多种高级CSS动画
- 🌓 **主题切换** - 支持深色/浅色主题切换
- 📊 **实时统计** - 展示Gitee仓库统计数据（项目数、星标数、分支数、活跃项目）
- 🔍 **项目搜索** - 支持按名称和描述搜索项目
- 🎯 **项目筛选** - 支持按最近更新、热门、分支、星标、归档等条件筛选
- � **README 预览** - 点击项目卡片查看 README，支持 Markdown 渲染、代码高亮、Gitee 图片 Blob 缓存加载
- 💬 **一言展示** - 集成一言 API（hi.logacg.com），打字机效果逐字显示，支持复制和手动刷新
- 🖱️ **鼠标跟随** - 自定义鼠标跟随光标效果
- 📜 **滚动进度** - 顶部滚动进度条指示阅读位置
- ⬆️ **返回顶部** - 滚动后显示返回顶部按钮
- 🍪 **Cookie 记录** - 记录用户访问信息
- 🚀 **平滑滚动** - 页面内平滑滚动导航
- ⚠️ **错误页面** - 独立的 error.html 错误页，支持多错误码（404/500/403/400/503）与倒计时跳转

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite 6
- **CSS预处理器**: Less
- **图标库**: FontAwesome
- **状态管理**: React Context
- **Markdown 渲染**: marked + DOMPurify + highlight.js

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
src/
├── components/            # 组件目录
│   ├── BackToTop.tsx      # 返回顶部按钮
│   ├── CookieRecord.tsx   # Cookie 记录组件
│   ├── ErrorBoundary.tsx  # 错误边界组件
│   ├── Footer.tsx         # 页脚组件
│   ├── HeadConfig.tsx     # 头部配置（title/favicon/样式表）
│   ├── Header.tsx         # 头部导航组件
│   ├── Hero.tsx           # 首页英雄区域
│   ├── Hitokoto.tsx       # 一言展示组件
│   ├── MouseFollower.tsx  # 鼠标跟随光标
│   ├── Projects.tsx       # 项目列表组件
│   ├── ReadmeModal.tsx    # README 预览弹窗
│   ├── ScrollProgress.tsx # 滚动进度条
│   ├── Stats.tsx          # 统计数据组件
│   ├── Team.tsx           # 团队/功能展示组件
│   └── Typewriter.tsx     # 打字机效果组件
├── context/               # Context 状态管理
│   ├── ThemeContext.tsx   # 主题上下文
│   └── UiConfigContext.tsx # UI 配置上下文
├── data/                  # 数据文件
│   └── mockRepos.ts       # 模拟仓库数据
├── hooks/                 # 自定义 Hooks
│   ├── useCookieRecord.ts # Cookie 记录 Hook
│   ├── useLocalStorage.ts # 本地存储 Hook
│   └── useScrollAnimation.ts # 滚动动画 Hook
├── services/              # 服务层
│   ├── api.ts             # API 请求（仓库/README/一言）
│   └── config.ts          # 配置加载
├── types/                 # TypeScript 类型定义
│   └── ui.ts              # UI 相关类型
├── App.less               # 全局样式（Less）
├── App.tsx                # 主应用组件
└── main.tsx               # 入口文件

public/                    # 静态资源（运行时配置）
├── config.json            # API 配置（baseUrl/orgName/accessToken）
├── ui.json                # UI 配置（布局/主题/导航等）
├── error.html             # 错误页面
└── Font/                  # FontAwesome 图标库
```

## 配置说明

### UI 配置（public/ui.json）

运行时 UI 配置文件，无需重新构建即可修改：

- **head** - 页面标题、favicon、外部样式表、预加载资源
- **light** - 主题色配置（主色调、次要颜色、强调色、背景色等）
- **layout** - 各模块布局配置：
  - `navbar` - 导航栏（Logo、链接、吸顶）
  - `hero` - 首页英雄区（标题、副标题、按钮）
  - `hitokoto` - 一言模块（显示开关）
  - `stats` - 统计卡片
  - `projects` - 项目列表（筛选器、每页数量、搜索占位符）
  - `team` - 团队理念卡片
  - `footer` - 页脚（链接列、版权信息）

### API 配置（public/config.json）

Gitee API 访问配置：

- `baseUrl` - Gitee API 基础地址
- `orgName` - 组织/用户名
- `accessToken` - 访问令牌
- `cacheLifetime` - 缓存有效期（秒）

## 动画效果

项目包含多种高级 CSS 动画效果（统一在 App.less 中管理）：

| 动画名称 | 效果描述 |
|---------|---------|
| `spring` | 弹簧弹性振动效果 |
| `wave` | 波浪起伏效果 |
| `scanLine` / `hitokotoScanMove` | 扫描线移动效果 |
| `breathe` / `hitokotoRingBreathe` | 呼吸缩放效果 |
| `pulseGlow` / `hitokotoIconBreathe` | 脉冲发光效果 |
| `glowRing` | 发光圆环缩放动画 |
| `slideScaleIn` / `hitokotoCardIn` | 滑动+缩放组合进入 |
| `floatRandom` | 随机漂浮移动 |
| `checkPulse` | 复制成功弹性反馈 |
| `loadingGlow` | 加载旋转器呼吸光晕 |
| `hitokotoDotWave` | 加载点波浪起伏 |

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge
