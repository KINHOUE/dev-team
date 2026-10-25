import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fallback CSS du design system (variables --ds-*). Import en chemin relatif car
// le package n'expose pas de sous-chemin `styles.css` dans son champ `exports`.
import '../../../packages/design-system/src/styles.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
