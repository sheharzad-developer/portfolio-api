require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const client = require("prom-client");

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = 3000;

const allowedOrigins = [
  'http://localhost:3000',
  'https://sheharzad-portfolio.vercel.app',
];

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics();

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    console.error("Metrics error:", error);
    res.status(500).end();
  }
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
    });
  });
  next();
});

app.use(cors({
  origin(origin, callback) {
    // allow no-Origin requests (curl, server-to-server, health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Parse JSON request bodies
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "portfolio-api"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "portfolio-api"
  });
});

app.get("/api/message", (req, res) => {
  res.json({
    message: "Hello from AWS EC2 - deployed by GitHub Actions!"
  });
});

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Name, email, and message are required."
    });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Sheharzad <onboarding@resend.dev>",
      to: ["sheharzad.salahuddin9000@outlook.com"],
      subject: `New Project Inquiry — Sheharzad Portfolio ${name}`,
      replyTo: email,
      text: `
    Name: ${name}
    Email: ${email}

    Message:
    ${message}
      `
    });

    if (error) {
      console.error("Resend error:", error);

      return res.status(500).json({
        error: "Failed to send email."
      });
    }

    console.log("Email sent successfully:", data);

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully."
    });
  } catch (error) {
    console.error("Contact email error:", error);

    res.status(500).json({
      error: "Failed to send email."
    });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`API running on http://127.0.0.1:${PORT}`);
});