/**
 * RenoLeads V2 Property Details Page Controller
 * Handles interactive gallery preview, thumbnail swapping, lightbox modal, specification list, location map, payment calculator, and contextual mobile action bar
 */

document.addEventListener("DOMContentLoaded", async () => {
  const mainContainer = document.getElementById("property-detail-main");
  if (!mainContainer) return;

  // Add body class for mobile contextual bar display (Section 7.3)
  document.body.classList.add("page-property-detail");

  const urlParams = new URLSearchParams(window.location.search);
  let propertyId = urlParams.get("id");

  if (!propertyId && window.location.pathname.includes("/properties/")) {
    const parts = window.location.pathname.split("/").filter(Boolean);
    propertyId = parts[parts.length - 1];
  }

  if (!propertyId) propertyId = "POL-RES-001";

  const property = await fetchPropertyById(propertyId);

  // 1. Property Not Found Handling (Section 12.12)
  if (!property) {
    document.title = "Property Not Found | RenoLeads";
    mainContainer.innerHTML = `
      <div class="container section-padding text-center">
        <h2>Property Not Found</h2>
        <p class="mx-auto mb-2">The property listing you requested could not be located or may have been reserved.</p>
        <a href="properties.html" class="btn btn-accent btn-lg">Browse Available Land Lots</a>
      </div>
    `;
    return;
  }

  // 2. Log Property to Recently Viewed (Layer 4 Retention)
  RetentionManager.addRecentlyViewed(property.id);

  document.title = `${property.title} | RenoLeads Polomolok`;
  
  const formattedPrice = DOMUtils.formatCurrency(property.totalPrice);
  const formattedPriceSqm = DOMUtils.formatCurrency(property.pricePerSqm);
  const formattedLotArea = DOMUtils.formatNumber(property.lotAreaSqm);

  const statusBadgeClass = property.status === 'available' ? 'badge-available' : (property.status === 'reserved' ? 'badge-reserved' : 'badge-sold');
  const isSaved = RetentionManager.isShortlisted(property.id);

  const images = (property.imageUrls && property.imageUrls.length > 0) ? property.imageUrls : [property.thumbnailUrl];

  const appHandoffUrl = `https://rreno1.github.io/renoleads/properties/${property.id}`;
  const appIntentUrl = `intent://rreno1.github.io/renoleads/properties/${property.id}#Intent;scheme=https;package=${RENO_CONFIG.androidPackage};S.browser_fallback_url=${encodeURIComponent(appHandoffUrl)};end;`;

  // Gallery Thumbnails: Filter out main image (images[0]) to eliminate photo duplication
  const thumbnailImages = images.length > 1 ? images.slice(1) : images;

  mainContainer.innerHTML = `
    <!-- Top Action & Breadcrumb Bar -->
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; padding-top: 1.25rem;">
      <nav class="property-breadcrumbs" aria-label="Breadcrumb navigation">
        <a href="index.html">Home</a> &nbsp;/&nbsp; 
        <a href="properties.html">Properties</a> &nbsp;/&nbsp; 
        <span style="color: var(--color-text); font-weight: 600;">${DOMUtils.escapeHTML(property.propertyCode)}</span>
      </nav>

      <!-- Status Badge & Retention Actions (Share & Shortlist) -->
      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <span class="badge ${statusBadgeClass}" style="height: 40px; padding: 0 1rem; border-radius: var(--radius-sm); font-size: 0.82rem; min-height: 40px; display: inline-flex; align-items: center;">${property.status.toUpperCase()}</span>
        <button class="btn btn-outline btn-sm btn-share-trigger" data-title="${DOMUtils.escapeHTML(property.title)}" data-text="Check out this prime land lot in Polomolok:" data-url="${window.location.href}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share Listing
        </button>
        <button class="btn btn-outline btn-sm card-shortlist-btn ${isSaved ? 'active' : ''}" data-id="${DOMUtils.escapeHTML(property.id)}" style="position: static; width: auto; height: 40px; padding: 0 1rem; border-radius: var(--radius-sm);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'var(--danger)' : 'none'}" stroke="${isSaved ? 'var(--danger)' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: 0.35rem;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>${isSaved ? 'Saved to Shortlist' : 'Save to Shortlist'}</span>
        </button>
      </div>
    </div>

    <!-- Editorial Property Header -->
    <div style="margin-bottom: 1.5rem;">
      <div style="color: var(--color-text-muted); font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.35rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Brgy. ${DOMUtils.escapeHTML(property.barangay)}, Polomolok, South Cotabato
      </div>

      <h1 style="margin: 0; font-size: clamp(1.8rem, 4vw, 2.75rem); line-height: 1.18; font-family: var(--font-display);">${DOMUtils.escapeHTML(property.title)}</h1>
    </div>

    <!-- Interactive Gallery Preview (Section 17.3) -->
    <div class="property-gallery-grid" style="margin-bottom: 2rem;">
      <div class="gallery-main">
        <img id="gallery-main-view" src="${images[0]}" alt="${DOMUtils.escapeHTML(property.title)}" width="800" height="500" style="cursor: pointer;" title="Click image to swap preview">
      </div>
      <div class="gallery-sub">
        ${thumbnailImages.map((img, idx) => `
          <button type="button" class="gallery-sub-item ${idx === 0 ? 'active' : ''}" data-src="${img}" aria-label="View photo ${idx + 2}">
            <img src="${img}" alt="Property view ${idx + 2}" width="400" height="250" loading="lazy">
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Consolidated Key Specifications Summary Card (Zero Duplication) -->
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; background: var(--color-surface); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.85); padding: 1.25rem 1.75rem; border-radius: var(--radius-md); box-shadow: var(--glass-shadow); margin-bottom: 2.5rem;">
      <div>
        <span style="font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Total Contract Price</span>
        <div style="font-family: var(--font-display); font-size: 2.25rem; font-weight: 700; color: var(--color-primary); line-height: 1.1;">${formattedPrice}</div>
        <span style="font-size: 0.9rem; font-weight: 600; color: var(--color-accent-text); font-family: var(--font-body); display: block; margin-top: 0.15rem;">${formattedPriceSqm} / sqm</span>
      </div>

      <div style="display: flex; align-items: center; gap: 1.75rem; flex-wrap: wrap;">
        <div style="border-left: 2px solid var(--border); padding-left: 1.5rem;">
          <span style="font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Lot Area</span>
          <div style="font-size: 1.35rem; font-weight: 700; color: var(--color-primary);">${formattedLotArea} sqm</div>
        </div>

        <div style="border-left: 2px solid var(--border); padding-left: 1.5rem;">
          <span style="font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Land Title Status</span>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--status-available);">${DOMUtils.escapeHTML(property.documentStatus || "Clean Title (TCT)")}</div>
        </div>

        <div style="border-left: 2px solid var(--border); padding-left: 1.5rem;">
          <span style="font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block;">Payment Terms</span>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary);">Cash / Installment</div>
        </div>
      </div>
    </div>

    <!-- Main Two-Column Layout -->
    <div class="details-layout">
      
      <!-- Left Column: Main Information -->
      <div>
        <div style="background: var(--color-surface); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); padding: clamp(1.5rem, 4vw, 2.5rem); border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.85); box-shadow: var(--glass-shadow); margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Property Description</h3>
          <p style="line-height: 1.7; font-size: 1.05rem;">${DOMUtils.escapeHTML(property.description)}</p>
        </div>

        <div style="background: var(--color-surface); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); padding: clamp(1.5rem, 4vw, 2.5rem); border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.85); box-shadow: var(--glass-shadow); margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Nearby Landmarks & Accessibility</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${(property.nearbyLandmarks || []).map(lm => `
              <li style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem; font-weight: 500;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                ${DOMUtils.escapeHTML(lm)}
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Location Map Preview -->
        <div style="background: var(--color-surface); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); padding: clamp(1.5rem, 4vw, 2.5rem); border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.85); box-shadow: var(--glass-shadow); margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Location Map Reference</h3>
          <div class="map-container">
            <iframe 
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

            <div class="calc-result-box">
              <span style="font-size: 0.88rem; color: rgba(255,255,255,0.75);">Est. Monthly Amortization (0% Interest Terms)</span>
              <h3 id="calc-monthly-result" style="color: var(--bronze-300); font-family: var(--font-display); font-size: 2rem; margin-top: 0.25rem;">₱0 / mo</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Sticky Sidebar -->
      <div class="property-sidebar">
        <!-- Site Visit Booking Form Card (Padded for Header Offset & Zero Cutoff) -->
        <div id="inquiry-form-card" style="background: var(--color-surface); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); padding: clamp(1.5rem, 3vw, 2.25rem); border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.85); box-shadow: var(--glass-shadow); margin-bottom: 2rem; scroll-margin-top: 110px;">
          <h3 style="margin-bottom: 0.5rem;">Book a Site Visit</h3>
          <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Submit your details to schedule an on-site inspection with our accredited agent.</p>

          <div id="form-feedback" class="feedback-alert" role="status" aria-live="polite" style="display: none;"></div>

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
        <div style="background: rgba(11, 31, 24, 0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); color: #FFF; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.18);">
          <h4 style="color: #FFF; margin-bottom: 0.5rem;">RenoLeads App Handoff</h4>
          <p style="font-size: 0.88rem; color: rgba(255,255,255,0.75); margin-bottom: 1.25rem;">Open this listing directly inside the RenoLeads Android app.</p>
          <a href="${appIntentUrl}" class="btn btn-app btn-sm" style="width: 100%;">Open in RenoLeads App</a>
        </div>
      </div>

    </div>

    <!-- Mobile Contextual 2-Action Bottom Bar (Section 7.3) -->
    <div class="property-bottom-bar">
      <a href="#inquiry-form-card" class="btn btn-accent">Book Visit</a>
      <a href="contact.html?property=${encodeURIComponent(property.propertyCode)}" class="btn btn-outline">Ask a Question</a>
    </div>
  `;

  // Gallery Thumbnail Click Handler (Section 17.3)
  const mainImg = document.getElementById("gallery-main-view");
  const thumbBtns = document.querySelectorAll(".gallery-sub-item");

  thumbBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const src = btn.dataset.src;
      if (mainImg && src) {
        mainImg.style.opacity = "0.4";
        setTimeout(() => {
          mainImg.src = src;
          mainImg.style.opacity = "1";
        }, 150);
      }
      thumbBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Calculator Logic with Number Safeguards
  const dpSlider = document.getElementById("calc-dp-slider");
  const dpText = document.getElementById("calc-dp-percent-text");
  const termSelect = document.getElementById("calc-term-select");
  const monthlyResult = document.getElementById("calc-monthly-result");

  function updateAmortization() {
    if (!dpSlider || !termSelect || !monthlyResult) return;
    const dpPercent = parseFloat(dpSlider.value) || 20;
    if (dpText) dpText.textContent = `${dpPercent}%`;

    const totalPrice = Number(property.totalPrice) || 0;
    const downPayment = totalPrice * (dpPercent / 100);
    const remainingBalance = Math.max(0, totalPrice - downPayment);
    const months = parseInt(termSelect.value) || 24;

    const monthlyPayment = months > 0 ? remainingBalance / months : 0;
    monthlyResult.textContent = `${DOMUtils.formatCurrency(monthlyPayment)} / mo`;
  }

  if (dpSlider) dpSlider.addEventListener("input", updateAmortization);
  if (termSelect) termSelect.addEventListener("change", updateAmortization);
  updateAmortization();
});
