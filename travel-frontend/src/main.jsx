import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root');

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (err) {
  root.innerHTML = `<div style="padding:2rem;color:red;font-family:monospace">
    <h2>App failed to load</h2><pre>${err.message}\n${err.stack}</pre>
  </div>`;
}
