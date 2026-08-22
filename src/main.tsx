import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '../css/tokens.css';
import '../css/base.css';
import '../css/components.css';
import '../css/pages.css';
import '../css/responsive.css';
import { App } from './App';
import { captureAttribution } from './lib/nj125Api';
import { PropertyProvider } from './state/PropertyContext';

captureAttribution();

const root = document.getElementById('root');
if (!root) throw new Error('RenoLeads root element is missing');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <PropertyProvider>
        <App/>
      </PropertyProvider>
    </BrowserRouter>
  </StrictMode>,
);
