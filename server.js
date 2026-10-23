const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
let PORT = parseInt(process.env.PORT, 10) || 3000;

// Serve static assets from project root and public
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "public")));

// API endpoint for all cards
app.get("/api/cards", (req, res) => {
  const dataPath = path.join(__dirname, "cards.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Could not load cards." });
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: "Invalid JSON format." });
    }
  });
});

// Single card endpoint by id or slug
app.get("/api/cards/:identifier", (req, res) => {
  const dataPath = path.join(__dirname, "cards.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Could not load cards." });
    try {
      const cards = JSON.parse(data);
      const idOrSlug = req.params.identifier.toLowerCase();
      const card = cards.find(
        (c) => String(c.id) === idOrSlug || c.slug.toLowerCase() === idOrSlug
      );
      if (!card) return res.status(404).json({ error: "Card not found" });
      res.json(card);
    } catch (e) {
      res.status(500).json({ error: "Invalid JSON format." });
    }
  });
});

// SPA fallback: All other routes serve index.html (React Router handles client routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Resilient server startup that detects EADDRINUSE and switches ports gracefully
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n==================================================`);
    console.log(`  ✦ Awards Central Virtual Business Cards`);
    console.log(`  ✦ Server active on: http://localhost:${port}`);
    console.log(`  ✦ Directory: http://localhost:${port}/`);
    console.log(`  ✦ Individual cards: http://localhost:${port}/card/1`);
    console.log(`==================================================\n`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[Warning] Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer(PORT);
