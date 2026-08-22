/* RenoLeads — property detail renderer for the authoritative NJ125 public contract. */

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("property-detail-main");
  if (!container) return;

  document.body.classList.add("page-property-detail");
  const propertyId = new URLSearchParams(window.location.search).get("id");
  if (!propertyId) {
    renderNotFound(container);
    return;
  }

  renderLoadingSkeleton(container);
  let property;
  try {
    property = await fetchPropertyById(propertyId);
  } catch {
    renderServiceError(container);
    return;
  }
  if (!property) {
    renderNotFound(container);
    return;
  }

  RetentionManager.addRecentlyViewed(property.id);
  document.title = `${property.title || "Property"} — RenoLeads`;
  setInquiryContext(property);

  const images = getPropertyImages(property);
  container.replaceChildren();
  renderBreadcrumbs(container, property);
  renderHeader(container, property);

  const layout = document.createElement("div");
  layout.className = "detail-layout";
  const mainColumn = document.createElement("div");
  mainColumn.className = "detail-main";
  renderGallery(mainColumn, images, property);
  renderSpecifications(mainColumn, property);
  renderDescription(mainColumn, property);
  await renderSimilarProperties(mainColumn, property);

  const sidebar = document.createElement("aside");
  sidebar.className = "detail-sidebar";
  renderInquiryCard(sidebar);
  renderSellerProfile(sidebar);
  renderAPKHandoff(sidebar, property);

  layout.append(mainColumn, sidebar);
  container.appendChild(layout);
  initLightbox(images, property.title || "Property");
});

function getPropertyImages(property) {
  return [property.thumbnailUrl, ...(property.imageUrls || [])]
    .filter((url, index, list) => Boolean(url) && list.indexOf(url) === index);
}

function detailTitleCase(value) {
  return String(value || "lot").replace(/[-_]/g, " ").replace(/\b\w/g, character => character.toUpperCase());
}

function setInquiryContext(property) {
  const hiddenField = document.getElementById("propertyInterest");
  if (hiddenField) hiddenField.value = property.id;
  const label = document.getElementById("inquiry-sheet-property");
  if (label) label.textContent = property.title || property.propertyCode;
  document.querySelectorAll("[data-property-action]").forEach(element => {
    element.dataset.propertyId = property.id;
    element.dataset.propertyCode = property.propertyCode;
  });
}

function renderBreadcrumbs(container, property) {
  const breadcrumbs = document.createElement("nav");
  breadcrumbs.className = "detail-breadcrumbs";
  breadcrumbs.setAttribute("aria-label", "Breadcrumb");
  const home = document.createElement("a");
  home.href = "index.html";
  home.textContent = "Home";
  const lots = document.createElement("a");
  lots.href = "properties.html";
  lots.textContent = "Available lots";
  const current = document.createElement("span");
  current.textContent = property.lotNumber ? `Lot ${property.lotNumber}` : property.propertyCode;
  current.setAttribute("aria-current", "page");
  breadcrumbs.append(home, IconUtils.create("chevron"), lots, IconUtils.create("chevron"), current);
  container.appendChild(breadcrumbs);
}

function renderHeader(container, property) {
  const header = document.createElement("header");
  header.className = "detail-header";
  const titleGroup = document.createElement("div");
  titleGroup.className = "detail-title-group";

  const statusRow = document.createElement("div");
  statusRow.className = "detail-status-row";
  const badge = document.createElement("span");
  badge.className = "badge badge-available";
  badge.textContent = "Available";
  const code = document.createElement("span");
  code.className = "detail-verified";
  code.textContent = property.propertyCode;
  statusRow.append(badge, code);

  const title = document.createElement("h1");
  title.className = "detail-title";
  title.textContent = property.title || "Available land lot";

  const location = document.createElement("div");
  location.className = "detail-location";
  location.appendChild(IconUtils.create("map"));
  const locationText = document.createElement("span");
  locationText.textContent = [property.municipality, property.province].filter(Boolean).join(", ") || "Location available on inquiry";
  location.appendChild(locationText);

  const priceArea = document.createElement("div");
  priceArea.className = "detail-price-area";
  const price = document.createElement("strong");
  price.className = "detail-price";
  price.textContent = DOMUtils.formatCurrency(property.totalPrice);
  const area = document.createElement("span");
  area.className = "detail-area";
  area.textContent = property.lotAreaSqm ? `${DOMUtils.formatNumber(property.lotAreaSqm)} sqm` : "Area available on inquiry";
  priceArea.append(price, area);

  titleGroup.append(statusRow, title, location, priceArea);
  header.appendChild(titleGroup);

  const actions = document.createElement("div");
  actions.className = "detail-actions";
  const save = document.createElement("button");
  const saved = RetentionManager.isShortlisted(property.id);
  save.type = "button";
  save.className = `detail-action-btn${saved ? " saved" : ""}`;
  save.dataset.saveId = property.id;
  save.setAttribute("aria-label", saved ? "Remove from saved" : "Save property");
  save.setAttribute("aria-pressed", String(saved));
  save.appendChild(IconUtils.create("heart"));

  const share = document.createElement("button");
  share.type = "button";
  share.className = "detail-action-btn";
  share.dataset.share = "true";
  share.dataset.title = property.title || "RenoLeads property";
  share.dataset.text = `${property.title || "Land lot"}${property.municipality ? ` in ${property.municipality}` : ""}`;
  share.dataset.url = window.location.href;
  share.setAttribute("aria-label", "Share property");
  share.appendChild(IconUtils.create("share"));
  actions.append(save, share);
  header.appendChild(actions);
  container.appendChild(header);
}

function renderGallery(container, images, property) {
  const section = document.createElement("section");
  section.className = "gallery-section";
  const gallery = document.createElement("div");
  gallery.className = "gallery";

  if (!images.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "gallery-main gallery-placeholder";
    placeholder.appendChild(IconUtils.create("area"));
    const title = document.createElement("strong");
    title.textContent = "Property photos coming soon";
    const copy = document.createElement("span");
    copy.textContent = "Ask RenoLeads for current site photos before scheduling a visit.";
    placeholder.append(title, copy);
    gallery.appendChild(placeholder);
    section.appendChild(gallery);
    container.appendChild(section);
    return;
  }

  const main = document.createElement("button");
  main.type = "button";
  main.className = "gallery-main";
  main.id = "gallery-main-wrap";
  main.setAttribute("aria-label", "Open property photo viewer");
  const image = document.createElement("img");
  image.id = "gallery-main-img";
  image.src = images[0];
  image.alt = `${property.title || "Property"} — photo 1 of ${images.length}`;
  image.width = 960;
  image.height = 600;
  image.loading = "eager";
  main.appendChild(image);

  const count = document.createElement("span");
  count.className = "gallery-count";
  count.append(IconUtils.create("area"), document.createTextNode(`${images.length} photo${images.length === 1 ? "" : "s"}`));
  main.appendChild(count);
  gallery.appendChild(main);

  if (images.length > 1) {
    const thumbs = document.createElement("div");
    thumbs.className = "gallery-thumbs";
    images.forEach((src, index) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = `gallery-thumb${index === 0 ? " active" : ""}`;
      thumb.setAttribute("aria-label", `View property photo ${index + 1}`);
      const thumbImage = document.createElement("img");
      thumbImage.src = src;
      thumbImage.alt = `Photo ${index + 1}`;
      thumbImage.loading = "lazy";
      thumb.appendChild(thumbImage);
      thumb.addEventListener("click", () => {
        image.src = src;
        image.alt = `${property.title || "Property"} — photo ${index + 1} of ${images.length}`;
        thumbs.querySelectorAll(".gallery-thumb").forEach(item => item.classList.remove("active"));
        thumb.classList.add("active");
      });
      thumbs.appendChild(thumb);
    });
    gallery.appendChild(thumbs);
  }

  section.appendChild(gallery);
  container.appendChild(section);
}

function initLightbox(images, title) {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");
  const counter = document.getElementById("lightbox-counter");
  const main = document.getElementById("gallery-main-wrap");
  if (!lightbox || !image) return;
  if (!main || !images.length) {
    lightbox.remove();
    return;
  }

  let current = 0;
  const show = index => {
    current = (index + images.length) % images.length;
    image.src = images[current];
    image.alt = `${title} — photo ${current + 1} of ${images.length}`;
    if (counter) counter.textContent = `${current + 1} / ${images.length}`;
  };
  const open = () => {
    show(current);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-lightbox-open");
    lightbox.querySelector(".lightbox-close")?.focus();
  };
  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-lightbox-open");
    main.focus();
  };
  show(0);
  main.addEventListener("click", open);
  lightbox.querySelector(".lightbox-close")?.addEventListener("click", close);
  lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => show(current + 1));
  lightbox.addEventListener("click", event => { if (event.target === lightbox) close(); });
  lightbox.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
}

function renderSpecifications(container, property) {
  const section = document.createElement("section");
  section.className = "spec-section";
  section.appendChild(createSectionTitle("Property details"));
  const list = document.createElement("dl");
  list.className = "spec-grid";

  const entries = [
    ["Project", property.project],
    ["Phase", property.phase ? `Phase ${property.phase}` : ""],
    ["Block", property.block ? `Block ${property.block}` : ""],
    ["Lot", property.lotNumber ? `Lot ${property.lotNumber}` : ""],
    ["Lot area", property.lotAreaSqm ? `${DOMUtils.formatNumber(property.lotAreaSqm)} sqm` : ""],
    ["Display price", DOMUtils.formatCurrency(property.totalPrice)],
    ["Availability", "Available"]
  ].filter(([, value]) => Boolean(value));

  entries.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "spec-item";
    const term = document.createElement("dt");
    term.className = "spec-label";
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.className = "spec-value";
    detail.textContent = value;
    item.append(term, detail);
    list.appendChild(item);
  });
  section.appendChild(list);

  const note = document.createElement("p");
  note.className = "detail-map-note";
  note.textContent = "Only published NJ125 inventory fields are shown here. Ask RenoLeads to verify documents, exact boundaries, access, utilities, and payment terms before making a decision.";
  section.appendChild(note);
  container.appendChild(section);
}

function renderDescription(container, property) {
  if (!property.description) return;
  const section = document.createElement("section");
  section.className = "spec-section detail-copy";
  section.appendChild(createSectionTitle("About this property"));
  const text = document.createElement("p");
  text.textContent = property.description;
  section.appendChild(text);
  container.appendChild(section);
}

function renderInquiryCard(container) {
  const card = document.createElement("div");
  card.className = "sidebar-card detail-cta-card";
  const title = document.createElement("h2");
  title.className = "sidebar-card-title";
  title.textContent = "Plan a closer look";
  const copy = document.createElement("p");
  copy.textContent = "Ask for current photos, document information, boundary details, payment terms, or a site visit for this lot.";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-accent btn-block";
  button.dataset.openInquiry = "inquiry-sheet";
  button.dataset.propertyAction = "true";
  button.textContent = "Book a site visit";
  card.append(title, copy, button);
  container.appendChild(card);
}

function renderSellerProfile(container) {
  const profile = document.createElement("div");
  profile.className = "seller-profile";
  const avatar = document.createElement("div");
  avatar.className = "seller-avatar";
  avatar.textContent = "R";
  const info = document.createElement("div");
  info.className = "seller-info";
  const name = document.createElement("strong");
  name.className = "seller-name";
  name.textContent = RENO_CONFIG.seller.name;
  const role = document.createElement("span");
  role.className = "seller-role";
  role.textContent = RENO_CONFIG.seller.role;
  const area = document.createElement("span");
  area.className = "seller-area";
  area.textContent = RENO_CONFIG.seller.area;
  info.append(name, role, area);
  profile.append(avatar, info);
  container.appendChild(profile);
}

function renderAPKHandoff(container, property) {
  if (!RENO_CONFIG.androidPackage || !/Android/i.test(navigator.userAgent)) return;
  const link = document.createElement("a");
  link.className = "app-handoff";
  link.href = `intent://property.html?id=${encodeURIComponent(property.id)}#Intent;scheme=https;package=${RENO_CONFIG.androidPackage};end`;
  link.append(IconUtils.create("grid"), document.createTextNode("Open in the RenoLeads app"));
  container.appendChild(link);
}

async function renderSimilarProperties(container, current) {
  try {
    const properties = await fetchPublishedProperties();
    const similar = properties
      .filter(property => property.id !== current.id)
      .sort((a, b) => {
        const aScore = Number(Boolean(current.project && a.project === current.project)) + Number(Boolean(current.phase && a.phase === current.phase));
        const bScore = Number(Boolean(current.project && b.project === current.project)) + Number(Boolean(current.phase && b.phase === current.phase));
        return bScore - aScore;
      })
      .slice(0, 3);
    if (!similar.length) return;
    const section = document.createElement("section");
    section.className = "spec-section similar-section";
    section.appendChild(createSectionTitle("More lots to compare"));
    const grid = document.createElement("div");
    grid.className = "properties-grid";
    similar.forEach(property => grid.appendChild(createPropertyCard(property)));
    section.appendChild(grid);
    container.appendChild(section);
  } catch {
    // Similar listings are supplemental; the primary property remains usable.
  }
}

function createSectionTitle(text) {
  const title = document.createElement("h2");
  title.className = "spec-section-title";
  title.textContent = text;
  return title;
}

function renderLoadingSkeleton(container) {
  container.replaceChildren();
  ["detail-breadcrumbs", "detail-header", "gallery skeleton-detail-media", "spec-section skeleton-detail-copy"].forEach(className => {
    const skeleton = document.createElement("div");
    skeleton.className = `skeleton ${className}`;
    container.appendChild(skeleton);
  });
}

function renderNotFound(container) {
  renderDetailState(container, "Property not found", "This listing is not in the current published available inventory.");
}

function renderServiceError(container) {
  renderDetailState(container, "Listing temporarily unavailable", "The NJ125 property service could not be reached. Please try again later.");
}

function renderDetailState(container, titleText, copyText) {
  const state = document.createElement("div");
  state.className = "empty-state detail-not-found";
  state.appendChild(IconUtils.create("info"));
  const title = document.createElement("h1");
  title.className = "empty-state-title";
  title.textContent = titleText;
  const copy = document.createElement("p");
  copy.className = "empty-state-text";
  copy.textContent = copyText;
  const link = document.createElement("a");
  link.className = "btn btn-primary";
  link.href = "properties.html";
  link.textContent = "Browse available lots";
  state.append(title, copy, link);
  container.replaceChildren(state);
}
