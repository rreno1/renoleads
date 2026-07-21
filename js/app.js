/**
 * RenoLeads V2 Production Interactive Engine & Layer 4 Retention Manager
 * Handles Mobile Bottom Navigation System, Shortlist Favorites, Recently Viewed History,
 * Web Share API, and Toast Notifications
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

    // Update SVG heart icons across DOM
    document.querySelectorAll(`.card-shortlist-btn[data-id="${id}"]`).forEach(btn => {
      btn.classList.toggle("active", added);
      btn.setAttribute("aria-label", added ? "Remove from saved lots" : "Save lot to shortlist");
      const svg = btn.querySelector("svg path");
      if (svg) {
        svg.setAttribute("fill", added ? "var(--danger)" : "none");
        svg.setAttribute("stroke", added ? "var(--danger)" : "currentColor");
      }
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
    if (list.length > 8) list.pop();
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
      DOMUtils.showToast("Property link copied to clipboard!");
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
  // 1. Highlight Active Mobile Bottom Nav Link (Bug Fix: query param aware)
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const currentQuery = window.location.search;
  const currentFull = currentPath + currentQuery;

  document.querySelectorAll(".mobile-bottom-nav .mobile-nav-item").forEach(link => {
    const href = link.getAttribute("href");
    let isActive = false;

    if (href.includes("?")) {
      isActive = (currentFull === href);
    } else {
      isActive = (currentPath === href && !currentQuery.includes("filter=saved"));
    }

    if (isActive) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });

  // 2. Global Delegated Click Handler for Shortlist & Share Buttons
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

  // 3. Automated Layout Overflow Diagnostic Runner (Section 29)
  window.checkLayoutOverflow = function() {
    const viewportWidth = document.documentElement.clientWidth;
    const leakingElements = [...document.querySelectorAll("*")].filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.left < -1 || rect.right > viewportWidth + 1;
    });

    if (leakingElements.length > 0) {
      console.warn("[RenoLeads V2 Overflow Audit] Leaking elements detected:", leakingElements);
    } else {
      console.log("[RenoLeads V2 Overflow Audit] CLEAN: 0 elements escaping viewport boundaries.");
    }
    return leakingElements;
  };
});
