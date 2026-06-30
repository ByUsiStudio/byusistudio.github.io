export interface Theme {
  'bg-color': string;
  'text-color': string;
  'primary': string;
  'primary-dark': string;
  'secondary': string;
  'accent': string;
  'light-gray': string;
  'dark-gray': string;
  'card-bg': string;
  'shadow': string;
  'transition': string;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleMode: () => void;
}
