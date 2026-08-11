const express = require("express");

const app = express();
const PORT = 3000;

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

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Name, email, and message are required."
    });
  }

  console.log("New contact message:", {
    name,
    email,
    message
  });

  res.status(201).json({
    success: true,
    message: "Contact message received successfully."
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`API running on http://127.0.0.1:${PORT}`);
});

const cors = require("cors");

app.use(cors({
  origin: "https://sheharzad-portfolio.vercel.app/"
}));