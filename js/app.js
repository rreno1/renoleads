/* RenoLeads V2 — shared navigation, retention, sheets, and contact hydration. */

document.documentElement.classList.add("js");

const RetentionManager = {
  SHORTLIST_KEY: "renoleads_shortlist",
  RECENT_KEY: "renoleads_recently_viewed",

  getShortlist() {
    try {
      const value = JSON.parse(localStorage.getItem(this.SHORTLIST_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  },

  isShortlisted(id) {
    return this.getShortlist().includes(id);
  },

  toggleShortlist(id) {
    const list = this.getShortlist();
    const index = list.indexOf(id);
    const saved = index === -1;

    if (saved) {
      list.push(id);
      DOMUtils.showToast("Saved to your shortlist on this device");
    } else {
      list.splice(index, 1);
      DOMUtils.showToast("Removed from saved lots");
    }

    localStorage.setItem(this.SHORTLIST_KEY, JSON.stringify(list));
    this.syncSaveButtons(id);
    document.dispatchEvent(new CustomEvent("renoleads:shortlist-changed", {
      detail: { id, saved, ids: list }
    }));
    return saved;
  },

  syncSaveButtons(id) {
    const saved = this.isShortlisted(id);
    document.querySelectorAll(`[data-save-id="${CSS.escape(String(id))}"], .card-save-btn[data-id="${CSS.escape(String(id))}"]`).forEach(button => {
      button.classList.toggle("saved", saved);
      button.setAttribute("aria-label", saved ? "Remove from saved" : "Save property");
      button.setAttribute("aria-pressed", String(saved));
    });
  },

  getRecentlyViewed() {
    try {
      const value = JSON.parse(localStorage.getItem(this.RECENT_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  },

  addRecentlyViewed(id) {
    let list = this.getRecentlyViewed().filter(item => item !== id);
    list.unshift(id);
    localStorage.setItem(this.RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  },

  async shareProperty(title, text, url) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      DOMUtils.showToast("Property link copied to clipboard");
    } catch (error) {
      if (error && error.name === "AbortError") return;
      DOMUtils.showToast("Could not share the link. Please copy the URL manually.");
    }
  }
};

DOMUtils.showToast = function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 320);
  }, 3000);
};

const SheetController = {
  activeSheet: null,
  previousFocus: null,

  getFocusable(sheet) {
    return [...sheet.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])")]
      .filter(element => !element.hasAttribute("hidden") && element.offsetParent !== null);
  },

  open(sheet) {
    if (!sheet) return;
    if (this.activeSheet && this.activeSheet !== sheet) this.close();

    this.activeSheet = sheet;
    this.previousFocus = document.activeElement;
    let backdrop = document.querySelector(".sheet-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "sheet-backdrop";
      backdrop.addEventListener("click", () => this.close());
      document.body.appendChild(backdrop);
    }
    backdrop.classList.add("is-open");
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-sheet-open");

    const focusable = this.getFocusable(sheet);
    if (focusable[0]) focusable[0].focus();
    document.addEventListener("keydown", this.handleKeydown);
  },

  close() {
    if (!this.activeSheet) return;
    const closingSheet = this.activeSheet;
    document.querySelector(".sheet-backdrop")?.classList.remove("is-open");
    closingSheet.classList.remove("is-open");
    closingSheet.setAttribute("aria-hidden", "true");
    this.activeSheet = null;
    document.body.classList.remove("is-sheet-open");
    document.removeEventListener("keydown", this.handleKeydown);

    if (this.previousFocus && typeof this.previousFocus.focus === "function") {
      this.previousFocus.focus();
    }
    this.previousFocus = null;
  },

  handleKeydown(event) {
    if (event.key === "Escape") {
      SheetController.close();
      return;
    }

    if (event.key !== "Tab" || !SheetController.activeSheet) return;
    const focusable = SheetController.getFocusable(SheetController.activeSheet);
    if (focusable.length < 2) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
};

function isConfiguredValue(value) {
  if (!value) return false;
  return !/YOUR_|example\.|placeholder|REPLACE_ME/i.test(value);
}

function hydrateContactDetails() {
  const contact = RENO_CONFIG.contact || {};
  const bindings = [
    { selector: "[data-contact-phone]", value: contact.phoneDisplay, href: contact.phoneTel ? `tel:${contact.phoneTel}` : "" },
    { selector: "[data-contact-email]", value: contact.email, href: contact.email ? `mailto:${contact.email}` : "" },
    { selector: "[data-contact-viber]", value: "Viber", href: contact.viberUrl },
    { selector: "[data-contact-messenger]", value: "Messenger", href: contact.messengerUrl },
    { selector: "[data-contact-address]", value: contact.address, href: "" }
  ];

  bindings.forEach(binding => {
    const nodes = document.querySelectorAll(binding.selector);
    const configured = isConfiguredValue(binding.value) && (!binding.href || isConfiguredValue(binding.href));
    nodes.forEach(node => {
      if (!configured) {
        const removable = node.closest(".contact-item, .footer-contact-item, .contact-channel");
        (removable || node).hidden = true;
        return;
      }
      const nestedValue = node.querySelector(binding.selector);
      const valueNode = nestedValue || node.querySelector("span") || node;
      valueNode.textContent = binding.value;
      const link = node.closest("a") || (node.tagName === "A" ? node : null);
      if (binding.href && link) link.setAttribute("href", binding.href);
    });
  });
}

function setActiveNavigation() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const isSaved = new URLSearchParams(window.location.search).get("filter") === "saved";

  document.querySelectorAll(".nav-link, .mobile-menu-link").forEach(link => {
    const href = link.getAttribute("href") || "";
    let active = false;
    if (href === "index.html" || href === "") active = path === "index.html";
    if (href === "properties.html") active = path === "properties.html" && !isSaved;
    if (href.includes("filter=saved")) active = isSaved;
    if (href === "contact.html") active = path === "contact.html";

    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function setupMobileMenu() {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  const links = [...menu.querySelectorAll("a")];
  const setOpen = (open, restoreFocus = false) => {
    menu.hidden = !open;
    menu.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("mobile-menu-open", open);
    if (open) links[0]?.focus();
    else if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => setOpen(menu.hidden));
  links.forEach(link => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("click", event => {
    if (!menu.hidden && !event.target.closest(".site-header")) setOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.hidden) setOpen(false, true);
  });
}

function setupHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("scrolled", window.scrollY > 12);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupScrollReveal() {
  if (!document.querySelector(".hero")) return;

  const revealSelector = "[data-scroll-reveal]";
  const markVisible = () => document.querySelectorAll(revealSelector).forEach(element => element.classList.add("is-visible"));
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    document.documentElement.classList.add("no-scroll-reveal");
    window.refreshScrollReveal = markVisible;
    markVisible();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

  const observeTargets = () => {
    document.querySelectorAll(`${revealSelector}:not(.is-visible)`).forEach((element, index) => {
      if (!element.dataset.revealReady) {
        element.dataset.revealReady = "true";
        element.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 70}ms`);
      }
      observer.observe(element);
    });
  };

  window.refreshScrollReveal = observeTargets;
  observeTargets();
  const main = document.querySelector("main");
  if (main && "MutationObserver" in window) {
    const mutations = new MutationObserver(observeTargets);
    mutations.observe(main, { childList: true, subtree: true });
  }
}

function setupDelegatedActions() {
  document.addEventListener("click", event => {
    const saveButton = event.target.closest(".card-save-btn, .detail-action-btn[data-save-id]");
    if (saveButton) {
      event.preventDefault();
      event.stopPropagation();
      const id = saveButton.dataset.id || saveButton.dataset.saveId;
      if (id) RetentionManager.toggleShortlist(id);
      return;
    }

    const shareButton = event.target.closest("[data-share]");
    if (shareButton) {
      event.preventDefault();
      event.stopPropagation();
      RetentionManager.shareProperty(
        shareButton.dataset.title || document.title,
        shareButton.dataset.text || "",
        shareButton.dataset.url || window.location.href
      );
      return;
    }

    const openButton = event.target.closest("[data-open-inquiry]");
    if (openButton) {
      const sheet = document.getElementById(openButton.dataset.openInquiry || "inquiry-sheet");
      if (sheet) {
        event.preventDefault();
        SheetController.open(sheet);
      }
      return;
    }

    const closeButton = event.target.closest("[data-close-sheet]");
    if (closeButton) {
      event.preventDefault();
      SheetController.close();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavigation();
  setupMobileMenu();
  setupHeaderScroll();
  setupScrollReveal();
  hydrateContactDetails();
  setupDelegatedActions();
});

window.checkLayoutOverflow = function checkLayoutOverflow() {
  const viewportWidth = document.documentElement.clientWidth;
  const leakingElements = [...document.querySelectorAll("*")].filter(element => {
    const rect = element.getBoundingClientRect();
    return rect.left < -1 || rect.right > viewportWidth + 1;
  });
  return {
    documentOverflow: document.documentElement.scrollWidth > viewportWidth,
    leakingElements
  };
};
