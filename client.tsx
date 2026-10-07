import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './app/page';
const Admin = React.lazy(() => import('./app/studio'));
import './app/globals.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {location.pathname.startsWith('/admin') ? <React.Suspense fallback={<p role="status">Loading editor…</p>}><Admin /></React.Suspense> : <Home initialPath={location.pathname.replace(/\/$/, '')} />}
  </React.StrictMode>,
);
