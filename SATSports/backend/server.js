
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const jwt = require("jsonwebtoken");   // ✅ FIX
const xlsx = require("xlsx");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const app = express();
app.use(express.json());

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const allowedOrigins = [
  "https://sat-sports.vercel.app",
  "https://www.sat-sports.in",
  "https://sat-sports.in"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


let isAuthenticated = false;

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const db = connection.promise();   // ✅ create db variable

let sessions = [];
// LOGIN

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, email, role, name FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    let coachId = null;
    let playerId = null;

    if (user.role === "coach") {
      const [c] = await db.query(
        "SELECT id FROM coaches WHERE user_id = ?",
        [user.id]
      );
      if (c.length > 0) coachId = c[0].id;
    }

    if (user.role === "player") {
      const [p] = await db.query(
        "SELECT id FROM players WHERE user_id = ?",
        [user.id]
      );
      if (p.length > 0) playerId = p[0].id;
    }

    // 🔐 CREATE JWT TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
        coachId,
        playerId
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token   // ✅ ONLY send token
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// LOGOUT
app.post("/api/logout", (req, res) => {
  currentUser = null;
  res.json({ success: true });
});


    
  
// --- PROGRAMS (DB) ---

// READ (Public - all programs)
app.get("/api/programs", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, min_age, max_age, category FROM programs
    `);

    res.json(rows);

  } catch (err) {
    console.error("PROGRAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load programs" });
  }
});
// READ (Admin - all programs)
app.get("/api/admin/programs", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        title,
        description,
        min_age,
        max_age,
        created_at
      FROM programs
      ORDER BY created_at DESC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("ADMIN GET PROGRAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load programs" });
  }
});
app.put("/api/admin/programs/:id", async (req, res) => {
  const { id } = req.params;
  const { min_age, max_age, title } = req.body;

  await db.query(
    `UPDATE programs SET min_age=?, max_age=?, title=? WHERE id=?`,
    [min_age, max_age, title, id]
  );

  res.json({ success: true });
});
// CREATE
app.post("/api/programs", async (req, res) => {
  const { title, description, min_age, max_age } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO programs (title, description, min_age, max_age)
       VALUES (?, ?, ?, ?)`,
      [title, description || null, min_age || null, max_age || null]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("CREATE PROGRAM ERROR:", err);
    res.status(500).json({ message: "Failed to create program" });
  }
});

app.put("/api/programs/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, min_age, max_age } = req.body;

  try {
    await db.query(
      `UPDATE programs
       SET title = ?, description = ?, min_age = ?, max_age = ?
       WHERE id = ?`,
      [title, description, min_age || null, max_age || null, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE PROGRAM ERROR:", err);
    res.status(500).json({ message: "Failed to update program" });
  }
});

// DELETE
app.delete("/api/programs/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 🔍 CHECK IN SESSIONS
    const [sessions] = await db.query(
      "SELECT id FROM training_sessions WHERE program_id = ? LIMIT 1",
      [id]
    );

    if (sessions.length > 0) {
      return res.status(400).json({
        message: "Cannot delete: Program is used in sessions"
      });
    }

    // 🔍 CHECK IN PLAYERS
    const [players] = await db.query(
      "SELECT id FROM players WHERE program_id = ? LIMIT 1",
      [id]
    );

    if (players.length > 0) {
      return res.status(400).json({
        message: "Cannot delete: Program is assigned to players"
      });
    }

    // ✅ SAFE TO DELETE
    await db.query("DELETE FROM programs WHERE id = ?", [id]);

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE PROGRAM ERROR:", err);
    res.status(500).json({ message: "Failed to delete program" });
  }
});
// --- REVENUE / FINANCE ---
let revenue = [
    {
      id: 1,
      date: "2026-01-20",
      type: "CR",
      amount: 2000,
      description: "Rahul Sharma - Monthly Fees",
      playerId: 1,
      programId: 1,
    },
    {
      id: 2,
      date: "2026-01-21",
      type: "DR",
      amount: 500,
      description: "Court Maintenance",
      programId: 1,
    },
  ];
  
// --- NEWS CMS ---
let news = [
    {
      id: 1,
      title: "Academy Cup Announced",
      body: "Registrations are now open for the Academy Cup.",
      date: "2026-01-15",
      category: "Event", // News | Event
      isPublished: true,
    },
  ];

// --- NEWS & EVENTS ---

// READ (Public)
app.get("/api/news", (req, res) => {
    res.json(news.filter(n => n.isPublished));
  });
  
  // READ (Admin)
  app.get("/api/admin/news",  (req, res) => {
    res.json(news);
  });
  
  // CREATE
  app.post("/api/news",  (req, res) => {
    const newItem = {
      id: Date.now(),
      ...req.body,
    };
    news.push(newItem);
    res.json(newItem);
  });
  
  // UPDATE
  app.put("/api/news/:id",  (req, res) => {
    const id = req.params.id;
    news = news.map(n =>
      n.id == id ? { ...n, ...req.body } : n
    );
    res.json({ success: true });
  });
  
  // DELETE
  app.delete("/api/news/:id",  (req, res) => {
    const id = req.params.id;
    news = news.filter(n => n.id != id);
    res.json({ success: true });
  });
  
app.get("/api/news", (req, res) => {
  res.json(news.filter(n => n.isPublished));
});

app.post("/api/news", (req, res) => {
  const item = { id: Date.now(), ...req.body };
  news.push(item);
  res.json(item);
});

// --- TOURNAMENTS CMS ---
let tournaments = [
  { id: 1, name: "Academy Cup", date: "2026-02-12", status: "Open", registrationOpen: true },
];

app.get("/api/tournaments", async (req, res) => {
  const [rows] = await db.query(`
    SELECT 
      t.*,
      COUNT(tp.player_id) AS playerCount
    FROM tournaments t
    LEFT JOIN tournament_players tp 
      ON tp.tournament_id = t.id
    GROUP BY t.id
    ORDER BY t.date DESC
  `);

  res.json(rows);
});

app.post("/api/tournaments", (req, res) => {
  const item = { id: Date.now(), ...req.body };
  tournaments.push(item);
  res.json(item);
});

app.listen(4000, () => {
  console.log("CMS Backend running on http://localhost:4000");
});
// --- TOURNAMENTS ---

// READ (Public)
app.get("/api/tournaments", (req, res) => {
    res.json(tournaments.filter(t => t.isPublished));
  });
  
  // READ (Admin)
  app.get("/api/admin/tournaments",  (req, res) => {
    res.json(tournaments);
  });
  
  // CREATE
  app.post("/api/tournaments",  (req, res) => {
    const newItem = {
      id: Date.now(),
      ...req.body,
    };
    tournaments.push(newItem);
    res.json(newItem);
  });
  
  // UPDATE
  app.put("/api/tournaments/:id",  (req, res) => {
    const id = req.params.id;
    tournaments = tournaments.map(t =>
      t.id == id ? { ...t, ...req.body } : t
    );
    res.json({ success: true });
  });
  
  // DELETE
  app.delete("/api/tournaments/:id",  (req, res) => {
    const id = req.params.id;
    tournaments = tournaments.filter(t => t.id != id);
    res.json({ success: true });
  });
// --- ATTENDANCE ---
app.get("/api/admin/attendance", async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD

    let sql = `
      SELECT 
        sa.session_id,
        sa.player_id,
        sa.present,
DATE_FORMAT(ts.session_date, '%Y-%m-%d') AS session_date,
        p.name AS playerName,
        pr.title AS programTitle
      FROM session_attendance sa
      JOIN training_sessions ts ON ts.id = sa.session_id
      JOIN players p ON p.id = sa.player_id
      JOIN programs pr ON pr.id = ts.program_id
    `;

    const params = [];

    if (date) {
      sql += " WHERE DATE(ts.session_date) = ?";
      params.push(date);
    }

    sql += " ORDER BY ts.session_date DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
});
  
  // CREATE
  app.post("/api/attendance",  (req, res) => {
    const record = { id: Date.now(), ...req.body };
    attendance.push(record);
    res.json(record);
  });
  
  // UPDATE
  app.put("/api/attendance/:id",  (req, res) => {
    const { id } = req.params;
    attendance = attendance.map(a =>
      a.id == id ? { ...a, ...req.body } : a
    );
    res.json({ success: true });
  });
  
  // DELETE
  app.delete("/api/attendance/:id",  (req, res) => {
    const { id } = req.params;
    attendance = attendance.filter(a => a.id != id);
    res.json({ success: true });
  });
  // --- PLAYERS ---
// --- PLAYERS ---
app.get("/api/admin/players", async (req, res) => {
  const [rows] = await db.query(`
    SELECT 
      p.*, 
      pr.title AS programTitle,
      u.email
    FROM players p
    LEFT JOIN programs pr ON pr.id = p.program_id
    LEFT JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
  `);
  res.json(rows);
});


app.post("/api/admin/players", async (req, res) => {
  const { name, email, phone, age, program_id, sub_category } = req.body;

  await db.query(
    `INSERT INTO players (name, email, phone, age, program_id, sub_category)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, phone, age, program_id, sub_category]
  );

  res.json({ success: true });
});

app.put("/api/admin/players/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, age, program_id } = req.body;

  try {
    // 1️⃣ Update players table
// 1️⃣ Update players table (FIXED)
let fields = [];
let values = [];

if (name !== undefined) {
  fields.push("name = ?");
  values.push(name);
}

if (age !== undefined) {
  fields.push("age = ?");
  values.push(age);
}

if (program_id !== undefined) {
  fields.push("program_id = ?");
  values.push(program_id);
}

if (fields.length > 0) {
  values.push(id);

  await db.query(
    `UPDATE players SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});
app.delete("/api/admin/players/:id", async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM players WHERE id = ?", [id]);

  res.json({ success: true });
});  
 
  // --- COACHES ---

// ===============================
// COACHES (DB DRIVEN)
// ===============================

// Admin: Get all coaches
// List coaches
app.get("/api/admin/coaches", async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, name, phone, created_at FROM coaches ORDER BY created_at DESC"
  );
  res.json(rows);
});

// Create coach
app.post("/api/admin/coaches", async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  await db.query(
    "INSERT INTO coaches (name, email, phone) VALUES (?, ?, ?)",
    [name, email, phone]
  );

  // Later you can send credentials email here 👇
  // sendWelcomeEmail(email, ...)

  res.json({ success: true });
});

// Update coach
app.put("/api/admin/coaches/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  await db.query(
    "UPDATE coaches SET name = ?, email = ?, phone = ? WHERE id = ?",
    [name, email, phone, id]
  );

  res.json({ success: true });
});

// Delete coach
app.delete("/api/admin/coaches/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Check if coach is used in sessions
    const [[row]] = await db.query(
      "SELECT COUNT(*) AS cnt FROM training_sessions WHERE coach_id = ?",
      [id]
    );

    if (row.cnt > 0) {
      return res.status(400).json({
        message: "Cannot delete coach: assigned to sessions."
      });
    }

    // 2️⃣ Get user_id from coaches
    const [[coach]] = await db.query(
      "SELECT user_id FROM coaches WHERE id = ?",
      [id]
    );

    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    const userId = coach.user_id;

    // 3️⃣ DELETE FROM USERS (IMPORTANT)
    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    // ✅ This will automatically delete coach due to CASCADE

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});
// ===============================
// COACH → PLAYERS (BY COACH ID)
// ===============================

// Get players for a coach (used in coach dashboard later)
app.get("/api/coach/:coachId/players", async (req, res) => {
  const { coachId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT id, name, age, category, program_id
       FROM players
       WHERE program_id IN (
         SELECT program_id FROM coaches WHERE id = ?
       )`,
      [coachId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET COACH PLAYERS ERROR:", err);
    res.status(500).json({ message: "Failed to load players" });
  }
});


// ===============================
// ADMIN ATTENDANCE
// ===============================

// Get attendance for a specific player
app.get("/api/admin/attendance/player/:playerId", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { playerId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT *
       FROM attendance
       WHERE player_id = ?
       ORDER BY date DESC`,
      [playerId]
    );

    res.json(rows);
  } catch (err) {
    console.error("ADMIN ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
});
// GET attendance for a specific player
app.get("/api/admin/attendance/player/:playerId",  (req, res) => {
    const { playerId } = req.params;
    res.json(attendance.filter(a => a.playerId == playerId));
  });
// --- REVENUE / FINANCE ---

// READ (Admin)
app.get("/api/admin/revenue",  (req, res) => {
    res.json(revenue);
  });
  
  // CREATE
  app.post("/api/revenue",  (req, res) => {
    const record = {
      id: Date.now(),
      ...req.body,
    };
    revenue.push(record);
    res.json(record);
  });
  
  // UPDATE
  app.put("/api/revenue/:id",  (req, res) => {
    const { id } = req.params;
    revenue = revenue.map(r =>
      r.id == id ? { ...r, ...req.body } : r
    );
    res.json({ success: true });
  });
  
  // DELETE
  app.delete("/api/revenue/:id",  (req, res) => {
    const { id } = req.params;
    revenue = revenue.filter(r => r.id != id);
    res.json({ success: true });
  });
// --- REPORTS ---

// Attendance report by date range
    
  let locations = [
    { id: 1, name: "Whitefield" },
    { id: 2, name: "Indiranagar" },
    { id: 3, name: "Electronic City" },
  ];
  
 
  
  
  app.get("/api/admin/sessions", async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT 
          ts.id,
DATE_FORMAT(ts.session_date, '%Y-%m-%d') AS session_date,
          ts.start_time,
          ts.end_time,
          ts.program_id,
          p.title AS programTitle,
          ts.location_id,
          l.name AS locationName,
          ts.coach_id,
          c.name AS coachName,
          COUNT(sp.player_id) AS playerCount
         FROM training_sessions ts
         JOIN locations l ON l.id = ts.location_id
         JOIN programs p ON p.id = ts.program_id
         JOIN coaches c ON c.id = ts.coach_id
         LEFT JOIN session_players sp ON sp.session_id = ts.id
         GROUP BY ts.id
         ORDER BY ts.session_date, ts.start_time`
      );
  
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });
      
  
  app.post("/api/admin/sessions", async (req, res) => {
    try {
      const { session_date, start_time, end_time, location_id, coach_id, program_id } = req.body;
  
      if (!session_date || !start_time || !end_time || !location_id || !coach_id || !program_id) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // 1. Create session
      const [result] = await db.execute(
        `INSERT INTO training_sessions
         (session_date, start_time, end_time, location_id, coach_id, program_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [session_date, start_time, end_time, location_id, coach_id, program_id]
      );
  
      const sessionId = result.insertId;
  
      // 2. Auto-assign players by PROGRAM
      await db.execute(
        `INSERT INTO session_players (session_id, player_id)
         SELECT ?, id FROM players WHERE program_id = ?`,
        [sessionId, program_id]
      );
  
      res.json({ id: sessionId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create session" });
    }
  });
        
// Update session
app.put("/api/admin/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { session_date, start_time, end_time, location_id, coach_id, program_id } = req.body;

    if (!session_date || !start_time || !end_time || !location_id || !coach_id || !program_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await db.execute(
      `UPDATE training_sessions
       SET session_date = ?, start_time = ?, end_time = ?, location_id = ?, coach_id = ?, program_id = ?
       WHERE id = ?`,
      [session_date, start_time, end_time, location_id, coach_id, program_id, id]
    );

    // Re-assign players for this session (optional but clean)
    await db.execute(`DELETE FROM session_players WHERE session_id = ?`, [id]);

    await db.execute(
      `INSERT INTO session_players (session_id, player_id)
       SELECT ?, id FROM players WHERE program_id = ?`,
      [id, program_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update session" });
  }
});
// Delete session
app.delete("/api/admin/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute("DELETE FROM session_players WHERE session_id = ?", [id]);
    await db.execute("DELETE FROM training_sessions WHERE id = ?", [id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete session" });
  }
});
// Check-in

// Check-in status
app.get("/api/coach/checkin/status", async (req, res) => {
  const { coachId, sessionId } = req.query;

  const [rows] = await db.query(
    `SELECT id FROM coach_checkins
     WHERE coach_id = ? AND session_id = ? AND checkout_time IS NULL`,
    [coachId, sessionId]
  );

  res.json({ checkedIn: rows.length > 0 });
});

app.post("/api/coach/checkin/qr", (req, res) => {
  const { coachId, qrToken } = req.body;

  if (!coachId || !qrToken) {
    return res.status(400).json({ message: "Missing coachId or qrToken" });
  }

  // 1. Find location by QR token
  connection.query(
    "SELECT id FROM locations WHERE qr_token = ?",
    [qrToken],
    (err, rows) => {
      if (err) {
        console.error("Location lookup error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (rows.length === 0) {
        return res.status(400).json({ message: "Invalid QR code" });
      }

      const locationId = rows[0].id;

      // 2. Insert check-in (prevent double check-in via unique constraint or logic)
      connection.query(
        `INSERT INTO coach_checkins (coach_id, session_id, location_id, checkin_time)
VALUES (?, ?, ?, NOW())
`,
        [coachId, locationId],
        (err2, result) => {
          if (err2) {
            console.error("Check-in insert error:", err2);
            return res.status(409).json({ message: "Already checked in today" });
          }
      
          res.json({ success: true, message: "Check-in successful" });
        }
      );
      
    }
  );
});
app.post("/api/coach/checkout", (req, res) => {
  const { coachId } = req.body;

  connection.query(
    `UPDATE coach_checkins
     SET checkout_time = NOW(),
         work_minutes = TIMESTAMPDIFF(MINUTE, checkin_time, NOW())
     WHERE coach_id = ? AND checkin_date = CURDATE() AND checkout_time IS NULL`,
    [coachId],
    (err, result) => {
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "Not checked in or already checked out" });
      }
      res.json({ success: true });
    }
  );
});
app.get("/api/admin/live-coaches", (req, res) => {
  connection.query(
    `SELECT c.id, c.name, l.name AS location, cc.checkin_time
     FROM coach_checkins cc
     JOIN coaches c ON c.id = cc.coach_id
     JOIN locations l ON l.id = cc.location_id
     WHERE cc.checkin_date = CURDATE()
       AND cc.checkout_time IS NULL`,
    (err, rows) => {
      res.json(rows);
    }
  );
});
app.post("/api/attendance", (req, res) => {
  const { coachId } = req.body;

  connection.query(
    `SELECT 1 FROM coach_checkins
     WHERE coach_id = ? AND checkin_date = CURDATE() AND checkout_time IS NULL`,
    [coachId],
    (err, rows) => {
      if (rows.length === 0) {
        return res.status(403).json({ message: "Coach not checked in" });
      }

      // ✅ Coach is checked in → allow attendance save
      // ... existing insert logic here ...
    }
  );
});
// Generate or rotate QR token for a location

// Generate or rotate QR token for a location

app.get("/api/coach/sessions/:coachId", async (req, res) => {
  const { coachId } = req.params;

  const [rows] = await db.query(
    `SELECT 
      ts.id,
DATE_FORMAT(ts.session_date, '%Y-%m-%d') AS session_date,
      ts.start_time,
      ts.end_time,
      ts.category,
      ts.location_id,        -- ✅ ADD THIS
      l.name AS locationName
     FROM training_sessions ts
     JOIN locations l ON l.id = ts.location_id
     WHERE ts.coach_id = ?
     ORDER BY ts.session_date, ts.start_time`,
    [coachId]
  );

  res.json(rows);
});
app.post("/api/coach/checkin", async (req, res) => {
  const { coachId, sessionId, locationId } = req.body;

  try {
    await db.execute(
      `INSERT INTO coach_checkins (coach_id, session_id, location_id, checkin_time)
       VALUES (?, ?, ?, NOW())`,
      [coachId, sessionId, locationId]
    );

    res.json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Already checked in" });
    }
    console.error(err);
    res.status(500).json({ message: "Check-in failed" });
  }
});
app.get("/api/coach/sessions/:sessionId/players", async (req, res) => {
  const { sessionId } = req.params;

  const [rows] = await db.query(
    `SELECT p.id, p.name, p.age
     FROM session_players sp
     JOIN players p ON p.id = sp.player_id
     WHERE sp.session_id = ?`,
    [sessionId]
  );

  res.json(rows);
});
app.post("/api/coach/sessions/:sessionId/attendance", async (req, res) => {
  const { sessionId } = req.params;
  const { attendance } = req.body;

  try {
    for (const a of attendance) {
      await db.execute(
        `INSERT INTO session_attendance 
         (session_id, player_id, present, remark)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           present = VALUES(present),
           remark = VALUES(remark)`,
        [
          sessionId,
          a.playerId,
          a.present ? 1 : 0,
          a.remark || null
        ]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save attendance" });
  }
});
app.get("/api/admin/sessions/:sessionId/attendance", async (req, res) => {
  const { sessionId } = req.params;

  const [rows] = await db.query(
    `SELECT 
      p.name, 
      sa.present,
      sa.remark
     FROM session_attendance sa
     JOIN players p ON p.id = sa.player_id
     WHERE sa.session_id = ?`,
    [sessionId]
  );

  res.json(rows);
});
app.post("/api/coach/leaves", async (req, res) => {
  const { userId, start_date, end_date, leave_type, reason } = req.body;

  // ❗ CHECK CONFLICT
  const [existing] = await db.query(
    `SELECT * FROM coach_leaves 
     WHERE coach_id = ? 
     AND status != 'Rejected'
     AND (
       (start_date <= ? AND end_date >= ?) OR
       (start_date <= ? AND end_date >= ?)
     )`,
    [userId, end_date, start_date, start_date, end_date]
  );

  if (existing.length > 0) {
    return res.status(400).json({
      message: "Leave conflict detected"
    });
  }

  await db.query(
    `INSERT INTO coach_leaves 
     (coach_id, start_date, end_date, leave_type, reason, status)
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [userId, start_date, end_date, leave_type, reason]
  );

  res.json({ success: true });
});
app.get("/api/admin/leaves", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        cl.id,
        cl.from_date AS start_date,
        cl.to_date   AS end_date,
        cl.reason,
        cl.status,
        c.name AS username,
        'Coach' AS role
       FROM coach_leaves cl
       JOIN coaches c ON c.user_id = cl.coach_id   -- ✅ FIX IS HERE
       ORDER BY cl.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("ADMIN LEAVES ERROR:", err);
    res.status(500).json({ message: "Failed to load leaves" });
  }
});
app.put("/api/admin/leaves/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "Approved" or "Rejected"

  if (!status) {
    return res.status(400).json({ message: "Status required" });
  }

  try {
    await db.execute(
      `UPDATE coach_leaves SET status = ? WHERE id = ?`,
      [status, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update leave status" });
  }
});
app.get("/api/coach/leaves/:coachId", async (req, res) => {
  const { coachId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
        id,
        from_date AS start_date,
        to_date   AS end_date,
        reason,
        status
       FROM coach_leaves
       WHERE coach_id = ?
       ORDER BY created_at DESC`,
      [coachId]
    );

    res.json(rows);
  } catch (err) {
    console.error("COACH LEAVES LOAD ERROR:", err);
    res.status(500).json({ message: "Failed to load leaves" });
  }
});
app.get("/api/coach/overview/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [coachRows] = await db.query(
      "SELECT id, name FROM coaches WHERE user_id = ?",
      [userId]
    );

    if (!coachRows.length) {
      return res.status(404).json({ message: "Coach not found" });
    }

    const coachId = coachRows[0].id;

    const [[todaySessions]] = await db.query(
      `SELECT COUNT(*) as cnt
       FROM training_sessions
       WHERE coach_id = ? AND session_date = CURDATE()`,
      [coachId]
    );

    const [todaySessionList] = await db.query(
      `SELECT id, start_time, end_time
       FROM training_sessions
       WHERE coach_id = ? AND session_date = CURDATE()
       ORDER BY start_time`,
      [coachId]
    );

    const [upcoming] = await db.query(
      `SELECT session_date, start_time, end_time
       FROM training_sessions
       WHERE coach_id = ? AND session_date >= CURDATE()
       ORDER BY session_date
       LIMIT 5`,
      [coachId]
    );

    const [weekly] = await db.query(
      `SELECT DAYOFWEEK(session_date) as d, COUNT(*) as cnt
       FROM training_sessions
       WHERE coach_id = ?
       AND session_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY d`,
      [coachId]
    );
// Active Players
const [[players]] = await db.query(
  `SELECT COUNT(DISTINCT sp.player_id) AS activePlayers
   FROM session_players sp
   JOIN training_sessions ts ON ts.id = sp.session_id
   WHERE ts.coach_id = ?`,
  [coachId]
);

// Check-ins Today
const [[checkins]] = await db.query(
  `SELECT COUNT(*) AS checkinsToday
   FROM coach_checkins
   WHERE coach_id = ?
   AND checkin_date = CURDATE()`,
  [coachId]
);
res.json({
  coachName: coachRows[0].name,
  todaySessionCount: todaySessions.cnt,
  todaySessionList,
  upcoming,
  weekly,
  activePlayers: players.activePlayers,
  checkinsToday: checkins.checkinsToday
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Overview failed" });
  }
});
app.get("/api/coach/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [[row]] = await db.query(
      `SELECT u.email, u.role, c.name
       FROM users u
       JOIN coaches c ON c.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!row) return res.status(404).json({ message: "Profile not found" });

    res.json(row);
  } catch (err) {
    console.error("COACH PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});app.get("/api/coach/overview/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Get coach record
    const [coachRows] = await db.query(
      "SELECT id, name FROM coaches WHERE user_id = ?",
      [userId]
    );

    if (coachRows.length === 0) {
      return res.status(404).json({ message: "Coach not found" });
    }

    const coachId = coachRows[0].id;

    // Today's sessions (next session)
    const [sessionsToday] = await db.query(
      `SELECT session_date, start_time, end_time
       FROM training_sessions
       WHERE coach_id = ? AND session_date = CURDATE()
       ORDER BY start_time
       LIMIT 1`,
      [coachId]
    );

    // Count today's sessions
    const [sessionCount] = await db.query(
      `SELECT COUNT(*) as cnt
       FROM training_sessions
       WHERE coach_id = ? AND session_date = CURDATE()`,
      [coachId]
    );

    // Check-in status today (your table uses userId here)
    const [checkinRows] = await db.query(
      `SELECT id FROM coach_checkins
       WHERE coach_id = ? AND checkin_date = CURDATE()`,
      [userId]
    );

    // Pending leaves
    const [pendingLeaves] = await db.query(
      `SELECT COUNT(*) as cnt
       FROM coach_leaves
       WHERE coach_id = ? AND status = 'Pending'`,
      [userId]
    );

    // Weekly sessions (last 7 days)
    const [weeklyRows] = await db.query(
      `SELECT session_date, COUNT(*) as cnt
       FROM training_sessions
       WHERE coach_id = ?
         AND session_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY session_date
       ORDER BY session_date`,
      [coachId]
    );

    // Build array for last 7 days (simple bars)
    const weeklySessions = [0, 0, 0, 0, 0, 0, 0];
    weeklyRows.forEach((r, i) => {
      if (i < 7) weeklySessions[i] = r.cnt;
    });

    // Last 3 sessions
    const [lastSessionsRows] = await db.query(
      `SELECT session_date, start_time, end_time
       FROM training_sessions
       WHERE coach_id = ?
       ORDER BY session_date DESC, start_time DESC
       LIMIT 3`,
      [coachId]
    );

    const lastSessions = lastSessionsRows.map((s) => ({
      date: s.session_date,
      time: `${s.start_time} - ${s.end_time}`,
    }));

    // Last 3 leave requests
    const [lastLeavesRows] = await db.query(
      `SELECT from_date, to_date, status
       FROM coach_leaves
       WHERE coach_id = ?
       ORDER BY created_at DESC
       LIMIT 3`,
      [userId]
    );

    const lastLeaves = lastLeavesRows.map((l) => ({
      from: l.from_date,
      to: l.to_date,
      status: l.status,
    }));

    // Recent activity (simple derived feed)
    const recentActivities = [];
    if (checkinRows.length > 0) recentActivities.push("Checked in today");
    if (sessionCount[0].cnt > 0)
      recentActivities.push(`Has ${sessionCount[0].cnt} session(s) today`);
    if (pendingLeaves[0].cnt > 0)
      recentActivities.push(`${pendingLeaves[0].cnt} leave request(s) pending`);
    if (recentActivities.length === 0)
      recentActivities.push("No recent activity");

    res.json({
      coachName: coachRows[0].name,
      todaySessionCount: sessionCount[0].cnt,
      nextSession: sessionsToday.length ? sessionsToday[0] : null,
      checkedInToday: checkinRows.length > 0,
      pendingLeaves: pendingLeaves[0].cnt,
      weeklySessions,
      recentActivities,
      lastSessions,
      lastLeaves,
    });
  } catch (err) {
    console.error("COACH OVERVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to load overview" });
  }
});
app.get("/api/coach/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [[row]] = await db.query(
      `SELECT u.email, u.role, c.name
       FROM users u
       JOIN coaches c ON c.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!row) return res.status(404).json({ message: "Profile not found" });

    res.json(row);
  } catch (err) {
    console.error("COACH PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});
app.put("/api/coach/profile", async (req, res) => {
  const { userId, name } = req.body;

  try {
    await db.query(
      "UPDATE coaches SET name = ? WHERE user_id = ?",
      [name, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});
app.post("/api/coach/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const [[user]] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password !== oldPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [newPassword, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});
app.get("/api/player/overview/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Get player record
    const [playerRows] = await db.query(
      "SELECT id, name FROM players WHERE user_id = ?",
      [userId]
    );

    if (playerRows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    const playerId = playerRows[0].id;

    // Upcoming session
    const [nextSessionRows] = await db.query(
      `SELECT ts.session_date, ts.start_time, ts.end_time
       FROM training_sessions ts
       JOIN session_players sp ON sp.session_id = ts.id
       WHERE sp.player_id = ? AND ts.session_date >= CURDATE()
       ORDER BY ts.session_date, ts.start_time
       LIMIT 1`,
      [playerId]
    );

    // Total sessions
    const [totalCount] = await db.query(
      `SELECT COUNT(*) as cnt
       FROM session_players
       WHERE player_id = ?`,
      [playerId]
    );

    // Weekly sessions (last 7 days)
    const [weeklyRows] = await db.query(
      `SELECT ts.session_date, COUNT(*) as cnt
       FROM training_sessions ts
       JOIN session_players sp ON sp.session_id = ts.id
       WHERE sp.player_id = ?
         AND ts.session_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY ts.session_date
       ORDER BY ts.session_date`,
      [playerId]
    );

    const weeklySessions = [0, 0, 0, 0, 0, 0, 0];
    weeklyRows.forEach((r, i) => {
      if (i < 7) weeklySessions[i] = r.cnt;
    });

    // Last 3 sessions
    const [lastSessionsRows] = await db.query(
      `SELECT ts.session_date, ts.start_time, ts.end_time
       FROM training_sessions ts
       JOIN session_players sp ON sp.session_id = ts.id
       WHERE sp.player_id = ?
       ORDER BY ts.session_date DESC, ts.start_time DESC
       LIMIT 3`,
      [playerId]
    );

    const lastSessions = lastSessionsRows.map((s) => ({
      date: s.session_date,
      time: `${s.start_time} - ${s.end_time}`,
    }));

    // Recent activity (simple)
    const recentActivities = [];
    if (nextSessionRows.length > 0) recentActivities.push("Upcoming training session scheduled");
    if (totalCount[0].cnt > 0) recentActivities.push(`Enrolled in ${totalCount[0].cnt} session(s)`);
    if (recentActivities.length === 0) recentActivities.push("No recent activity");

    res.json({
      playerName: playerRows[0].name,
      totalSessions: totalCount[0].cnt,
      nextSession: nextSessionRows.length ? nextSessionRows[0] : null,
      weeklySessions,
      lastSessions,
      recentActivities,
    });
  } catch (err) {
    console.error("PLAYER OVERVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to load player overview" });
  }
});
app.post("/api/admin/players", async (req, res) => {
  const { username, password, name } = req.body;

  try {
    // Create user
    const [userResult] = await db.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'player')",
      [username, password]
    );

    const userId = userResult.insertId;

    // Create player
    await db.query(
      "INSERT INTO players (user_id, name) VALUES (?, ?)",
      [userId, name]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("CREATE PLAYER ERROR:", err);
    res.status(500).json({ message: "Failed to create player" });
  }
});
// ================== COURT BOOKINGS ==================

// Check overlap helper
async function hasOverlap(db, courtName, date, start, end, excludeId = null) {
  let sql = `
    SELECT id FROM court_bookings
    WHERE court_name = ?
      AND booking_date = ?
      AND NOT (end_time <= ? OR start_time >= ?)
  `;
  const params = [courtName, date, start, end];

  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.query(sql, params);
  return rows.length > 0;
}

// ✅ Public: Get availability for a date
app.get("/api/court-bookings", async (req, res) => {
  const { date } = req.query;

  try {
    const [rows] = await db.query(
      `SELECT * FROM court_bookings WHERE booking_date = ? ORDER BY start_time`,
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error("FETCH BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Failed to load bookings" });
  }
});

// ✅ Public: Create booking (no overlap)
app.post("/api/court-bookings", async (req, res) => {
  const { name, phone, court_name, booking_date, start_time, end_time } = req.body;

  if (!name || !court_name || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 🚫 Check overlap
    const [conflicts] = await db.query(
      `
      SELECT id FROM court_bookings
      WHERE court_name = ?
        AND booking_date = ?
        AND (? < end_time AND ? > start_time)
      `,
      [court_name, booking_date, start_time, end_time]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    // ✅ Insert
    await db.query(
      `
      INSERT INTO court_bookings (name, phone, court_name, booking_date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, phone, court_name, booking_date, start_time, end_time]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

// ADMIN: Get court bookings (optionally by date)
app.get("/api/admin/court-bookings", async (req, res) => {
  const { date } = req.query;

  try {
    let sql = `
      SELECT id, court_name, booking_date, start_time, end_time, name, phone
      FROM court_bookings
    `;
    const params = [];

    if (date) {
      sql += " WHERE booking_date = ?";
      params.push(date);
    }

    sql += " ORDER BY booking_date DESC, start_time ASC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("ADMIN COURT BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Failed to load bookings" });
  }
});

// ADMIN: Cancel booking
app.delete("/api/admin/court-bookings/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM court_bookings WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to delete booking" });
  }
});
app.post("/api/public/student-apply", async (req, res) => {
  const { name, email, phone, age, parent_name, parent_phone } = req.body;

  const suggested = suggestProgram(age);

  await db.query(
    `INSERT INTO student_applications 
     (name, email, phone, age, parent_name, parent_phone, suggested_program)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, age, parent_name || null, parent_phone || null, suggested]
  );

  res.json({ success: true });
});
app.put("/api/admin/players/:id/promote", async (req, res) => {
  const { program_id, category, sub_category } = req.body;
  const { id } = req.params;

  await db.query(
    `UPDATE players 
     SET program_id = ?, category = ?, sub_category = ?
     WHERE id = ?`,
    [program_id, category, sub_category, id]
  );

  res.json({ success: true });
});
app.post("/api/admin/players/import", upload.single("file"), async (req, res) => {
  // parse excel
  // loop rows
  // insert players + users
  res.json({ success: true });
});
// CREATE application (public)
app.post("/api/applications", async (req, res) => {
  const { name, email, phone, age, parent_name, parent_phone, preferred_program } = req.body;

  if (!name || !email || !age) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  await db.query(
    `INSERT INTO applications (name, email, phone, age, parent_name, parent_phone, preferred_program)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, age, parent_name || null, parent_phone || null, preferred_program || null]
  );

  res.json({ success: true });
});

// ADMIN: get all applications
app.get("/api/admin/applications", async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM applications ORDER BY created_at DESC`);
  res.json(rows);
});

// ADMIN: approve application -> create player
app.post("/api/admin/applications/:id/approve", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Get application
    const [[appData]] = await db.query(
      "SELECT * FROM applications WHERE id = ?",
      [id]
    );

    if (!appData) {
      return res.status(404).json({ message: "Application not found" });
    }

    // 2️⃣ Find program
    let programId = null;

    if (appData.age) {
      const [[program]] = await db.query(
        `SELECT id FROM programs
         WHERE ? BETWEEN min_age AND max_age
         ORDER BY min_age DESC
         LIMIT 1`,
        [appData.age]
      );

      if (program) programId = program.id;
    }

    // 3️⃣ Check if user exists
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [appData.email]
    );

    let userId;
    let password = null;
    let isNewUser = false;

    if (existingUsers.length > 0) {
      // ✅ Existing user
      userId = existingUsers[0].id;

      await db.query(
        "UPDATE users SET role = 'player' WHERE id = ?",
        [userId]
      );

    } else {
      // ✅ New user
      password = Math.random().toString(36).slice(-8);
      isNewUser = true;

      const [userResult] = await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'player')",
        [appData.name, appData.email, password]
      );

      userId = userResult.insertId;
    }

    // 4️⃣ Create player (avoid duplicates)
    const [existingPlayer] = await db.query(
      "SELECT id FROM players WHERE user_id = ?",
      [userId]
    );

    if (existingPlayer.length === 0) {
      await db.query(
        `INSERT INTO players (user_id, name, age, program_id)
         VALUES (?, ?, ?, ?)`,
        [userId, appData.name, appData.age, programId]
      );
    }

    // 5️⃣ Update application
    await db.query(
      "UPDATE applications SET status = 'approved' WHERE id = ?",
      [id]
    );

    // 6️⃣ Send email (ALWAYS)
    try {
      await resend.emails.send({
        from: "SAT Sports <no-reply@sat-sports.in>",
        to: appData.email,
        subject: "Application Approved 🎾",
        html: `
          <h3>Welcome to SAT Sports 🎾</h3>
          <p>Your application has been approved.</p>
          <p><b>Email:</b> ${appData.email}</p>
          ${
            isNewUser
              ? `<p><b>Password:</b> ${password}</p>`
              : `<p>You can login using your existing account.</p>`
          }
        `
      });

      console.log("✅ Email sent to:", appData.email);

    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr);
    }

    res.json({
      success: true,
      message: isNewUser
        ? "User created + email sent"
        : "User already existed, email sent"
    });

  } catch (err) {
    console.error("❌ APPROVE ERROR:", err);
    res.status(500).json({ message: "Approval failed" });
  }
});
// ADMIN: reject
app.post("/api/admin/applications/:id/reject", async (req, res) => {
  const { id } = req.params;

  await db.query(
    "UPDATE applications SET status = 'rejected' WHERE id = ?",
    [id]
  );

  res.json({ success: true });
});
app.post("/api/admin/players/import", upload.single("file"), async (req, res) => {
  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  for (const r of rows) {
    await db.query(
      `INSERT INTO players (name, email, phone, age) VALUES (?, ?, ?, ?)`,
      [r.name, r.email, r.phone, r.age]
    );
  }

  res.json({ success: true, count: rows.length });
});
// Get players by program
app.get("/api/admin/players/program/:programId", async (req, res) => {
  const { programId } = req.params;

  const [rows] = await db.query(
    "SELECT * FROM players WHERE program_id = ?",
    [programId]
  );

  res.json(rows);
});
app.get("/api/admin/coach-checkins", async (req, res) => {
  try {
    const { date } = req.query;

    let sql = `
      SELECT 
        cc.id,
        c.name AS coachName,
        DATE_FORMAT(ts.session_date, '%Y-%m-%d') AS session_date,
        ts.start_time,
        ts.end_time,
        l.name AS locationName,
        cc.checkout_time,
        cc.work_minutes
      FROM coach_checkins cc
      JOIN coaches c ON c.id = cc.coach_id
      JOIN training_sessions ts ON ts.id = cc.session_id
      JOIN locations l ON l.id = cc.location_id
    `;

    const params = [];

    if (date) {
      sql += " WHERE ts.session_date = ?";
      params.push(date);
    }

    sql += " ORDER BY ts.session_date DESC, ts.start_time DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch coach check-ins" });
  }
});
app.get("/api/admin/reports/attendance", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ message: "from and to dates are required" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        ts.session_date AS date,
        p.id AS playerId,
        p.name AS playerName,
        pr.id AS programId,
        pr.title AS programTitle,
        c.id AS coachId,
        c.name AS coachName,
        sa.present,
        CASE WHEN sa.present = 1 THEN 'Present' ELSE 'Absent' END AS status
      FROM session_attendance sa
      JOIN training_sessions ts ON ts.id = sa.session_id
      JOIN players p ON p.id = sa.player_id
      JOIN programs pr ON pr.id = p.program_id
      LEFT JOIN coaches c ON c.id = ts.coach_id
      WHERE DATE(ts.session_date) BETWEEN ? AND ?
      ORDER BY ts.session_date ASC
      `,
      [from, to]
    );

    res.json(rows);
  } catch (err) {
    console.error("Attendance report error:", err);
    res.status(500).json({ message: "Failed to load attendance report" });
  }
});
app.get("/api/admin/reports/revenue", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ message: "from and to dates are required" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        entry_date AS date,
        type,
        amount,
        description
      FROM revenue
      WHERE entry_date BETWEEN ? AND ?
      ORDER BY entry_date ASC
      `,
      [from, to]
    );

    res.json(rows); // ✅ Always returns array
  } catch (err) {
    console.error("Revenue report error:", err);
    res.status(500).json({ message: "Failed to load revenue report" });
  }
});

app.get("/api/admin/reports/coach-monthly-hours", async (req, res) => {
  try {
    const { month } = req.query; // e.g. 2026-02

    let sql = `
      SELECT 
        c.id AS coachId,
        c.name AS coachName,
        DATE_FORMAT(cc.checkin_date, '%Y-%m') AS month,
        SUM(cc.work_minutes) AS totalMinutes
      FROM coach_checkins cc
      JOIN coaches c ON c.id = cc.coach_id
    `;

    const params = [];

    if (month) {
      sql += " WHERE DATE_FORMAT(cc.checkin_date, '%Y-%m') = ?";
      params.push(month);
    }

    sql += `
      GROUP BY c.id, DATE_FORMAT(cc.checkin_date, '%Y-%m')
      ORDER BY c.name ASC
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch monthly coach hours" });
  }
});
app.get("/api/admin/reports/coach-daily-hours", async (req, res) => {
  try {
    const { date } = req.query;

    const sql = `
      SELECT 
  c.id AS coachId,
  c.name AS coachName,
  DATE_FORMAT(cc.checkin_date, '%Y-%m-%d') AS date,
  SUM(IFNULL(cc.work_minutes,0)) AS totalMinutes
FROM coach_checkins cc
JOIN coaches c ON c.id = cc.coach_id
WHERE cc.checkin_date = ?
GROUP BY c.id, cc.checkin_date
ORDER BY cc.checkin_date DESC, c.name ASC
    `;

    const [rows] = await db.query(sql, [date]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch daily coach hours" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { name, email, phone, age, parentName, parentPhone } = req.body;

  try {
    // ✅ prevent duplicate applications
    const [existing] = await db.query(
      "SELECT id FROM applications WHERE email = ? AND status = 'pending'",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Application already submitted"
      });
    }

    // ✅ insert into applications
    await db.query(
      `INSERT INTO applications
       (name, email, phone, age, parent_name, parent_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [name, email, phone, age, parentName, parentPhone]
    );

    res.json({
      success: true,
      message: "Application submitted"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});
app.get("/api/player/attendance/:userId", async (req, res) => {
  const { userId } = req.params;

  const [[player]] = await db.query(
    "SELECT id FROM players WHERE user_id = ?",
    [userId]
  );

  const [rows] = await db.query(
    `SELECT 
      ts.session_date,
      ts.start_time,
      ts.end_time,
      sa.present,
      sa.remark
     FROM session_attendance sa
     JOIN training_sessions ts ON ts.id = sa.session_id
     WHERE sa.player_id = ?
     ORDER BY ts.session_date DESC`,
    [player.id]
  );

  res.json(rows);
});
app.get("/api/session/:sessionId/players", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT p.id, p.name
       FROM session_players sp
       JOIN players p ON p.id = sp.player_id
       WHERE sp.session_id = ?`,
      [sessionId]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch players" });
  }
});
app.post("/api/signup/coach", async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    // 1️⃣ Check if email already exists
    const [[existing]] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // 2️⃣ Generate password
    const password = Math.random().toString(36).slice(-8);

    // 3️⃣ Create user
    const [userResult] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'coach')",
      [name, email, password]
    );

    const userId = userResult.insertId;

    // 4️⃣ Create coach
    await db.query(
      "INSERT INTO coaches (user_id, name, phone) VALUES (?, ?, ?)",
      [userId, name, phone]
    );

    // 5️⃣ Send email
    await resend.emails.send({
      from: "SAT Sports <no-reply@sat-sports.in>",
      to: email,
      subject: "Coach Account Created",
      html: `
        <h2>Welcome to SAT Sports 🎾</h2>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${password}</p>
        <p>Please login and change your password.</p>
      `
    });

    res.json({ success: true });

  } catch (err) {
    console.error("🔥 SIGNUP ERROR:", err);
    res.status(500).json({ message: "Coach signup failed" });
  }
});
app.post("/api/admin/players/bulk-assign", async (req, res) => {
  const { playerIds, program_id } = req.body;

  await db.query(
    `UPDATE players SET program_id=? WHERE id IN (?)`,
    [program_id, playerIds]
  );

  res.json({ success: true });
});
app.get("/api/admin/locations", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM locations");
  res.json(rows);
});
app.post("/api/admin/locations", async (req, res) => {
  const { name } = req.body;

  await db.query(
    "INSERT INTO locations (name) VALUES (?)",
    [name]
  );

  res.json({ success: true });
});
app.put("/api/admin/locations/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  await db.query(
    "UPDATE locations SET name=? WHERE id=?",
    [name, id]
  );

  res.json({ success: true });
});
app.delete("/api/admin/locations/:id", async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM locations WHERE id=?", [id]);

  res.json({ success: true });
});
app.get("/api/player/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  const [[row]] = await db.query(`
    SELECT p.name, p.age, pr.title AS programTitle
    FROM players p
    LEFT JOIN programs pr ON pr.id = p.program_id
    WHERE p.user_id = ?
  `, [userId]);

  res.json(row || {});
});
app.get("/api/player/attendance/:userId", async (req, res) => {
  const { userId } = req.params;

  const [rows] = await db.query(`
    SELECT 
      sa.id,
      ts.session_date AS date,
      CASE WHEN sa.present = 1 THEN 'present' ELSE 'absent' END AS status
    FROM session_attendance sa
    JOIN training_sessions ts ON ts.id = sa.session_id
    JOIN players p ON p.id = sa.player_id
    WHERE p.user_id = ?
    ORDER BY ts.session_date DESC
  `, [userId]);

  res.json(rows);
});
app.get("/api/player/revenue/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        r.id,
        r.entry_date AS date,
        r.amount,
        r.type,
        r.description
      FROM revenue r
      JOIN players p ON p.id = r.player_id
      WHERE p.user_id = ?
      ORDER BY r.entry_date DESC
    `, [userId]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Revenue failed" });
  }
});
app.post("/api/player/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const [[user]] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ⚠️ plain text (since you're not hashing yet)
    if (user.password !== oldPassword) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [newPassword, userId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password change failed" });
  }
});
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // save OTP
    await db.query(
      "INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
      [email, otp]
    );

    // send email
    await resend.emails.send({
      from: "SAT Sports <no-reply@sat-sports.in>",
      to: email,
      subject: "Password Reset OTP",
      html: `<h2>Your OTP is: ${otp}</h2>`
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP send failed" });
  }
});
app.post("/api/auth/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const [[row]] = await db.query(
      `SELECT * FROM password_resets 
       WHERE email = ? AND otp = ? 
       AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email, otp]
    );

    if (!row) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [newPassword, email]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset failed" });
  }
});
app.post("/api/tournaments/:id/register", async (req, res) => {
  const { id } = req.params;
  const { playerId } = req.body;

  await db.query(
    "INSERT INTO tournament_players (tournament_id, player_id) VALUES (?, ?)",
    [id, playerId]
  );

  res.json({ success: true });
});
app.post("/api/matches/:id/winner", async (req, res) => {
  const { id } = req.params;
  const { winnerId } = req.body;

  // 1. update winner
  await db.query(
    "UPDATE matches SET winner_id = ? WHERE id = ?",
    [winnerId, id]
  );

  // 2. get match details
  const [[match]] = await db.query(
    "SELECT * FROM matches WHERE id = ?",
    [id]
  );

  const nextRound = match.round + 1;

  // 3. find next match
  const [[nextMatch]] = await db.query(
    `SELECT * FROM matches 
     WHERE tournament_id = ? 
     AND round = ? 
     AND match_order = ?`,
    [
      match.tournament_id,
      nextRound,
      Math.floor(match.match_order / 2)
    ]
  );

  if (nextMatch) {
    // fill player1 or player2
    if (!nextMatch.player1_id) {
      await db.query(
        "UPDATE matches SET player1_id = ? WHERE id = ?",
        [winnerId, nextMatch.id]
      );
    } else {
      await db.query(
        "UPDATE matches SET player2_id = ? WHERE id = ?",
        [winnerId, nextMatch.id]
      );
    }
  }

  res.json({ success: true });
});
app.post("/api/admin/tournaments/:id/next-round", async (req, res) => {
  const { id } = req.params;

  const [completed] = await db.query(
    `SELECT winner_id FROM matches 
     WHERE tournament_id = ? AND winner_id IS NOT NULL`,
    [id]
  );

  const winners = completed.map(m => m.winner_id);

  const matches = [];

  for (let i = 0; i < winners.length; i += 2) {
    if (winners[i + 1]) {
      matches.push([
        id,
        winners[i],
        winners[i + 1],
        2,
        i / 2
      ]);
    }
  }

  await db.query(
    `INSERT INTO matches 
     (tournament_id, player1_id, player2_id, round, match_order)
     VALUES ?`,
    [matches]
  );

  res.json({ success: true });
});
app.get("/api/programs/:id/sessions", async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    `SELECT * FROM training_sessions WHERE program_id = ?`,
    [id]
  );

  res.json(rows);
});
app.post("/api/programs/enroll", async (req, res) => {
  const { userId, programId } = req.body;

  await db.query(
    `UPDATE players SET program_id = ? WHERE user_id = ?`,
    [programId, userId]
  );

  res.json({ success: true });
});
app.post("/api/matches/:id/score", async (req, res) => {
  const { id } = req.params;
  const { score1, score2, status } = req.body;

  await db.query(
    `UPDATE matches 
     SET score1=?, score2=?, status=? 
     WHERE id=?`,
    [score1, score2, status, id]
  );

  res.json({ success: true });
});
app.post("/api/admin/tournaments/:id/generate-brackets", async (req, res) => {
  const { id } = req.params;

  const [players] = await db.query(
    "SELECT player_id FROM tournament_players WHERE tournament_id = ?",
    [id]
  );

  if (players.length < 2) {
    return res.status(400).json({ message: "Not enough players" });
  }

  // shuffle players
  const shuffled = players.sort(() => 0.5 - Math.random());

  const matches = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      matches.push([
        id,
        shuffled[i].player_id,
        shuffled[i + 1].player_id,
        1,
        i / 2 + 1
      ]);
    }
  }

  await db.query(
    `INSERT INTO matches 
     (tournament_id, player1_id, player2_id, round, match_order)
     VALUES ?`,
    [matches]
  );

  res.json({ success: true });
});
app.get("/api/tournaments/:id/matches", async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(`
    SELECT 
      m.*,
      p1.name AS player1,
      p2.name AS player2
    FROM matches m
    LEFT JOIN players p1 ON p1.id = m.player1_id
    LEFT JOIN players p2 ON p2.id = m.player2_id
    WHERE m.tournament_id = ?
    ORDER BY m.round, m.match_order
  `, [id]);

  res.json(rows);
});
app.post("/api/admin/tournaments/:id/players", async (req, res) => {
  const { id } = req.params;
  const { players } = req.body;

  const values = players.map(p => [id, p]);

  await db.query(
    `INSERT INTO tournament_players (tournament_id, player_id)
     VALUES ?`,
    [values]
  );

  res.json({ success: true });
});
app.post("/api/admin/matches", async (req, res) => {
  const { tournament_id, player1_id, player2_id, round, match_order } = req.body;

  await db.query(
    `INSERT INTO matches 
     (tournament_id, player1_id, player2_id, round, match_order)
     VALUES (?, ?, ?, ?, ?)`,
    [tournament_id, player1_id, player2_id, round, match_order]
  );

  res.json({ success: true });
});
app.put("/api/tournaments/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  await db.query(
    "UPDATE tournaments SET status = ? WHERE id = ?",
    [status, id]
  );

  res.json({ success: true });
});
app.get("/api/coach/leave-balance/:coachId", async (req, res) => {
  const { coachId } = req.params;

  const [[row]] = await db.query(
    "SELECT * FROM leave_balances WHERE coach_id = ?",
    [coachId]
  );

  res.json(row || {});
});
app.post("/api/admin/leaves/:id/approve", async (req, res) => {
  const { id } = req.params;

  const [[leave]] = await db.query(
    "SELECT * FROM coach_leaves WHERE id = ?",
    [id]
  );

  // deduct leave
  if (leave.leave_type !== "lop") {
    await db.query(
      `UPDATE leave_balances 
       SET ${leave.leave_type} = ${leave.leave_type} - 1
       WHERE coach_id = ?`,
      [leave.coach_id]
    );
  }

  await db.query(
    "UPDATE coach_leaves SET status='Approved' WHERE id=?",
    [id]
  );

  res.json({ success: true });
});
// GET
app.get("/api/admin/leave-settings", async (req, res) => {
  const [[row]] = await db.query("SELECT * FROM leave_settings LIMIT 1");
  res.json(row);
});

// UPDATE
app.put("/api/admin/leave-settings", async (req, res) => {
  const { casual, medical } = req.body;

  await db.query(
    "UPDATE leave_settings SET casual=?, medical=? WHERE id=1",
    [casual, medical]
  );

  res.json({ success: true });
});
app.get("/api/player/sessions/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [[player]] = await db.query(
      "SELECT id FROM players WHERE user_id = ?",
      [userId]
    );

    if (!player) return res.json([]);

    const [rows] = await db.query(`
      SELECT 
        ts.id,
        DATE_FORMAT(ts.session_date, '%Y-%m-%d') AS date,
        ts.start_time,
        ts.end_time,
        l.name AS location,
        c.name AS coach,
        p.title AS program
      FROM session_players sp
      JOIN training_sessions ts ON ts.id = sp.session_id
      JOIN locations l ON l.id = ts.location_id
      JOIN coaches c ON c.id = ts.coach_id
      JOIN programs p ON p.id = ts.program_id
      WHERE sp.player_id = ?
      ORDER BY ts.session_date ASC
    `, [player.id]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load sessions" });
  }
});