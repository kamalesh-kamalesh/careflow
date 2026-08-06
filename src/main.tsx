import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker, unregisterServiceWorker } from './serviceWorkerRegistration.ts';

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

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-red-400">Application Error</h2>
            <p className="text-sm text-slate-300">Something went wrong while rendering the app.</p>
            <pre className="text-xs bg-slate-950 p-3 rounded-xl text-red-300 overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl text-sm transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register service worker in production or unregister in dev to prevent cache conflicts
if ((import.meta as any).env?.PROD) {
  registerServiceWorker(() => {
    console.log('[CareFlow AI] Service Worker active & ready for offline caching.');
  });
} else {
  unregisterServiceWorker();
}



