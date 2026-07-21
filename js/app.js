/**
 * RenoLeads UI/UX Master Interactivity Engine
 * Manages Mobile Drawer Navigation, Backdrop Overlays, and Floating Action Controls
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Drawer Toggle Setup
  const headerNavbar = document.querySelector(".navbar");
  if (headerNavbar && !document.querySelector(".mobile-nav-toggle")) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "mobile-nav-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle Mobile Navigation");
    toggleBtn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    `;

    const drawer = document.createElement("div");
    drawer.className = "mobile-drawer";
    drawer.innerHTML = `
      <div style="font-family: var(--font-family-heading); font-weight: 800; font-size: 1.6rem; color: var(--primary-dark); margin-bottom: 1.5rem;">
        RenoLeads
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

    function toggleDrawer() {
      drawer.classList.toggle("active");
      overlay.classList.toggle("active");
      document.body.style.overflow = drawer.classList.contains("active") ? "hidden" : "";
    }

    toggleBtn.addEventListener("click", toggleDrawer);
    overlay.addEventListener("click", toggleDrawer);

    // Highlight current page link
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
});
