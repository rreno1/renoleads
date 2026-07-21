/**
 * RenoLeads Production Interactive Engine
 * Handles Mobile Off-Canvas Drawer (A11y & Focus Trapping), Overlay Backdrop,
 * Floating Action Bar, and Layout Overflow Diagnostic Pass
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Navigation Off-Canvas Drawer Setup
  const headerNavbar = document.querySelector(".navbar");
  if (headerNavbar && !document.querySelector(".mobile-nav-toggle")) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "mobile-nav-toggle";
    toggleBtn.setAttribute("aria-label", "Open Navigation Menu");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-controls", "mobile-navigation-drawer");
    toggleBtn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    `;

    const drawer = document.createElement("nav");
    drawer.className = "mobile-drawer";
    drawer.id = "mobile-navigation-drawer";
    drawer.setAttribute("aria-label", "Mobile Main Navigation");
    drawer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <div style="font-family: var(--font-family-heading); font-weight: 800; font-size: 1.5rem; color: var(--color-primary-dark);">
          RenoLeads
        </div>
        <button id="close-drawer-btn" class="modal-close-btn" aria-label="Close Menu">✕</button>
      </div>
      <a href="index.html" class="nav-link">Home</a>
      <a href="properties.html" class="nav-link">Available Lots</a>
      <a href="why-invest.html" class="nav-link">Why Invest</a>
      <a href="buying-process.html" class="nav-link">Buying Process</a>
      <a href="contact.html" class="nav-link">Contact Us</a>
      <div style="margin-top: auto; padding-top: 1rem;">
        <a href="properties.html" class="btn btn-accent" style="width: 100%;">View Available Lots</a>
      </div>
    `;

    const overlay = document.createElement("div");
    overlay.className = "mobile-drawer-overlay";

    headerNavbar.appendChild(toggleBtn);
    document.body.appendChild(drawer);
    document.body.appendChild(overlay);

    const closeBtn = drawer.querySelector("#close-drawer-btn");

    function openDrawer() {
      drawer.classList.add("active");
      overlay.classList.add("active");
      toggleBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      // Focus first link in drawer
      const firstLink = drawer.querySelector(".nav-link");
      if (firstLink) firstLink.focus();
    }

    function closeDrawer() {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      toggleBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      toggleBtn.focus();
    }

    toggleBtn.addEventListener("click", openDrawer);
    overlay.addEventListener("click", closeDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    // Keyboard Escape Key Listener & Focus Trap
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("active")) {
        closeDrawer();
      }

      if (e.key === "Tab" && drawer.classList.contains("active")) {
        const focusableElements = drawer.querySelectorAll("a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])");
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    });

    // Close drawer when clicking any link
    drawer.querySelectorAll(".nav-link, .btn").forEach(link => {
      link.addEventListener("click", closeDrawer);
    });

    // Highlight active link
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    drawer.querySelectorAll(".nav-link").forEach(link => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  }

  // 2. Inject Floating Quick Contact Bar if not present
  if (!document.querySelector(".floating-quick-bar")) {
    const quickBar = document.createElement("div");
    quickBar.className = "floating-quick-bar";
    quickBar.innerHTML = `
      <a href="contact.html" class="quick-action-btn quick-book">📅 Book Tour</a>
      <a href="https://viber.com" target="_blank" rel="noopener" class="quick-action-btn quick-viber">💬 Viber</a>
      <a href="https://m.me" target="_blank" rel="noopener" class="quick-action-btn quick-messenger">⚡ Messenger</a>
    `;
    document.body.appendChild(quickBar);
  }

  // 3. Layout Overflow Diagnostic Function (Requirement 17)
  window.checkLayoutOverflow = function() {
    const docWidth = document.documentElement.clientWidth;
    const overflowElements = [];

    document.querySelectorAll("*").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1) { // 1px tolerance for rounding
        overflowElements.push({ element: el, right: rect.right, docWidth });
      }
    });

    if (overflowElements.length > 0) {
      console.warn("Layout Overflow Diagnostic Result: Detected elements escaping viewport:", overflowElements);
    } else {
      console.log("Layout Overflow Diagnostic Result: CLEAN (0 elements escaping viewport).");
    }
    return overflowElements;
  };
});
