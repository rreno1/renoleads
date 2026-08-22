/**
 * RenoLeads local funnel event bridge.
 * Phase 2 intentionally sends no analytics data to Firebase or another analytics backend.
 */
function trackFunnelEvent(eventName, eventParams = {}) {
  const safeName = String(eventName || "event").slice(0, 80);
  const detail = eventParams && typeof eventParams === "object" && !Array.isArray(eventParams) ? eventParams : {};
  document.dispatchEvent(new CustomEvent("renoleads:funnel-event", {
    detail: { name: safeName, params: detail }
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  trackFunnelEvent("page_view", {
    page_title: document.title,
    page_path: window.location.pathname
  });
});

window.trackFunnelEvent = trackFunnelEvent;
