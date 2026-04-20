// server.js
// ─────────────────────────────────────────────
// A simple Node.js + Express server.
// This serves all your HTML, CSS, and JS files
// so you can run the project on localhost instead
// of just opening index.html directly in the browser.
//
// HOW TO RUN:
//   1. Make sure Node.js is installed (node -v to check)
//   2. In this project folder, run:  npm install express
//   3. Then run:                     node server.js
//   4. Open browser at:              http://localhost:3000
// ─────────────────────────────────────────────

const express = require("express"); // import the express library
const path    = require("path");    // built-in Node module to handle file paths

const app  = express(); // create our app
const PORT = 3000;      // the port our server will listen on

// ── SERVE STATIC FILES ────────────────────────
// This one line tells Express:
// "Serve everything in the current folder as static files."
// So if someone visits /dashboard.html, Express sends that file.
// If they visit /style.css, Express sends that file. Etc.
app.use(express.static(path.join(__dirname)));

// ── DEFAULT ROUTE ─────────────────────────────
// If someone visits just "/" (the root), send them to login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// ── 404 HANDLER ───────────────────────────────
// If a file is not found, return a simple message
// instead of a confusing server error.
app.use((req, res) => {
  res.status(404).send("Page not found. Check the URL and try again.");
});

// ── START THE SERVER ──────────────────────────
// app.listen starts the server and keeps it running.
// The callback just logs a message so we know it's working.
app.listen(PORT, () => {
  console.log(`Stock Sync is running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the server.`);
});