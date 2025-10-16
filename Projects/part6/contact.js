// contact.js — async submit, success/error message inline, no redirect

const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORMSPREE_ID"; // <-- replace this!

const $ = (s, r=document) => r.querySelector(s);
const form = $("#contactForm");
const statusBox = $("#formStatus");
const sendBtn = $("#sendBtn");

function setStatus(type, msg){
  statusBox.className = `status ${type}`;
  statusBox.textContent = msg;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("", ""); // clear

  // HTML5 validation first
  if (!form.checkValidity()){
    // trigger native UI per-field
    form.reportValidity();
    setStatus("error", "Please fix the highlighted fields and try again.");
    return;
  }

  // Build payload
  const data = {
    name:   $("#name").value.trim(),
    email:  $("#email").value.trim(),
    subject:$("#subject").value.trim(),
    message:$("#message").value.trim()
  };

  // Send
  try{
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";

    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok){
      setStatus("success", "Thanks! Your message has been sent.");
      form.reset();
    } else {
      const err = await res.json().catch(()=> ({}));
      const msg = (err && err.error) ? err.error : `Error ${res.status}`;
      setStatus("error", `Could not send: ${msg}`);
    }
  } catch (err){
    setStatus("error", "Network error. Please try again in a moment.");
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
  }
});

// Optional: Reset clears status
$("#resetBtn").addEventListener("click", () => setStatus("", ""));
