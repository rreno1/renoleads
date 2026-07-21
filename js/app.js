/**
 * RenoLeads Production Interactive Engine & Layer 4 Retention Manager
 * Handles Mobile Off-Canvas Drawer (A11y, Focus Trapping, Transform Animation),
 * Shortlist Favorites, Recently Viewed History, Web Share API, and Toast System
 */

const RetentionManager = {
  getShortlist() {
    try {
      return JSON.parse(localStorage.getItem("renoleads_shortlist") || "[]");
    } catch (e) {
      return [];
    }
  },

  isShortlisted(id) {
    return this.getShortlist().includes(id);
  },

  toggleShortlist(id) {
    let list = this.getShortlist();
    const index = list.indexOf(id);
    let added = false;

    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(id);
      added = true;
    }

    try {
      localStorage.setItem("renoleads_shortlist", JSON.stringify(list));
    } catch (e) {}

    // Update heart icons across DOM
    document.querySelectorAll(`.card-shortlist-btn[data-id="${id}"]`).forEach(btn => {
      btn.classList.toggle("active", added);
      btn.setAttribute("aria-label", added ? "Remove from saved lots" : "Save lot to shortlist");
      btn.textContent = added ? "❤️" : "🤍";
    });

    DOMUtils.showToast(added ? "Saved to device shortlist ❤️" : "Removed from shortlist");
    return added;
  },

  getRecentlyViewed() {
    try {
      return JSON.parse(localStorage.getItem("renoleads_recently_viewed") || "[]");
    } catch (e) {
      return [];
    }
  },

  addRecentlyViewed(id) {
    if (!id) return;
    let list = this.getRecentlyViewed().filter(item => item !== id);
    list.unshift(id);
    if (list.length > 8) list.pop(); // keep top 8
    try {
      localStorage.setItem("renoleads_recently_viewed", JSON.stringify(list));
    } catch (e) {}
  },

  async shareProperty(title, text, url) {
    const shareData = {
      title: title || "RenoLeads Property",
      text: text || "Check out this prime land lot in Polomolok, South Cotabato:",
      url: url || window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.warn("Share API error:", err);
      }
    }

    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url);
      DOMUtils.showToast("Property link copied to clipboard! 📋");
    } catch (err) {
      DOMUtils.showToast("Sharing link: " + shareData.url);
    }
  }
};

// Toast Notification Helper
DOMUtils.showToast = function(message) {
  let toast = document.querySelector(".toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("active");

  setTimeout(() => {
    toast.classList.remove("active");
  }, 3000);
};

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

  // 3. Global Delegated Click Handler for Shortlist Buttons & Share Buttons
  document.addEventListener("click", (e) => {
    const shortlistBtn = e.target.closest(".card-shortlist-btn");
    if (shortlistBtn) {
      e.preventDefault();
      e.stopPropagation();
      const propId = shortlistBtn.dataset.id;
      if (propId) RetentionManager.toggleShortlist(propId);
      return;
    }

    const shareBtn = e.target.closest(".btn-share-trigger");
    if (shareBtn) {
      e.preventDefault();
      const title = shareBtn.dataset.title;
      const text = shareBtn.dataset.text;
      const url = shareBtn.dataset.url;
      RetentionManager.shareProperty(title, text, url);
    }
  });

  // 4. Automated Layout Overflow Diagnostic Runner (Section 28)
  window.checkLayoutOverflow = function() {
    const viewportWidth = document.documentElement.clientWidth;
    const leakingElements = [...document.querySelectorAll("*")].filter((el) => {
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
