/* RenoLeads — inquiry forms backed exclusively by the shared NJ125 API. */

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || "").trim());
}

async function hydrateSelectedPropertyField(field, propertyParam) {
  if (!field || !propertyParam) return;
  if (!isUuid(propertyParam) || field.type === "hidden") {
    field.value = propertyParam;
    return;
  }

  field.readOnly = true;
  field.value = "Selected listing";
  field.setAttribute("aria-busy", "true");
  try {
    const property = await fetchPropertyById(propertyParam);
    if (property) {
      const placement = [
        property.project,
        property.phase && `Phase ${property.phase}`,
        property.block && `Block ${property.block}`,
        property.lotNumber && `Lot ${property.lotNumber}`
      ].filter(Boolean).join(" · ");
      field.value = property.title ? `${property.title}${placement ? ` — ${placement}` : ""}` : (placement || "Selected listing");
    }
  } catch {
    field.value = "Selected listing";
  } finally {
    field.removeAttribute("aria-busy");
  }
}

function bindInquiryForm(form) {
  if (!form || form.dataset.bound === "true") return;
  form.dataset.bound = "true";

  const feedback = form.closest(".inquiry-sheet, .contact-form-card")?.querySelector("[data-form-feedback]") || document.getElementById("form-feedback");
  const propertyField = form.querySelector("[name=propertyInterest]");
  const propertyParam = new URLSearchParams(window.location.search).get("property");
  hydrateSelectedPropertyField(propertyField, propertyParam);

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const submit = form.querySelector("button[type=submit]");
    const originalLabel = submit ? submit.textContent : "Submit inquiry";
    const data = new FormData(form);
    const propertyInterest = String(data.get("propertyInterest") || "").trim();
    const rawMessage = String(data.get("message") || "").trim();
    const propertyId = isUuid(propertyParam) ? propertyParam : (isUuid(propertyInterest) ? propertyInterest : null);
    const message = propertyId || !propertyInterest
      ? rawMessage
      : [`Property or area of interest: ${propertyInterest}`, rawMessage].filter(Boolean).join("\n");

    const inquiry = {
      propertyId,
      fullName: String(data.get("fullName") || "").trim(),
      mobileNumber: String(data.get("mobileNumber") || "").trim(),
      email: String(data.get("email") || "").trim(),
      inquiryType: String(data.get("inquiryType") || "general_question").trim(),
      preferredDate: String(data.get("preferredDate") || "").trim(),
      preferredContactMethod: String(data.get("preferredContactMethod") || "phone").trim(),
      message,
      consent: Boolean(form.querySelector("[name=consent]")?.checked)
    };

    if (!inquiry.fullName || !inquiry.mobileNumber) {
      showFormFeedback(feedback, "warning", "Please provide your full name and mobile number.");
      return;
    }

    if (!inquiry.consent) {
      showFormFeedback(feedback, "warning", "Please read the Privacy Notice and confirm consent before sending your inquiry.");
      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Sending…";
    }
    clearFormFeedback(feedback);

    try {
      const result = await submitInquiryToNJ125(inquiry);
      if (typeof trackFunnelEvent === "function") {
        trackFunnelEvent("lead_submit", {
          property_id: inquiry.propertyId || "general",
          inquiry_type: inquiry.inquiryType
        });
      }

      form.reset();
      await hydrateSelectedPropertyField(propertyField, propertyParam);
      const reference = result.requestId ? ` Reference: ${result.requestId}.` : "";
      showFormFeedback(feedback, "success", `Inquiry received. Thank you, ${inquiry.fullName}.${reference}`);
    } catch (error) {
      const code = error?.code || "request-failed";
      if (code === "duplicate") {
        showFormFeedback(feedback, "warning", "A similar inquiry was already received recently. Please wait for a response or use a direct contact option.");
      } else if (code === "rate-limited") {
        showFormFeedback(feedback, "warning", "Too many inquiry attempts were received. Please try again later or use a direct contact option.");
      } else if (code === "property-unavailable") {
        showFormFeedback(feedback, "warning", "This lot is no longer available. Please browse the current available listings.");
      } else {
        showFormFeedback(feedback, "error", `We could not send the inquiry. Please call or SMS ${RENO_CONFIG.contact.phoneDisplay} directly.`);
      }
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
