const express = require("express");

const app = express();
const PORT = 3000;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "portfolio-api"
  });
});

app.get("/api/message", (req, res) => {
  res.json({
    message: "Hello from AWS EC2!"
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`API running on http://127.0.0.1:${PORT}`);
});
