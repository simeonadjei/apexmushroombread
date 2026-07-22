import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// When deployed as a static site (e.g. Render), point API calls at the
// separate API server. Set VITE_API_URL to your Render API service URL.
// In Replit dev the proxy handles /api/* so no base URL is needed.
if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL as string);
}

createRoot(document.getElementById('root')!).render(<App />);
