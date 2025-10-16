// contact.js — Web3Forms (async email submission, inline success/error message, no redirect)
// Author: Hadeem Secka

const $ = (s, r=document) => r.querySelector(s);
const form      = $("#contactForm");
const statusBox = $("#formStatus");
const sendBtn   = $("#sendBtn");

const ENDPOINT = "https://api.web3forms.com/submit";  // Web3Forms API endpoint
const ACCESS_KEY = "4b370dcc-6fd1-4c70-ad6c-98ba1e9a9835"; // Your Web3Forms Access Key

// Helper to update the status message area
function setStatus(type, msg){
  statusBox.className = `status ${type || ""}`;
  statusBox.textContent = msg || "";
}

// Form submit event
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("", "");

  // Validate before sending
  if (!form.checkValidity()){
    form.reportValidity();
    setStatus("error", "Please fill out all required fields correctly.");
    return;
  }

  // Prevent spam (honeypot)
  const botcheck = form.querySelector("[name='botcheck']");
  if (botcheck && botcheck.checked){
    setStatus("success", "Thanks! Your message has been sent.");
    form.reset();
    return;
  }

  // Build form data
  const formData = new FormData(form);
  formData.append("access_key", ACCESS_KEY);  // Required for Web3Forms
  formData.append("from_name", "GameDay Contact Form");
  formData.append("subject", `New message from ${$("#name").value || "Visitor"}`);

  try {
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: formData
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      setStatus("success", "✅ Thanks! Your message has been sent successfully.");
      form.reset();
    } else {
      const msg = result?.message || result?.detail || `Error ${response.status}`;
      setStatus("error", `❌ Message failed to send: ${msg}`);
    }

  } catch (error) {
    console.error(error);
    setStatus("error", "⚠️ Network error. Please try again in a moment.");
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
  }
});

// Reset clears messages
$("#resetBtn")?.addEventListener("click", () => setStatus("", ""));
