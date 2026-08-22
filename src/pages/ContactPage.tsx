import { useSearchParams } from 'react-router-dom';
import { InquiryForm } from '../components/InquiryForm';
import { usePageTitle } from '../hooks/usePageTitle';
import { useProperties } from '../state/PropertyContext';

export function ContactPage() {
  usePageTitle('Contact | RenoLeads');
  const [params] = useSearchParams();
  const { properties } = useProperties();
  const requestedId = params.get('property') ?? '';
  const property = requestedId ? properties.find((item) => item.id === requestedId || item.slug === requestedId) ?? null : null;

  return <>
    <section className="support-hero"><div className="container"><span className="hero-eyebrow">Start a focused conversation</span><h1>Ask about a lot or plan a site visit.</h1><p>Submit the details needed to respond to your inquiry. RenoLeads sends the request directly into the shared NJ125 lead workflow.</p></div></section>
    <section className="support-content"><div className="container support-grid"><div><span className="section-eyebrow">Inquiry</span><h2>{property ? `About ${property.title}` : 'Tell us what you are looking for.'}</h2><p>{property ? 'This form is linked to the exact NJ125 lot you selected.' : 'You can send a general inquiry even if you have not selected a property yet.'}</p><p className="text-muted">Your inquiry is sent to NJ125 when you submit. It is not buffered in browser storage if the service is unavailable.</p></div><div className="sidebar-card"><InquiryForm property={property}/></div></div></section>
  </>;
}
