/**
 * Firebase Modular Data SDK Integration & Fallback Mock Engine
 */

let firestoreDB = null;
let isFirebaseActive = false;

// Initialize Firebase if credentials are populated
if (typeof firebase !== 'undefined' && RENO_CONFIG.firebase.apiKey !== "YOUR_FIREBASE_API_KEY") {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(RENO_CONFIG.firebase);
    }
    firestoreDB = firebase.firestore();
    isFirebaseActive = true;
    console.log("[RenoLeads] Firebase Cloud Firestore initialized successfully.");
  } catch (err) {
    console.warn("[RenoLeads] Firebase init warning:", err);
  }
}

// Certified Polomolok Property Inventory Mock Dataset
const MOCK_PROPERTIES = [
  {
    id: "POL-RES-001",
    propertyCode: "POL-RES-001",
    title: "Prime Residential Lot under Mt. Matutum View",
    slug: "prime-residential-lot-mt-matutum-view",
    propertyType: "residential",
    barangay: "Poblacion",
    municipality: "Polomolok",
    province: "South Cotabato",
    lotAreaSqm: 300,
    pricePerSqm: 3500,
    totalPrice: 1050000,
    description: "Exclusive residential land parcel located in a peaceful neighborhood in Brgy. Poblacion, Polomolok. Offers clear, unobstructed panoramic views of Mount Matutum, cool highland breeze, and direct concrete road access. Water and electricity lines are ready for immediate building connection.",
    paymentOptions: ["cash", "installment"],
    thumbnailUrl: "assets/images/sample-res-1.jpg",
    imageUrls: [
      "assets/images/sample-res-1.jpg",
      "assets/images/sample-res-2.jpg",
      "assets/images/polomolok-hero-bg.jpg"
    ],
    latitude: 6.2192,
    longitude: 125.0658,
    nearbyLandmarks: ["Dole Philippines Head Office (5 mins)", "Polomolok Municipal Hall (3 mins)", "General Santos International Airport (30 mins)"],
    documentStatus: "Clean Title (TCT) - Transfer Ready",
    status: "available",
    published: true,
    featured: true,
    createdAt: "2026-07-01T08:00:00.000Z"
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
    description: "Expansive fertile volcanic soil farm lot ideal for fruit trees, organic farming, or a retirement farm resthouse. Located near Cannery Plaza with year-round cool temperatures.",
    paymentOptions: ["cash", "installment"],
    thumbnailUrl: "assets/images/sample-farm-1.jpg",
    imageUrls: [
      "assets/images/sample-farm-1.jpg",
      "assets/images/sample-res-2.jpg"
    ],
    latitude: 6.2305,
    longitude: 125.0811,
    nearbyLandmarks: ["Cannery Plaza (4 mins)", "Dole Pineapple Field Views", "St. Michael Parish Church"],
    documentStatus: "Verified Tax Declaration & Survey Plan",
    status: "available",
    published: true,
    featured: true,
    createdAt: "2026-07-05T09:30:00.000Z"
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
    description: "High-traffic commercial frontage parcel along the GenSan-Polomolok National Highway. Excellent location for commercial building, logistics depot, hardware, or retail establishment.",
    paymentOptions: ["cash", "bank_financing"],
    thumbnailUrl: "assets/images/sample-com-1.jpg",
    imageUrls: [
      "assets/images/sample-com-1.jpg",
      "assets/images/polomolok-hero-bg.jpg"
    ],
    latitude: 6.1954,
    longitude: 125.1023,
    nearbyLandmarks: ["Silway 8 National High School", "GenSan Border (10 mins)"],
    documentStatus: "Clean Title (TCT)",
    status: "available",
    published: true,
    featured: true,
    createdAt: "2026-07-10T10:15:00.000Z"
  },
  {
    id: "POL-RES-004",
    propertyCode: "POL-RES-004",
    title: "Corner Residential Lot in Gated Subdivision",
    slug: "corner-residential-lot-subdivision",
    propertyType: "residential",
    barangay: "Poblacion",
    municipality: "Polomolok",
    province: "South Cotabato",
    lotAreaSqm: 250,
    pricePerSqm: 4000,
    totalPrice: 1000000,
    description: "Corner lot inside a peaceful, secured residential village with underground drainage and street lights.",
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
    createdAt: "2026-07-12T11:00:00.000Z"
  }
];

// Data Access API
async function fetchPublishedProperties() {
  if (isFirebaseActive && firestoreDB) {
    try {
      const snapshot = await firestoreDB.collection("properties")
        .where("published", "==", true)
        .get();
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("[RenoLeads] Firestore properties query fallback:", err);
    }
  }
  return MOCK_PROPERTIES.filter(p => p.published);
}

async function fetchPropertyById(propertyId) {
  if (isFirebaseActive && firestoreDB) {
    try {
      const doc = await firestoreDB.collection("properties").doc(propertyId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
    } catch (err) {
      console.warn("[RenoLeads] Firestore document query fallback:", err);
    }
  }
  return MOCK_PROPERTIES.find(p => p.id === propertyId || p.propertyCode === propertyId) || null;
}

/**
 * Submit Lead to Firestore with Offline Fallback Warning
 */
async function submitLeadToFirestore(leadPayload) {
  console.log("[RenoLeads Lead Submission Payload]:", leadPayload);

  if (isFirebaseActive && firestoreDB) {
    try {
      const docRef = await firestoreDB.collection("leads").add({
        ...leadPayload,
        status: "new",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, leadId: docRef.id, isLive: true };
    } catch (err) {
      console.error("[RenoLeads] Firestore Submission Error:", err);
      return { success: false, error: err.message || "Database connection error." };
    }
  }

  // If Firebase API Key is not set, buffer in local storage & notify user
  try {
    const localLeads = JSON.parse(localStorage.getItem("renoleads_buffered_inquiries") || "[]");
    const bufferedLead = {
      ...leadPayload,
      id: "buf_" + Date.now(),
      status: "buffered",
      createdAt: new Date().toISOString()
    };
    localLeads.push(bufferedLead);
    localStorage.setItem("renoleads_buffered_inquiries", JSON.stringify(localLeads));

    return { 
      success: true, 
      leadId: bufferedLead.id, 
      isLive: false,
      message: "Lead saved locally. Please contact our agent directly via Viber/Call to confirm."
    };
  } catch (err) {
    return { success: false, error: "Storage allocation error." };
  }
}
