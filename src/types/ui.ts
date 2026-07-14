export interface UiHeadConfig {
  lang: string;
  charset: string;
  viewport: string;
  title: string;
  favicon: {
    href: string;
    type: string;
  };
  stylesheets: Array<{
    href: string;
    integrity?: string;
    crossorigin?: string;
    referrerpolicy?: string;
  }>;
  preconnect: string[];
  preload: Array<{ href: string; as: string; type?: string }>;
}

export interface Theme {
  'bg-color': string;
  'text-color': string;
  primary: string;
  'primary-dark': string;
  secondary: string;
  accent: string;
  'light-gray': string;
  'dark-gray': string;
  'card-bg': string;
  'border-color': string;
  shadow: string;
  transition: string;
}

export type ThemeMode = 'light' | 'dark';

export interface HeroButton {
  label: string;
  icon: string;
  action?: string;
  href?: string;
  primary: boolean;
}

export interface HeroConfig {
  show: boolean;
  title: string;
  subtitle: string;
  buttons: HeroButton[];
}

export interface NavLink {
  href: string;
  icon: string;
  label: string;
  external?: boolean;
}

export interface NavbarConfig {
  showLogo: boolean;
  logoText: string;
  logoImage: string;
  height: number;
  sticky: boolean;
  links: NavLink[];
}

export interface StatCardConfig {
  key: string;
  label: string;
}

export interface StatsConfig {
  show: boolean;
  cards: StatCardConfig[];
}

export interface FilterConfig {
  key: string;
  label: string;
}

export interface ProjectsConfig {
  show: boolean;
  title: string;
  searchPlaceholder: string;
  filters: FilterConfig[];
  itemsPerPage: number;
}

export interface TeamItemConfig {
  icon: string;
  title: string;
  description: string;
}

export interface TeamConfig {
  show: boolean;
  title: string;
  items: TeamItemConfig[];
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterConfig {
  show: boolean;
  copyright: string;
  subtitle: string;
  columns: FooterColumn[];
}

export interface LayoutConfig {
  navbar: NavbarConfig;
  hero: HeroConfig;
  stats: StatsConfig;
  projects: ProjectsConfig;
  team: TeamConfig;
  footer: FooterConfig;
}

export interface UiConfig {
  head: UiHeadConfig;
  light: Theme;
  dark: Theme;
  layout: LayoutConfig;
}

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
