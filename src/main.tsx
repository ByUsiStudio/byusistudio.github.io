import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UiConfigProvider } from './context/UiConfigContext';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UiConfigProvider>
      <App />
    </UiConfigProvider>
  </StrictMode>
);
