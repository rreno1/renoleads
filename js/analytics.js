/**
 * Firebase Analytics & Funnel Activity Tracker
 */

function trackFunnelEvent(eventName, eventParams = {}) {
  console.log(`[Analytics Event] ${eventName}:`, eventParams);
  
  if (
    typeof firebase !== 'undefined' &&
    typeof isFirebaseActive !== 'undefined' &&
    isFirebaseActive &&
    firebase.analytics
  ) {
    try {
      firebase.analytics().logEvent(eventName, eventParams);
    } catch (err) {
      console.warn("Analytics logging exception:", err);
    }
  }
}

// Track page view automatically
document.addEventListener("DOMContentLoaded", () => {
  trackFunnelEvent('page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
});
