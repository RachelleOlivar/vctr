const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   TELEGRAM CONFIG
   (USE ENV VARIABLES IN PRODUCTION)
========================= */
const TELEGRAM_TOKEN = "AAGzyVXdxov0nQqi8WV7YG7v87_s007qV5Y";
const TELEGRAM_CHAT_ID = "1332855204";

/* =========================
   MIDDLEWARE
========================= */
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

/* =========================
   MEMORY STORAGE
========================= */
let messages = [];
let messageCount = {};
let totalVisits = 0;

/* =========================
   TELEGRAM FUNCTION
========================= */
async function sendTelegram(text) {
  try {
    const url = `https://api.telegram.org/bot${AAGzyVXdxov0nQqi8WV7YG7v87_s007qV5Y}/sendMessage`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: 1332855204,
        text
      })
    });

    const data = await res.json();

    console.log("🔵 TELEGRAM FULL RESPONSE:", JSON.stringify(data, null, 2));

    return data;

  } catch (err) {
    console.error("🔴 TELEGRAM ERROR:", err);
    return null;
  }
}

/* =========================
   📡 VISITOR TRACKING (SILENT)
========================= */
app.get("/visit", async (req, res) => {
  totalVisits++;

  const time = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    hour12: true
  });

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  await sendTelegram(
`🚨 VISIT LOG

Total Visits: ${totalVisits}
Time: ${time}
IP: ${ip}`
  );

  res.json({ success: true });
});

/* =========================
   💬 MESSAGE SYSTEM
========================= */
app.post("/message", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || !message.trim()) {
      return res.json({ success: false, error: "Empty message" });
    }

    const time = new Date().toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour12: true
    });

    messages.push({ message, time });

    if (!messageCount["global"]) messageCount["global"] = 1;
    else messageCount["global"]++;

    const result = await sendTelegram(
`NEW MESSAGE

Message: ${message}
Time: ${time}
Total Messages: ${messageCount["global"]}`
    );

    console.log("Telegram result:", result);

    if (!result || !result.ok) {
      return res.json({
        success: false,
        error: "Telegram failed",
        details: result
      });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("MESSAGE ERROR:", err);
    res.json({ success: false, error: err.message });
  }
});

/* =========================
   📊 OPTIONAL STATS (PRIVATE)
========================= */
app.get("/stats", (req, res) => {
  res.json({
    totalVisits,
    totalMessages: messageCount["global"] || 0
  });
});

app.get("/test", async (req, res) => {
  const result = await sendTelegram("🔥 TEST MESSAGE");
  res.json(result);
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
