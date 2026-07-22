/* RenoLeads V2 — truthful inquiry form handling for page and sheet forms. */

function bindInquiryForm(form) {
  if (!form || form.dataset.bound === "true") return;
  form.dataset.bound = "true";

  const feedback = form.closest(".inquiry-sheet, .contact-form-card")?.querySelector("[data-form-feedback]") || document.getElementById("form-feedback");
  const propertyField = form.querySelector("[name=propertyInterest]");
  const propertyParam = new URLSearchParams(window.location.search).get("property");
  if (propertyField && propertyParam) propertyField.value = propertyParam;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const submit = form.querySelector("button[type=submit]");
    const originalLabel = submit ? submit.textContent : "Submit inquiry";
    const data = new FormData(form);
    const lead = {
      fullName: String(data.get("fullName") || "").trim(),
      mobileNumber: String(data.get("mobileNumber") || "").trim(),
      email: String(data.get("email") || "").trim(),
      propertyCode: String(data.get("propertyInterest") || "General inquiries").trim(),
      inquiryType: String(data.get("inquiryType") || "general_question").trim(),
      preferredDate: String(data.get("preferredDate") || "").trim(),
      preferredContactMethod: String(data.get("preferredContactMethod") || "phone").trim(),
      message: String(data.get("message") || "").trim(),
      source: "website_funnel"
    };

    if (!lead.fullName || !lead.mobileNumber) {
      showFormFeedback(feedback, "warning", "Please provide your full name and mobile number.");
      return;
    }

    if (form.querySelector("[name=consent]") && !form.querySelector("[name=consent]").checked) {
      showFormFeedback(feedback, "warning", "Please confirm that we may contact you about this inquiry.");
      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Sending…";
    }
    clearFormFeedback(feedback);

    try {
      const result = await submitLeadToFirestore(lead);
      if (!result || !result.success) throw new Error(result?.error || "Submission failed");
      if (typeof trackFunnelEvent === "function") trackFunnelEvent("lead_submit", { property_code: lead.propertyCode, inquiry_type: lead.inquiryType });

      if (result.isLive) {
        form.reset();
        if (propertyField) propertyField.value = lead.propertyCode;
        showFormFeedback(feedback, "success", `Inquiry received. Thank you, ${lead.fullName}. We’ll follow up about ${lead.propertyCode}.`);
      } else {
        showFormFeedback(feedback, "warning", `${result.message || "Your inquiry was saved locally."} Please use the direct contact options below to confirm.`);
      }
    } catch (error) {
      console.error("[RenoLeads] Inquiry submission failed:", error);
      showFormFeedback(feedback, "error", `We could not reach the server. Please call or SMS ${RENO_CONFIG.contact.phoneDisplay} directly.`);
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalLabel;
      }
    }
  });
}

function clearFormFeedback(element) {
  if (!element) return;
  element.replaceChildren();
  element.hidden = true;
  element.className = "form-feedback";
}

function showFormFeedback(element, kind, message) {
  if (!element) return;
  element.replaceChildren();
  element.hidden = false;
  element.className = `feedback-alert feedback-${kind}`;
  element.setAttribute("role", kind === "error" || kind === "warning" ? "alert" : "status");
  const copy = document.createElement("p");
  copy.textContent = message;
  element.appendChild(copy);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form[data-inquiry-form], #lead-inquiry-form").forEach(bindInquiryForm);
});

window.bindInquiryForm = bindInquiryForm;
