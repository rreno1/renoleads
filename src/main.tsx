import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/app.css';
import './styles/forms.css';
import './styles/catalog.css';
import { App } from './App';
import { captureAttribution } from './lib/propertyApi';
import { PropertyProvider } from './state/PropertyContext';

captureAttribution();

const root = document.getElementById('root');
if (!root) throw new Error('renoleads root element is missing');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <PropertyProvider>
        <App/>
      </PropertyProvider>
    </BrowserRouter>
  </StrictMode>,
);
