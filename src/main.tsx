import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './serviceWorkerRegistration.ts';

// Suppress benign Vite HMR WebSocket connection warnings in sandboxed dev environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message || event.reason || '');
    if (msg.includes('WebSocket') || msg.includes('vite')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || event.error?.message || '');
    if (msg.includes('WebSocket') || msg.includes('vite')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  const origConsoleError = console.error;
  console.error = (...args) => {
    const str = args.map(a => String(a?.message || a || '')).join(' ');
    if (str.includes('WebSocket') || str.includes('[vite] failed to connect')) {
      return;
    }
    origConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for offline accessibility and caching
registerServiceWorker(() => {
  console.log('[CareFlow AI] Service Worker active & ready for offline caching.');
});


