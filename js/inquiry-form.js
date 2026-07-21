/**
 * Lead Inquiry & Site Tour Form Handling (Phase 10 Conversion & Trust Engine)
 */

document.addEventListener("DOMContentLoaded", () => {
  const inquiryForm = document.getElementById("lead-inquiry-form");
  const formFeedback = document.getElementById("form-feedback");

  // Query Parameter Property Prefill logic
  const urlParams = new URLSearchParams(window.location.search);
  const propertyParam = urlParams.get("property");
  const propertyInterestInput = document.getElementById("form-property-interest") || document.getElementById("propertyInterest");

  if (propertyInterestInput && propertyParam) {
    propertyInterestInput.value = decodeURIComponent(propertyParam);
  }

  if (!inquiryForm) return;

  inquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = inquiryForm.querySelector("button[type='submit']");
    const originalBtnText = submitBtn ? submitBtn.innerHTML : "Submit Inquiry";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Submitting Inquiry...`;
    }

    if (formFeedback) {
      formFeedback.style.display = "none";
      formFeedback.className = "feedback-alert";
      formFeedback.innerHTML = "";
    }

    const formData = new FormData(inquiryForm);
    const leadPayload = {
      fullName: (formData.get("fullName") || "").trim(),
      mobileNumber: (formData.get("mobileNumber") || "").trim(),
      email: (formData.get("email") || "").trim(),
      propertyCode: (formData.get("propertyInterest") || "General Inquiries").trim(),
      inquiryType: (formData.get("inquiryType") || "site_visit").trim(),
      preferredDate: (formData.get("preferredDate") || "").trim(),
      preferredContactMethod: (formData.get("preferredContactMethod") || "phone").trim(),
      message: (formData.get("message") || "").trim(),
      source: "website_funnel"
    };

    // Validation
    if (!leadPayload.fullName || !leadPayload.mobileNumber) {
      if (formFeedback) {
        formFeedback.style.display = "block";
        formFeedback.className = "feedback-alert feedback-warning";
        formFeedback.setAttribute("role", "alert");
        formFeedback.textContent = "Please provide your Full Name and Mobile Number.";
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
        if (result.isLive) {
          // Live Firebase Success
          inquiryForm.reset();
          if (formFeedback) {
            formFeedback.style.display = "block";
            formFeedback.className = "feedback-alert feedback-success";
            formFeedback.setAttribute("role", "status");
            formFeedback.innerHTML = `
              <strong>Inquiry Received!</strong><br>
              Thank you, ${DOMUtils.escapeHTML(leadPayload.fullName)}. Your site visit request for ${DOMUtils.escapeHTML(leadPayload.propertyCode)} has been logged. Our land agent will contact you via ${DOMUtils.escapeHTML(leadPayload.preferredContactMethod.toUpperCase())} shortly.
            `;
          }
        } else {
          // Offline / Local Buffer Notice (Truthful Messaging - Phase 10)
          if (formFeedback) {
            formFeedback.style.display = "block";
            formFeedback.className = "feedback-alert feedback-warning";
            formFeedback.setAttribute("role", "status");
            formFeedback.innerHTML = `
              <strong>Inquiry Saved Locally!</strong><br>
              ${DOMUtils.escapeHTML(result.message)}
              <div style="margin-top: 0.75rem;">
                <a href="${RENO_CONFIG.contact.viberUrl}" class="btn btn-sm btn-accent">Click to Message Agent on Viber</a>
              </div>
            `;
          }
        }
      } else {
        throw new Error(result.error || "Submission failed");
      }
    } catch (err) {
      console.error("[RenoLeads] Lead Form Error:", err);
      if (formFeedback) {
        formFeedback.style.display = "block";
        formFeedback.className = "feedback-alert feedback-error";
        formFeedback.setAttribute("role", "alert");
        formFeedback.innerHTML = `
          <strong>Submission Error</strong><br>
          We could not reach the server at this moment. Please call or SMS us directly at <strong>${RENO_CONFIG.contact.phoneDisplay}</strong>.
        `;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
});
