const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const xlsx = require("xlsx");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors({
  origin: "https://sat-sports.vercel.app"
}));

app.use(express.json());

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
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, email, role FROM users WHERE email = ? AND password = ?",
      [username, password]
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

    // ✅ admin just works via role === "admin"
    res.json({
      success: true,
      role: user.role,   // "admin" | "coach" | "player"
      userId: user.id,
      coachId,
      playerId
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
    const [rows] = await db.query(
      "SELECT id, title, description, created_at FROM programs ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET PROGRAMS ERROR:", err);
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

app.get("/api/tournaments", (req, res) => {
  res.json(tournaments);
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
    SELECT p.*, pr.title AS programTitle
    FROM players p
    LEFT JOIN programs pr ON pr.id = p.program_id
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
  const { program_id, sub_category, age } = req.body;

  await db.query(
    `UPDATE players SET program_id = ?, sub_category = ?, age = ? WHERE id = ?`,
    [program_id, sub_category, age, id]
  );

  res.json({ success: true });
});

app.delete("/api/admin/players/:id", async (req, res) => {
  const { id } = req.params;
  await db.query(`DELETE FROM players WHERE id = ?`, [id]);
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
    "SELECT id, name, email, phone, created_at FROM coaches ORDER BY created_at DESC"
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

  // Check if coach is used in any session
  const [[row]] = await db.query(
    "SELECT COUNT(*) AS cnt FROM training_sessions WHERE coach_id = ?",
    [id]
  );

  if (row.cnt > 0) {
    return res.status(400).json({
      message: "Cannot delete coach: this coach is assigned to one or more sessions."
    });
  }

  await db.query("DELETE FROM coaches WHERE id = ?", [id]);
  res.json({ success: true });
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
  
 
  app.get("/api/admin/locations", (req, res) => {
    connection.query(
      "SELECT id, name, qr_token FROM locations",
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "DB error" });
        }
        res.json(rows);
      }
    );
  });
  
  
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
const crypto = require("crypto");

// Generate or rotate QR token for a location
app.post("/api/admin/locations/:id/qr", (req, res) => {
  const locationId = req.params.id;
  const newToken = crypto.randomUUID();

  connection.query(
    "UPDATE locations SET qr_token = ? WHERE id = ?",
    [newToken, locationId],
    (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Location not found" });
      }

      res.json({ success: true, qr_token: newToken });
    }
  );
});
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
  // attendance = [{ playerId: 1, present: true }, ...]

  for (const a of attendance) {
    await db.execute(
      `INSERT INTO session_attendance (session_id, player_id, present)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE present = VALUES(present)`,
      [sessionId, a.playerId, a.present ? 1 : 0]
    );
  }

  res.json({ success: true });
});
app.get("/api/admin/sessions/:sessionId/attendance", async (req, res) => {
  const { sessionId } = req.params;

  const [rows] = await db.query(
    `SELECT p.name, sa.present
     FROM session_attendance sa
     JOIN players p ON p.id = sa.player_id
     WHERE sa.session_id = ?`,
    [sessionId]
  );

  res.json(rows);
});
app.post("/api/coach/leaves", async (req, res) => {
  console.log("REQ BODY:", req.body); // keep this for debugging

  const { userId, start_date, end_date, reason } = req.body;

  if (!userId || !start_date || !end_date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await db.execute(
      `INSERT INTO coach_leaves (coach_id, from_date, to_date, reason)
       VALUES (?, ?, ?, ?)`,
      [userId, start_date, end_date, reason || null]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to apply leave" });
  }
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
    // Count today's sessions
    const [sessions] = await db.query(
      `SELECT COUNT(*) as cnt
       FROM training_sessions
       WHERE coach_id = (
         SELECT id FROM coaches WHERE user_id = ?
       )
       AND session_date = CURDATE()`,
      [userId]
    );

    // Count pending leaves
    const [leaves] = await db.query(
      `SELECT COUNT(*) as cnt
       FROM coach_leaves
       WHERE coach_id = ? AND status = 'Pending'`,
      [userId]
    );

    res.json({
      sessionsToday: sessions[0].cnt,
      pendingLeaves: leaves[0].cnt,
    });
  } catch (err) {
    console.error("COACH OVERVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to load overview" });
  }
});
app.get("/api/coach/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
        u.id,
        u.username,
        u.role,
        c.name
       FROM users u
       LEFT JOIN coaches c ON c.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("COACH PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});
app.get("/api/coach/overview/:userId", async (req, res) => {
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

  const [[appRow]] = await db.query(`SELECT * FROM applications WHERE id = ?`, [id]);
  if (!appRow) return res.status(404).json({ message: "Not found" });

  // Decide program title by age
  let programTitle = "Adult";
  if (appRow.age < 10) programTitle = "Little Aces";
  else if (appRow.age <= 15) programTitle = "BA1";
  else if (appRow.age <= 18) programTitle = "Junior Pros";

  // Find program_id
  const [[program]] = await db.query(
    `SELECT id FROM programs WHERE title = ?`,
    [programTitle]
  );

  if (!program) {
    return res.status(400).json({ message: "Program not found: " + programTitle });
  }

  await db.query(
    `INSERT INTO players (name, email, phone, age, program_id, sub_category)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [appRow.name, appRow.email, appRow.phone, appRow.age, program.id, null]
  );

  await db.query(`UPDATE applications SET status = 'approved' WHERE id = ?`, [id]);

  res.json({ success: true });
});

// ADMIN: reject
app.post("/api/admin/applications/:id/reject", async (req, res) => {
  const { id } = req.params;
  await db.query(`UPDATE applications SET status = 'rejected' WHERE id = ?`, [id]);
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