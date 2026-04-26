const express = require("express");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

/* =========================
   EMAIL SETUP
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rachelle.olivar01@gmail.com",
    pass: "pgxz weql fbud ebje"
  }
});

/* =========================
   MEMORY STORAGE
========================= */
let messages = [];
let messageCount = {};   // per visitor message counter
let visitorCounter = 0;  // sequential visitor ID

/* =========================
   📡 VISITOR TRACKING
========================= */
app.get("/visit", async (req, res) => {
  let visitorId = req.cookies.visitorId;
  let visitCount = req.cookies.visitCount || 0;
  let isNewVisitor = false;

  // NEW VISITOR
  if (!visitorId) {
    visitorCounter++;
    visitorId = `VTCR-${visitorCounter.toString().padStart(4, "0")}`;
    visitCount = 1;
    isNewVisitor = true;
  } else {
    visitCount = parseInt(visitCount) + 1;
  }

  // save cookies
  res.cookie("visitorId", visitorId, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true
  });

  res.cookie("visitCount", visitCount, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true
  });

const time = new Date().toLocaleString("en-PH", {
  timeZone: "Asia/Manila",
  hour12: true
});
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  try {
    await transporter.sendMail({
      from: '"Visitor Tracker" <rachelle.olivar01@gmail.com>',
      to: "rachelle.olivar01@gmail.com",
      subject: isNewVisitor ? "New Visitor Detected" : "Returning Visitor",

      text: `
Visitor Report

Type: ${isNewVisitor ? "NEW" : "RETURNING"}
Visitor ID: ${visitorId}
Visit Count: ${visitCount}
Time: ${time}
      `
    });

    res.json({
      success: true,
      visitorId,
      visitCount,
      newVisitor: isNewVisitor
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
    const visitorId = req.cookies.visitorId || "UNKNOWN";
    const message = req.body.message;

    if (!message || message.trim() === "") {
      return res.json({ success: false, error: "Empty message" });
    }

    const time = new Date().toLocaleString("en-PH", {
  timeZone: "Asia/Manila",
  hour12: true
});

    // message count per visitor
    if (!messageCount[visitorId]) {
      messageCount[visitorId] = 1;
    } else {
      messageCount[visitorId]++;
    }

    messages.push({
      visitorId,
      message,
      time
    });

    await transporter.sendMail({
      from: '"Visitor Message System" <rachelle.olivar01@gmail.com>',
      to: "rachelle.olivar01@gmail.com",
      subject: "New Anonymous Message Received",

      html: `
        <h3>Anonymous Message</h3>

        <p><strong>Message:</strong> <em>${message}</em></p>

        <p><strong>Visitor ID:</strong> ${visitorId}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Total Messages From This Visitor:</strong> ${messageCount[visitorId]}</p>
      `
    });

    res.json({
      success: true,
      messageCount: messageCount[visitorId]
    });

  } catch (error) {
    console.error("MESSAGE EMAIL ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   📊 VIEW MESSAGES
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
