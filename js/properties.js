/**
 * RenoLeads Properties Catalog Page Controller
 * Handles intrinsic grids, shortlist retention, aria-pressed pill filters, dropdown filters, aria-live results, and clean empty states
 */

document.addEventListener("DOMContentLoaded", async () => {
  const gridContainer = document.getElementById("properties-grid-container");
  const statusFilter = document.getElementById("filter-status");
  const priceFilter = document.getElementById("filter-max-price");
  const sortFilter = document.getElementById("filter-sort");
  const clearBtn = document.getElementById("clear-filters-btn");
  const resultsCount = document.getElementById("properties-count");
  const pillBtns = document.querySelectorAll(".pill-btn");

  if (!gridContainer) return;

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

  pillBtns.forEach(btn => {
    const isSelected = btn.dataset.type === selectedCategory;
    btn.classList.toggle("active", isSelected);
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  // Loading Skeleton State
  gridContainer.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
      <p style="font-size: 1.1rem; color: var(--color-text-muted);">Loading available land lots in Polomolok...</p>
    </div>
  `;

  let allProperties = await fetchPublishedProperties();

  function renderListings(propertiesToRender) {
    // Update ARIA live results count
    if (resultsCount) {
      const count = propertiesToRender.length;
      resultsCount.textContent = `${count} Land Parcel${count === 1 ? '' : 's'} Found`;
    }

    // Empty State
    if (propertiesToRender.length === 0) {
      const isSavedFilter = selectedCategory === "saved";
      gridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1.5rem; background: #FFF; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;" aria-hidden="true">${isSavedFilter ? '❤️' : '🍃'}</div>
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

    // Render Cards
    gridContainer.innerHTML = propertiesToRender.map(prop => {
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
              ${isSaved ? '❤️' : '🤍'}
            </button>
            <img src="${thumbnail}" alt="${DOMUtils.escapeHTML(prop.title)}" width="400" height="250" loading="lazy" onerror="this.src='assets/images/sample-res-1.jpg'">
            <div class="card-price-tag">${formattedPrice}</div>
          </div>
          <div class="card-body">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent-hover); text-transform: uppercase; margin-bottom: 0.25rem;">
              ${DOMUtils.escapeHTML(prop.propertyType.toUpperCase())} LOT
            </span>
            <h3 class="card-title">${DOMUtils.escapeHTML(prop.title)}</h3>
            <div class="card-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              Brgy. ${DOMUtils.escapeHTML(prop.barangay)}, Polomolok
            </div>

            <div class="card-features">
              <div class="feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                <span>${DOMUtils.formatNumber(prop.lotAreaSqm)} sqm</span>
              </div>
              <div class="feature-item">
                <span>${formattedPriceSqm}/sqm</span>
              </div>
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

    if (selectedCategory === "saved") {
      const savedIds = RetentionManager.getShortlist();
      filtered = filtered.filter(p => savedIds.includes(p.id));
    } else if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.propertyType === selectedCategory);
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
    pillBtns.forEach(btn => {
      const isAll = btn.dataset.type === "all";
      btn.classList.toggle("active", isAll);
      btn.setAttribute("aria-pressed", isAll ? "true" : "false");
    });
    if (statusFilter) statusFilter.value = "available";
    if (priceFilter) priceFilter.value = "all";
    if (sortFilter) sortFilter.value = "price-asc";
    applyFilters();
  }

  // Pill click handlers
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

  if (statusFilter) statusFilter.addEventListener("change", applyFilters);
  if (priceFilter) priceFilter.addEventListener("change", applyFilters);
  if (sortFilter) sortFilter.addEventListener("change", applyFilters);
  if (clearBtn) clearBtn.addEventListener("click", resetAllFilters);

  // Initial Render
  applyFilters();
});
