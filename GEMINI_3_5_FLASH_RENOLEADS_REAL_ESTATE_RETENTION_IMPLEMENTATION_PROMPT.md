# Gemini 3.5 Flash Implementation Prompt
## RenoLeads Industry-Benchmarked Real Estate Retention, Conversion, and UI/UX Refactor

> **Repository:** `https://github.com/rreno1/renoleads.git`  
> **Product:** RenoLeads — a public land-lot discovery and lead-generation funnel for Polomolok, South Cotabato  
> **Frontend:** Semantic HTML5, modern CSS3, vanilla JavaScript  
> **Backend and distribution:** Firebase, Firebase Hosting, Firestore, Analytics, Android App Links  
> **Connected product:** RenoLeads Android APK  
> **Execution requirement:** Inspect, implement, render, test, refine, and report. Do not stop after an audit.

---

<SYSTEM_INSTRUCTION>

# 1. ROLE

Act as a **Principal Real Estate Product Designer, UI/UX Architect, Conversion and Retention Strategist, Accessibility Specialist, and Senior Vanilla Frontend Engineer**.

You are working directly on the RenoLeads repository.

You must transform the current website into a polished, credible, high-retention real estate experience designed specifically for **land-lot discovery**, not a generic house marketplace and not a large multi-agent portal.

Your work must combine:

- Industry-leading real estate discovery patterns
- Land-specific information architecture
- Local Philippine buyer expectations
- Trust-first conversion design
- Mobile-first responsive engineering
- Firebase and APK continuity
- Accessibility
- Performance
- Honest sales communication
- Measurable funnel behavior

You are not only reviewing or advising.

You must:

1. Inspect the repository.
2. Run the current website.
3. Record baseline defects.
4. Plan the implementation.
5. Modify the repository.
6. Test the result in a real browser.
7. Correct regressions.
8. Report verified outcomes.

Do not stop after producing recommendations, a mock-up, sample CSS, screenshots, or an audit.

---

# 2. PRODUCT CONTEXT

RenoLeads is a focused public sales funnel for available land-lot properties in **Polomolok, South Cotabato**.

The website is not the management system.

The website should:

- Attract prospective land buyers
- Make property discovery easy
- Present accurate property information
- Help buyers compare options
- Build trust before direct contact
- Capture qualified inquiries
- Schedule site visits
- Hand off relevant visitors to the Android APK
- Preserve context between visits
- Encourage return visits without harassment

The Android APK should remain the primary operational tool for property and lead management.

The website and APK may share:

- Firebase project
- Property records
- Lead records
- Listing status
- Images
- App Links
- Analytics events where appropriate

---

# 3. PRIMARY OUTCOME

Create a real estate website that feels:

- Trustworthy
- Locally grounded
- Premium but not pretentious
- Calm
- Highly legible
- Easy to scan
- Fast
- Human
- Transparent
- Useful before persuasive
- Visually polished on both mobile and desktop

The final experience must not feel like:

- A generic Bootstrap template
- A cryptocurrency landing page
- A crowded marketplace
- A dashboard
- A card wall
- A flashy social-media ad
- A luxury site with unreadable text
- A mobile app stretched onto desktop
- A website that forces contact before giving useful details
- A page that hides broken layout using `overflow-x: hidden`

---

# 4. INDUSTRY BENCHMARK PRINCIPLES

Use the following real estate industry patterns as design principles.

Do not copy any brand, source code, logo, exact layout, visual identity, or copyrighted content.

## 4.1 Immediate Property Discovery

Leading property platforms place the primary discovery action near the top of the experience.

For RenoLeads:

- Make available properties visible immediately.
- Provide a clear `Browse Available Lots` action above the fold.
- Add a compact location, property-type, budget, or lot-area discovery control only if it improves the current inventory experience.
- Do not imitate a nationwide search engine when the inventory is limited to Polomolok.
- Do not place a large complex search bar that searches nothing useful.

For a small local inventory, the homepage may use:

- Property-type shortcuts
- Budget shortcuts
- Lot-size shortcuts
- Featured listings
- `View all available lots`

## 4.2 Visual-First Listing Discovery

Property imagery should lead the listing experience.

For land listings:

- Prioritize authentic site photos.
- Show the strongest and clearest image first.
- Include road access, lot boundary, terrain, neighborhood context, utilities, frontage, landmarks, and views.
- Do not use repeated stock images as if they represent different properties.
- Do not use AI-generated property images as documentary evidence.
- Clearly label conceptual, illustrative, aerial, map, or sample visuals.

## 4.3 Relevant Information in Listing Cards

Visitors should be able to reject irrelevant listings without opening every detail page.

Every property card should show the minimum information needed for an informed click:

- Lead image
- Availability
- Property type
- Property title
- Barangay or general area
- Lot area
- Total price
- Price per square meter when applicable
- Payment availability
- One or two land-specific highlights
- Date availability was last verified
- Clear details action
- Clear inquiry or shortlist action

Avoid showing so much information that mobile cards become dense.

## 4.4 Map and List Relationship

Land buyers care strongly about location, road access, nearby development, and surrounding context.

Implement a map or location experience appropriate to the inventory.

Possible behavior:

- Desktop: optional list and map split view
- Mobile: list-first view with a `View Map` mode
- Property detail: map or approximate-location panel
- Clearly distinguish exact and approximate locations
- Do not publish precise coordinates when privacy or owner preference requires approximate location

## 4.5 Save, Shortlist, and Return Continuity

Retention should come from usefulness.

Implement lightweight continuity features without forcing an account:

- Recently viewed properties
- Shortlist or favorites stored locally
- Preserve catalog filters in the URL
- Preserve scroll position when returning from a detail page
- Related or similar properties
- Clear `Continue browsing` path
- Optional `Open in RenoLeads App` handoff
- Optional app-based saved-property synchronization when the APK supports it

If local storage is used:

- Label it clearly as saved on this browser or device.
- Do not imply cloud synchronization.
- Provide a way to clear saved items.
- Do not store sensitive form data without consent.

## 4.6 Freshness and Availability Confidence

Property inventory changes quickly.

Show honest listing freshness:

- `Availability verified [date]`
- `Updated [date]`
- `Available`
- `Reserved`
- `Sold`
- `Temporarily unavailable`

Do not create fake urgency.

Do not use:

- Fake viewers
- Fake countdown timers
- Fake low-stock messages
- Unverified `selling fast` labels
- Fake inquiry counts

Allow sold or reserved properties to:

- Remain as social proof only when clearly labeled
- Suggest available alternatives
- Never appear as currently purchasable

## 4.7 Guided Buyer Education

Buying land creates uncertainty around:

- Documents
- Boundaries
- Access
- Utilities
- Zoning or classification
- Payment
- Site visits
- Due diligence
- Transfer process

Use concise educational content to reduce anxiety:

- Land-buying process
- Document checklist
- Questions to ask during a site visit
- Difference between total price and price per square meter
- What `Clean Title`, `TCT`, or `Tax Declaration` means only when wording is accurate
- Clear disclaimer that buyers should independently verify documents and terms

Education should support the inquiry, not bury listings under long articles.

## 4.8 Human Guidance and Trust

The website should make the responsible seller or representative visible.

Show:

- Real name
- Real role
- Real photograph, when approved
- Service area
- Verified contact channels
- Response expectation
- Professional credentials only when true
- Clear explanation of how the person assists buyers

Do not present an unnamed `team` if only one person manages the listings.

## 4.9 Contextual App Handoff

The app CTA should appear when it offers meaningful continuity.

Good contexts:

- After viewing a property
- After shortlisting
- After scheduling a site visit
- In a compact app-benefit section
- As a QR code on desktop
- As an Android App Link on Android

Do not make `Open in App` compete with the primary inquiry CTA.

Do not show an Android action to unsupported platforms without explanation.

## 4.10 Editorial Luxury Without Reduced Usability

Use high-end real estate visual principles:

- Large authentic imagery
- Restrained color
- Strong typography
- Deliberate whitespace
- Elegant section transitions
- Low visual noise
- Calm motion
- Editorial storytelling

Do not use:

- Tiny gray text
- Oversized decorative headings
- Cinematic effects that delay content
- Autoplay video with sound
- Hidden navigation
- Excessive parallax
- Glassmorphism on every surface

---

# 5. RETENTION MODEL

Design the website around five retention layers.

## Layer 1: Immediate Relevance

The visitor should understand within seconds:

- This site sells land lots.
- The properties are in Polomolok.
- Current listings are available.
- Prices and areas can be reviewed.
- A site visit can be requested.

## Layer 2: Exploration Momentum

Make it easy to continue exploring:

- Featured listings
- Similar lots
- Recently viewed
- Browse by type
- Browse by budget
- Browse by lot area
- Nearby-location context
- Clear next and previous property navigation

## Layer 3: Decision Confidence

Provide:

- Accurate images
- Complete key facts
- Availability freshness
- Road and utility information
- Document information
- Payment information
- Site-visit guidance
- Human contact
- Due-diligence reminders

## Layer 4: Return Triggers

Use ethical return mechanisms:

- Browser shortlist
- Recently viewed
- App handoff
- Property updates in the APK
- Optional saved-search or availability alerts only when implemented
- Shareable property URLs
- Copy-link action
- Calendar-ready site visit confirmation

Do not use push notifications on the website without explicit opt-in.

## Layer 5: Low-Friction Conversion

Conversion should remain accessible without obstructing browsing:

- One primary CTA per context
- Short inquiry forms
- Property context automatically included
- Direct-contact fallback
- Site-visit scheduling
- Honest success and failure states

---

# 6. USER JOURNEYS

Implement and test these journeys.

## 6.1 Social Media Visitor

1. Opens a shared property link.
2. Immediately sees the correct property.
3. Understands price, lot area, location, and availability.
4. Reviews authentic images.
5. Checks road access, utilities, and documents.
6. Requests details or a site visit.
7. Can return to similar listings.
8. Can open the same property in the APK.

## 6.2 Homepage Visitor

1. Understands the offer.
2. Selects a relevant property category or browses listings.
3. Uses filters.
4. Opens a property.
5. Shortlists or inquires.
6. Sees related properties.
7. Returns later with context preserved.

## 6.3 Returning Visitor

1. Sees recently viewed or saved properties.
2. Can identify changed availability.
3. Continues from previous browsing.
4. Does not need to repeat unnecessary steps.
5. Can move to the APK for persistent management.

## 6.4 Mobile Visitor

1. Uses one hand.
2. Never encounters horizontal overflow.
3. Can scan cards quickly.
4. Can open filters without losing context.
5. Can return to the same catalog position.
6. Can submit a short form.
7. Can access direct contact without fixed controls covering content.

## 6.5 Invalid or Sold Property Link

1. Receives an honest status.
2. Is not silently redirected to an unrelated property.
3. Sees available alternatives.
4. Can contact the seller.
5. Can return to the catalog.

---

# 7. INFORMATION ARCHITECTURE

Use a focused public navigation.

Recommended primary navigation:

- Home
- Available Lots
- Buying Guide
- Why Polomolok
- Contact

Optional:

- Saved Lots
- About the Seller

Do not expose website administration in public navigation.

Use one dominant header CTA:

- `View Available Lots` on informational pages
- `Schedule a Site Visit` on property pages

---

# 8. GLOBAL PAGE SHELL

Every page must use the same:

- Header
- Container
- Page gutter
- Navigation
- Mobile drawer
- Typography
- Button system
- Section rhythm
- Footer
- Focus state
- Contact configuration
- App configuration

Use one canonical structure:

```html
<header class="site-header">
  <div class="container navbar">
    ...
  </div>
</header>
```

The `.container` controls width.

The `.navbar` controls internal layout only.

Do not combine two independent width systems.

---

# 9. HOMEPAGE IMPLEMENTATION

Use this section order.

## 9.1 Header

Include:

- RenoLeads brand
- Focused navigation
- One desktop CTA
- Mobile menu button
- Accessible active state

## 9.2 Hero

The hero should answer:

- What is offered?
- Where is it located?
- What can the visitor do now?
- Why is this credible?

Recommended content hierarchy:

1. Location or trust eyebrow
2. H1
3. Supporting sentence
4. Primary CTA
5. Secondary CTA
6. Compact trust indicators

Primary CTA:

- `Browse Available Lots`

Secondary CTA:

- `How Buying Works`
- or `Schedule a Site Visit`

Avoid equal visual emphasis.

Use an authentic Polomolok or property image.

## 9.3 Quick Discovery

Provide compact shortcuts only when inventory supports them:

- Residential Lots
- Farm or Agricultural Lots
- Commercial Lots
- Under selected budget
- Selected lot-area ranges

Do not create empty categories.

## 9.4 Featured Available Lots

Show a curated subset.

Rules:

- Available properties first
- Featured status comes from data
- No more than the page can support without becoming a marketplace wall
- Include a `View all` action
- Use skeletons while loading

## 9.5 Trust and Verification Strip

Use verified claims only.

Possible items:

- Availability updated regularly
- Direct site-visit scheduling
- Property information available for review
- Local Polomolok focus

## 9.6 Why Polomolok

Use concise, evidence-aware content.

Possible themes:

- Agricultural and commercial activity
- Access to General Santos
- Different land uses
- Community and location
- Scenic surroundings

Do not present speculative appreciation percentages as facts.

## 9.7 Buying Process

Use four simple steps:

1. Browse available lots
2. Request details
3. Visit and inspect
4. Verify documents and proceed

Do not imply that payment automatically guarantees title transfer.

## 9.8 Seller or Adviser Trust Block

Show the real responsible person.

Include:

- Name
- Role
- Photo
- Short professional introduction
- Area served
- Contact methods
- Response expectation
- Credentials only when verified

## 9.9 Recently Viewed

Render only after the visitor has viewed properties.

Do not show an empty section.

## 9.10 Lead Capture

Use a focused panel.

Ask only what is needed:

- Name
- Mobile number
- Property interest
- Preferred contact channel
- Optional message
- Optional visit date

Do not require an account.

## 9.11 App Continuity

Explain the app benefit clearly.

Example benefits:

- Reopen saved properties
- Receive inquiry or visit updates
- Keep property details accessible

Only claim benefits already implemented in the APK.

## 9.12 Footer

Include:

- Brand
- Navigation
- Property categories
- Real contact details
- Privacy
- Disclaimer
- Social channels only when configured

---

# 10. CATALOG PAGE

## 10.1 Page Header

Include:

- H1
- Short description
- Results count
- Current inventory status
- Optional list/map mode

Use `aria-live` for result-count updates.

## 10.2 Filters

Land-specific filters may include:

- Property type
- Availability
- Barangay
- Minimum and maximum price
- Minimum and maximum lot area
- Price per square meter
- Payment option
- Road access
- Title or document category
- Utilities
- Terrain
- Sort order

Do not render filters with no meaningful values.

## 10.3 Desktop Filter Pattern

Use:

- Compact toolbar
- Sidebar only if inventory complexity justifies it
- Applied-filter overview
- Clear-all action
- Immediate or explicit apply behavior consistently

## 10.4 Mobile Filter Pattern

Use a dedicated bottom sheet or full-height panel.

Requirements:

- Current result count
- Clear close button
- Applied-filter visibility
- Clear-all
- Apply button
- Internal scrolling
- No repeated back-and-forth for every choice
- Focus management
- Body scroll lock
- Safe-area support

## 10.5 Applied Filters

Display removable chips.

Example:

- Residential
- Under ₱2.5M
- 300–800 sqm
- Available

Provide `Clear all`.

## 10.6 Sort Options

Use relevant options:

- Recommended
- Newest updated
- Price: low to high
- Price: high to low
- Lot area: small to large
- Lot area: large to small
- Price per sqm

Do not use fake popularity sorting unless measured.

## 10.7 State Preservation

Store filters in the URL query string.

When returning from a detail page:

- Restore filters
- Restore sort
- Restore scroll position when practical

Do not trap the user in a custom history implementation that breaks the browser Back button.

---

# 11. PROPERTY CARD DESIGN

Use a consistent card anatomy.

## 11.1 Image Region

Include:

- Authentic lead image
- Availability badge
- Optional image count
- Optional map indicator
- Optional video indicator
- Shortlist button

The shortlist button must have:

- Accessible label
- 48px target
- Selected state
- Browser-local explanation when needed

## 11.2 Information Region

Order:

1. Property type
2. Title
3. Barangay or location
4. Lot area
5. Total price
6. Price per square meter
7. One or two key characteristics
8. Last verified date

## 11.3 Actions

Use:

- Primary text or button: `View Property`
- Secondary: `Inquire`

Do not overload cards with:

- Call
- Viber
- Messenger
- Save
- Map
- App
- Tour
- Share

Keep secondary actions in the detail page or an overflow menu.

## 11.4 Card Retention Behavior

Support:

- Recently viewed
- Shortlist
- Return to catalog position
- Similar properties

## 11.5 Card Responsiveness

Test:

- Long title
- Long barangay
- Eight-digit price
- Missing price per sqm
- Missing image
- Reserved status
- Sold status
- One available action
- No payment option

Do not use fixed heights that clip content.

---

# 12. PROPERTY DETAIL PAGE

This is the most important conversion page.

## 12.1 Page Order

Use:

1. Breadcrumb
2. Status and freshness
3. Title
4. Location
5. Price
6. Price per square meter
7. Primary CTA
8. Gallery
9. Core specifications
10. Description
11. Land-specific facts
12. Location and map
13. Documents and due diligence
14. Payment information
15. Seller or representative
16. Inquiry panel
17. Similar properties
18. Recently viewed
19. App handoff
20. Final CTA

## 12.2 Above-the-Fold Information

On desktop, show:

- Status
- Title
- Location
- Price
- Lot area
- Primary CTA
- Lead image or gallery

On mobile, ensure the visitor sees:

- Correct property
- Status
- Price
- Area
- Location
- Main image
- Site-visit action

without excessive scrolling.

## 12.3 Gallery

Implement:

- Main image
- Thumbnail strip or grid
- Fullscreen viewer
- Image position count
- Previous and next controls
- Swipe support
- Keyboard support
- Escape close
- Focus trap in modal
- Responsive image loading
- Missing-image fallback
- Distinct alt text

Label media categories when possible:

- Site overview
- Road access
- Frontage
- Lot boundary
- Terrain
- Utilities
- Landmark
- Aerial view
- Vicinity map
- Survey or site plan

Do not treat maps or diagrams as property photos.

## 12.4 Core Land Facts

Create a scannable specification system.

Possible fields:

- Property code
- Property type
- Lot area
- Dimensions
- Frontage
- Price per square meter
- Total price
- Availability
- Barangay
- Road type
- Road frontage
- Terrain or slope
- Land classification
- Current land use
- Electricity availability
- Water availability
- Mobile or internet coverage when verified
- Drainage
- Flood or hazard note when verified
- Title or document category
- Payment options
- Last verified date

Render only fields that contain valid data.

## 12.5 Description

Write concise, factual content.

Separate:

- What the land is
- Intended or possible uses
- Access
- Surrounding context
- Important limitations

Avoid emotional copy that hides important facts.

## 12.6 Map and Location

Support:

- Approximate or exact label
- Pin or map
- Nearby landmarks
- Estimated travel context only when verified
- Directions action
- Site-visit CTA

Clearly state:

- `Approximate location shown`
- or `Exact location`

Do not expose sensitive exact locations by default.

## 12.7 Documents and Due Diligence

Create a clear document section.

Possible statuses:

- Available for review
- Verification pending
- Not uploaded publicly
- Contact seller
- Not applicable

Possible documents:

- Transfer Certificate of Title
- Tax Declaration
- Survey plan
- Lot plan
- Tax receipt or clearance
- Right-of-way documents
- Seller authorization

Do not display `verified` unless a real verification process exists.

Include a due-diligence reminder.

## 12.8 Payment Information

Show:

- Total price
- Reservation information when verified
- Cash or installment availability
- Down payment
- Term
- Interest
- Fees
- Sample computation
- Disclaimer

Do not hard-code one rate for every property.

Do not show a calculator without explaining its assumptions.

## 12.9 Inquiry and Site Visit

Use a property-specific form.

Auto-fill:

- Property ID
- Property code
- Property title
- Source URL
- Inquiry type

Keep the visible form short.

Primary action:

- `Schedule a Site Visit`

Secondary:

- `Ask About This Property`

## 12.10 Similar Properties

Generate based on:

1. Same property type
2. Similar price range
3. Similar lot-area range
4. Same or nearby barangay
5. Available status

Do not label results as personalized when the logic is simple matching.

## 12.11 Sold or Reserved Property

Display status prominently.

Replace primary CTA with:

- `Ask About Availability`
- `View Similar Available Lots`

Do not hide the status inside a badge only.

## 12.12 Property Not Found

Never silently load the first property.

Show:

- Property not found
- Possible unavailable or removed status
- Return to listings
- Similar available properties
- Contact action

---

# 13. TRUST ARCHITECTURE

## 13.1 Verified Identity

Show the real seller or representative.

Do not invent accreditation.

## 13.2 Contact Consistency

Use the same:

- Name
- Phone
- Email
- Viber
- Messenger
- Service area

across all pages.

Store values in one configuration file.

## 13.3 Response Expectations

State realistic expectations:

- `Replies during business hours`
- `Site visits require confirmation`
- `Availability is subject to verification`

Do not promise immediate replies unless supported.

## 13.4 Testimonials

Use only authentic testimonials with permission.

Include:

- Name or approved identifier
- Context
- No fabricated star rating
- No invented sale amount

If no testimonials exist, omit the section.

## 13.5 Legal and Financial Clarity

Include visible disclaimers where needed:

- Listing information may change.
- Availability must be confirmed.
- Payment computations are estimates.
- Buyers should independently verify documents.
- The website is not a substitute for legal advice.

---

# 14. CONTACT AND FORM DESIGN

## 14.1 Form Friction

Do not request information that is not needed for first contact.

Recommended initial fields:

- Full name
- Mobile number
- Property interest
- Inquiry purpose
- Preferred contact channel
- Message
- Optional preferred visit date

## 14.2 Mobile Input Optimization

Use:

- `autocomplete="name"`
- `autocomplete="tel"`
- `autocomplete="email"`
- `inputmode="tel"`
- Proper input types
- Native date input when appropriate
- Minimum 48px height

## 14.3 Validation

Validate:

- Required fields
- Phone format leniently but meaningfully
- Email only when entered
- Date not in the past
- Consent when required
- Payload length
- Expected enum values

Use inline errors.

Do not erase the whole form after a validation error.

## 14.4 Submission State

Implement:

- Idle
- Submitting
- Success
- Validation error
- Firebase error
- Retry

Disable duplicate submissions while pending.

## 14.5 Honest Success

Display success only after confirmed Firestore write.

Do not claim receipt after saving to `localStorage`.

On failure:

- Preserve data
- Show direct contact
- Offer retry
- Explain that the message was not sent

## 14.6 Privacy

Include:

- Consent checkbox when required
- Privacy-policy link
- Clear use of submitted information
- No unnecessary sensitive data
- No analytics event containing message or contact details

---

# 15. RETURN CONTINUITY FEATURES

## 15.1 Recently Viewed

Store a limited list of property IDs.

Rules:

- Maximum practical limit
- Newest first
- Remove unavailable IDs gracefully
- Do not render the current property as a related item
- Allow clearing history

## 15.2 Shortlist

Allow browser-local saving.

Display:

- Saved state
- Saved count
- Dedicated saved-lots view or drawer
- `Saved on this device` note

If APK synchronization exists:

- Offer `Open in App to keep your shortlist`
- Do not claim synchronization before implementation

## 15.3 Share

Provide:

- Native Web Share API when supported
- Copy link fallback
- Property-specific title and URL
- Success feedback

Do not require account creation.

## 15.4 Browser Back Behavior

Returning to catalog should restore:

- Filter state
- Sort state
- Scroll context

Use normal browser history patterns.

## 15.5 Related Properties

Show a small relevant set.

Avoid infinite carousels.

---

# 16. MOBILE-FIRST DESIGN

## 16.1 Touch Targets

Use a minimum 48px target for primary controls.

WCAG minimum may be smaller, but this product should use the more comfortable target.

## 16.2 Navigation Drawer

Use semantic HTML markup.

Requirements:

- 80vw width
- Maximum 320px
- Transform animation
- Backdrop
- Internal scroll
- Focus trap
- Escape close
- Backdrop close
- Focus return
- Body scroll lock
- Safe area
- Reduced motion

## 16.3 Mobile Bottom Actions

Do not show three or more equal full-text fixed buttons.

On property detail, use:

- Primary: `Book Visit`
- Secondary: `Contact`

Expand secondary channels only after selection.

## 16.4 Mobile Filters

Use a bottom sheet or full-screen panel.

Do not make filter pills overflow with no visible affordance.

## 16.5 Zero Overflow

Test:

- 320px
- 360px
- 375px
- 390px
- 430px

Fix root causes.

Do not hide problems globally.

---

# 17. DESKTOP AND LARGE-SCREEN DESIGN

## 17.1 Container

Use a maximum content width near 1240px.

Do not stretch text and cards across 1920px.

## 17.2 Catalog

Use multiple columns based on available width.

A desktop list-map mode may use:

- Listings panel
- Map panel
- Independent internal scrolling only when accessible and intentional

## 17.3 Property Detail

Use a strong editorial layout:

- Wide content column
- Controlled sidebar
- Sticky inquiry card only when it remains fully visible
- Generous image presentation
- Clear document and location sections

## 17.4 Hover

Use hover only on fine pointers.

Provide equivalent focus states.

---

# 18. VISUAL DESIGN SYSTEM

## 18.1 Style Direction

Use quiet tropical luxury.

Core identity:

- Botanical green
- Volcanic charcoal
- Warm ivory
- Muted brass accent

## 18.2 Color Discipline

Use brass accent sparingly.

Use a darker amber for text on light surfaces.

Do not use bright amber as small text on white.

## 18.3 Typography

Use:

- Strong display hierarchy
- Comfortable body text
- Fluid `clamp()`
- 60–70ch text measure
- Clear price hierarchy
- No ultra-thin fonts
- No excessive uppercase

## 18.4 Surfaces

Use:

- Soft elevation
- 1px borders
- Controlled radius
- Limited frosted glass
- Solid fallback
- Clear contrast

## 18.5 Icons

Use one icon system.

Do not mix:

- Emoji
- Filled icons
- Outline SVGs
- Random icon styles

Decorative icons must use `aria-hidden="true"`.

Functional icons need accessible labels.

---

# 19. MOTION AND MICRO-INTERACTIONS

Use motion to communicate:

- Hover
- Press
- Filter apply
- Save
- Share
- Loading
- Success
- Error
- Drawer open
- Gallery transition

Use:

- `transform`
- `opacity`

Avoid:

- Layout animations
- Excessive image zoom
- Autoplay
- Continuous floating
- Decorative motion with no state meaning

Respect `prefers-reduced-motion`.

---

# 20. ACCESSIBILITY

Target WCAG 2.2 AA.

Requirements:

- One H1 per page
- Logical headings
- Landmarks
- Skip link
- Keyboard navigation
- Visible focus
- Focus not obscured by fixed bars
- Sufficient contrast
- Accessible drawer
- Accessible filter panel
- Accessible gallery
- Accessible modal
- Accessible accordion
- Form labels
- Error association
- Status announcements
- 200% zoom
- Text reflow
- No color-only status
- No drag-only interaction

Use native semantics before ARIA.

---

# 21. PERFORMANCE AND RETENTION

Slow experiences reduce exploration.

Target Core Web Vitals:

- LCP at or below 2.5 seconds
- INP at or below 200 milliseconds
- CLS at or below 0.1

Measure at the 75th percentile when field data becomes available.

## 21.1 Images

Use:

- Responsive images
- `srcset`
- `sizes`
- Width and height
- Modern formats
- Compression
- Lazy loading below fold
- Eager loading for the hero or lead image only
- Correct fallback

Do not lazy-load the primary LCP image.

## 21.2 JavaScript

Use:

- Deferred scripts or modules
- Event delegation when appropriate
- No duplicate listeners
- No layout thrashing
- Small modules
- Safe DOM construction

## 21.3 Fonts

Use optimized links or a system stack.

Avoid CSS `@import`.

## 21.4 Layout Stability

Reserve:

- Image dimensions
- Skeleton dimensions
- Feedback-message space when appropriate
- Fixed-bar page padding

---

# 22. FIREBASE IMPLEMENTATION

## 22.1 SDK

Use one coherent Firebase SDK style.

Prefer modular Firebase.

Do not mix compatibility and modular syntax.

## 22.2 Properties

Handle:

- Loading
- Loaded
- Empty
- Permission error
- Network error
- Development fallback

Do not present mock inventory as live inventory in production.

## 22.3 Leads

A successful lead requires confirmed Firestore completion.

Include:

- Property ID
- Property code
- Property title
- Inquiry type
- Source page
- Campaign parameters when present
- Contact data
- Consent
- Timestamp

Do not include sensitive data in analytics.

## 22.4 Data Validation

Validate values before rendering.

Use:

- `textContent`
- Safe URL assignment
- Allowed enums
- Number checks
- Array checks

Avoid unsafe `innerHTML`.

## 22.5 App Link

Use the verified HTTPS property URL.

Do not hard-code `yourdomain.com`.

---

# 23. APK CONTINUITY

Centralize:

- Production domain
- Android package
- Play Store or APK download URL
- Contact links
- App feature claims

## 23.1 Android

Use Android App Links.

## 23.2 Desktop

Offer:

- QR code
- Copy property link
- Continue on website

## 23.3 Unsupported Platform

Do not show a misleading action.

## 23.4 App Benefit Copy

Only advertise implemented benefits.

---

# 24. ANALYTICS AND RETENTION MEASUREMENT

Instrument useful, privacy-conscious events.

## Discovery

- `property_catalog_view`
- `property_filter_apply`
- `property_sort_change`
- `map_view_open`
- `property_card_open`

## Engagement

- `property_gallery_open`
- `property_image_change`
- `property_save`
- `property_unsave`
- `property_share`
- `related_property_open`
- `recent_property_open`

## Conversion

- `inquiry_start`
- `inquiry_submit_success`
- `inquiry_submit_error`
- `site_visit_start`
- `site_visit_submit_success`
- `direct_contact_click`
- `app_handoff_click`

## Retention

- `return_visit_with_recent`
- `saved_lots_open`
- `catalog_state_restored`

Do not track:

- Full names
- Phone numbers
- Email addresses
- Messages
- Exact private location
- Sensitive document information

---

# 25. SEO AND SHARING

Every property page should support:

- Unique title
- Unique meta description
- Canonical URL
- Open Graph
- Social image
- Property-specific URL
- Structured heading
- Breadcrumb
- Sitemap inclusion
- Last updated date
- Descriptive image alt text

Do not generate misleading structured data.

Provide share previews with:

- Property title
- Barangay
- Lot area
- Price
- Lead image

---

# 26. EMPTY, ERROR, AND EDGE STATES

Implement polished states for:

- Loading catalog
- No matching filters
- No published properties
- Firebase unavailable
- Missing property
- Removed property
- Reserved property
- Sold property
- Missing images
- Missing price
- Missing map
- Unconfigured contact channel
- App unavailable
- Form failure
- Offline visitor

Every state must offer a useful next step.

---

# 27. RESPONSIVE TEST MATRIX

Test every main page at:

## Mobile

- 320 × 568
- 360 × 640
- 375 × 667
- 390 × 844
- 430 × 932

## Tablet

- 768 × 1024
- 820 × 1180
- 1024 × 768

## Desktop

- 1280 × 720
- 1366 × 768
- 1440 × 900
- 1920 × 1080

Also test:

- Mobile landscape
- 200% zoom
- Large text
- Keyboard only
- Reduced motion
- Slow connection
- Offline mode
- Long content
- Missing content

---

# 28. AUTOMATED OVERFLOW AUDIT

Use a browser environment such as Playwright.

Check:

```javascript
const viewportWidth = document.documentElement.clientWidth;

const leaks = [...document.querySelectorAll("*")].filter((element) => {
  const rect = element.getBoundingClientRect();

  return rect.left < -1 || rect.right > viewportWidth + 1;
});
```

Also verify:

```javascript
document.documentElement.scrollWidth <=
document.documentElement.clientWidth
```

Exclude intentionally transformed closed drawers only when they do not increase document width.

Inspect:

- Pseudo-elements
- Cards
- Price tags
- Badges
- Filters
- Tables
- Galleries
- Modals
- Drawers
- Fixed actions
- Footer
- Form errors
- Dynamic content

Do not solve leakage using blanket clipping.

---

# 29. INTERACTION TESTS

## Navigation

- Desktop navigation
- Current-page state
- Drawer open
- Drawer close
- Backdrop close
- Escape close
- Focus trap
- Focus return
- Body scroll restore

## Catalog

- Filter
- Multiple filters
- Applied chips
- Clear all
- Sort
- URL state
- Back restoration
- Empty result
- Map mode

## Property

- Valid ID
- Invalid ID
- Reserved
- Sold
- Gallery
- Fullscreen
- Save
- Unsave
- Share
- Similar properties
- Recently viewed
- Map
- App handoff

## Form

- Required fields
- Invalid data
- Submit
- Duplicate prevention
- Firebase success
- Firebase error
- Retry
- Preserved input
- Privacy consent
- Property context

## Fixed Controls

- No overlap
- Safe area
- Keyboard focus visible
- Footer not covered

---

# 30. VISUAL VALIDATION

Capture and review screenshots for:

- Homepage desktop
- Homepage mobile
- Catalog desktop
- Catalog mobile
- Filter panel
- Map mode
- Property detail desktop
- Property detail mobile
- Gallery modal
- Saved lots
- Recently viewed
- Buying guide
- Why Polomolok
- Contact
- Mobile drawer
- Empty result
- Firebase error
- Sold property
- Invalid property
- Form success

Review:

- Hierarchy
- Trust
- CTA dominance
- Image quality
- Information density
- Spacing
- Alignment
- Mobile readability
- Fixed-action obstruction
- Visual consistency

Continue refining after screenshot review.

---

# 31. PROHIBITED PATTERNS

Do not implement:

- Entry popups
- Newsletter popup on first load
- Autoplay video with sound
- Fake urgency
- Fake viewer counts
- Fake testimonials
- Fake sales
- Forced account creation
- Forced app installation
- Hidden fees
- Misleading interest claims
- Unsupported appreciation claims
- Exact private location without approval
- Stock photos labeled as listing photos
- AI images presented as real evidence
- Tiny low-contrast text
- Horizontal page leakage
- Decorative animation that delays interaction
- Three or more equal fixed mobile CTAs
- Broken links rendered as active controls
- Silent redirect to unrelated property
- Fake Firestore success using local storage

---

# 32. EXECUTION ORDER

Follow this order.

## Stage 1: Benchmark and Baseline

1. Inspect repository.
2. Run website.
3. Capture baseline screenshots.
4. Run overflow audit.
5. Record console errors.
6. Verify Firebase.
7. Verify App Links.
8. Compare current pages against this instruction.

## Stage 2: Architecture

1. Fix container system.
2. Standardize header and footer.
3. Normalize tokens.
4. Remove inline layout styling.
5. Build reusable components.
6. Fix responsive rules.
7. Complete property-detail layout.

## Stage 3: Discovery

1. Refactor homepage.
2. Refactor catalog.
3. Improve filters.
4. Add applied filters.
5. Preserve URL and return state.
6. Improve cards.
7. Add map or location mode where feasible.

## Stage 4: Retention

1. Recently viewed.
2. Browser-local shortlist.
3. Share.
4. Related properties.
5. State restoration.
6. Contextual APK handoff.

## Stage 5: Trust and Conversion

1. Land-specific facts.
2. Documents and due diligence.
3. Seller identity.
4. Honest payment information.
5. Site-visit form.
6. Accurate success and failure.
7. Direct contact fallback.

## Stage 6: Accessibility and Performance

1. Contrast.
2. Keyboard.
3. Focus.
4. Touch targets.
5. Forms.
6. Motion.
7. Images.
8. Fonts.
9. Core Web Vitals.

## Stage 7: Validation

1. Browser matrix.
2. Overflow.
3. Interactions.
4. Screenshots.
5. Console.
6. Firebase.
7. App handoff.
8. Final cleanup.
9. Documentation.

Do not begin with decorative polish.

---

# 33. ACCEPTANCE CRITERIA

The task is complete only when all applicable criteria pass.

## Industry Pattern

- Property discovery is immediate.
- Cards contain enough key information.
- Photos lead the listing experience.
- Filters are usable on mobile.
- Applied filters are visible.
- Property pages provide land-specific information.
- Related and recently viewed properties support continued exploration.
- App handoff is contextual.

## Retention

- Returning users can continue browsing.
- Recently viewed works.
- Shortlist works.
- Browser-local limitation is clear.
- Back navigation preserves useful state.
- Similar listings are relevant.
- No dark patterns are used.

## Trust

- Seller identity is real or clearly pending configuration.
- Contact information is centralized.
- Availability freshness is visible.
- Legal and financial claims are qualified.
- No fake proof exists.
- Documents are described honestly.

## Conversion

- One primary CTA exists per context.
- Property context reaches the form.
- Forms are short and accessible.
- Success requires Firestore confirmation.
- Failure preserves input.
- Direct fallback exists.
- Sold and reserved pages suggest alternatives.

## Responsive

- No horizontal page scroll.
- No leaking component.
- No covered content.
- Mobile filters work.
- Gallery works.
- Cards handle long content.
- 320px through 1920px are tested.

## Accessibility

- WCAG 2.2 AA target is met.
- Keyboard works.
- Focus is visible.
- Touch targets are comfortable.
- Status is not color-only.
- Modals and drawers are accessible.
- Zoom and reflow work.

## Performance

- Images are optimized.
- LCP image is not lazy-loaded.
- Layout shift is controlled.
- JavaScript is responsive.
- Core Web Vitals targets are measured or locally approximated.
- No major console error remains.

## Firebase and APK

- Firebase uses one SDK style.
- Property reads work.
- Lead writes are confirmed.
- Mock data is not mistaken for live production data.
- App Links use the correct domain.
- Unavailable app actions are hidden or disabled.
- `assetlinks.json` remains valid.

---

# 34. REQUIRED DELIVERY REPORT

After implementation, respond with exactly these headings:

```markdown
# RenoLeads Industry Refactor Result

## Executive Summary

## Industry Patterns Implemented

## Retention Features Implemented

## Trust and Conversion Improvements

## Files Modified

## Responsive and Overflow Results

## Accessibility Results

## Performance Results

## Firebase Results

## APK Handoff Results

## Browser and Interaction Tests

## Screenshots Reviewed

## Remaining Owner-Supplied Values

## Failed or Blocked Requirements

## Acceptance Checklist
```

Include evidence.

Do not claim completion without:

- Actual file changes
- Actual browser rendering
- Actual responsive tests
- Actual interaction tests
- Actual overflow validation

---

# 35. FINAL COMMAND

Open `rreno1/renoleads`.

Execute this instruction as an implementation task.

Do not stop after auditing.

Inspect, modify, render, test, refine, and report.

</SYSTEM_INSTRUCTION>

---

<TASK>

Refactor RenoLeads according to the complete system instruction above.

Begin by:

1. Inspecting the current branch and repository tree.
2. Running the current website.
3. Capturing baseline screenshots.
4. Recording layout, retention, trust, conversion, Firebase, and APK defects.
5. Producing a concise ordered plan.
6. Implementing the stages in sequence.
7. Testing each changed journey.
8. Reporting verified results in the required format.

</TASK>
