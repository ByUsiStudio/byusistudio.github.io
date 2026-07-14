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

export interface ThemeContextType {
  theme: Theme;
}
