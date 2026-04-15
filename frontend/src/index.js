import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: { background: '#1a1a2e', color: '#fff', borderRadius: '8px' },
        success: { iconTheme: { primary: '#e94560', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
);
