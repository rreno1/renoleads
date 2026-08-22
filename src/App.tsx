import { Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyPage } from './pages/PropertyPage';
import { BuyingProcessPage, PrivacyPage, WhyPolomolokPage } from './pages/StaticPages';

export function App() {
  return <Layout><Routes>
    <Route path="/" element={<HomePage/>}/>
    <Route path="/properties" element={<PropertiesPage/>}/>
    <Route path="/property/:id" element={<PropertyPage/>}/>
    <Route path="/contact" element={<ContactPage/>}/>
    <Route path="/privacy" element={<PrivacyPage/>}/>
    <Route path="/buying-process" element={<BuyingProcessPage/>}/>
    <Route path="/why-polomolok" element={<WhyPolomolokPage/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes></Layout>;
}

function NotFound() {
  return <section className="section-padding"><div className="container"><div className="empty-state" data-reveal="up"><h1 className="empty-state-title">Page not found</h1><p className="empty-state-text">The page does not exist or is no longer published.</p><Link className="btn btn-primary" to="/">Return home</Link></div></div></section>;
}
