# ByUsi Studio

一个现代化的开源项目展示网站，展示开发者的Gitee项目和统计数据。

## 功能特性

- 🎨 **响应式设计** - 完美适配桌面端和移动端
- ✨ **丰富动画效果** - 包含弹簧动画、波浪动画、扫描线、呼吸效果等多种高级CSS动画
- 🌓 **主题切换** - 支持深色/浅色主题切换
- 📊 **实时统计** - 展示Gitee仓库统计数据（项目数、星标数、分支数、活跃项目）
- 🔍 **项目搜索** - 支持按名称和描述搜索项目
- 🎯 **项目筛选** - 支持按最近更新、热门、分支、星标、归档等条件筛选
- 🕘 **最近访问** - 记录最近查看过的仓库，按访问时间展示在项目区顶部，方便快速回访
- 📄 **README 预览** - 点击项目卡片查看 README，支持 Markdown 渲染、代码高亮、Gitee 图片 Blob 缓存加载
- 💬 **一言展示** - 集成一言 API，打字机效果逐字显示，支持复制和手动刷新
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
│   ├── Layout.tsx         # 页面布局编排（各模块显隐）
│   ├── MouseFollower.tsx  # 鼠标跟随光标
│   ├── Projects.tsx       # 项目列表组件
│   ├── ReadmeModal.tsx    # README 预览弹窗
│   ├── RecentRepos.tsx    # 最近访问仓库条
│   ├── ScrollProgress.tsx # 滚动进度条
│   ├── Stats.tsx          # 统计数据组件
│   ├── Team.tsx           # 团队/功能展示组件
│   └── Typewriter.tsx     # 打字机效果组件
├── context/               # Context 状态管理
│   ├── ThemeContext.tsx   # 主题 Provider（注入 CSS 变量）
│   ├── theme.ts           # 主题 Context 与 useTheme Hook
│   ├── UiConfigContext.tsx# UI 配置 Provider（加载 ui.json）
│   └── uiConfig.ts        # UI 配置 Context 与 useUiConfig Hook
├── data/                  # 数据文件
│   └── mockRepos.ts       # 模拟仓库数据
├── hooks/                 # 自定义 Hooks
│   ├── useCookieRecord.ts # Cookie 记录 Hook
│   ├── useLocalStorage.ts # 本地存储 Hook
│   ├── useScrollAnimation.ts # 滚动动画 Hook
│   └── useRecentRepos.ts  # 最近访问仓库 Hook
├── services/              # 服务层
│   ├── api.ts             # API 请求（仓库/README/一言，含缓存）
│   └── config.ts          # 运行时配置加载
├── types/                 # TypeScript 类型定义
│   ├── theme.ts           # 主题类型
│   ├── ui.ts              # UI 配置与仓库类型
│   └── jcupupw.d.ts       # JCuPupw 弹窗库类型声明
├── utils/                 # 通用工具
│   ├── clipboard.ts       # 剪贴板复制（Clipboard API + 降级方案）
│   └── relativeTime.ts    # 相对时间文案
├── App.less               # 全局样式（Less）
├── App.tsx                # 主应用组件
├── noJsWarning.less       # 无 JS 提示页样式源（编译至 public）
└── main.tsx               # 入口文件

public/                    # 静态资源（运行时配置）
├── config.json            # API 配置（baseUrl/orgName）
├── ui.json                # UI 配置（布局/主题/导航等）
├── error.html             # 错误页面
├── no-js-warning.css      # 无 JS 提示样式（lessc 编译产物）
├── js/jcupupw.umd.js      # JCuPupw 弹窗库
├── favicon.png / logo/    # 站点图标与 Logo
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
- `cacheLifetime` - 缓存有效期（秒）

> ⚠️ **不要在此处配置任何 access token**。本站所有接口均访问 Gitee 公开仓库资源，
> 无需鉴权；由于前端代码和 `public/` 静态文件对访问者可见，任何放在这里的
> token 都会直接泄露。如需访问私有数据，请改走后端代理。

## 动画效果

项目包含多种高级 CSS 动画效果（统一在 App.less 中管理）：

| 动画名称                            | 效果描述           |
| ----------------------------------- | ------------------ |
| `spring`                            | 弹簧弹性振动效果   |
| `wave`                              | 波浪起伏效果       |
| `scanLine` / `hitokotoScanMove`     | 扫描线移动效果     |
| `breathe` / `hitokotoRingBreathe`   | 呼吸缩放效果       |
| `pulseGlow` / `hitokotoIconBreathe` | 脉冲发光效果       |
| `glowRing`                          | 发光圆环缩放动画   |
| `slideScaleIn` / `hitokotoCardIn`   | 滑动+缩放组合进入  |
| `floatRandom`                       | 随机漂浮移动       |
| `checkPulse`                        | 复制成功弹性反馈   |
| `loadingGlow`                       | 加载旋转器呼吸光晕 |
| `hitokotoDotWave`                   | 加载点波浪起伏     |

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge
