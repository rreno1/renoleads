/**
 * Lead Inquiry & Site Visit Form Controller
 * Handles form validation, Firestore lead creation, and confirmation handling
 */

document.addEventListener("DOMContentLoaded", () => {
  const inquiryForm = document.getElementById("lead-inquiry-form");
  const formFeedback = document.getElementById("form-feedback");

  if (!inquiryForm) return;

  inquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = inquiryForm.querySelector("button[type='submit']");
    const originalBtnText = submitBtn ? submitBtn.innerHTML : "Submit Inquiry";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Submitting...`;
    }

    if (formFeedback) {
      formFeedback.style.display = "none";
    }

    // Extract form data
    const formData = new FormData(inquiryForm);
    const leadPayload = {
      fullName: formData.get("fullName") || "",
      mobileNumber: formData.get("mobileNumber") || "",
      email: formData.get("email") || "",
      propertyCode: formData.get("propertyInterest") || "General Inquiries",
      inquiryType: formData.get("inquiryType") || "general",
      preferredDate: formData.get("preferredDate") || "",
      preferredContactMethod: formData.get("preferredContactMethod") || "phone",
      message: formData.get("message") || "",
      source: "website",
      status: "new"
    };

    // Basic Validation
    if (!leadPayload.fullName.trim() || !leadPayload.mobileNumber.trim()) {
      if (formFeedback) {
        formFeedback.style.display = "block";
        formFeedback.className = "alert alert-warning";
        formFeedback.textContent = "Please fill in your Full Name and Mobile Number.";
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      return;
    }

    try {
      const result = await submitLeadToFirestore(leadPayload);

      if (result && result.success) {
        inquiryForm.reset();
        
        if (formFeedback) {
          formFeedback.style.display = "block";
          formFeedback.className = "alert alert-success";
          formFeedback.innerHTML = `
            <strong>Inquiry Received!</strong><br>
            Thank you, ${leadPayload.fullName}. Our land sales team will contact you via ${leadPayload.preferredContactMethod.toUpperCase()} shortly regarding your site visit / inquiry.
          `;
        }

        // Trigger Analytics Event
        if (typeof trackFunnelEvent === 'function') {
          trackFunnelEvent('lead_submitted', { inquiry_type: leadPayload.inquiryType });
        }
      }
    } catch (err) {
      console.error("Form submission error:", err);
      if (formFeedback) {
        formFeedback.style.display = "block";
        formFeedback.className = "alert alert-error";
        formFeedback.textContent = "Unable to submit inquiry at this time. Please call or message us directly.";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
});
