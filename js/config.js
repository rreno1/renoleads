/**
 * RenoLeads Centralized Platform Configuration & Safe DOM Utilities
 */
const RENO_CONFIG = {
  appName: "RenoLeads",
  domain: "https://rreno1.github.io/renoleads",
  androidPackage: "com.renoleads.app",
  seller: {
    name: "RenoLeads",
    role: "Polomolok land lot service",
    area: "Serving Polomolok, South Cotabato"
  },
  
  contact: {
    phoneDisplay: "+63 917 123 4567",
    phoneTel: "+639171234567",
    viberUrl: "viber://chat?number=%2B639171234567",
    messengerUrl: "https://m.me/renoleads",
    email: "info@renoleads.com",
    address: "Polomolok, South Cotabato, Philippines"
  },

  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "renoleads.firebaseapp.com",
    projectId: "renoleads",
    storageBucket: "renoleads.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890",
    measurementId: "G-MEASUREMENT_ID"
  }
};

/**
 * Safe DOM Text Sanitizer & Element Creator
 */
const DOMUtils = {
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(amount || 0);
  },

  formatNumber(num) {
    return new Intl.NumberFormat('en-PH').format(num || 0);
  }
};

/* One outline icon language for static and dynamic UI. */
const IconUtils = {
  paths: {
    home: '<path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9Z"/><path d="M9 21v-6h6v6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
    message: '<path d="M20.5 11.5a8.5 8.5 0 0 1-9 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5h.5a8.5 8.5 0 0 1 7.5 8.5Z"/>',
    map: '<path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    area: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m9 4 4 4m-4 0h4V4M15 20l-4-4m4 0h-4v4"/>',
    document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 3.9m0-11-6.8 3.9"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.3a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.8-1.2a2 2 0 0 1 2.1-.5c.8.3 1.5.5 2.3.6a2 2 0 0 1 1.8 2.1Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    filter: '<path d="M4 6h16M7 12h10m-7 6h4"/>',
    sort: '<path d="M7 6h10M7 12h7M7 18h4"/>'
  },

  create(name, options = {}) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", options.strokeWidth || "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    if (options.className) svg.className.baseVal = options.className;
    if (options.width) svg.setAttribute("width", options.width);
    if (options.height) svg.setAttribute("height", options.height);
    const parsed = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg">${this.paths[name] || this.paths.info}</svg>`,
      "image/svg+xml"
    );
    Array.from(parsed.documentElement.childNodes).forEach(node => {
      svg.appendChild(document.importNode(node, true));
    });
    return svg;
  }
};
