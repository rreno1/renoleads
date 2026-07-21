/**
 * RenoLeads Centralized Platform Configuration & Safe DOM Utilities
 */
const RENO_CONFIG = {
  appName: "RenoLeads",
  domain: "https://rreno1.github.io/renoleads",
  androidPackage: "com.renoleads.app",
  
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
