/**
 * RenoLeads Properties Catalog & Featured Listings Controller (V2 Overhaul)
 * Handles intrinsic grids, SVG shortlist buttons, aria-pressed pill filters, dropdown filters, aria-live results, and clean empty states
 */

document.addEventListener("DOMContentLoaded", async () => {
  const gridContainer = document.getElementById("properties-grid-container") || document.getElementById("featured-properties-container");
  const statusFilter = document.getElementById("filter-status");
  const priceFilter = document.getElementById("filter-max-price");
  const sortFilter = document.getElementById("filter-sort");
  const clearBtn = document.getElementById("clear-filters-btn");
  const resultsCount = document.getElementById("properties-count");
  const pillBtns = document.querySelectorAll(".pill-btn");

  if (!gridContainer) return;

  const isHomepageFeatured = gridContainer.id === "featured-properties-container";
  let selectedCategory = "all";

  // Check URL query parameters e.g. properties.html?type=residential or ?filter=saved
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get("type");
  const filterParam = urlParams.get("filter");

  if (typeParam) {
    selectedCategory = typeParam;
  } else if (filterParam === "saved") {
    selectedCategory = "saved";
  }

  if (pillBtns.length > 0) {
    pillBtns.forEach(btn => {
      const isSelected = btn.dataset.type === selectedCategory;
      btn.classList.toggle("active", isSelected);
      btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  }

  // Loading Skeleton State
  gridContainer.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
      <p style="font-size: 1.1rem; color: var(--color-text-muted);">Loading available land lots in Polomolok...</p>
    </div>
  `;

  let allProperties = await fetchPublishedProperties();

  function renderListings(propertiesToRender) {
    // If on homepage featured section, limit display to 3 featured listings
    const displayProperties = isHomepageFeatured ? propertiesToRender.slice(0, 3) : propertiesToRender;

    // Update ARIA live results count
    if (resultsCount) {
      const count = displayProperties.length;
      resultsCount.textContent = `${count} Land Parcel${count === 1 ? '' : 's'} Found`;
    }

    // Empty State
    if (displayProperties.length === 0) {
      const isSavedFilter = selectedCategory === "saved";
      gridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1.5rem; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <h3>${isSavedFilter ? 'No Saved Lots Yet' : 'No properties match your filter selection'}</h3>
          <p style="color: var(--color-text-muted); margin: 0.5rem auto 1.5rem auto;">${isSavedFilter ? 'Click the heart icon on any land listing to save it to your device shortlist.' : 'Try resetting your filters or contacting our sales team for upcoming land lot releases in Polomolok.'}</p>
          <button id="reset-filters-action" class="btn btn-outline">Reset All Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById("reset-filters-action");
      if (resetBtn) {
        resetBtn.addEventListener("click", resetAllFilters);
      }
      return;
    }

    // Render Property Cards (Price in body, SVG heart icon)
    gridContainer.innerHTML = displayProperties.map(prop => {
      const statusClass = prop.status === 'available' ? 'badge-available' : (prop.status === 'reserved' ? 'badge-reserved' : 'badge-sold');
      const formattedPrice = DOMUtils.formatCurrency(prop.totalPrice);
      const formattedPriceSqm = DOMUtils.formatCurrency(prop.pricePerSqm);
      const thumbnail = prop.thumbnailUrl || 'assets/images/sample-res-1.jpg';
      const isSaved = RetentionManager.isShortlisted(prop.id);

      return `
        <article class="property-card">
          <div class="card-image-wrap">
            <span class="badge ${statusClass} card-status-badge">${DOMUtils.escapeHTML(prop.status.toUpperCase())}</span>
            <button class="card-shortlist-btn ${isSaved ? 'active' : ''}" data-id="${DOMUtils.escapeHTML(prop.id)}" aria-label="${isSaved ? 'Remove from saved lots' : 'Save lot to shortlist'}">
              <svg viewBox="0 0 24 24" fill="${isSaved ? 'var(--danger)' : 'none'}" stroke="${isSaved ? 'var(--danger)' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <a href="property.html?id=${encodeURIComponent(prop.id)}">
              <img src="${thumbnail}" alt="${DOMUtils.escapeHTML(prop.title)}" width="400" height="250" loading="lazy" onerror="this.src='assets/images/sample-res-1.jpg'">
            </a>
          </div>
          <div class="card-body">
            <div class="card-price-row">
              <div class="card-price">${formattedPrice}</div>
              <div class="card-price-sqm">${formattedPriceSqm}/sqm</div>
            </div>
            
            <a href="property.html?id=${encodeURIComponent(prop.id)}" style="text-decoration: none;">
              <h3 class="card-title">${DOMUtils.escapeHTML(prop.title)}</h3>
            </a>

            <div class="card-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Brgy. ${DOMUtils.escapeHTML(prop.barangay)}, Polomolok
            </div>

            <div class="card-features">
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                <span>${DOMUtils.formatNumber(prop.lotAreaSqm)} sqm</span>
              </div>
              <span style="color: var(--color-accent-text); font-weight: 700;">${DOMUtils.escapeHTML(prop.propertyType.toUpperCase())}</span>
            </div>

            <div class="card-footer">
              <a href="property.html?id=${encodeURIComponent(prop.id)}" class="btn btn-outline btn-sm">View Details</a>
              <a href="contact.html?property=${encodeURIComponent(prop.propertyCode + ' - ' + prop.title)}" class="btn btn-accent btn-sm">Quick Inquire</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function applyFilters() {
    let filtered = [...allProperties];

    const sectionTagline = document.querySelector(".section-header .tagline");
    const sectionTitle = document.querySelector(".section-header h1");
    const sectionDesc = document.querySelector(".section-header p");

    if (selectedCategory === "saved") {
      const savedIds = RetentionManager.getShortlist();
      filtered = filtered.filter(p => savedIds.includes(p.id));
      if (sectionTagline) sectionTagline.textContent = "Saved Shortlist";
      if (sectionTitle) sectionTitle.textContent = "Your Shortlisted Land Lots";
      if (sectionDesc) sectionDesc.textContent = "Review land parcels you have saved to your local device shortlist.";
    } else {
      if (sectionTagline) sectionTagline.textContent = "Exclusive Inventory";
      if (sectionTitle) sectionTitle.textContent = "Available Land Lots in Polomolok";
      if (sectionDesc) sectionDesc.textContent = "Filter clean-title residential homesteads, farm lots, and commercial land parcels in South Cotabato.";
      if (selectedCategory !== "all") {
        filtered = filtered.filter(p => p.propertyType === selectedCategory);
      }
    }

    if (statusFilter && statusFilter.value !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter.value);
    }

    if (priceFilter && priceFilter.value !== "all") {
      const maxPrice = parseFloat(priceFilter.value);
      filtered = filtered.filter(p => p.totalPrice <= maxPrice);
    }

    if (sortFilter) {
      if (sortFilter.value === "price-asc") {
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
      } else if (sortFilter.value === "price-desc") {
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
      } else if (sortFilter.value === "area-desc") {
        filtered.sort((a, b) => b.lotAreaSqm - a.lotAreaSqm);
      }
    }

    renderListings(filtered);
  }

  function resetAllFilters() {
    selectedCategory = "all";
    if (pillBtns.length > 0) {
      pillBtns.forEach(btn => {
        const isAll = btn.dataset.type === "all";
        btn.classList.toggle("active", isAll);
        btn.setAttribute("aria-pressed", isAll ? "true" : "false");
      });
    }
    if (statusFilter) statusFilter.value = "available";
    if (priceFilter) priceFilter.value = "all";
    if (sortFilter) sortFilter.value = "price-asc";
    applyFilters();
  }

  // Pill click handlers
  if (pillBtns.length > 0) {
    pillBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        pillBtns.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        selectedCategory = btn.dataset.type;
        applyFilters();
      });
    });
  }

  if (statusFilter) statusFilter.addEventListener("change", applyFilters);
  if (priceFilter) priceFilter.addEventListener("change", applyFilters);
  if (sortFilter) sortFilter.addEventListener("change", applyFilters);
  if (clearBtn) clearBtn.addEventListener("click", resetAllFilters);

  // Initial Render
  applyFilters();
});
