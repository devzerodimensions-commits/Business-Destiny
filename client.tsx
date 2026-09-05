import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './app/page';
import Admin from './app/studio';
import './app/globals.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {location.pathname.startsWith('/admin') ? <Admin /> : <Home />}
  </React.StrictMode>,
);
