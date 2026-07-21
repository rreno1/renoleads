# RenoLeads - Polomolok Real Estate Land Lot Sales Funnel & Shared Platform

A high-converting public sales funnel for land lot properties in **Polomolok, South Cotabato, Philippines**, built with pure HTML5, Vanilla CSS3, and JavaScript, integrated with a shared **Firebase Cloud Firestore** database, **Cloud Functions**, and **Firebase Cloud Messaging (FCM)** to connect seamlessly with your **RenoLeads Android Management APK**.

---

## Architecture Overview

```
Shared Firebase Project (renoleads)
 ├── Web Application (Public Sales Funnel on Firebase Hosting)
 └── Android Application (RenoLeads APK)
```

- **Website Funnel Role**: Publicly showcase land lot properties in Polomolok, capture buyer inquiries, schedule site visits, and hand off visitors to the Android app.
- **Android APK Role**: Allow authorized owners to manage land listings, upload property photos, track lead inquiries, update site visit statuses, and receive real-time push notifications.
- **Cloud Function Trigger**: Whenever a new lead document is created under `leads/{leadId}`, a Cloud Function dispatches an FCM push notification directly to registered APK device tokens in `deviceTokens/{tokenId}`.

---

## Directory Structure

```
renoleads/
├── public/
│   ├── index.html              # Landing Page (Hero, Featured Lots, Stepper, FAQs, Inquiry Form)
│   ├── properties.html         # Properties Catalog & Filters (Residential, Farm, Commercial)
│   ├── property.html           # Property Detail Page & Android App Link handoff
│   ├── contact.html            # Standalone Inquiry & Site-Visit Request Form
│   ├── privacy.html            # Privacy Policy
│   ├── .well-known/
│   │   └── assetlinks.json     # Android App Links domain verification
│   ├── css/
│   │   ├── variables.css       # HSL color tokens & typography
│   │   ├── global.css          # Typography & utility styles
│   │   ├── components.css      # Hero, Property Cards, Calculator, Forms, Accordion
│   │   └── responsive.css      # Mobile & tablet breakpoints
│   ├── js/
│   │   ├── firebase-config.js  # Firebase SDK v10 init & fallback properties engine
│   │   ├── properties.js      # Listings grid filtering & sorting logic
│   │   ├── property-details.js # Property detail renderer, gallery, & payment calculator
│   │   ├── inquiry-form.js     # Form handler & Firestore lead creation
│   │   └── analytics.js        # Firebase Analytics tracker
│   └── assets/
│       └── images/             # Polomolok hero backdrop & land thumbnails
├── functions/
│   ├── package.json
│   └── src/
│       └── index.js            # FCM push notification trigger on new lead creation
├── firebase.json               # Firebase Hosting & Cloud Functions config
├── firestore.rules             # Role-based Firestore Security Rules
├── storage.rules               # Cloud Storage Rules
├── firestore.indexes.json      # Firestore composite indexes
└── README.md
```

---

## Setup & Deployment Guide

### 1. Connecting Your Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project `renoleads`.
2. Register a **Web App** inside your project.
3. Open `public/js/firebase-config.js` and replace the placeholder `firebaseConfig` object with your project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "renoleads.firebaseapp.com",
  projectId: "renoleads",
  storageBucket: "renoleads.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 2. Registering the Android APK

1. In the same Firebase Project (`renoleads`), register an **Android Application**.
2. Set the Package Name to `com.renoleads.app` (matching `public/.well-known/assetlinks.json`).
3. Download the `google-services.json` file and place it inside your Android APK project root under `app/google-services.json`.
4. Copy your SHA-256 certificate fingerprint from Android Studio / Gradle (`./gradlew signingReport`) into `public/.well-known/assetlinks.json`.

### 3. Deploying Security Rules & Functions

Using the Firebase CLI:

```bash
# Login to Firebase CLI
firebase login

# Select target project
firebase use renoleads

# Deploy Firestore Security Rules & Storage Rules
firebase deploy --only firestore:rules,storage:rules

# Deploy Cloud Functions for Push Notifications
cd functions
npm install
firebase deploy --only functions
```

### 4. Deploying Web Funnel to Firebase Hosting & GitHub Pages

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting
```

To push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit of RenoLeads"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/renoleads.git
git push -u origin main
```


---

## Testing the Data Flow & Lead Hand-off

1. **Browsing Listings**: Open `index.html` or `properties.html` locally or on Firebase Hosting.
2. **Submitting Lead**: Fill out the inquiry form on `contact.html` or `property.html`.
3. **Firestore Document Creation**: A document is written to `leads/{leadId}` with `status: "new"`.
4. **Cloud Function Trigger**: `notifyNewLeadInquiry` detects the new document and sends an FCM push notification to all APK device tokens.
5. **Android App Link Handoff**: Clicking "Open in App" on `property.html` launches your Android app directly to the property screen via Android App Links.
