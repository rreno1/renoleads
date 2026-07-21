/**
 * Properties Catalog Page Controller
 * Handles pill filters, dropdown filters, search inputs, and dynamic property rendering.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const gridContainer = document.getElementById("properties-grid-container");
  const statusFilter = document.getElementById("filter-status");
  const priceFilter = document.getElementById("filter-max-price");
  const sortFilter = document.getElementById("filter-sort");
  const resultsCount = document.getElementById("properties-count");
  const pillBtns = document.querySelectorAll(".pill-btn");

  let selectedCategory = "all";

  // Check URL param for pre-selected type e.g. properties.html?type=residential
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get("type");
  if (typeParam) {
    selectedCategory = typeParam;
    pillBtns.forEach(btn => {
      if (btn.dataset.type === typeParam) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  if (!gridContainer) return;

  gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;"><p>Loading available land lots in Polomolok...</p></div>`;
  
  let allProperties = await fetchPublishedProperties();

  function renderListings(propertiesToRender) {
    if (resultsCount) {
      resultsCount.textContent = `${propertiesToRender.length} Lot${propertiesToRender.length === 1 ? '' : 's'} Found`;
    }

    if (propertiesToRender.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: #FFF; border-radius: 16px;">
          <h3>No properties match your selected criteria</h3>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your filters or contact us to inquire about upcoming land lot releases.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = propertiesToRender.map(prop => {
      const statusClass = prop.status === 'available' ? 'badge-available' : (prop.status === 'reserved' ? 'badge-reserved' : 'badge-sold');
      const formattedPrice = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(prop.totalPrice);
      const thumbnail = prop.thumbnailUrl || 'assets/images/sample-res-1.jpg';

      return `
        <div class="property-card">
          <div class="card-image-wrap">
            <span class="badge ${statusClass} card-status-badge">${prop.status.toUpperCase()}</span>
            <img src="${thumbnail}" alt="${prop.title}" loading="lazy" onerror="this.src='assets/images/sample-res-1.jpg'">
            <div class="card-price-tag">${formattedPrice}</div>
          </div>
          <div class="card-body">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent); text-transform: uppercase; margin-bottom: 0.2rem;">
              ${prop.propertyType.toUpperCase()} LOT
            </span>
            <h3 class="card-title">${prop.title}</h3>
            <div class="card-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              Brgy. ${prop.barangay}, Polomolok, South Cotabato
            </div>

            <div class="card-features">
              <div class="feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                <span>${prop.lotAreaSqm.toLocaleString()} sqm</span>
              </div>
              <div class="feature-item">
                <span>₱${prop.pricePerSqm.toLocaleString()}/sqm</span>
              </div>
            </div>

            <div class="card-footer">
              <a href="property.html?id=${prop.id}" class="btn btn-outline btn-sm">Details & Map</a>
              <a href="contact.html?property=${encodeURIComponent(prop.propertyCode + ' - ' + prop.title)}" class="btn btn-accent btn-sm">Quick Inquire</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function applyFilters() {
    let filtered = [...allProperties];

    // Filter by Pill Category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.propertyType === selectedCategory);
    }

    // Filter by status
    if (statusFilter && statusFilter.value !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter.value);
    }

    // Filter by max price
    if (priceFilter && priceFilter.value !== "all") {
      const maxPrice = parseFloat(priceFilter.value);
      filtered = filtered.filter(p => p.totalPrice <= maxPrice);
    }

    // Sort
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

  // Pill click handlers
  pillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      pillBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.type;
      applyFilters();
    });
  });

  // Dropdown Filter event listeners
  if (statusFilter) statusFilter.addEventListener("change", applyFilters);
  if (priceFilter) priceFilter.addEventListener("change", applyFilters);
  if (sortFilter) sortFilter.addEventListener("change", applyFilters);

  // Initial Render
  applyFilters();
});
