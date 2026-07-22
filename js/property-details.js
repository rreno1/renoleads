/* RenoLeads V2 — property detail renderer. */

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
  } catch (error) {
    console.error("[RenoLeads] Property detail load failed:", error);
    renderNotFound(container);
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
  renderAccessAndSite(mainColumn, property);
  renderMap(mainColumn, property);
  renderCalculator(mainColumn, property);
  await renderSimilarProperties(mainColumn, property);

  const sidebar = document.createElement("aside");
  sidebar.className = "detail-sidebar";
  renderInquiryCard(sidebar, property);
  renderSellerProfile(sidebar);
  renderAPKHandoff(sidebar, property);

  layout.appendChild(mainColumn);
  layout.appendChild(sidebar);
  container.appendChild(layout);

  initLightbox(images, property.title || "Property");
});

function getPropertyImages(property) {
  const candidates = [property.thumbnailUrl, ...(property.imageUrls || [])];
  return candidates.filter((url, index, list) => Boolean(url) && list.indexOf(url) === index && !/sample-(?:res|farm|com)|polomolok-hero-bg/i.test(url));
}

function titleCase(value) {
  return String(value || "lot").replace(/[-_]/g, " ").replace(/\b\w/g, character => character.toUpperCase());
}

function setInquiryContext(property) {
  const propertyCode = property.propertyCode || property.id || "General inquiry";
  const hiddenField = document.getElementById("propertyInterest");
  if (hiddenField) hiddenField.value = propertyCode;

  const label = document.getElementById("inquiry-sheet-property");
  if (label) label.textContent = property.title || propertyCode;

  document.querySelectorAll("[data-property-action]").forEach(element => {
    element.dataset.propertyId = property.id;
    element.dataset.propertyCode = propertyCode;
  });
}

function renderBreadcrumbs(container, property) {
  const breadcrumbs = document.createElement("nav");
  breadcrumbs.className = "detail-breadcrumbs";
  breadcrumbs.setAttribute("aria-label", "Breadcrumb");

  const home = document.createElement("a");
  home.href = "index.html";
  home.textContent = "Home";
  breadcrumbs.appendChild(home);
  breadcrumbs.appendChild(IconUtils.create("chevron"));

  const lots = document.createElement("a");
  lots.href = "properties.html";
  lots.textContent = "Available lots";
  breadcrumbs.appendChild(lots);
  breadcrumbs.appendChild(IconUtils.create("chevron"));

  const current = document.createElement("span");
  current.textContent = property.propertyCode || "Property";
  current.setAttribute("aria-current", "page");
  breadcrumbs.appendChild(current);
  container.appendChild(breadcrumbs);
}

function renderHeader(container, property) {
  const header = document.createElement("header");
  header.className = "detail-header";

  const titleGroup = document.createElement("div");
  titleGroup.className = "detail-title-group";

  const statusRow = document.createElement("div");
  statusRow.className = "detail-status-row";
  const status = String(property.status || "available").toLowerCase();
  const badge = document.createElement("span");
  badge.className = `badge badge-${status}`;
  badge.textContent = titleCase(status);
  statusRow.appendChild(badge);

  const code = document.createElement("span");
  code.className = "detail-verified";
  code.textContent = property.propertyCode || property.id || "Property listing";
  statusRow.appendChild(code);
  titleGroup.appendChild(statusRow);

  const title = document.createElement("h1");
  title.className = "detail-title";
  title.textContent = property.title || "Land lot in Polomolok";
  titleGroup.appendChild(title);

  const location = document.createElement("div");
  location.className = "detail-location";
  location.appendChild(IconUtils.create("map"));
  const locationText = document.createElement("span");
  locationText.textContent = [property.barangay, property.municipality || "Polomolok", property.province || "South Cotabato"].filter(Boolean).join(", ");
  location.appendChild(locationText);
  titleGroup.appendChild(location);

  const priceArea = document.createElement("div");
  priceArea.className = "detail-price-area";
  const price = document.createElement("strong");
  price.className = "detail-price";
  price.textContent = DOMUtils.formatCurrency(property.totalPrice);
  priceArea.appendChild(price);
  const area = document.createElement("span");
  area.className = "detail-area";
  area.textContent = `${DOMUtils.formatNumber(property.lotAreaSqm)} sqm · ${DOMUtils.formatCurrency(property.pricePerSqm)} / sqm`;
  priceArea.appendChild(area);
  titleGroup.appendChild(priceArea);
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
  actions.appendChild(save);

  const share = document.createElement("button");
  share.type = "button";
  share.className = "detail-action-btn";
  share.dataset.share = "true";
  share.dataset.title = property.title || "RenoLeads property";
  share.dataset.text = `${property.title || "Land lot"} in ${property.municipality || "Polomolok"}`;
  share.dataset.url = window.location.href;
  share.setAttribute("aria-label", "Share property");
  share.appendChild(IconUtils.create("share"));
  actions.appendChild(share);
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
    placeholder.appendChild(title);
    const copy = document.createElement("span");
    copy.textContent = `${property.propertyCode || property.id || "Lot"} · Ask the seller for current site photos.`;
    placeholder.appendChild(copy);
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
  count.appendChild(IconUtils.create("area"));
  count.appendChild(document.createTextNode(`${images.length} photo${images.length === 1 ? "" : "s"}`));
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
  show(0);
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

  main.addEventListener("click", open);
  lightbox.querySelector(".lightbox-close")?.addEventListener("click", close);
  lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => show(current + 1));
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) close();
  });
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
    ["Lot area", `${DOMUtils.formatNumber(property.lotAreaSqm)} sqm`],
    ["Property type", titleCase(property.propertyType)],
    ["Total price", DOMUtils.formatCurrency(property.totalPrice)],
    ["Price per sqm", DOMUtils.formatCurrency(property.pricePerSqm)],
    ["Availability", titleCase(property.status)],
    ["Payment options", (property.paymentOptions || []).map(titleCase).join(", ") || "Ask the seller"],
    ["Document note", property.documentStatus ? "Details supplied by seller; verify independently" : "Ask the seller"],
    ["Listing code", property.propertyCode || property.id]
  ];
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

function renderAccessAndSite(container, property) {
  if (!property.nearbyLandmarks?.length) return;
  const section = document.createElement("section");
  section.className = "spec-section detail-copy";
  section.appendChild(createSectionTitle("Nearby context"));
  const note = document.createElement("p");
  note.textContent = "Use these nearby places as orientation points. Confirm travel time, road access, and utilities during a site visit.";
  section.appendChild(note);
  const list = document.createElement("ul");
  list.className = "detail-list";
  property.nearbyLandmarks.forEach(landmark => {
    const item = document.createElement("li");
    item.appendChild(IconUtils.create("check"));
    item.appendChild(document.createTextNode(landmark));
    list.appendChild(item);
  });
  section.appendChild(list);
  container.appendChild(section);
}

function renderMap(container, property) {
  if (!property.latitude || !property.longitude) return;
  const section = document.createElement("section");
  section.className = "spec-section";
  section.appendChild(createSectionTitle("Map reference"));
  const note = document.createElement("p");
  note.className = "detail-map-note";
  note.textContent = "Map coordinates are for orientation. Confirm the exact boundary and access route before committing.";
  section.appendChild(note);
  const map = document.createElement("div");
  map.className = "map-container";
  const frame = document.createElement("iframe");
  frame.src = `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`;
  frame.title = `Map reference for ${property.title || "property"}`;
  frame.loading = "lazy";
  frame.setAttribute("allowfullscreen", "");
  frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
  map.appendChild(frame);
  section.appendChild(map);
  container.appendChild(section);
}

function renderCalculator(container, property) {
  const section = document.createElement("section");
  section.className = "spec-section";
  const card = document.createElement("div");
  card.className = "calculator-card";
  const title = document.createElement("h2");
  title.textContent = "Payment estimator";
  card.appendChild(title);
  const copy = document.createElement("p");
  copy.textContent = "A simple principal-only estimate. Confirm final terms with the seller or your lender.";
  card.appendChild(copy);

  const priceGroup = document.createElement("div");
  priceGroup.className = "calc-input-group";
  priceGroup.appendChild(createCalcLabel("Total contract price", "calc-total-price"));
  const price = document.createElement("input");
  price.id = "calc-total-price";
  price.className = "calc-input";
  price.type = "number";
  price.min = "0";
  price.step = "1000";
  price.value = property.totalPrice || 0;
  priceGroup.appendChild(price);
  card.appendChild(priceGroup);

  const downLabel = document.createElement("span");
  downLabel.className = "calc-label";
  downLabel.textContent = "Down payment";
  card.appendChild(downLabel);
  const chips = document.createElement("div");
  chips.className = "calc-chips";
  [10, 20, 30, 50].forEach(percent => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `calc-chip${percent === 20 ? " active" : ""}`;
    chip.dataset.dp = percent;
    chip.textContent = `${percent}%`;
    chips.appendChild(chip);
  });
  card.appendChild(chips);

  const slider = document.createElement("input");
  slider.id = "calc-dp-slider";
  slider.className = "calc-slider";
  slider.type = "range";
  slider.min = "0";
  slider.max = "80";
  slider.value = "20";
  slider.setAttribute("aria-label", "Down payment percentage");
  card.appendChild(slider);

  const downInfo = document.createElement("div");
  downInfo.className = "calc-label";
  card.appendChild(downInfo);

  const termGroup = document.createElement("div");
  termGroup.className = "calc-input-group";
  termGroup.appendChild(createCalcLabel("Payment term", "calc-term-select"));
  const term = document.createElement("select");
  term.id = "calc-term-select";
  term.className = "calc-select";
  [6, 12, 24, 36, 60].forEach(months => {
    const option = document.createElement("option");
    option.value = months;
    option.textContent = `${months} months`;
    if (months === 24) option.selected = true;
    term.appendChild(option);
  });
  termGroup.appendChild(term);
  card.appendChild(termGroup);

  const result = document.createElement("div");
  result.className = "calc-result";
  const resultLabel = document.createElement("div");
  resultLabel.className = "calc-result-label";
  resultLabel.textContent = "Estimated monthly payment";
  result.appendChild(resultLabel);
  const resultValue = document.createElement("div");
  resultValue.className = "calc-result-value";
  result.appendChild(resultValue);
  const summary = document.createElement("div");
  summary.className = "calc-result-summary";
  const downSummary = createCalcSummary("Down payment");
  const balanceSummary = createCalcSummary("Balance");
  summary.append(downSummary.wrapper, balanceSummary.wrapper);
  result.appendChild(summary);
  card.appendChild(result);
  section.appendChild(card);
  container.appendChild(section);

  function update() {
    const total = Number(price.value) || 0;
    const percent = Number(slider.value) || 0;
    const months = Number(term.value) || 24;
    const down = total * percent / 100;
    const balance = Math.max(total - down, 0);
    downInfo.textContent = `Down payment: ${percent}% · ${DOMUtils.formatCurrency(down)}`;
    resultValue.textContent = DOMUtils.formatCurrency(months ? balance / months : 0);
    downSummary.value.textContent = DOMUtils.formatCurrency(down);
    balanceSummary.value.textContent = DOMUtils.formatCurrency(balance);
    chips.querySelectorAll(".calc-chip").forEach(chip => chip.classList.toggle("active", Number(chip.dataset.dp) === percent));
  }

  chips.querySelectorAll(".calc-chip").forEach(chip => chip.addEventListener("click", () => {
    slider.value = chip.dataset.dp;
    update();
  }));
  [price, slider, term].forEach(input => input.addEventListener("input", update));
  term.addEventListener("change", update);
  update();
}

function createCalcLabel(text, inputId) {
  const label = document.createElement("label");
  label.className = "calc-label";
  label.htmlFor = inputId;
  label.textContent = text;
  return label;
}

function createCalcSummary(labelText) {
  const wrapper = document.createElement("div");
  wrapper.className = "calc-summary-item";
  const label = document.createElement("span");
  label.textContent = labelText;
  const value = document.createElement("span");
  value.className = "calc-summary-value";
  wrapper.append(label, value);
  return { wrapper, value };
}

function renderInquiryCard(container, property) {
  const card = document.createElement("div");
  card.className = "sidebar-card detail-cta-card";
  const title = document.createElement("h2");
  title.className = "sidebar-card-title";
  title.textContent = "Plan a closer look";
  card.appendChild(title);
  const copy = document.createElement("p");
  copy.textContent = "Ask for current photos, boundary details, payment terms, or a site visit for this lot.";
  card.appendChild(copy);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-accent btn-block";
  button.dataset.openInquiry = "inquiry-sheet";
  button.dataset.propertyAction = "true";
  button.textContent = "Book a site visit";
  card.appendChild(button);
  container.appendChild(card);
}

function renderSellerProfile(container) {
  const profile = document.createElement("div");
  profile.className = "seller-profile";
  const avatar = document.createElement("div");
  avatar.className = "seller-avatar";
  avatar.textContent = "R";
  profile.appendChild(avatar);
  const info = document.createElement("div");
  info.className = "seller-info";
  const name = document.createElement("strong");
  name.className = "seller-name";
  name.textContent = RENO_CONFIG.seller.name;
  info.appendChild(name);
  const role = document.createElement("span");
  role.className = "seller-role";
  role.textContent = RENO_CONFIG.seller.role;
  info.appendChild(role);
  const area = document.createElement("span");
  area.className = "seller-area";
  area.textContent = RENO_CONFIG.seller.area;
  info.appendChild(area);
  profile.appendChild(info);
  container.appendChild(profile);
}

function renderAPKHandoff(container, property) {
  if (!RENO_CONFIG.androidPackage || !/Android/i.test(navigator.userAgent)) return;
  const link = document.createElement("a");
  link.className = "app-handoff";
  link.href = `intent://property.html?id=${encodeURIComponent(property.id)}#Intent;scheme=https;package=${RENO_CONFIG.androidPackage};end`;
  link.appendChild(IconUtils.create("grid"));
  link.appendChild(document.createTextNode("Open in the RenoLeads app"));
  container.appendChild(link);
}

function renderSimilarProperties(container, current) {
  return fetchPublishedProperties().then(properties => {
    const similar = properties.filter(property => property.id !== current.id && property.status === "available")
      .filter(property => property.propertyType === current.propertyType || property.barangay === current.barangay)
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
  }).catch(error => console.warn("[RenoLeads] Similar properties unavailable:", error));
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
  const state = document.createElement("div");
  state.className = "empty-state detail-not-found";
  state.appendChild(IconUtils.create("info"));
  const title = document.createElement("h1");
  title.className = "empty-state-title";
  title.textContent = "Property not found";
  state.appendChild(title);
  const copy = document.createElement("p");
  copy.className = "empty-state-text";
  copy.textContent = "This listing may have been removed or the link may be incomplete.";
  state.appendChild(copy);
  const link = document.createElement("a");
  link.className = "btn btn-primary";
  link.href = "properties.html";
  link.textContent = "Browse available lots";
  state.appendChild(link);
  container.replaceChildren(state);
}
