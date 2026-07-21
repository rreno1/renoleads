/**
 * RenoLeads Property Details Page Architecture Controller
 * Handles dynamic property rendering, leafet/map integration, amortization calculator, and app handoff
 */

document.addEventListener("DOMContentLoaded", async () => {
  const mainContainer = document.getElementById("property-detail-main");
  if (!mainContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  let propertyId = urlParams.get("id");

  // Fallback check for URL path rewrite e.g. /properties/POL-RES-001
  if (!propertyId && window.location.pathname.includes("/properties/")) {
    const parts = window.location.pathname.split("/").filter(Boolean);
    propertyId = parts[parts.length - 1];
  }

  if (!propertyId) propertyId = "POL-RES-001"; // Default catalog fallback

  const property = await fetchPropertyById(propertyId);

  // 1. Property Not Found Handling (Phase 7)
  if (!property) {
    document.title = "Property Not Found | RenoLeads";
    mainContainer.innerHTML = `
      <div class="container section-padding text-center">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <h2>Property Not Found</h2>
        <p style="margin-inline: auto; margin-bottom: 2rem;">The property listing you requested could not be located or may have been reserved.</p>
        <a href="properties.html" class="btn btn-accent btn-lg">Browse Available Land Lots</a>
      </div>
    `;
    return;
  }

  // 2. Set Page Metadata
  document.title = `${property.title} | RenoLeads Polomolok`;
  
  // Formatters
  const formattedPrice = DOMUtils.formatCurrency(property.totalPrice);
  const formattedPriceSqm = DOMUtils.formatCurrency(property.pricePerSqm);
  const formattedLotArea = DOMUtils.formatNumber(property.lotAreaSqm);

  // Status Badge Class
  const statusBadgeClass = property.status === 'available' ? 'badge-available' : (property.status === 'reserved' ? 'badge-reserved' : 'badge-sold');

  // Images Gallery Arrays
  const images = (property.imageUrls && property.imageUrls.length > 0) ? property.imageUrls : [property.thumbnailUrl];

  // Android App Handoff Link (Verified HTTPS format & Intent scheme fallback)
  const appHandoffUrl = `https://rreno1.github.io/renoleads/properties/${property.id}`;
  const appIntentUrl = `intent://rreno1.github.io/renoleads/properties/${property.id}#Intent;scheme=https;package=${RENO_CONFIG.androidPackage};S.browser_fallback_url=${encodeURIComponent(appHandoffUrl)};end;`;

  // Render Full Detail Component Structure
  mainContainer.innerHTML = `
    <!-- Breadcrumbs -->
    <nav class="property-breadcrumbs" aria-label="Breadcrumb navigation" style="margin-bottom: 1.5rem;">
      <a href="index.html">Home</a> &nbsp;/&nbsp; 
      <a href="properties.html">Properties</a> &nbsp;/&nbsp; 
      <span style="color: var(--color-text); font-weight: 600;">${DOMUtils.escapeHTML(property.propertyCode)}</span>
    </nav>

    <!-- Header Block -->
    <div class="property-details-header">
      <div>
        <span class="badge ${statusBadgeClass}">${property.status.toUpperCase()}</span>
        <h1 style="margin-top: 0.5rem; margin-bottom: 0.25rem;">${DOMUtils.escapeHTML(property.title)}</h1>
        <div style="color: var(--color-text-muted); font-size: 1.05rem; display: flex; align-items: center; gap: 0.4rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          Brgy. ${DOMUtils.escapeHTML(property.barangay)}, Polomolok, South Cotabato
        </div>
      </div>

      <div class="property-price-block">
        <span style="font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700; display: block;">Total Contract Price</span>
        <h2 style="color: var(--color-primary); margin: 0;">${formattedPrice}</h2>
        <span style="font-size: 0.95rem; font-weight: 700; color: var(--color-accent-hover);">${formattedPriceSqm} / sqm</span>
      </div>
    </div>

    <!-- Gallery Grid -->
    <div class="property-gallery-grid" style="margin-bottom: 2.5rem;">
      <div class="gallery-main">
        <img id="gallery-main-view" src="${images[0]}" alt="${DOMUtils.escapeHTML(property.title)}" width="800" height="500">
      </div>
      <div class="gallery-sub">
        ${images.slice(1, 3).map((img, idx) => `
          <div class="gallery-sub-item">
            <img src="${img}" alt="Property view ${idx + 2}" width="400" height="250" loading="lazy">
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Specifications Grid -->
    <div class="specs-grid" style="margin-bottom: 2.5rem;">
      <div class="spec-box">
        <span>Property Code</span>
        <strong>${DOMUtils.escapeHTML(property.propertyCode)}</strong>
      </div>
      <div class="spec-box">
        <span>Lot Area Size</span>
        <strong>${formattedLotArea} sqm</strong>
      </div>
      <div class="spec-box">
        <span>Document Status</span>
        <strong>${DOMUtils.escapeHTML(property.documentStatus || "Clean Title (TCT)")}</strong>
      </div>
      <div class="spec-box">
        <span>Payment Options</span>
        <strong>Cash / Installment</strong>
      </div>
    </div>

    <!-- Main Two-Column Layout -->
    <div class="details-layout">
      
      <!-- Left Column: Main Information -->
      <div>
        <div style="background: #FFF; padding: clamp(1.5rem, 4vw, 2.5rem); border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Property Description</h3>
          <p style="line-height: 1.7; font-size: 1.05rem;">${DOMUtils.escapeHTML(property.description)}</p>
        </div>

        <div style="background: #FFF; padding: clamp(1.5rem, 4vw, 2.5rem); border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Nearby Landmarks & Accessibility</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${(property.nearbyLandmarks || []).map(lm => `
              <li style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem; font-weight: 500;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                ${DOMUtils.escapeHTML(lm)}
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Location Map Preview -->
        <div style="background: #FFF; padding: clamp(1.5rem, 4vw, 2.5rem); border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Location Map Reference</h3>
          <div style="width: 100%; height: 300px; border-radius: var(--radius-sm); overflow: hidden; background: #E2E8F0; position: relative;">
            <iframe 
              width="100%" 
              height="100%" 
              style="border:0;" 
              loading="lazy" 
              allowfullscreen
              src="https://maps.google.com/maps?q=${property.latitude || 6.2192},${property.longitude || 125.0658}&hl=en&z=14&output=embed"
              title="Polomolok Property Location Map">
            </iframe>
          </div>
        </div>

        <!-- Payment Estimator Calculator -->
        <div class="calculator-card">
          <h3 style="margin-bottom: 0.5rem;">Sample Payment Calculator</h3>
          <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Sample estimate only. Final pricing and payment terms are subject to verification upon site tour.</p>

          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="form-group">
              <label for="calc-dp-slider">
                Down Payment Percentage: <strong id="calc-dp-percent-text">20%</strong>
              </label>
              <input type="range" id="calc-dp-slider" min="10" max="50" step="5" value="20" style="width: 100%;">
            </div>

            <div class="form-group">
              <label for="calc-term-select">Payment Term Length</label>
              <select id="calc-term-select" class="form-control">
                <option value="12">12 Months (1 Year)</option>
                <option value="24" selected>24 Months (2 Years)</option>
                <option value="36">36 Months (3 Years)</option>
                <option value="60">60 Months (5 Years)</option>
              </select>
            </div>

            <div class="calc-result-box" style="background: var(--color-primary-dark); color: #FFF; padding: 1.5rem; border-radius: var(--radius-md); text-align: center;">
              <span style="font-size: 0.88rem; color: rgba(255,255,255,0.75);">Est. Monthly Amortization (0% Interest Terms)</span>
              <h3 id="calc-monthly-result" style="color: var(--color-accent); font-size: 2rem; margin-top: 0.25rem;">₱0 / mo</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Sticky Sidebar -->
      <div class="property-sidebar">
        <!-- Site Visit Booking Form Card -->
        <div id="inquiry-form-card" style="background: #FFF; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: var(--shadow-md); margin-bottom: 2rem;">
          <h3 style="margin-bottom: 0.5rem;">Book a Site Visit</h3>
          <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Submit your details to schedule an on-site inspection with our accredited agent.</p>

          <div id="form-feedback" role="status" aria-live="polite" style="display: none; margin-bottom: 1.25rem; padding: 1rem; border-radius: 8px;"></div>

          <form id="lead-inquiry-form">
            <input type="hidden" name="propertyInterest" value="${DOMUtils.escapeHTML(property.propertyCode + ' - ' + property.title)}">
            <input type="hidden" name="inquiryType" value="site_visit">

            <div class="form-group" style="margin-bottom: 1rem;">
              <label for="fullName">Full Name *</label>
              <input type="text" id="fullName" name="fullName" class="form-control" placeholder="e.g. Juan Dela Cruz" required>
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label for="mobileNumber">Mobile Number *</label>
              <input type="tel" id="mobileNumber" name="mobileNumber" class="form-control" placeholder="e.g. 09171234567" required>
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label for="preferredDate">Preferred Date</label>
              <input type="date" id="preferredDate" name="preferredDate" class="form-control">
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label for="preferredContactMethod">Preferred Contact Channel</label>
              <select id="preferredContactMethod" name="preferredContactMethod" class="form-control">
                <option value="phone">Phone Call / SMS</option>
                <option value="viber">Viber</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="messenger">Facebook Messenger</option>
              </select>
            </div>

            <button type="submit" class="btn btn-accent" style="width: 100%;">Confirm Site Inspection</button>
          </form>
        </div>

        <!-- Android APK Handoff Card -->
        <div style="background: var(--color-surface-dark); color: #FFF; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--color-surface-dark-border);">
          <h4 style="color: #FFF; margin-bottom: 0.5rem;">RenoLeads App Handoff</h4>
          <p style="font-size: 0.88rem; color: rgba(255,255,255,0.75); margin-bottom: 1.25rem;">Are you the land owner or agent? Open this listing directly in the APK management app.</p>
          <a href="${appIntentUrl}" class="btn btn-app btn-sm" style="width: 100%;">Open in RenoLeads App</a>
        </div>
      </div>

    </div>
  `;

  // Calculator Logic
  const dpSlider = document.getElementById("calc-dp-slider");
  const dpText = document.getElementById("calc-dp-percent-text");
  const termSelect = document.getElementById("calc-term-select");
  const monthlyResult = document.getElementById("calc-monthly-result");

  function updateAmortization() {
    if (!dpSlider || !termSelect || !monthlyResult) return;
    const dpPercent = parseFloat(dpSlider.value);
    if (dpText) dpText.textContent = `${dpPercent}%`;

    const totalPrice = property.totalPrice;
    const downPayment = totalPrice * (dpPercent / 100);
    const remainingBalance = totalPrice - downPayment;
    const months = parseInt(termSelect.value) || 24;

    // Simple 0% Interest amortization division
    const monthlyPayment = remainingBalance / months;
    monthlyResult.textContent = `${DOMUtils.formatCurrency(monthlyPayment)} / mo`;
  }

  if (dpSlider) dpSlider.addEventListener("input", updateAmortization);
  if (termSelect) termSelect.addEventListener("change", updateAmortization);
  updateAmortization();
});
