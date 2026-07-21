/**
 * Property Details Controller
 * Handles dynamic property rendering by ID, gallery viewer, loan calculator, and Android App handoff link
 */

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  let propertyId = urlParams.get("id");

  // Fallback if URL rewrite used e.g. /properties/POL-RES-001
  if (!propertyId && window.location.pathname.includes("/properties/")) {
    const parts = window.location.pathname.split("/");
    propertyId = parts[parts.length - 1];
  }

  if (!propertyId) propertyId = "POL-RES-001"; // Default fallback

  const property = await fetchPropertyById(propertyId);
  if (!property) return;

  // Render Title & Basic Metadata
  document.title = `${property.title} | Land for Sale in Polomolok`;
  
  const titleEl = document.getElementById("property-title");
  if (titleEl) titleEl.textContent = property.title;

  const codeEl = document.getElementById("property-code");
  if (codeEl) codeEl.textContent = property.propertyCode || property.id;

  const locationEl = document.getElementById("property-location");
  if (locationEl) locationEl.textContent = `Brgy. ${property.barangay}, Polomolok, South Cotabato`;

  const statusBadge = document.getElementById("property-status-badge");
  if (statusBadge) {
    statusBadge.textContent = property.status.toUpperCase();
    statusBadge.className = `badge badge-${property.status}`;
  }

  const priceEl = document.getElementById("property-price");
  if (priceEl) {
    priceEl.textContent = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(property.totalPrice);
  }

  const priceSqmEl = document.getElementById("property-price-sqm");
  if (priceSqmEl) {
    priceSqmEl.textContent = `₱${property.pricePerSqm.toLocaleString()} / sqm`;
  }

  const areaEl = document.getElementById("property-area");
  if (areaEl) {
    areaEl.textContent = `${property.lotAreaSqm.toLocaleString()} sqm`;
  }

  const descEl = document.getElementById("property-description");
  if (descEl) {
    descEl.textContent = property.description;
  }

  const docEl = document.getElementById("property-doc-status");
  if (docEl) {
    docEl.textContent = property.documentStatus || "Clean Title (TCT)";
  }

  // Render Images Gallery
  const images = property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls : [property.thumbnailUrl];
  const galleryMain = document.getElementById("gallery-main-img");
  if (galleryMain && images[0]) {
    galleryMain.src = images[0];
  }

  const gallerySub1 = document.getElementById("gallery-sub-img-1");
  const gallerySub2 = document.getElementById("gallery-sub-img-2");
  if (gallerySub1 && images[1]) gallerySub1.src = images[1];
  if (gallerySub2 && images[2]) gallerySub2.src = images[2];

  // Render Nearby Landmarks
  const landmarksList = document.getElementById("landmarks-list");
  if (landmarksList && property.nearbyLandmarks) {
    landmarksList.innerHTML = property.nearbyLandmarks.map(lm => `
      <li style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        ${lm}
      </li>
    `).join('');
  }

  // Setup Android App Handoff Link
  const appBtn = document.getElementById("open-in-app-btn");
  if (appBtn) {
    const deepLinkUrl = `intent://yourdomain.com/properties/${property.id}#Intent;scheme=https;package=com.renoleads.app;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;
    appBtn.href = deepLinkUrl;
  }

  // Auto-fill hidden input fields in contact form
  const propInterestInput = document.getElementById("form-property-interest");
  if (propInterestInput) {
    propInterestInput.value = `${property.propertyCode} - ${property.title} (${property.lotAreaSqm} sqm)`;
  }

  // Amortization Calculator
  const calcDpSlider = document.getElementById("calc-dp-percent");
  const calcDpVal = document.getElementById("calc-dp-val");
  const calcTermSelect = document.getElementById("calc-term-years");
  const calcMonthlyRes = document.getElementById("calc-monthly-result");

  function calculateAmortization() {
    if (!calcDpSlider || !calcTermSelect || !calcMonthlyRes) return;

    const totalPrice = property.totalPrice;
    const dpPercent = parseFloat(calcDpSlider.value);
    if (calcDpVal) calcDpVal.textContent = `${dpPercent}%`;

    const downPayment = totalPrice * (dpPercent / 100);
    const loanAmount = totalPrice - downPayment;
    const termYears = parseInt(calcTermSelect.value);
    const totalMonths = termYears * 12;

    // Simple 7% annual interest estimation
    const annualInterestRate = 0.07;
    const monthlyRate = annualInterestRate / 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      monthlyPayment = loanAmount / totalMonths;
    }

    calcMonthlyRes.textContent = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(monthlyPayment);
  }

  if (calcDpSlider) calcDpSlider.addEventListener("input", calculateAmortization);
  if (calcTermSelect) calcTermSelect.addEventListener("change", calculateAmortization);
  calculateAmortization();
});
