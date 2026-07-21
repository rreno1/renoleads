/**
 * Firebase Cloud Function - FCM Push Notification Trigger on New Lead Document Creation
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notifyNewLeadInquiry = functions.firestore
  .document("leads/{leadId}")
  .onCreate(async (snap, context) => {
    const leadData = snap.data();
    const leadId = context.params.leadId;

    const fullName = leadData.fullName || "Potential Buyer";
    const propertyCode = leadData.propertyCode || "General Property";
    const mobileNumber = leadData.mobileNumber || "N/A";
    const inquiryType = leadData.inquiryType || "Inquiry";

    console.log(`[Cloud Function] Processing new lead trigger for leadId: ${leadId} (${fullName})`);

    try {
      // 1. Fetch active FCM APK device tokens from Firestore collection `deviceTokens`
      const tokensSnapshot = await admin.firestore().collection("deviceTokens").get();
      
      if (tokensSnapshot.empty) {
        console.log("[Cloud Function] No APK device tokens found in `deviceTokens` collection.");
        return null;
      }

      const tokens = [];
      tokensSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token) {
          tokens.push(data.token);
        }
      });

      if (tokens.length === 0) {
        console.log("[Cloud Function] Device tokens array is empty.");
        return null;
      }

      // 2. Build Notification Payload for FCM
      const payload = {
        notification: {
          title: "New Property Inquiry",
          body: `${fullName} is interested in ${propertyCode}. (${mobileNumber})`,
          sound: "default",
          badge: "1"
        },
        data: {
          leadId: leadId,
          propertyCode: propertyCode,
          inquiryType: inquiryType,
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        }
      };

      // 3. Send Multicast Push Notification
      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log(`[Cloud Function] Push Notification sent to ${tokens.length} devices. Success count: ${response.successCount}`);
      
      return response;
    } catch (err) {
      console.error("[Cloud Function] Error sending FCM push notification:", err);
      return null;
    }
  });
