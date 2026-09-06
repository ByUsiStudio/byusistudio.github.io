import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

try {
  if (typeof JCuPupw !== 'undefined' && typeof JCuPupw.intercept === 'function') {
    JCuPupw.intercept();
  }
} catch (err) {
  console.warn('[JCuPupw] 拦截原生对话框失败，回退到原生行为:', err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA：仅生产构建注册 Service Worker（开发环境不注册，避免缓存干扰 HMR）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[SW] Service Worker 注册失败:', err);
    });
  });
}
