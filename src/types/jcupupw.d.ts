declare module '*.umd.js';

interface JCuPupwButton {
  text: string;
  type?: 'default' | 'primary' | 'danger';
  action?: () => void;
  close?: boolean;
}

interface JCuPupwOpenOptions {
  title?: string;
  content?: string;
  buttons?: JCuPupwButton[];
  onOpen?: () => void;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'auto';
  width?: number | string;
  draggable?: boolean;
  autoClose?: number;
  theme?: 'auto' | 'light' | 'dark';
  queue?: boolean;
  beforeClose?: () => boolean | Promise<boolean>;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
}

interface JCuPupwAlertOptions extends JCuPupwOpenOptions {
  type?: 'primary' | 'danger';
  buttonText?: string;
}

interface JCuPupwConfirmOptions extends JCuPupwOpenOptions {
  confirmText?: string;
  cancelText?: string;
}

interface JCuPupwPromptOptions extends JCuPupwOpenOptions {
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

interface JCuPupwToastOptions {
  content?: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
}

interface JCuPupwToastInstance {
  close: () => void;
  el: HTMLElement;
}

interface JCuPupwInstance {
  modalId: string;
  open(options?: JCuPupwOpenOptions): Promise<void>;
  close(): Promise<boolean>;
  setTitle(title: string): this;
  setContent(content: string): this;
  addButton(text: string, action?: () => void, type?: 'default' | 'primary' | 'danger'): this;
  showLoading(): this;
  hideLoading(): this;
  alert(options?: JCuPupwAlertOptions): Promise<void>;
  confirm(options?: JCuPupwConfirmOptions): Promise<boolean>;
  prompt(options?: JCuPupwPromptOptions): Promise<string | null>;
  toast(options?: JCuPupwToastOptions): JCuPupwToastInstance;
  isOpen(): boolean;
  destroy(): void;
  on(event: string, callback: () => void): void;
  registerMethod(name: string, fn: (...args: unknown[]) => unknown): void;
}

interface JCuPupwStatic {
  new (options?: { id?: string }): JCuPupwInstance;
  alert(options?: JCuPupwAlertOptions): Promise<void>;
  confirm(options?: JCuPupwConfirmOptions): Promise<boolean>;
  prompt(options?: JCuPupwPromptOptions): Promise<string | null>;
  toast(options?: JCuPupwToastOptions | string): JCuPupwToastInstance;
  closeAll(): Promise<boolean[]>;
  instance(): JCuPupwInstance;
  intercept(): () => void;
  restore(): void;
}

declare const JCuPupw: JCuPupwStatic;
