export interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  archived: boolean;
  has_issues: boolean;
  open_issues_count: number;
}

export const mockRepos: Repo[] = [
  {
    id: 1,
    name: 'ByUsiOS',
    full_name: 'byusi/ByUsiOS',
    description: '一个基于Linux内核的轻量级操作系统，专注于性能优化和安全性',
    html_url: 'https://gitee.com/byusi/ByUsiOS',
    language: 'C',
    stargazers_count: 128,
    forks_count: 32,
    updated_at: '2024-01-15T10:30:00Z',
    created_at: '2023-06-01T08:00:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 5
  },
  {
    id: 2,
    name: 'ByUsiUI',
    full_name: 'byusi/ByUsiUI',
    description: '现代化的UI组件库，支持React和Vue框架',
    html_url: 'https://gitee.com/byusi/ByUsiUI',
    language: 'TypeScript',
    stargazers_count: 89,
    forks_count: 24,
    updated_at: '2024-01-14T15:45:00Z',
    created_at: '2023-08-15T12:00:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 3
  },
  {
    id: 3,
    name: 'ByUsiAPI',
    full_name: 'byusi/ByUsiAPI',
    description: '高性能后端API框架，基于Node.js和Express',
    html_url: 'https://gitee.com/byusi/ByUsiAPI',
    language: 'JavaScript',
    stargazers_count: 67,
    forks_count: 18,
    updated_at: '2024-01-13T09:20:00Z',
    created_at: '2023-09-01T10:30:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 2
  },
  {
    id: 4,
    name: 'ByUsiMobile',
    full_name: 'byusi/ByUsiMobile',
    description: '跨平台移动应用开发框架，支持iOS和Android',
    html_url: 'https://gitee.com/byusi/ByUsiMobile',
    language: 'Dart',
    stargazers_count: 54,
    forks_count: 15,
    updated_at: '2024-01-12T14:00:00Z',
    created_at: '2023-10-01T09:00:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 4
  },
  {
    id: 5,
    name: 'ByUsiData',
    full_name: 'byusi/ByUsiData',
    description: '数据处理和分析工具库，支持大数据处理',
    html_url: 'https://gitee.com/byusi/ByUsiData',
    language: 'Python',
    stargazers_count: 43,
    forks_count: 12,
    updated_at: '2024-01-11T16:30:00Z',
    created_at: '2023-11-15T11:00:00Z',
    archived: false,
    has_issues: false,
    open_issues_count: 0
  },
  {
    id: 6,
    name: 'ByUsiAI',
    full_name: 'byusi/ByUsiAI',
    description: '人工智能工具集，包含机器学习和深度学习组件',
    html_url: 'https://gitee.com/byusi/ByUsiAI',
    language: 'Python',
    stargazers_count: 95,
    forks_count: 28,
    updated_at: '2024-01-10T12:15:00Z',
    created_at: '2023-07-01T08:30:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 6
  },
  {
    id: 7,
    name: 'ByUsiTools',
    full_name: 'byusi/ByUsiTools',
    description: '开发工具集合，提升开发效率',
    html_url: 'https://gitee.com/byusi/ByUsiTools',
    language: 'Go',
    stargazers_count: 32,
    forks_count: 8,
    updated_at: '2024-01-09T10:00:00Z',
    created_at: '2023-12-01T14:00:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 1
  },
  {
    id: 8,
    name: 'ByUsiWeb',
    full_name: 'byusi/ByUsiWeb',
    description: 'Web开发脚手架，快速构建现代化Web应用',
    html_url: 'https://gitee.com/byusi/ByUsiWeb',
    language: 'TypeScript',
    stargazers_count: 48,
    forks_count: 14,
    updated_at: '2024-01-08T17:20:00Z',
    created_at: '2023-08-20T09:30:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 2
  },
  {
    id: 9,
    name: 'ByUsiDocs',
    full_name: 'byusi/ByUsiDocs',
    description: '项目文档中心，提供完整的API文档和使用指南',
    html_url: 'https://gitee.com/byusi/ByUsiDocs',
    language: 'Markdown',
    stargazers_count: 23,
    forks_count: 6,
    updated_at: '2024-01-07T11:45:00Z',
    created_at: '2023-09-15T10:00:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 0
  },
  {
    id: 10,
    name: 'ByUsiLegacy',
    full_name: 'byusi/ByUsiLegacy',
    description: '遗留项目存档，保留历史版本供参考',
    html_url: 'https://gitee.com/byusi/ByUsiLegacy',
    language: 'Java',
    stargazers_count: 15,
    forks_count: 3,
    updated_at: '2023-12-01T08:00:00Z',
    created_at: '2022-01-01T00:00:00Z',
    archived: true,
    has_issues: false,
    open_issues_count: 0
  },
  {
    id: 11,
    name: 'ByUsiCLI',
    full_name: 'byusi/ByUsiCLI',
    description: '命令行工具，简化日常开发操作',
    html_url: 'https://gitee.com/byusi/ByUsiCLI',
    language: 'Rust',
    stargazers_count: 56,
    forks_count: 16,
    updated_at: '2024-01-06T13:30:00Z',
    created_at: '2023-10-15T12:00:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 3
  },
  {
    id: 12,
    name: 'ByUsiCloud',
    full_name: 'byusi/ByUsiCloud',
    description: '云服务基础设施，支持容器化部署',
    html_url: 'https://gitee.com/byusi/ByUsiCloud',
    language: 'Shell',
    stargazers_count: 38,
    forks_count: 10,
    updated_at: '2024-01-05T15:00:00Z',
    created_at: '2023-11-01T11:30:00Z',
    archived: false,
    has_issues: true,
    open_issues_count: 1
  }
];
