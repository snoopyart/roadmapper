import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { RoadmapProvider } from './context/RoadmapContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RoadmapProvider>
        <App />
      </RoadmapProvider>
    </AuthProvider>
  </StrictMode>
);
