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
  </StrictMode>
);
