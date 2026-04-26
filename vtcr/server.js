const express = require("express");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware (VERY IMPORTANT)
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rachelle.olivar01@gmail.com",
    pass: "pgxz weql fbud ebje"
  }
});

// memory storage (temporary dashboard use)
let messages = [];

/* =========================
   📡 VISITOR TRACKING
========================= */
app.get("/visit", async (req, res) => {
  let visitorId = req.cookies.visitorId;
  let visitCount = req.cookies.visitCount || 0;
  let isNewVisitor = false;

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    visitCount = 1;
    isNewVisitor = true;
  } else {
    visitCount = parseInt(visitCount) + 1;
  }

  res.cookie("visitorId", visitorId, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true
  });

  res.cookie("visitCount", visitCount, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true
  });

  const time = new Date().toLocaleString();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    await transporter.sendMail({
      from: '"Visitor Tracker" <rachelle.olivar01@gmail.com>',
      to: "rachelle.olivar01@gmail.com",
      subject: isNewVisitor
        ? "🆕 New Visitor Detected"
        : `🔁 Returning Visitor (#${visitCount})`,
      text: `
Visitor Report

Type: ${isNewVisitor ? "NEW" : "RETURNING"}
Visit Count: ${visitCount}

Visitor ID: ${visitorId}
IP: ${ip}
Time: ${time}
      `
    });

    res.json({
      success: true,
      newVisitor: isNewVisitor,
      visitCount
    });

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    res.status(500).json({ success: false });
  }
});

/* =========================
   💬 ANONYMOUS MESSAGE
========================= */
app.post("/message", async (req, res) => {
  try {
    const visitorId = req.cookies.visitorId || "unknown";
    const message = req.body.message;

    if (!message || message.trim() === "") {
      return res.json({ success: false, error: "Empty message" });
    }

    const time = new Date().toLocaleString();

    console.log("New message:", message);

    await transporter.sendMail({
      from: '"Visitor Message System" <rachelle.olivar01@gmail.com>',
      to: "rachelle.olivar01@gmail.com",
      subject: "New Anonymous Message Received",
      text: `
<b>Anonymous Message</b>

<b>Message:</b> ${message}

<b>Visitor ID:</b> ${visitorId}
<b>Time:</b> ${time}
      `
    });

    res.json({ success: true });

  } catch (error) {
    console.error("MESSAGE EMAIL ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   📊 VIEW MESSAGES (OPTIONAL)
========================= */
app.get("/messages", (req, res) => {
  res.json(messages.slice().reverse());
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});