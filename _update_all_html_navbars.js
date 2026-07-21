const fs = require('fs');
const files = ['index.html', 'properties.html', 'property.html', 'why-invest.html', 'buying-process.html', 'contact.html', 'privacy.html'];

const canonicalHeader = `  <!-- Unified Header Navigation Bar with 2-Layer Mobile Hamburger -->
  <header class="site-header">
    <div class="navbar">
      <a href="index.html" class="brand-logo" aria-label="RenoLeads Home">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg>
        <span>RenoLeads</span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav" aria-label="Main Navigation">
        <ul class="nav-links">
          <li><a href="index.html" class="nav-link">Home</a></li>
          <li><a href="properties.html" class="nav-link">Available Lots</a></li>
          <li><a href="properties.html?filter=saved" class="nav-link">Saved</a></li>
          <li><a href="why-invest.html" class="nav-link">Why Invest</a></li>
          <li><a href="buying-process.html" class="nav-link">Buyer's Guide</a></li>
          <li><a href="contact.html" class="nav-link">Contact</a></li>
        </ul>
      </nav>

      <div class="nav-actions">
        <a href="properties.html" class="btn btn-accent">View Available Lots</a>
      </div>

      <!-- 2-Layer Mobile Hamburger Toggle Icon -->
      <button type="button" class="mobile-menu-toggle" aria-label="Toggle Navigation Menu" aria-expanded="false" aria-controls="mobile-menu-drawer">
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
      </button>
    </div>

    <!-- Mobile Glassmorphism Dropdown Drawer -->
    <div id="mobile-menu-drawer" class="mobile-menu-drawer" aria-hidden="true">
      <ul class="mobile-nav-links">
        <li><a href="index.html" class="mobile-nav-link">Home</a></li>
        <li><a href="properties.html" class="mobile-nav-link">Available Lots</a></li>
        <li><a href="properties.html?filter=saved" class="mobile-nav-link">Saved Lots</a></li>
        <li><a href="why-invest.html" class="mobile-nav-link">Why Invest in Polomolok</a></li>
        <li><a href="buying-process.html" class="mobile-nav-link">Buyer's Guide</a></li>
        <li><a href="contact.html" class="mobile-nav-link">Contact Us</a></li>
      </ul>
      <div style="padding-top: 1rem; border-top: 1px solid var(--border); margin-top: 0.75rem;">
        <a href="properties.html" class="btn btn-accent" style="width: 100%; text-align: center; justify-content: center;">View Available Lots</a>
      </div>
    </div>
  </header>`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Replace header section
  content = content.replace(/<!--[\s\S]*?Header Navigation[\s\S]*?-->\s*<header class="site-header">[\s\S]*?<\/header>/, canonicalHeader);
  content = content.replace(/<header class="site-header">[\s\S]*?<\/header>/, canonicalHeader);

  // Remove mobile bottom nav completely
  content = content.replace(/<!--[\s\S]*?Mobile Bottom Navigation[\s\S]*?-->\s*<nav class="mobile-bottom-nav"[\s\S]*?<\/nav>/, '');
  content = content.replace(/<nav class="mobile-bottom-nav"[\s\S]*?<\/nav>/, '');

  fs.writeFileSync(f, content);
  console.log('✓ Standardized header & removed bottom nav in ' + f);
});
