import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { seedDemoOnFirstVisit } from './store/app';
import './index.css';

seedDemoOnFirstVisit();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* "user" = Framer Motion honours prefers-reduced-motion globally */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
