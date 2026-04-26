const BASE_URL = "https://vctr.onrender.com";

/* =========================
   SILENT VISITOR TRACKING
========================= */
window.addEventListener("load", () => {
  fetch(`${BASE_URL}/visit`)
    .then(() => console.log("Visit logged"))
    .catch(() => console.log("Visit failed"));
});

/* =========================
   SEND MESSAGE
========================= */
function sendMessage() {
  const message = document.getElementById("message").value;
  const status = document.getElementById("msgStatus");

  if (!message.trim()) {
    status.innerText = "Please type a message first.";
    return;
  }

  fetch(`${BASE_URL}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(() => {
      status.innerText = "Message sent anonymously ✅";
      document.getElementById("message").value = "";
    })
    .catch(() => {
      status.innerText = "Failed to send message.";
    });
}
