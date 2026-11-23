const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_DIST = path.join(__dirname, "../frontend/dist");

// Middleware
app.use(cors());
app.use(express.json());
app.disable("x-powered-by");

// --------------------------------------------------
// TEMPORARY TEAM DATA
// --------------------------------------------------

let teamMembers = [
  {
    id: 1,
    name: "Amit",
    avatar_url: null,
    status: "Away",
    last_updated: "2026-08-22T19:13:20",
  },
  {
    id: 2,
    name: "Rashmita",
    avatar_url: null,
    status: "Busy",
    last_updated: "2026-08-22T19:07:57",
  },
  {
    id: 3,
    name: "Sneha",
    avatar_url: null,
    status: "Available",
    last_updated: "2026-08-22T19:05:15",
  },
];

let nextId = 4;

// --------------------------------------------------
// GET ALL TEAM MEMBERS
// --------------------------------------------------

app.get("/api/members", (req, res) => {
  res.json(teamMembers);
});

// --------------------------------------------------
// GET STATS (NEW - Added to match frontend)
// --------------------------------------------------

app.get("/api/stats", (req, res) => {
  const stats = {
    Available: teamMembers.filter(m => m.status === "Available").length,
    Busy: teamMembers.filter(m => m.status === "Busy").length,
    Away: teamMembers.filter(m => m.status === "Away").length,
    Total: teamMembers.length
  };
  res.json(stats);
});

// --------------------------------------------------
// GET SINGLE MEMBER
// --------------------------------------------------

app.get("/api/members/:id", (req, res) => {
  const id = Number(req.params.id);
  const member = teamMembers.find((member) => member.id === id);

  if (!member) {
    return res.status(404).json({ message: "Member not found" });
  }

  res.json(member);
});

// --------------------------------------------------
// ADD NEW MEMBER
// --------------------------------------------------

app.post("/api/members", (req, res) => {
  const { name, status } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  const newMember = {
    id: nextId++,
    name: name.trim(),
    avatar_url: null,
    status: status || "Available",
    last_updated: new Date().toISOString(),
  };

  teamMembers.push(newMember);
  res.status(201).json(newMember);
});

// --------------------------------------------------
// UPDATE MEMBER STATUS (Updated to match frontend)
// --------------------------------------------------

app.put("/api/members/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const member = teamMembers.find((member) => member.id === id);

  if (!member) {
    return res.status(404).json({ message: "Member not found" });
  }

  const { status } = req.body;
  const allowedStatuses = ["Available", "Busy", "Away"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status", allowedStatuses });
  }

  member.status = status;
  member.last_updated = new Date().toISOString();

  res.json(member);
});

// --------------------------------------------------
// DELETE MEMBER
// --------------------------------------------------

app.delete("/api/members/:id", (req, res) => {
  const id = Number(req.params.id);
  const memberIndex = teamMembers.findIndex((member) => member.id === id);

  if (memberIndex === -1) {
    return res.status(404).json({ message: "Member not found" });
  }

  const deletedMember = teamMembers.splice(memberIndex, 1)[0];
  res.json({ message: "Member deleted successfully", member: deletedMember });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", members: teamMembers.length });
});

// --------------------------------------------------
// SERVE FRONTEND 
// --------------------------------------------------

app.use(express.static(FRONTEND_DIST));

app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.use((req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`TeamConnect API running on port ${PORT}`);
});