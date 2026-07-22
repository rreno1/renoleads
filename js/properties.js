/* RenoLeads V2 — property cards, catalog filters, and recently viewed. */

document.addEventListener("DOMContentLoaded", async () => {
  const catalogGrid = document.getElementById("properties-grid-container");
  const featuredGrid = document.getElementById("featured-properties-container");
  const target = catalogGrid || featuredGrid;
  if (!target) return;

  renderLoadingState(target, catalogGrid ? 6 : 3);

  let properties;
  try {
    properties = await fetchPublishedProperties();
  } catch (error) {
    console.error("[RenoLeads] Property load failed:", error);
    renderErrorState(target);
    return;
  }

  if (!properties || properties.length === 0) {
    renderEmptyState(target, "No properties available", "Check back soon for new land lot listings in Polomolok.");
    return;
  }

  if (catalogGrid) {
    initCatalogFilters(properties, catalogGrid, document.getElementById("properties-count"));
  } else {
    const featured = properties.filter(property => property.featured && property.status === "available").slice(0, 4);
    const available = properties.filter(property => property.status === "available");
    const shown = (featured.length ? featured : available).slice(0, 4);
    target.replaceChildren(...shown.map(createPropertyCard));
    renderRecentlyViewed(properties);
  }
});

function titleCase(value) {
  return String(value || "lot")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase());
}

function isDocumentaryImage(url) {
  return Boolean(url) && !/sample-(?:res|farm|com)|polomolok-hero-bg/i.test(url);
}

function getPropertyImage(property) {
  const candidates = [property.thumbnailUrl, ...(property.imageUrls || [])];
  return candidates.find(isDocumentaryImage) || "";
}

function createPropertyMedia(property, compact = false) {
  const media = document.createElement("div");
  media.className = compact ? "property-media property-media-compact" : "property-media";

  const imageUrl = getPropertyImage(property);
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = property.title || "Property lot";
    image.loading = compact ? "lazy" : "lazy";
    image.width = compact ? 96 : 480;
    image.height = compact ? 72 : 300;
    image.addEventListener("error", () => {
      image.replaceWith(createPropertyPlaceholder(property, compact));
    }, { once: true });
    media.appendChild(image);
    return media;
  }

  media.appendChild(createPropertyPlaceholder(property, compact));
  return media;
}

function createPropertyPlaceholder(property, compact = false) {
  const placeholder = document.createElement("div");
  placeholder.className = compact ? "property-media-placeholder property-media-placeholder-compact" : "property-media-placeholder";
  placeholder.appendChild(IconUtils.create("area"));

  const copy = document.createElement("span");
  copy.className = "property-media-copy";
  copy.textContent = compact ? "Photos coming soon" : "Property photos coming soon";
  placeholder.appendChild(copy);

  const code = document.createElement("small");
  code.textContent = property.propertyCode || property.id || "LOT";
  placeholder.appendChild(code);
  return placeholder;
}

function renderLoadingState(container, count) {
  const skeletons = Array.from({ length: count }, () => {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton skeleton-card";
    return skeleton;
  });
  container.replaceChildren(...skeletons);
}

function createPropertyCard(property) {
  const article = document.createElement("article");
  article.className = "property-card";
  article.dataset.id = property.id;

  const mediaWrap = document.createElement("div");
  mediaWrap.className = "card-image-wrap";
  const imageLink = document.createElement("a");
  imageLink.href = `property.html?id=${encodeURIComponent(property.id)}`;
  imageLink.className = "card-image-link";
  imageLink.setAttribute("aria-label", `View ${property.title || "property lot"}`);
  imageLink.appendChild(createPropertyMedia(property));
  mediaWrap.appendChild(imageLink);

  const status = String(property.status || "available").toLowerCase();
  const statusBadge = document.createElement("span");
  statusBadge.className = `badge card-status-badge badge-${status}`;
  statusBadge.textContent = titleCase(status);
  mediaWrap.appendChild(statusBadge);

  const saveButton = document.createElement("button");
  const saved = RetentionManager.isShortlisted(property.id);
  saveButton.type = "button";
  saveButton.className = `card-save-btn${saved ? " saved" : ""}`;
  saveButton.dataset.id = property.id;
  saveButton.setAttribute("aria-label", saved ? "Remove from saved" : "Save property");
  saveButton.setAttribute("aria-pressed", String(saved));
  saveButton.appendChild(IconUtils.create("heart"));
  mediaWrap.appendChild(saveButton);
  article.appendChild(mediaWrap);

  const body = document.createElement("div");
  body.className = "card-body";

  const eyebrow = document.createElement("span");
  eyebrow.className = "card-eyebrow";
  eyebrow.textContent = `${titleCase(property.propertyType)} lot`;
  body.appendChild(eyebrow);

  const title = document.createElement("h3");
  title.className = "card-title";
  const titleLink = document.createElement("a");
  titleLink.href = `property.html?id=${encodeURIComponent(property.id)}`;
  titleLink.textContent = property.title || "Untitled property";
  title.appendChild(titleLink);
  body.appendChild(title);

  const location = document.createElement("div");
  location.className = "card-location";
  location.appendChild(IconUtils.create("map"));
  const locationText = document.createElement("span");
  locationText.textContent = [property.barangay, property.municipality || "Polomolok"].filter(Boolean).join(", ");
  location.appendChild(locationText);
  body.appendChild(location);

  const price = document.createElement("div");
  price.className = "card-price";
  price.textContent = DOMUtils.formatCurrency(property.totalPrice);
  body.appendChild(price);

  if (property.pricePerSqm) {
    const pricePerSqm = document.createElement("div");
    pricePerSqm.className = "card-price-sqm";
    pricePerSqm.textContent = `${DOMUtils.formatCurrency(property.pricePerSqm)} / sqm`;
    body.appendChild(pricePerSqm);
  }

  const facts = document.createElement("div");
  facts.className = "card-specs";
  facts.appendChild(createFact("area", `${DOMUtils.formatNumber(property.lotAreaSqm)} sqm`));
  if (property.documentStatus) facts.appendChild(createFact("document", "Ask to review documents"));
  body.appendChild(facts);

  const actions = document.createElement("div");
  actions.className = "card-actions";
  const detailsLink = document.createElement("a");
  detailsLink.className = "btn btn-primary btn-sm";
  detailsLink.href = `property.html?id=${encodeURIComponent(property.id)}`;
  detailsLink.textContent = "View details";
  actions.appendChild(detailsLink);

  const inquiryLink = document.createElement("a");
  inquiryLink.className = "btn btn-outline btn-sm";
  inquiryLink.href = `contact.html?property=${encodeURIComponent(property.propertyCode || property.id)}`;
  inquiryLink.textContent = "Quick inquiry";
  actions.appendChild(inquiryLink);
  body.appendChild(actions);

  article.appendChild(body);
  return article;
}

function createFact(iconName, text) {
  const fact = document.createElement("span");
  fact.className = "card-spec";
  fact.appendChild(IconUtils.create(iconName));
  const label = document.createElement("span");
  label.textContent = text;
  fact.appendChild(label);
  return fact;
}

function initCatalogFilters(allProperties, container, countDisplay) {
  const params = new URLSearchParams(window.location.search);
  const state = {
    type: params.get("type") || "all",
    status: params.get("status") || "",
    budget: params.get("budget") || "",
    area: params.get("area") || "",
    sort: params.get("sort") || "newest",
    saved: params.get("filter") === "saved"
  };

  const refs = {
    heading: document.getElementById("catalog-heading"),
    subtitle: document.getElementById("catalog-subtitle"),
    activeFilters: document.getElementById("active-filter-chips"),
    openSheet: document.getElementById("open-filter-sheet"),
    clear: document.getElementById("clear-filters-btn"),
    status: document.getElementById("filter-status"),
    budget: document.getElementById("filter-max-price"),
    area: document.getElementById("filter-area"),
    sort: document.getElementById("filter-sort"),
    sheet: document.getElementById("filter-sheet"),
    sheetStatus: document.getElementById("sheet-filter-status"),
    sheetBudget: document.getElementById("sheet-filter-max-price"),
    sheetArea: document.getElementById("sheet-filter-area"),
    sheetSort: document.getElementById("sheet-filter-sort"),
    sheetClear: document.getElementById("sheet-clear-filters"),
    sheetApply: document.getElementById("apply-filter-sheet")
  };

  const typeButtons = [...document.querySelectorAll("[data-filter-type]")];

  function syncControls() {
    typeButtons.forEach(button => button.classList.toggle("active", !state.saved && button.dataset.filterType === state.type));
    [
      [refs.status, state.status], [refs.budget, state.budget], [refs.area, state.area], [refs.sort, state.sort],
      [refs.sheetStatus, state.status], [refs.sheetBudget, state.budget], [refs.sheetArea, state.area], [refs.sheetSort, state.sort]
    ].forEach(([element, value]) => {
      if (element) element.value = value;
    });
    if (refs.heading) refs.heading.textContent = state.saved ? "Saved lots" : "Available lots";
    if (refs.subtitle) refs.subtitle.textContent = state.saved ? "Your shortlist, stored on this device." : "Browse focused land opportunities in and around Polomolok.";
  }

  function writeUrl() {
    const next = new URLSearchParams();
    if (state.saved) next.set("filter", "saved");
    else if (state.type !== "all") next.set("type", state.type);
    if (state.status) next.set("status", state.status);
    if (state.budget) next.set("budget", state.budget);
    if (state.area) next.set("area", state.area);
    if (state.sort !== "newest") next.set("sort", state.sort);
    const query = next.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  function getFilteredProperties() {
    let filtered = allProperties.filter(property => property.published !== false);
    if (state.saved) filtered = filtered.filter(property => RetentionManager.isShortlisted(property.id));
    if (!state.saved && state.type !== "all") filtered = filtered.filter(property => property.propertyType === state.type);
    if (state.status) filtered = filtered.filter(property => property.status === state.status);
    if (state.budget) filtered = filtered.filter(property => Number(property.totalPrice) <= Number(state.budget));
    if (state.area) {
      const [minimum, maximum] = state.area.split("-").map(Number);
      filtered = filtered.filter(property => Number(property.lotAreaSqm) >= minimum && (!maximum || Number(property.lotAreaSqm) <= maximum));
    }

    return filtered.sort((first, second) => {
      if (state.sort === "price-asc") return Number(first.totalPrice) - Number(second.totalPrice);
      if (state.sort === "price-desc") return Number(second.totalPrice) - Number(first.totalPrice);
      if (state.sort === "area-asc") return Number(first.lotAreaSqm) - Number(second.lotAreaSqm);
      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
  }

  function renderAppliedFilters() {
    if (!refs.activeFilters) return;
    refs.activeFilters.replaceChildren();
    const filters = [];
    if (state.saved) filters.push(["saved", "Saved lots"]);
    if (!state.saved && state.type !== "all") filters.push(["type", titleCase(state.type)]);
    if (state.status) filters.push(["status", titleCase(state.status)]);
    if (state.budget) filters.push(["budget", `Under ${DOMUtils.formatCurrency(state.budget)}`]);
    if (state.area) filters.push(["area", `${state.area.replace("-", "–")} sqm`]);

    filters.forEach(([key, label]) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "filter-chip";
      chip.setAttribute("aria-label", `Remove ${label} filter`);
      chip.appendChild(document.createTextNode(label));
      const close = document.createElement("span");
      close.className = "filter-chip-close";
      close.appendChild(IconUtils.create("close"));
      chip.appendChild(close);
      chip.addEventListener("click", () => {
        if (key === "saved") state.saved = false;
        if (key === "type") state.type = "all";
        if (key === "status") state.status = "";
        if (key === "budget") state.budget = "";
        if (key === "area") state.area = "";
        render();
      });
      refs.activeFilters.appendChild(chip);
    });
  }

  function render() {
    const filtered = getFilteredProperties();
    writeUrl();
    syncControls();
    renderAppliedFilters();
    if (countDisplay) countDisplay.textContent = `${filtered.length} ${filtered.length === 1 ? "lot" : "lots"}`;

    if (!filtered.length) {
      renderEmptyState(container, state.saved ? "No saved lots yet" : "No lots match those filters", state.saved ? "Save a lot you like and it will appear here. Saved lots stay on this device." : "Try removing a filter or browse all available lots.");
      return;
    }
    container.replaceChildren(...filtered.map(createPropertyCard));
  }

  function resetFilters() {
    state.type = "all";
    state.status = "";
    state.budget = "";
    state.area = "";
    state.sort = "newest";
    state.saved = false;
    render();
  }

  typeButtons.forEach(button => button.addEventListener("click", () => {
    state.saved = false;
    state.type = button.dataset.filterType;
    render();
  }));

  [[refs.status, "status"], [refs.budget, "budget"], [refs.area, "area"], [refs.sort, "sort"]].forEach(([element, key]) => {
    if (element) element.addEventListener("change", () => {
      state[key] = element.value;
      state.saved = false;
      render();
    });
  });

  if (refs.openSheet && refs.sheet) refs.openSheet.addEventListener("click", () => SheetController.open(refs.sheet));
  if (refs.sheetApply) refs.sheetApply.addEventListener("click", () => {
    state.status = refs.sheetStatus?.value || "";
    state.budget = refs.sheetBudget?.value || "";
    state.area = refs.sheetArea?.value || "";
    state.sort = refs.sheetSort?.value || "newest";
    state.saved = false;
    SheetController.close();
    render();
  });
  if (refs.sheetClear) refs.sheetClear.addEventListener("click", resetFilters);
  if (refs.clear) refs.clear.addEventListener("click", resetFilters);

  document.addEventListener("renoleads:shortlist-changed", () => {
    if (state.saved) render();
  });

  render();
}

function renderRecentlyViewed(properties) {
  const section = document.getElementById("recently-viewed-section");
  const container = document.getElementById("recently-viewed-container");
  if (!section || !container) return;

  const recent = RetentionManager.getRecentlyViewed()
    .map(id => properties.find(property => property.id === id))
    .filter(Boolean)
    .slice(0, 4);
  if (!recent.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  container.replaceChildren(...recent.map(createPropertyStripCard));
}

function createPropertyStripCard(property) {
  const link = document.createElement("a");
  link.className = "strip-card";
  link.href = `property.html?id=${encodeURIComponent(property.id)}`;
  link.appendChild(createPropertyMedia(property, true));

  const info = document.createElement("div");
  info.className = "strip-card-info";
  const title = document.createElement("span");
  title.className = "strip-card-title";
  title.textContent = property.title || "Property lot";
  info.appendChild(title);
  const price = document.createElement("span");
  price.className = "strip-card-price";
  price.textContent = DOMUtils.formatCurrency(property.totalPrice);
  info.appendChild(price);
  const meta = document.createElement("span");
  meta.className = "strip-card-meta";
  meta.textContent = `${DOMUtils.formatNumber(property.lotAreaSqm)} sqm · ${property.barangay || "Polomolok"}`;
  info.appendChild(meta);
  link.appendChild(info);
  return link;
}

function renderEmptyState(container, title, message) {
  const state = document.createElement("div");
  state.className = "empty-state";
  state.appendChild(IconUtils.create("grid"));

  const heading = document.createElement("h3");
  heading.className = "empty-state-title";
  heading.textContent = title;
  state.appendChild(heading);

  const copy = document.createElement("p");
  copy.className = "empty-state-text";
  copy.textContent = message;
  state.appendChild(copy);

  const link = document.createElement("a");
  link.className = "btn btn-outline btn-sm";
  link.href = "properties.html";
  link.textContent = "View all lots";
  state.appendChild(link);
  container.replaceChildren(state);
}

function renderErrorState(container) {
  const state = document.createElement("div");
  state.className = "error-state";
  state.appendChild(IconUtils.create("info"));

  const heading = document.createElement("h3");
  heading.className = "empty-state-title";
  heading.textContent = "Unable to load properties";
  state.appendChild(heading);

  const copy = document.createElement("p");
  copy.className = "empty-state-text";
  copy.textContent = "Please check your connection and try again.";
  state.appendChild(copy);

  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "btn btn-primary btn-sm";
  retry.textContent = "Try again";
  retry.addEventListener("click", () => window.location.reload());
  state.appendChild(retry);
  container.replaceChildren(state);
}
