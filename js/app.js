/**
 * RenoLeads Production Interactive Engine
 * Handles Mobile Off-Canvas Navigation Drawer (A11y, Focus Trapping, Transform Animation),
 * Floating Quick Action Bar, and Automated Layout Overflow Diagnostics
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Navigation Off-Canvas Drawer Setup
  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  const drawer = document.getElementById("mobile-navigation-drawer");
  const overlay = document.getElementById("mobile-drawer-overlay");
  const closeBtn = document.getElementById("close-drawer-btn");

  if (toggleBtn && drawer && overlay) {
    function openDrawer() {
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
      toggleBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      const firstLink = drawer.querySelector(".nav-link");
      if (firstLink) firstLink.focus();
    }

    function closeDrawer() {
      drawer.classList.remove("is-open");
      overlay.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      toggleBtn.focus();
    }

    toggleBtn.addEventListener("click", openDrawer);
    overlay.addEventListener("click", closeDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    // Keyboard Escape Key Listener & Focus Trap inside drawer
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        closeDrawer();
      }

      if (e.key === "Tab" && drawer.classList.contains("is-open")) {
        const focusables = drawer.querySelectorAll("a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])");
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    });

    // Close drawer on link click
    drawer.querySelectorAll(".nav-link, .btn").forEach(link => {
      link.addEventListener("click", closeDrawer);
    });

    // Highlight active link in drawer
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    drawer.querySelectorAll(".nav-link").forEach(link => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  // 2. Inject Floating Quick Contact Bar if not present
  if (!document.querySelector(".floating-quick-bar")) {
    const quickBar = document.createElement("div");
    quickBar.className = "floating-quick-bar";
    quickBar.innerHTML = `
      <a href="contact.html" class="quick-action-btn quick-book">📅 Book Tour</a>
      <a href="${RENO_CONFIG.contact.viberUrl}" target="_blank" rel="noopener" class="quick-action-btn quick-viber">💬 Viber</a>
      <a href="${RENO_CONFIG.contact.messengerUrl}" target="_blank" rel="noopener" class="quick-action-btn quick-messenger">⚡ Messenger</a>
    `;
    document.body.appendChild(quickBar);
  }

  // 3. Automated Layout Overflow Diagnostic Runner (Section 25)
  window.checkLayoutOverflow = function() {
    const viewportWidth = document.documentElement.clientWidth;
    const leakingElements = [...document.querySelectorAll("*")].filter((el) => {
      // Exclude closed off-canvas drawer
      if (el.id === "mobile-navigation-drawer" && !el.classList.contains("is-open")) return false;
      const rect = el.getBoundingClientRect();
      return rect.left < -1 || rect.right > viewportWidth + 1;
    });

    if (leakingElements.length > 0) {
      console.warn("[RenoLeads Overflow Audit] Leaking elements detected:", leakingElements);
    } else {
      console.log("[RenoLeads Overflow Audit] CLEAN: 0 elements escaping viewport boundaries.");
    }
    return leakingElements;
  };
});
