import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UiConfigProvider } from './context/UiConfigContext';
import App from './App';
import '../libs/jcupupw.umd.js';

try {
  if (typeof JCuPupw !== 'undefined' && typeof JCuPupw.intercept === 'function') {
    JCuPupw.intercept();
  }
} catch (err) {
  console.warn('[JCuPupw] 拦截原生对话框失败，回退到原生行为:', err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UiConfigProvider>
      <App />
    </UiConfigProvider>
  </StrictMode>
);
