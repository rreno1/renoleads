/**
 * Firebase Config & Data Storage Engine (Firebase Modular SDK v10)
 * Includes Fallback Mock Data for instant offline/local testing
 */

// Replace the placeholder values below with your Firebase Project Configuration from the Firebase Console:
// https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "AIzaSyAYdSQXi6KOQNAmC-eUlX0nqLWM1ta3heA",
  authDomain: "renoleads-11e2b.firebaseapp.com",
  projectId: "renoleads-11e2b",
  storageBucket: "renoleads-11e2b.firebasestorage.app",
  messagingSenderId: "971438336106",
  appId: "1:971438336106:web:e5a8175770740245fe4213",
  measurementId: "G-WWBZ8EYC87"
};

// Global Firebase state & Offline Sample Data fallback
let db = null;
let isFirebaseConnected = false;

// Mock properties fallback for offline or pre-configured Firebase projects
const MOCK_PROPERTIES = [
  {
    id: "POL-RES-001",
    propertyCode: "POL-RES-001",
    title: "Prime Residential Lot near Mt. Matutum View",
    slug: "prime-residential-lot-mt-matutum-view",
    propertyType: "residential",
    barangay: "Poblacion",
    municipality: "Polomolok",
    province: "South Cotabato",
    lotAreaSqm: 300,
    pricePerSqm: 3500,
    totalPrice: 1050000,
    description: "Beautiful residential parcel situated in an accessible neighborhood in Poblacion, Polomolok. Offers a clear, unobstructed panoramic view of Mount Matutum, fresh mountain air, and paved road access. Water and electricity lines ready.",
    paymentOptions: ["cash", "installment"],
    thumbnailUrl: "assets/images/sample-res-1.jpg",
    imageUrls: [
      "assets/images/sample-res-1.jpg",
      "assets/images/sample-res-2.jpg",
      "assets/images/polomolok-hero-bg.jpg"
    ],
    latitude: 6.2192,
    longitude: 125.0658,
    nearbyLandmarks: ["Dole Philippines Head Office (5 mins)", "Polomolok Municipal Hall (3 mins)", "GenSan Airport (30 mins)"],
    documentStatus: "Clean Title (TCT) - Transfer Ready",
    status: "available",
    published: true,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "POL-FARM-002",
    propertyCode: "POL-FARM-002",
    title: "1,200 sqm Homestead & Farm Lot in Cannery Site",
    slug: "homestead-farm-lot-cannery-site",
    propertyType: "agricultural",
    barangay: "Cannery Site",
    municipality: "Polomolok",
    province: "South Cotabato",
    lotAreaSqm: 1200,
    pricePerSqm: 1800,
    totalPrice: 2160000,
    description: "Expansive fertile soil homestead lot perfect for fruit trees, organic vegetable farming, or a retirement farm resthouse. Surrounded by lush greenery and cool breezes year-round.",
    paymentOptions: ["cash", "installment"],
    thumbnailUrl: "assets/images/sample-farm-1.jpg",
    imageUrls: [
      "assets/images/sample-farm-1.jpg",
      "assets/images/sample-res-2.jpg"
    ],
    latitude: 6.2305,
    longitude: 125.0811,
    nearbyLandmarks: ["Cannery Plaza", "Dole Pineapple Field Views", "St. Michael Parish"],
    documentStatus: "Tax Declaration & Verified Plan",
    status: "available",
    published: true,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "POL-COM-003",
    propertyCode: "POL-COM-003",
    title: "Highway Frontage Commercial Lot in Silway 8",
    slug: "highway-frontage-commercial-lot-silway-8",
    propertyType: "commercial",
    barangay: "Silway 8",
    municipality: "Polomolok",
    province: "South Cotabato",
    lotAreaSqm: 500,
    pricePerSqm: 7500,
    totalPrice: 3750000,
    description: "High-traffic commercial frontage along the Gensan-Polomolok National Highway. Ideal for gasoline stations, hardware stores, warehouses, or retail commercial spaces.",
    paymentOptions: ["cash", "bank_financing"],
    thumbnailUrl: "assets/images/sample-com-1.jpg",
    imageUrls: [
      "assets/images/sample-com-1.jpg",
      "assets/images/polomolok-hero-bg.jpg"
    ],
    latitude: 6.1954,
    longitude: 125.1023,
    nearbyLandmarks: ["Silway 8 National High School", "GenSan City Border (10 mins)"],
    documentStatus: "Clean Title (TCT)",
    status: "available",
    published: true,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "POL-RES-004",
    propertyCode: "POL-RES-004",
    title: "Corner Residential Subdivision Lot",
    slug: "corner-residential-subdivision-lot",
    propertyType: "residential",
    barangay: "Poblacion",
    municipality: "Polomolok",
    province: "South Cotabato",
    lotAreaSqm: 250,
    pricePerSqm: 4000,
    totalPrice: 1000000,
    description: "Premium corner lot in a gated peaceful residential community. Complete underground drainage, street lights, and 24/7 security guard post.",
    paymentOptions: ["cash", "installment"],
    thumbnailUrl: "assets/images/sample-res-2.jpg",
    imageUrls: [
      "assets/images/sample-res-2.jpg"
    ],
    latitude: 6.2210,
    longitude: 125.0680,
    nearbyLandmarks: ["Polomolok Public Market", "Howard Hubbard Memorial Hospital"],
    documentStatus: "Clean Title (TCT)",
    status: "reserved",
    published: true,
    featured: false,
    createdAt: new Date().toISOString()
  }
];

// Data Fetching Helper with Firebase Firestore integration & Offline Fallback
async function fetchPublishedProperties() {
  // If Firebase is initialized with valid credentials, fetch from Firestore
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
    try {
      const snapshot = await db.collection("properties").where("published", "==", true).get();
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Firestore fetch warning (falling back to mock data):", err);
    }
  }
  
  // Return fallback mock data
  return MOCK_PROPERTIES.filter(p => p.published);
}

async function fetchPropertyById(propertyId) {
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
    try {
      const doc = await db.collection("properties").doc(propertyId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
    } catch (err) {
      console.warn("Firestore doc fetch warning:", err);
    }
  }
  return MOCK_PROPERTIES.find(p => p.id === propertyId || p.propertyCode === propertyId) || MOCK_PROPERTIES[0];
}

async function submitLeadToFirestore(leadData) {
  console.log("Submitting Lead Data Payload:", leadData);

  // If Firebase is connected
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
    try {
      const docRef = await db.collection("leads").add({
        ...leadData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, leadId: docRef.id };
    } catch (err) {
      console.error("Firestore Lead Submission Error:", err);
    }
  }

  // Backup LocalStorage Save & Mock success response
  const existingLeads = JSON.parse(localStorage.getItem("polomolok_web_leads") || "[]");
  const newLead = { ...leadData, id: "lead_" + Date.now(), createdAt: new Date().toISOString() };
  existingLeads.push(newLead);
  localStorage.setItem("polomolok_web_leads", JSON.stringify(existingLeads));

  return { success: true, leadId: newLead.id, isOffline: true };
}
