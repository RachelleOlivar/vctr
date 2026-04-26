document.addEventListener("DOMContentLoaded", () => {
  trackVisit();
});

// 📡 TRACK VISIT
function trackVisit() {
  fetch("/visit")
    .then(res => res.json())
    .then(data => {
      const status = document.getElementById("status");

      if (!status) return;

      if (data.newVisitor) {
        status.innerText = "🆕 New visitor detected (first time device)";
      } else {
        status.innerText = "🔁 Returning visitor detected";
      }
    })
    .catch(() => {
      const status = document.getElementById("status");
      if (status) {
        status.innerText = "⚠️ Error connecting to server.";
      }
    });
}

// 💬 SEND ANONYMOUS MESSAGE
function sendMessage() {
  const messageBox = document.getElementById("message");
  const statusBox = document.getElementById("msgStatus");

  if (!messageBox || !statusBox) return;

  const message = messageBox.value.trim();

  // validation
  if (!message) {
    statusBox.innerText = "⚠️ Please type a message first.";
    return;
  }

  fetch("/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerText = "✅ Message sent anonymously!";
        messageBox.value = "";
      } else {
        statusBox.innerText = "❌ Failed to send message.";
      }
    })
    .catch(() => {
      statusBox.innerText = "⚠️ Server error. Try again later.";
    });
}