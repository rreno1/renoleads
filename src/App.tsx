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
    <Route path="/index.html" element={<HomePage/>}/>
    <Route path="/properties" element={<PropertiesPage/>}/>
    <Route path="/properties.html" element={<PropertiesPage/>}/>
    <Route path="/property/:id" element={<PropertyPage/>}/>
    <Route path="/property" element={<PropertyPage/>}/>
    <Route path="/property.html" element={<PropertyPage/>}/>
    <Route path="/contact" element={<ContactPage/>}/>
    <Route path="/contact.html" element={<ContactPage/>}/>
    <Route path="/privacy" element={<PrivacyPage/>}/>
    <Route path="/privacy.html" element={<PrivacyPage/>}/>
    <Route path="/buying-process" element={<BuyingProcessPage/>}/>
    <Route path="/buying-process.html" element={<BuyingProcessPage/>}/>
    <Route path="/why-polomolok" element={<WhyPolomolokPage/>}/>
    <Route path="/why-invest" element={<WhyPolomolokPage/>}/>
    <Route path="/why-invest.html" element={<WhyPolomolokPage/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes></Layout>;
}

function NotFound() {
  return <section className="section-padding"><div className="container"><div className="empty-state"><h1 className="empty-state-title">Page not found</h1><p className="empty-state-text">The page may have moved during the RenoLeads modernization.</p><Link className="btn btn-primary" to="/">Return home</Link></div></div></section>;
}
