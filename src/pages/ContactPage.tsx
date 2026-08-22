import { useSearchParams } from 'react-router-dom';
import { InquiryForm } from '../components/InquiryForm';
import { usePageTitle } from '../hooks/usePageTitle';
import { useProperties } from '../state/PropertyContext';

export function ContactPage() {
  usePageTitle('Contact | renoleads');
  const [params] = useSearchParams();
  const { properties } = useProperties();
  const requestedId = params.get('property') ?? '';
  const property = requestedId ? properties.find((item) => item.id === requestedId || item.slug === requestedId) ?? null : null;

  return <>
    <section className="support-hero"><div className="container" data-reveal="up"><span className="hero-eyebrow">Start a focused conversation</span><h1>Ask about a lot or plan a site visit.</h1><p>Submit the details needed to respond to your inquiry. renoleads sends the request directly into the property operations workflow.</p></div></section>
    <section className="support-content"><div className="container support-grid"><div data-reveal="left"><span className="section-eyebrow">Inquiry</span><h2>{property ? `About ${property.title}` : 'Tell us what you are looking for.'}</h2><p>{property ? 'This form is linked to the exact published lot you selected.' : 'You can send a general inquiry even if you have not selected a property yet.'}</p><p className="text-muted">Your inquiry is sent securely when you submit. It is not buffered in browser storage if the service is unavailable.</p></div><div className="sidebar-card" data-reveal="right"><InquiryForm property={property}/></div></div></section>
  </>;
}
