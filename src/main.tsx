import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/manrope';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import './styles/components.css';
import './styles/pages.css';
import './pwa/install';
import { App } from './App';
import { initializeApp } from './services/bootstrap';

registerSW({ immediate: true });

function hideSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('is-hidden');
  window.setTimeout(() => splash.remove(), 600);
}

initializeApp()
  .catch((err) => console.error('Falha ao preparar o armazenamento local', err))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    requestAnimationFrame(hideSplash);
  });
