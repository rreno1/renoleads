/* RenoLeads — authoritative NJ125 property cards and catalog filters. */

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
    renderErrorState(target);
    return;
  }

  if (!properties.length) {
    renderEmptyState(target, "No properties available", "There are no published available lots in NJ125 right now.");
    return;
  }

  if (catalogGrid) {
    initCatalogFilters(properties, catalogGrid, document.getElementById("properties-count"));
  } else {
    featuredGrid.replaceChildren(...properties.slice(0, 4).map(createPropertyCard));
    window.refreshScrollReveal?.();
    renderRecentlyViewed(properties);
  }
});

function titleCase(value) {
  return String(value || "lot")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase());
}

function getPropertyImage(property) {
  return property.thumbnailUrl || property.imageUrls?.[0] || "";
}

function createPropertyMedia(property, compact = false) {
  const media = document.createElement("div");
  media.className = compact ? "property-media property-media-compact" : "property-media";
  const imageUrl = getPropertyImage(property);

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = property.title || "Property lot";
    image.loading = "lazy";
    image.width = compact ? 96 : 480;
    image.height = compact ? 72 : 300;
    image.addEventListener("error", () => image.replaceWith(createPropertyPlaceholder(property, compact)), { once: true });
    media.appendChild(image);
  } else {
    media.appendChild(createPropertyPlaceholder(property, compact));
  }
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
  code.textContent = property.lotNumber ? `Lot ${property.lotNumber}` : "LOT";
  placeholder.appendChild(code);
  return placeholder;
}

function renderLoadingState(container, count) {
  container.replaceChildren(...Array.from({ length: count }, () => {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton skeleton-card";
    return skeleton;
  }));
}

function createPropertyCard(property) {
  const article = document.createElement("article");
  article.className = "property-card";
  article.dataset.id = property.id;
  article.dataset.scrollReveal = "up";

  const mediaWrap = document.createElement("div");
  mediaWrap.className = "card-image-wrap";
  const imageLink = document.createElement("a");
  imageLink.href = `property.html?id=${encodeURIComponent(property.id)}`;
  imageLink.className = "card-image-link";
  imageLink.setAttribute("aria-label", `View ${property.title || "property lot"}`);
  imageLink.appendChild(createPropertyMedia(property));
  mediaWrap.appendChild(imageLink);

  const statusBadge = document.createElement("span");
  statusBadge.className = "badge card-status-badge badge-available";
  statusBadge.textContent = "Available";
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
  eyebrow.textContent = property.project ? `${property.project} · Land lot` : "Land lot";
  body.appendChild(eyebrow);

  const title = document.createElement("h3");
  title.className = "card-title";
  const titleLink = document.createElement("a");
  titleLink.href = `property.html?id=${encodeURIComponent(property.id)}`;
  titleLink.textContent = property.title || (property.lotNumber ? `Lot ${property.lotNumber}` : "Available land lot");
  title.appendChild(titleLink);
  body.appendChild(title);

  const location = document.createElement("div");
  location.className = "card-location";
  location.appendChild(IconUtils.create("map"));
  const locationText = document.createElement("span");
  locationText.textContent = [property.municipality, property.province].filter(Boolean).join(", ") || "Location available on inquiry";
  location.appendChild(locationText);
  body.appendChild(location);

  const price = document.createElement("div");
  price.className = "card-price";
  price.textContent = DOMUtils.formatCurrency(property.totalPrice);
  body.appendChild(price);

  const facts = document.createElement("div");
  facts.className = "card-specs";
  if (property.lotAreaSqm) facts.appendChild(createFact("area", `${DOMUtils.formatNumber(property.lotAreaSqm)} sqm`));
  const placement = [property.phase && `Phase ${property.phase}`, property.block && `Block ${property.block}`, property.lotNumber && `Lot ${property.lotNumber}`].filter(Boolean).join(" · ");
  if (placement) facts.appendChild(createFact("document", placement));
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
  inquiryLink.href = `contact.html?property=${encodeURIComponent(property.id)}`;
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
    budget: params.get("budget") || "",
    area: params.get("area") || "",
    sort: params.get("sort") || "updated",
    saved: params.get("filter") === "saved"
  };

  const refs = {
    heading: document.getElementById("catalog-heading"),
    subtitle: document.getElementById("catalog-subtitle"),
    activeFilters: document.getElementById("active-filter-chips"),
    openSheet: document.getElementById("open-filter-sheet"),
    clear: document.getElementById("clear-filters-btn"),
    budget: document.getElementById("filter-max-price"),
    area: document.getElementById("filter-area"),
    sort: document.getElementById("filter-sort"),
    sheet: document.getElementById("filter-sheet"),
    sheetBudget: document.getElementById("sheet-filter-max-price"),
    sheetArea: document.getElementById("sheet-filter-area"),
    sheetSort: document.getElementById("sheet-filter-sort"),
    sheetClear: document.getElementById("sheet-clear-filters"),
    sheetApply: document.getElementById("apply-filter-sheet")
  };

  function syncControls() {
    [[refs.budget, state.budget], [refs.area, state.area], [refs.sort, state.sort], [refs.sheetBudget, state.budget], [refs.sheetArea, state.area], [refs.sheetSort, state.sort]].forEach(([element, value]) => {
      if (element) element.value = value;
    });
    if (refs.heading) refs.heading.textContent = state.saved ? "Saved lots" : "Available lots";
    if (refs.subtitle) refs.subtitle.textContent = state.saved ? "Your shortlist, stored on this device." : "Published available lots from the NJ125 inventory.";
  }

  function writeUrl() {
    const next = new URLSearchParams();
    if (state.saved) next.set("filter", "saved");
    if (state.budget) next.set("budget", state.budget);
    if (state.area) next.set("area", state.area);
    if (state.sort !== "updated") next.set("sort", state.sort);
    const query = next.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  function getFilteredProperties() {
    let filtered = allProperties.slice();
    if (state.saved) filtered = filtered.filter(property => RetentionManager.isShortlisted(property.id));
    if (state.budget) filtered = filtered.filter(property => property.totalPrice !== null && Number(property.totalPrice) <= Number(state.budget));
    if (state.area) {
      const [minimum, maximum] = state.area.split("-").map(Number);
      filtered = filtered.filter(property => Number(property.lotAreaSqm) >= minimum && (!maximum || Number(property.lotAreaSqm) <= maximum));
    }

    return filtered.sort((first, second) => {
      if (state.sort === "price-asc") return nullablePrice(first.totalPrice, Infinity) - nullablePrice(second.totalPrice, Infinity);
      if (state.sort === "price-desc") return nullablePrice(second.totalPrice, -Infinity) - nullablePrice(first.totalPrice, -Infinity);
      if (state.sort === "area-asc") return Number(first.lotAreaSqm || 0) - Number(second.lotAreaSqm || 0);
      return new Date(second.updatedAt || 0) - new Date(first.updatedAt || 0);
    });
  }

  function nullablePrice(value, fallback) {
    return value === null || value === undefined ? fallback : Number(value);
  }

  function renderAppliedFilters() {
    if (!refs.activeFilters) return;
    refs.activeFilters.replaceChildren();
    const filters = [];
    if (state.saved) filters.push(["saved", "Saved lots"]);
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
      renderEmptyState(container, state.saved ? "No saved lots yet" : "No lots match those filters", state.saved ? "Save a lot you like and it will appear here." : "Try removing a budget or area filter.");
      return;
    }
    container.replaceChildren(...filtered.map(createPropertyCard));
  }

  function resetFilters() {
    state.budget = "";
    state.area = "";
    state.sort = "updated";
    state.saved = false;
    render();
  }

  [[refs.budget, "budget"], [refs.area, "area"], [refs.sort, "sort"]].forEach(([element, key]) => {
    if (element) element.addEventListener("change", () => {
      state[key] = element.value;
      state.saved = false;
      render();
    });
  });

  if (refs.openSheet && refs.sheet) refs.openSheet.addEventListener("click", () => SheetController.open(refs.sheet));
  if (refs.sheetApply) refs.sheetApply.addEventListener("click", () => {
    state.budget = refs.sheetBudget?.value || "";
    state.area = refs.sheetArea?.value || "";
    state.sort = refs.sheetSort?.value || "updated";
    state.saved = false;
    SheetController.close();
    render();
  });
  if (refs.sheetClear) refs.sheetClear.addEventListener("click", resetFilters);
  if (refs.clear) refs.clear.addEventListener("click", resetFilters);
  document.addEventListener("renoleads:shortlist-changed", () => { if (state.saved) render(); });
  render();
}

function renderRecentlyViewed(properties) {
  const section = document.getElementById("recently-viewed-section");
  const container = document.getElementById("recently-viewed-container");
  if (!section || !container) return;
  const recent = RetentionManager.getRecentlyViewed().map(id => properties.find(property => property.id === id)).filter(Boolean).slice(0, 4);
  if (!recent.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  container.replaceChildren(...recent.map(createCompactPropertyCard));
}

function createCompactPropertyCard(property) {
  const link = document.createElement("a");
  link.className = "property-strip-card";
  link.href = `property.html?id=${encodeURIComponent(property.id)}`;
  link.appendChild(createPropertyMedia(property, true));
  const body = document.createElement("span");
  body.className = "property-strip-copy";
  const title = document.createElement("strong");
  title.textContent = property.title || `Lot ${property.lotNumber || ""}`.trim();
  const meta = document.createElement("span");
  meta.textContent = [property.lotAreaSqm ? `${DOMUtils.formatNumber(property.lotAreaSqm)} sqm` : "", DOMUtils.formatCurrency(property.totalPrice)].filter(Boolean).join(" · ");
  body.append(title, meta);
  link.appendChild(body);
  return link;
}

function renderEmptyState(container, titleText, copyText) {
  const state = document.createElement("div");
  state.className = "empty-state";
  state.appendChild(IconUtils.create("info"));
  const title = document.createElement("h3");
  title.className = "empty-state-title";
  title.textContent = titleText;
  const copy = document.createElement("p");
  copy.className = "empty-state-text";
  copy.textContent = copyText;
  state.append(title, copy);
  container.replaceChildren(state);
}

function renderErrorState(container) {
  const state = document.createElement("div");
  state.className = "empty-state";
  state.appendChild(IconUtils.create("info"));
  const title = document.createElement("h3");
  title.className = "empty-state-title";
  title.textContent = "Listings are temporarily unavailable";
  const copy = document.createElement("p");
  copy.className = "empty-state-text";
  copy.textContent = "We could not load the current NJ125 inventory. Please try again later.";
  state.append(title, copy);
  container.replaceChildren(state);
}
