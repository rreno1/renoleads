/**
 * RenoLeads public adapter for the shared NJ125 Supabase Edge API.
 * RenoLeads never talks to NJ125 database tables directly.
 */

class RenoApiError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = "RenoApiError";
    this.code = code || "request-failed";
    this.status = status;
  }
}

function apiRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function callNJ125PublicApi(action, payload = {}) {
  const endpoint = RENO_CONFIG?.backend?.endpoint;
  if (!endpoint) throw new RenoApiError("configuration", "The property service is not configured.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(RENO_CONFIG.backend.timeoutMs) || 12000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Request-Id": apiRequestId()
      },
      body: JSON.stringify({ action, payload }),
      signal: controller.signal
    });

    let body = null;
    try {
      body = await response.json();
    } catch {
      throw new RenoApiError("invalid-response", "The server returned an invalid response.", response.status);
    }

    if (!response.ok || body?.ok !== true) {
      const code = body?.error?.code || `http-${response.status}`;
      const message = body?.error?.message || "The request could not be completed.";
      throw new RenoApiError(code, message, response.status);
    }
    return body;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new RenoApiError("timeout", "The request took too long. Please try again.");
    }
    if (error instanceof RenoApiError) throw error;
    throw new RenoApiError("network", "The property service could not be reached.");
  } finally {
    clearTimeout(timer);
  }
}

function normalizePublicProperty(raw) {
  if (!raw || typeof raw !== "object" || !raw.id) return null;
  const media = Array.isArray(raw.media) ? raw.media.filter(item => item && typeof item.url === "string") : [];
  const area = Number(raw.areaSqm);
  const price = raw.displayPrice === null || raw.displayPrice === undefined || raw.displayPrice === "" ? null : Number(raw.displayPrice);
  const project = String(raw.project || "").trim();
  const phase = String(raw.phase || "").trim();
  const block = String(raw.block || "").trim();
  const lotNumber = String(raw.lotNumber || "").trim();
  const listingCode = [project, phase && `Phase ${phase}`, block && `Block ${block}`, lotNumber && `Lot ${lotNumber}`]
    .filter(Boolean)
    .join(" · ") || String(raw.slug || raw.id);

  return {
    id: String(raw.id),
    propertyCode: listingCode,
    slug: String(raw.slug || ""),
    title: String(raw.title || (lotNumber ? `Lot ${lotNumber}` : "Available land lot")),
    propertyType: "land",
    project,
    phase,
    block,
    lotNumber,
    barangay: "",
    municipality: String(raw.location?.municipality || ""),
    province: String(raw.location?.province || ""),
    lotAreaSqm: Number.isFinite(area) ? area : null,
    totalPrice: Number.isFinite(price) ? price : null,
    pricePerSqm: null,
    description: String(raw.description || ""),
    paymentOptions: [],
    thumbnailUrl: media[0]?.url || "",
    imageUrls: media.map(item => item.url),
    media,
    nearbyLandmarks: [],
    documentStatus: null,
    latitude: null,
    longitude: null,
    status: "available",
    published: true,
    featured: false,
    updatedAt: raw.updatedAt || null,
    createdAt: raw.updatedAt || null
  };
}

async function fetchPublishedProperties() {
  const body = await callNJ125PublicApi("public-properties");
  const rows = Array.isArray(body?.data?.properties) ? body.data.properties : [];
  return rows.map(normalizePublicProperty).filter(Boolean);
}

async function fetchPropertyById(propertyId) {
  const wanted = String(propertyId || "").trim();
  if (!wanted) return null;
  const properties = await fetchPublishedProperties();
  return properties.find(property => property.id === wanted || property.slug === wanted) || null;
}

const ATTRIBUTION_KEY = "renoleads_attribution_v1";

function captureAttribution() {
  try {
    const current = new URL(window.location.href);
    const previous = JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || "null") || {};
    const next = {
      landingPage: previous.landingPage || current.href.slice(0, 500),
      referrer: previous.referrer || String(document.referrer || "").slice(0, 500),
      utmSource: previous.utmSource || current.searchParams.get("utm_source") || "",
      utmMedium: previous.utmMedium || current.searchParams.get("utm_medium") || "",
      utmCampaign: previous.utmCampaign || current.searchParams.get("utm_campaign") || "",
      utmContent: previous.utmContent || current.searchParams.get("utm_content") || "",
      utmTerm: previous.utmTerm || current.searchParams.get("utm_term") || ""
    };
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
    return next;
  } catch {
    return {
      landingPage: window.location.href.slice(0, 500),
      referrer: String(document.referrer || "").slice(0, 500),
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      utmTerm: ""
    };
  }
}

function getAttribution() {
  const captured = captureAttribution();
  return {
    source: RENO_CONFIG.backend.source,
    ...captured
  };
}

async function submitInquiryToNJ125(inquiry) {
  const body = await callNJ125PublicApi("submit-property-inquiry", {
    propertyId: inquiry.propertyId || null,
    fullName: inquiry.fullName,
    mobileNumber: inquiry.mobileNumber,
    email: inquiry.email || null,
    inquiryType: inquiry.inquiryType || null,
    preferredDate: inquiry.preferredDate || null,
    preferredContactMethod: inquiry.preferredContactMethod || null,
    message: inquiry.message || null,
    consent: {
      accepted: inquiry.consent === true,
      noticeVersion: RENO_CONFIG.backend.privacyNoticeVersion
    },
    attribution: getAttribution()
  });

  return {
    success: true,
    requestId: String(body.requestId || ""),
    message: String(body.message || "Inquiry received.")
  };
}

captureAttribution();
window.RenoApiError = RenoApiError;
window.fetchPublishedProperties = fetchPublishedProperties;
window.fetchPropertyById = fetchPropertyById;
window.submitInquiryToNJ125 = submitInquiryToNJ125;
