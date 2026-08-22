import { config } from '../config';
import type { Attribution, InquiryInput, InquiryResult, Property, PropertyMedia } from '../types';

class RenoApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 0) {
    super(message);
    this.name = 'RenoApiError';
    this.code = code || 'request-failed';
    this.status = status;
  }
}

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

function requestId() {
  return globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function callPublicApi(action: string, payload: JsonObject = {}): Promise<JsonObject> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), config.backend.timeoutMs);

  try {
    const response = await fetch(config.backend.endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      referrerPolicy: 'strict-origin-when-cross-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Request-Id': requestId(),
      },
      body: JSON.stringify({ action, payload }),
      signal: controller.signal,
    });

    const body: unknown = await response.json().catch(() => null);
    if (!isObject(body)) throw new RenoApiError('invalid-response', 'The server returned an invalid response.', response.status);

    if (!response.ok || body.ok !== true) {
      const error = isObject(body.error) ? body.error : {};
      throw new RenoApiError(text(error.code) || `http-${response.status}`, text(error.message) || 'The request could not be completed.', response.status);
    }
    return body;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new RenoApiError('timeout', 'The request took too long. Please try again.');
    }
    if (error instanceof RenoApiError) throw error;
    throw new RenoApiError('network', 'The property service could not be reached.');
  } finally {
    window.clearTimeout(timeout);
  }
}

function normalizeMedia(value: unknown): PropertyMedia[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isObject(entry) || !text(entry.url)) return [];
    const order = Number(entry.sortOrder);
    return [{
      url: text(entry.url),
      alt: text(entry.alt),
      sortOrder: Number.isFinite(order) ? order : 0,
    }];
  });
}

function normalizeProperty(value: unknown): Property | null {
  if (!isObject(value) || !text(value.id)) return null;
  const location = isObject(value.location) ? value.location : {};
  const area = Number(value.areaSqm);
  const price = value.displayPrice === null || value.displayPrice === undefined || value.displayPrice === '' ? Number.NaN : Number(value.displayPrice);
  const lotNumber = text(value.lotNumber);

  return {
    id: text(value.id),
    slug: text(value.slug),
    title: text(value.title) || (lotNumber ? `Lot ${lotNumber}` : 'Available land lot'),
    project: text(value.project),
    phase: text(value.phase),
    block: text(value.block),
    lotNumber,
    areaSqm: Number.isFinite(area) ? area : null,
    displayPrice: Number.isFinite(price) ? price : null,
    municipality: text(location.municipality),
    province: text(location.province),
    description: text(value.description),
    media: normalizeMedia(value.media),
    updatedAt: text(value.updatedAt) || null,
  };
}

export async function fetchPublishedProperties(): Promise<Property[]> {
  const body = await callPublicApi('public-properties');
  const data = isObject(body.data) ? body.data : {};
  const properties = Array.isArray(data.properties) ? data.properties : [];
  return properties.flatMap((property) => {
    const normalized = normalizeProperty(property);
    return normalized ? [normalized] : [];
  });
}

const ATTRIBUTION_KEY = 'renoleads_attribution_v2';

function safeCurrentAttribution(): Omit<Attribution, 'source'> {
  const url = new URL(window.location.href);
  let previous: Partial<Omit<Attribution, 'source'>> = {};
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) ?? 'null');
    if (isObject(parsed)) {
      previous = {
        landingPage: text(parsed.landingPage),
        referrer: text(parsed.referrer),
        utmSource: text(parsed.utmSource),
        utmMedium: text(parsed.utmMedium),
        utmCampaign: text(parsed.utmCampaign),
        utmContent: text(parsed.utmContent),
        utmTerm: text(parsed.utmTerm),
      };
    }
  } catch {
    previous = {};
  }

  return {
    landingPage: previous.landingPage || url.href.slice(0, 500),
    referrer: previous.referrer || document.referrer.slice(0, 500),
    utmSource: previous.utmSource || url.searchParams.get('utm_source') || '',
    utmMedium: previous.utmMedium || url.searchParams.get('utm_medium') || '',
    utmCampaign: previous.utmCampaign || url.searchParams.get('utm_campaign') || '',
    utmContent: previous.utmContent || url.searchParams.get('utm_content') || '',
    utmTerm: previous.utmTerm || url.searchParams.get('utm_term') || '',
  };
}

export function captureAttribution(): Attribution {
  const attribution = safeCurrentAttribution();
  try {
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Attribution is best effort; inquiry submission must remain functional.
  }
  return { source: config.backend.source, ...attribution };
}

export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  const body = await callPublicApi('submit-property-inquiry', {
    propertyId: input.propertyId,
    fullName: input.fullName,
    mobileNumber: input.mobileNumber,
    email: input.email || null,
    inquiryType: input.inquiryType || null,
    preferredDate: input.preferredDate || null,
    preferredContactMethod: input.preferredContactMethod || null,
    message: input.message || null,
    consent: {
      accepted: input.consent,
      noticeVersion: config.backend.privacyNoticeVersion,
    },
    attribution: captureAttribution(),
  });

  return {
    requestId: text(body.requestId),
    message: text(body.message) || 'Inquiry received.',
  };
}

export { RenoApiError };
