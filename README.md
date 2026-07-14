# ByUsi Studio

一个现代化的开源项目展示网站，展示开发者的GitHub项目和统计数据。

## 功能特性

- 🎨 **响应式设计** - 完美适配桌面端和移动端
- ✨ **丰富动画效果** - 包含弹簧动画、波浪动画、扫描线、呼吸效果等多种高级CSS动画
- 🌓 **主题切换** - 支持深色/浅色主题切换
- 📊 **实时统计** - 展示GitHub仓库统计数据（项目数、星标数、分支数、活跃项目）
- 🔍 **项目搜索** - 支持按名称和描述搜索项目
- 🎯 **项目筛选** - 支持按最近更新、热门、分支、星标、归档等条件筛选
- 🚀 **平滑滚动** - 页面内平滑滚动导航

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite 6
- **CSS预处理器**: Less
- **图标库**: FontAwesome
- **状态管理**: React Context

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
├── components/          # 组件目录
│   ├── BackToTop.tsx    # 返回顶部按钮
│   ├── Footer.tsx       # 页脚组件
│   ├── Header.tsx       # 头部导航组件
│   ├── Hero.tsx         # 首页英雄区域
│   ├── Projects.tsx     # 项目列表组件
│   ├── ScrollProgress.tsx # 滚动进度条
│   ├── Stats.tsx        # 统计数据组件
│   └── Team.tsx         # 团队/功能展示组件
├── context/             # Context状态管理
│   ├── ThemeContext.tsx       # 主题上下文
│   └── UiConfigContext.tsx    # UI配置上下文
├── data/                # 数据文件
│   └── uiConfig.ts      # UI配置数据
├── types/               # TypeScript类型定义
│   └── ui.ts            # UI相关类型
├── App.less             # 全局样式（Less）
├── App.tsx              # 主应用组件
├── index.css            # 基础样式
├── main.tsx             # 入口文件
└── vite-env.d.ts        # Vite类型声明
```

## 配置说明

### UI配置

UI配置文件位于 `src/data/uiConfig.ts`，可以自定义：
- Hero区域的标题、副标题和按钮
- 统计卡片的数据映射
- 项目列表的筛选选项
- Team区域的功能卡片
- 页脚的链接和版权信息

### 主题配置

主题配置在 `src/context/ThemeContext.tsx` 中，支持自定义：
- 主色调（primary）
- 次要颜色（secondary）
- 强调色（accent）
- 背景色、文字色、边框色等

## 动画效果

项目包含多种高级CSS动画效果：

| 动画名称 | 效果描述 |
|---------|---------|
| `spring` | 弹簧弹性振动效果 |
| `wave` | 波浪起伏效果 |
| `scanLine` | 扫描线自上而下移动 |
| `breathe` | 呼吸缩放效果 |
| `pulseGlow` | 脉冲发光效果 |
| `neonFlicker` | 霓虹灯闪烁效果 |
| `borderFlow` | 边框流动效果 |
| `glowRing` | 发光圆环缩放动画 |
| `slideScaleIn` | 滑动+缩放组合进入 |
| `floatRandom` | 随机漂浮移动 |

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge