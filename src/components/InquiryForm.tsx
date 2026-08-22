import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { RenoApiError, submitInquiry } from '../lib/nj125Api';
import type { InquiryInput, Property } from '../types';

const emptyForm: InquiryInput = {
  propertyId: null,
  fullName: '',
  mobileNumber: '',
  email: '',
  inquiryType: 'general',
  preferredDate: '',
  preferredContactMethod: 'call-or-text',
  message: '',
  consent: false,
};

export function InquiryForm({ property = null, compact = false }: { property?: Property | null; compact?: boolean }) {
  const [form, setForm] = useState<InquiryInput>(() => ({ ...emptyForm, propertyId: property?.id ?? null }));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ requestId: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const update = <K extends keyof InquiryInput>(key: K, value: InquiryInput[K]) => setForm((current) => ({ ...current, [key]: value }));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.consent) {
      setError('Please acknowledge the Privacy Notice before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitInquiry({ ...form, propertyId: property?.id ?? form.propertyId });
      setSuccess(result);
      setForm((current) => ({ ...emptyForm, propertyId: current.propertyId }));
    } catch (caught: unknown) {
      setError(caught instanceof RenoApiError ? caught.message : 'Your inquiry could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return <form className={compact ? 'inquiry-form inquiry-form-compact' : 'inquiry-form'} onSubmit={onSubmit} noValidate aria-busy={submitting}>
    {property ? <div className="form-group property-interest"><label htmlFor="propertyInterest">Selected property</label><input id="propertyInterest" value={property.title} readOnly aria-readonly="true"/></div> : null}

    <fieldset className="form-section">
      <legend>Contact details</legend>
      <div className="form-row">
        <div className="form-group"><label htmlFor="fullName"><span>Full name</span><span className="field-required">Required</span></label><input id="fullName" name="fullName" autoComplete="name" maxLength={160} required value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder="Your full name"/></div>
        <div className="form-group"><label htmlFor="mobileNumber"><span>Mobile number</span><span className="field-required">Required</span></label><input id="mobileNumber" name="mobileNumber" autoComplete="tel" inputMode="tel" maxLength={40} required value={form.mobileNumber} onChange={(event) => update('mobileNumber', event.target.value)} placeholder="09xx xxx xxxx"/></div>
      </div>
      <div className="form-group"><label htmlFor="email"><span>Email</span><span className="text-muted">Optional</span></label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@example.com"/></div>
    </fieldset>

    <fieldset className="form-section">
      <legend>Inquiry details</legend>
      <div className="form-row">
        <div className="form-group"><label htmlFor="inquiryType">What do you need?</label><select id="inquiryType" value={form.inquiryType} onChange={(event) => update('inquiryType', event.target.value)}><option value="general">General inquiry</option><option value="site-visit">Schedule a site visit</option><option value="pricing">Pricing and terms</option><option value="documents">Property documents</option></select></div>
        <div className="form-group"><label htmlFor="preferredContact">Preferred contact</label><select id="preferredContact" value={form.preferredContactMethod} onChange={(event) => update('preferredContactMethod', event.target.value)}><option value="call-or-text">Call or text</option><option value="email">Email</option><option value="viber">Viber</option><option value="messenger">Messenger</option></select></div>
      </div>
      <div className="form-group"><label htmlFor="preferredDate"><span>Preferred date</span><span className="text-muted">Optional</span></label><input id="preferredDate" type="date" min={minDate} value={form.preferredDate} onChange={(event) => update('preferredDate', event.target.value)}/></div>
      <div className="form-group"><label htmlFor="message"><span>Message</span><span className="text-muted">Optional</span></label><textarea id="message" rows={5} maxLength={2000} value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Tell us what you want to verify, ask about, or see during a site visit."/></div>
    </fieldset>

    <label className="consent-check"><input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)}/><span>I have read the <Link to="/privacy">Privacy Notice</Link> and agree that the information I submit may be used to respond to this inquiry.</span></label>
    {error ? <div className="form-status form-status-error" role="alert">{error}</div> : null}
    {success ? <div className="form-status form-status-success" role="status"><strong>{success.message}</strong>{success.requestId ? <span> Reference: {success.requestId}</span> : null}</div> : null}
    <button className="btn btn-accent btn-block" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send inquiry'}</button>
  </form>;
}
