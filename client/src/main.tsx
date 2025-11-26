import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { RoadmapProvider } from './context/RoadmapContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <RoadmapProvider>
          <App />
          <ToastContainer />
        </RoadmapProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
