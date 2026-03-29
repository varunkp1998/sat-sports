
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const jwt = require("jsonwebtoken");   // ✅ FIX
const xlsx = require("xlsx");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const crypto = require("crypto");
const razorpay = require("./razorpay");
const cron = require("node-cron");
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
const path = require("path");
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/invoices", require("express").static("invoices"));

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

  app.post("/api/admin/tournaments", upload.single("image"), async (req, res) => {
    const { title, description, date, location, status } = req.body;
  
    const [result] = await db.query(`
      INSERT INTO tournaments (title, description, date, location, status)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, date, location, status]);
  
    res.json({
      success: true,
      id: result.insertId // 🔥 THIS FIXES undefined ID
    });
  });
// --- ATTENDANCE ---
app.get("/api/admin/attendance", async (req, res) => {
  try {
    const { date } = req.query;

    let sql = `
      SELECT 
        sa.session_id,
        sa.player_id,
        sa.present,
        DATE_FORMAT(ts.session_date, '%Y-%m-%d') AS session_date,
        p.name AS playerName,
        GROUP_CONCAT(pr.title) AS programTitles
      FROM session_attendance sa
      JOIN training_sessions ts ON ts.id = sa.session_id
      JOIN players p ON p.id = sa.player_id
      LEFT JOIN session_programs sp ON sp.session_id = ts.id
      LEFT JOIN programs pr ON pr.id = sp.program_id
    `;

    const params = [];

    if (date) {
      sql += " WHERE DATE(ts.session_date) = ?";
      params.push(date);
    }

    sql += `
      GROUP BY sa.session_id, sa.player_id
      ORDER BY ts.session_date DESC
    `;

    const [rows] = await db.query(sql, params);

    res.json(rows);

  } catch (err) {
    console.error("ATTENDANCE ERROR:", err);
    res.status(500).json({ error: err.message });
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
      const [rows] = await db.query(`
        SELECT 
          s.*,
          l.name AS locationName,
          c.name AS coachName,
          GROUP_CONCAT(DISTINCT p.title) AS programTitles,
          GROUP_CONCAT(DISTINCT sp.program_id) AS programIds
        FROM training_sessions s
        LEFT JOIN locations l ON l.id = s.location_id
        LEFT JOIN coaches c ON c.id = s.coach_id
        LEFT JOIN session_programs sp ON sp.session_id = s.id
        LEFT JOIN programs p ON p.id = sp.program_id
        GROUP BY s.id
        ORDER BY s.session_date DESC
      `);
  
      const formatted = rows.map(r => ({
        ...r,
        programIds: r.programIds
          ? r.programIds.split(",").map(Number)
          : []
      }));
  
      res.json(formatted);
  
    } catch (err) {
      console.error(err);
      res.status(500).json([]);
    }
  });
  app.post("/api/admin/sessions", async (req, res) => {
    const {
      session_date,
      start_time,
      end_time,
      location_id,
      coach_id,
      program_ids
    } = req.body;
  
    try {
      // 1. Insert session
      const [result] = await db.query(
        `INSERT INTO training_sessions 
         (session_date, start_time, end_time, location_id, coach_id)
         VALUES (?, ?, ?, ?, ?)`,
        [session_date, start_time, end_time, location_id, coach_id]
      );
  
      const sessionId = result.insertId;
  
      // 2. Insert mapping
      for (const pid of program_ids) {
        await db.query(
          `INSERT INTO session_programs (session_id, program_id)
           VALUES (?, ?)`,
          [sessionId, pid]
        );
      }
  
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create session" });
    }
  });
        
// Update session
app.put("/api/admin/sessions/:id", async (req, res) => {
  const { id } = req.params;

  const {
    session_date,
    start_time,
    end_time,
    location_id,
    coach_id,
    program_ids
  } = req.body;

  const db = connection.promise();

  try {
    // 1. Update session
    await db.query(
      `UPDATE training_sessions
       SET session_date = ?, start_time = ?, end_time = ?, 
           location_id = ?, coach_id = ?
       WHERE id = ?`,
      [session_date, start_time, end_time, location_id, coach_id, id]
    );

    // 2. Remove old mappings
    await db.query(
      `DELETE FROM session_programs WHERE session_id = ?`,
      [id]
    );

    // 3. Insert new mappings
    if (Array.isArray(program_ids)) {
      for (const pid of program_ids) {
        await db.query(
          `INSERT INTO session_programs (session_id, program_id)
           VALUES (?, ?)`,
          [id, pid]
        );
      }
    }

    res.json({ success: true });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update session" });
  }
});
// Delete session
app.delete("/api/admin/sessions/:id", async (req, res) => {
  const { id } = req.params;


  try {

    // 1. Delete mappings
    await db.query(
      `DELETE FROM session_programs WHERE session_id = ?`,
      [id]
    );

    // 2. Delete session
    await db.query(
      `DELETE FROM training_sessions WHERE id = ?`,
      [id]
    );


    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete session" });
  } finally {
  }
});// Check-in

// Check-in status

app.get("/api/coach/checkin/status", async (req, res) => {
  const { coachId, sessionId } = req.query;

  const [rows] = await db.query(
    `SELECT 
        MAX(cc.checkout_time) AS checkout_time,
        MAX(cc.is_late) AS is_late,
        COUNT(cc.id) AS total
     FROM coach_checkins cc
     JOIN training_sessions ts ON ts.id = cc.session_id
     WHERE cc.coach_id = ?
     AND cc.session_id = ?
     AND DATE(cc.checkin_time) = ts.session_date`,
    [coachId, sessionId]
  );

  const row = rows[0];

  // ✅ No record
  if (!row.total) {
    return res.json({
      checkedIn: false,
      completed: false,
      isLate: 0
    });
  }

  // ✅ Completed if ANY checkout exists
  if (row.checkout_time) {
    return res.json({
      checkedIn: false,
      completed: true,
      isLate: row.is_late || 0
    });
  }

  // ✅ Otherwise checked in
  return res.json({
    checkedIn: true,
    completed: false,
    isLate: row.is_late || 0
  });
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
app.post("/api/coach/checkout", async (req, res) => {
  const { coachId, sessionId } = req.body;

  const [result] = 
await db.query(
  `UPDATE coach_checkins
   SET checkout_time = CONVERT_TZ(NOW(), '+00:00', '+05:30'),
       work_minutes = TIMESTAMPDIFF(
         MINUTE,
         checkin_time,
         CONVERT_TZ(NOW(), '+00:00', '+05:30')
       )
   WHERE coach_id = ? 
   AND session_id = ? 
   AND checkout_time IS NULL`,
  [coachId, sessionId]
);



  if (result.affectedRows === 0) {
    return res.status(400).json({
      message: "Not checked in or already checked out"
    });
  }

  res.json({ success: true });
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
  try {
    const { coachId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        s.*,
        l.name AS locationName,
        GROUP_CONCAT(p.title) AS programTitles
      FROM training_sessions s
      LEFT JOIN locations l ON l.id = s.location_id
      LEFT JOIN session_programs sp ON sp.session_id = s.id
      LEFT JOIN programs p ON p.id = sp.program_id
      WHERE s.coach_id = ?
      GROUP BY s.id
      ORDER BY s.session_date DESC
    `, [coachId]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load sessions" });
  }
});
app.post("/api/coach/checkin", async (req, res) => {
  try {
    const { coachId, sessionId, locationId, lat, lng } = req.body;

    if (!coachId || !sessionId || !locationId || !lat || !lng) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    ///////////////////////////////////////////////////////
    // LOCATION CHECK
    ///////////////////////////////////////////////////////

    const [[location]] = await db.query(
      "SELECT lat, lng FROM locations WHERE id = ?",
      [locationId]
    );

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    ///////////////////////////////////////////////////////
    // DISTANCE CHECK
    ///////////////////////////////////////////////////////

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const distance = getDistance(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(location.lat),
      parseFloat(location.lng)
    );

    if (distance > 0.2) {
      return res.status(400).json({ message: "You are not at the location" });
    }

    ///////////////////////////////////////////////////////
    // PREVENT DUPLICATE (GRACEFUL)
    ///////////////////////////////////////////////////////

  
// BEFORE INSERT
const [existing] = await db.query(
  `SELECT id, checkout_time 
   FROM coach_checkins
   WHERE coach_id=? AND session_id=?`,
  [coachId, sessionId]
);

// ✅ If already checked out → DO NOT allow new check-in
if (existing.length > 0 && existing[0].checkout_time) {
  return res.status(400).json({
    message: "Session already completed"
  });
}

// ✅ If already checked in → return success (no duplicate insert)
if (existing.length > 0 && !existing[0].checkout_time) {
  return res.json({
    success: true,
    message: "Already checked in",
    isLate: 0
  });
}



    ///////////////////////////////////////////////////////
    // LATE DETECTION
    ///////////////////////////////////////////////////////

    const [[session]] = await db.query(
      `SELECT session_date, start_time FROM training_sessions WHERE id=?`,
      [sessionId]
    );

    const now = new Date();
    const sessionStart = new Date(
      `${session.session_date} ${session.start_time}`
    );

    const isLate = now > sessionStart ? 1 : 0;

    ///////////////////////////////////////////////////////
    // INSERT
    ///////////////////////////////////////////////////////

await db.query(
  `INSERT INTO coach_checkins
   (coach_id, session_id, location_id, lat, lng, checkin_time, is_late)
   VALUES (?, ?, ?, ?, ?, CONVERT_TZ(NOW(), '+00:00', '+05:30'), ?)`,
  [coachId, sessionId, locationId, lat, lng, isLate]
);


    ///////////////////////////////////////////////////////
    // 🔔 NOTIFICATION (OPTIONAL BUT INCLUDED)
    ///////////////////////////////////////////////////////

    if (isLate) {
      await db.query(
        `INSERT INTO notifications
         (type, title, message, coach_id, session_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          "LATE_CHECKIN",
          "Coach Late",
          `Coach ${coachId} checked in late`,
          coachId,
          sessionId
        ]
      );
    }

    ///////////////////////////////////////////////////////

    res.json({
      success: true,
      isLate
    });

  } catch (err) {
    console.error("Check-in error:", err);
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
  const { userId, from_date, to_date, leave_type, reason } = req.body;

  // ❗ CHECK CONFLICT
  const [existing] = await db.query(
    `SELECT * FROM coach_leaves 
     WHERE coach_id = ? 
     AND status != 'Rejected'
     AND (
       (from_date <= ? AND to_date >= ?) OR
       (from_date <= ? AND to_date >= ?)
     )`,
    [userId, to_date, from_date, from_date, to_date]
  );

  if (existing.length > 0) {
    return res.status(400).json({
      message: "Leave conflict detected"
    });
  }

  await db.query(
    `INSERT INTO coach_leaves 
     (coach_id, from_date, to_date, leave_type, reason, status)
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [userId, from_date, to_date, leave_type, reason]
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
    const [[coach]] = await db.query(
      `SELECT id, name, email 
       FROM coaches 
       WHERE user_id = ?`,
      [userId]
    );

    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    res.json({
      coachId: coach.id,   // 🔥 ADD THIS
      name: coach.name,
      email: coach.email,
      role: "coach"
    });

  } catch (err) {
    console.error(err);
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
        subject: "🎾 Application Approved!",
        html: `
        <div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:20px;">
          
          <div style="max-width:500px;margin:auto;background:white;border-radius:12px;overflow:hidden;">
            
            <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:20px;text-align:center;color:white;">
              <h2 style="margin:0;">SAT Sports 🎾</h2>
              <p style="opacity:0.8;margin-top:5px;">Application Approved</p>
            </div>
      
            <div style="padding:20px;">
              <h3 style="margin-top:0;">Welcome 🎉</h3>
      
              <p>Your application has been <b style="color:#16a34a;">approved</b>.</p>
      
              <div style="background:#f1f5f9;padding:15px;border-radius:10px;margin:15px 0;">
                <p><b>Email:</b> ${appData.email}</p>
                ${
                  isNewUser
                    ? `<p><b>Password:</b> ${password}</p>`
                    : `<p>You can login using your existing account.</p>`
                }
              </div>
      
              <div style="text-align:center;margin-top:20px;">
                <a href="https://www.sat-sports.in"
                   style="background:#f97316;color:white;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold;">
                  Login Now
                </a>
              </div>
            </div>
      
            <div style="text-align:center;padding:10px;font-size:12px;color:#64748b;">
              © SAT Sports
            </div>
      
          </div>
        </div>
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
        ts.id AS session_id,
        c.name AS coachName,
        DATE_FORMAT(ts.session_date, '%Y-%m-%d') AS session_date,
        ts.start_time,
        ts.end_time,
        l.name AS locationName,

        -- ✅ FORCE IST for display
        CONVERT_TZ(cc.checkin_time, '+00:00', '+05:30') AS checkin_time,
        CONVERT_TZ(cc.checkout_time, '+00:00', '+05:30') AS checkout_time,

        -- ✅ prevent negative values
        CASE 
          WHEN cc.work_minutes < 0 THEN 0
          ELSE cc.work_minutes
        END AS work_minutes

      FROM training_sessions ts
      JOIN coaches c ON c.id = ts.coach_id
      JOIN locations l ON l.id = ts.location_id

      LEFT JOIN coach_checkins cc 
        ON cc.session_id = ts.id 
        AND DATE(CONVERT_TZ(cc.checkin_time, '+00:00', '+05:30')) = ts.session_date
    `;

    const params = [];

    if (date) {
      sql += " WHERE ts.session_date = ?";
      params.push(date);
    }

    sql += " ORDER BY ts.start_time";

    const [rows] = await db.query(sql, params);

    // ✅ Status logic (unchanged but safe)
    const result = rows.map(r => {
      let status = "Not Checked In";

if (r.checkin_time && !r.checkout_time) {
  status = "Checked In";
} else if (r.checkout_time && r.work_minutes > 0) {
  status = "Checked Out";
}

      return {
        ...r,
        status
      };
    });

    res.json(result);

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
      subject: "🎾 Coach Account Created",
      html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:20px;">
        
        <div style="max-width:500px;margin:auto;background:white;border-radius:12px;overflow:hidden;">
          
          <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:20px;text-align:center;color:white;">
            <h2 style="margin:0;">SAT Sports 🎾</h2>
            <p style="opacity:0.8;margin-top:5px;">Coach Account Created</p>
          </div>
    
          <div style="padding:20px;">
            <h3 style="margin-top:0;">Welcome Coach 👋</h3>
    
            <p>Your account has been successfully created.</p>
    
            <div style="background:#f1f5f9;padding:15px;border-radius:10px;margin:15px 0;">
              <p><b>Email:</b> ${email}</p>
              <p><b>Password:</b> ${password}</p>
            </div>
    
            <p>Please login and change your password.</p>
    
            <div style="text-align:center;margin-top:20px;">
              <a href="https://www.sat-sports.in"
                 style="background:#f97316;color:white;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold;">
                Login
              </a>
            </div>
          </div>
    
          <div style="text-align:center;padding:10px;font-size:12px;color:#64748b;">
            © SAT Sports
          </div>
    
        </div>
      </div>
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
      subject: "🔐 Password Reset OTP",
      html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:20px;">
        
        <div style="max-width:500px;margin:auto;background:white;border-radius:12px;overflow:hidden;">
          
          <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:20px;text-align:center;color:white;">
            <h2 style="margin:0;">SAT Sports 🎾</h2>
            <p style="opacity:0.8;margin-top:5px;">Password Reset</p>
          </div>
    
          <div style="padding:20px;">
            <h3 style="margin-top:0;">Your OTP 🔐</h3>
    
            <p>Use the OTP below to reset your password:</p>
    
            <div style="background:#f1f5f9;padding:20px;border-radius:10px;margin:20px 0;text-align:center;">
              <h1 style="margin:0;color:#0f172a;letter-spacing:3px;">
                ${otp}
              </h1>
            </div>
    
            <p style="color:#ef4444;font-size:14px;">
              This OTP will expire soon. Do not share it with anyone.
            </p>
          </div>
    
          <div style="text-align:center;padding:10px;font-size:12px;color:#64748b;">
            © SAT Sports
          </div>
    
        </div>
      </div>
      `
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
app.put("/api/admin/matches/:id/winner", async (req, res) => {
  const { id } = req.params;
  const { winner } = req.body;

  await db.query(`
    UPDATE matches SET winner = ? WHERE id = ?
  `, [winner, id]);

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

  const [players] = await db.query(`
    SELECT * FROM tournament_players
    WHERE tournament_id = ?
    ORDER BY seed ASC
  `, [id]);

  // clear old matches
  await db.query("DELETE FROM matches WHERE tournament_id = ?", [id]);

  // round 1
  for (let i = 0; i < players.length; i += 2) {
    await db.query(`
      INSERT INTO matches (tournament_id, round, match_order, player1, player2)
      VALUES (?, 'round1', ?, ?, ?)
    `, [
      id,
      i / 2,
      players[i].name,
      players[i + 1]?.name
    ]);
  }

  res.json({ success: true });
});
app.get("/api/admin/tournaments/:id/matches", async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(`
    SELECT *
    FROM matches
    WHERE tournament_id = ?
    ORDER BY match_order
  `, [id]);

  res.json(rows);
});
app.post("/api/admin/tournaments/:id/players", async (req, res) => {
  const { id } = req.params;
  const { players } = req.body;

  for (let p of players) {
    await db.query(`
      INSERT INTO tournament_players (tournament_id, player_id, name)
      VALUES (?, ?, ?)
    `, [id, p.player_id || null, p.name]);
  }

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
app.put("/api/admin/tournaments/:id/seeding", async (req, res) => {
  const { id } = req.params;
  const { seeds } = req.body;

  for (let i = 0; i < seeds.length; i++) {
    await db.query(`
      UPDATE tournament_players
      SET seed = ?
      WHERE id = ?
    `, [i + 1, seeds[i].id]);
  }

  res.json({ success: true });
});
app.get("/api/admin/tournaments/:id/matches", async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(`
    SELECT * FROM matches
    WHERE tournament_id = ?
    ORDER BY round, match_order
  `, [id]);

  res.json(rows);
});
app.get("/api/admin/tournaments", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM tournaments ORDER BY id DESC");
  res.json(rows);
});
app.get("/api/admin/tournaments/:id/matches", async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(`
    SELECT * FROM matches WHERE tournament_id = ?
  `, [id]);

  res.json(rows);
});
app.get("/api/tournaments/:id/matches", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT *
      FROM matches
      WHERE tournament_id = ?
      ORDER BY match_order
    `, [id]);

    res.json(rows);

  } catch (err) {
    console.error("PUBLIC MATCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
});
app.post("/api/private-bookings", async (req, res) => {
  const { name, email, phone, location_id, booking_date, time_slot } = req.body;

  try {
    await db.query(`
      INSERT INTO private_bookings
      (name, email, phone, location_id, booking_date, time_slot)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, email, phone, location_id, booking_date, time_slot]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
});
app.get("/api/admin/private-bookings", async (req, res) => {
  const [rows] = await db.query(`
    SELECT b.*, l.name AS location_name, c.name AS coach_name
    FROM private_bookings b
    LEFT JOIN locations l ON b.location_id = l.id
    LEFT JOIN coaches c ON b.coach_id = c.id
    ORDER BY b.created_at DESC
  `);

  res.json(rows);
});
app.put("/api/admin/private-bookings/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { coach_id, court_id } = req.body;
  try {
    const [[booking]] = await db.query(
      "SELECT * FROM private_bookings WHERE id=?",
      [id]
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 1️⃣ UPDATE BOOKING
    await db.query(`
      UPDATE private_bookings
      SET status='approved', coach_id=?, court_id=?
      WHERE id=?
    `, [coach_id, court_id, id]);

    // 2️⃣ CREATE SESSION
    await db.query(`
      INSERT INTO training_sessions 
(coach_id, session_date, start_time, end_time, location_id)
VALUES (?, ?, ?, ?, ?)
    `, [
      coach_id,
      booking.booking_date,
      booking.time_slot,
      null,
      booking.location_id
    ]);

    // 3️⃣ SEND EMAIL (RESEND)
    try {
      await resend.emails.send({
        from: "SAT Sports <no-reply@sat-sports.in>",
        to: booking.email,
        subject: "🎾 Your Session is Confirmed!",
        html: `
        <div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:20px;">
          
          <div style="max-width:500px;margin:auto;background:white;border-radius:12px;overflow:hidden;">
            
            <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:20px;text-align:center;color:white;">
              <h2 style="margin:0;">SAT Sports 🎾</h2>
              <p style="opacity:0.8;margin-top:5px;">Private Session Confirmed</p>
            </div>
      
            <div style="padding:20px;">
              <h3 style="margin-top:0;">Hi ${booking.name},</h3>
      
              <p>Your private session has been <b style="color:#16a34a;">approved</b> 🎉</p>
      
              <div style="background:#f1f5f9;padding:15px;border-radius:10px;margin:15px 0;">
                <p><b>Date:</b> ${booking.booking_date}</p>
                <p><b>Time:</b> ${booking.time_slot}</p>
              </div>
      
              <p>We look forward to seeing you on court! 🏆</p>
      
              <div style="text-align:center;margin-top:20px;">
                <a href="https://www.sat-sports.in"
                   style="background:#f97316;color:white;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold;">
                  View Details
                </a>
              </div>
            </div>
      
            <div style="text-align:center;padding:10px;font-size:12px;color:#64748b;">
              © SAT Sports
            </div>
      
          </div>
        </div>
        `
      });

      console.log("✅ Email sent to:", booking.email);

    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Approval failed" });
  }
});
app.put("/api/admin/private-bookings/:id/reject", async (req, res) => {
  const { id } = req.params;

  try {
    const [[booking]] = await db.query(
      "SELECT * FROM private_bookings WHERE id=?",
      [id]
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // update status
    await db.query(
      "UPDATE private_bookings SET status='rejected' WHERE id=?",
      [id]
    );

    // send email
    try {
      await resend.emails.send({
        from: "SAT Sports <no-reply@sat-sports.in>",
        to: booking.email,
        subject: "Session Request Update",
        html: `
        <div style="font-family:Arial;background:#f5f7fb;padding:20px;">
          
          <div style="max-width:500px;margin:auto;background:white;border-radius:12px;">
            
            <div style="background:#ef4444;color:white;padding:20px;text-align:center;">
              <h2>Session Update</h2>
            </div>
      
            <div style="padding:20px;">
              <p>Hi ${booking.name},</p>
      
              <p>Unfortunately, your requested session could not be scheduled.</p>
      
              <p>Please try another time slot.</p>
      
              <a href="https://www.sat-sports.in"
                 style="display:inline-block;margin-top:15px;background:#0f172a;color:white;padding:10px 18px;border-radius:999px;text-decoration:none;">
                Book Again
              </a>
            </div>
      
          </div>
        </div>
        `
      });
      console.log("📧 Rejection email sent to:", booking.email);

    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("REJECT ERROR:", err);
    res.status(500).json({ message: "Reject failed" });
  }
});
app.post("/api/admin/players/by-programs", async (req, res) => {
  const { program_ids } = req.body;

  if (!program_ids || program_ids.length === 0) {
    return res.json([]);
  }

  try {
    const [rows] = await db.query(
      `SELECT DISTINCT p.*
       FROM players p
       WHERE p.program_id IN (?)`,
      [program_ids]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load players" });
  }
});

app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Safety check: Ensure amount exists and is a number
    if (!amount) return res.status(400).json({ error: "Amount is required" });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Ensure it's an integer
      currency: "INR",
      receipt: `receipt_${Date.now()}` // Razorpay often requires a receipt ID
    });

    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: error.description || "Failed to create order" });
  }
});
const generateInvoice = require("./utils/generateInvoice");
const sendInvoiceEmail = require("./utils/sendInvoiceEmail");

app.post("/api/payment/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      playerId,
      programId,
      sessions,
      amount,
      plan
    } = req.body;

    // 🔐 STEP 1: VERIFY SIGNATURE
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // 🔹 STEP 2: FETCH PLAYER + PROGRAM
    const [[player]] = await db.query(
      "SELECT id, name, email FROM players WHERE id = ?",
      [playerId]
    );

    const [[program]] = await db.query(
      "SELECT id, title FROM programs WHERE id = ?",
      [programId]
    );

    if (!player || !program) {
      return res.status(400).json({
        success: false,
        message: "Invalid player or program"
      });
    }

    // 🔹 STEP 3: INSERT PAYMENT
    const [result] = await db.query(
      `INSERT INTO payments 
      (player_id, source, source_id, sessions, amount, plan, status, payment_method, payment_id)
      VALUES (?, 'program', ?, ?, ?, ?, 'paid', 'razorpay', ?)`,
      [playerId, programId, sessions, amount, plan, razorpay_payment_id]
    );

    const paymentId = result.insertId;

    // 🔹 STEP 4: GENERATE INVOICE
    const invoiceUrl = await generateInvoice({
      paymentId,
      playerName: player.name,
      amount,
      plan,
      programName: program.title,
      sessions
    });

    // 🔹 STEP 5: SAVE INVOICE URL
    await db.query(
      "UPDATE payments SET invoice_url = ? WHERE id = ?",
      [invoiceUrl, paymentId]
    );

    // 🔹 STEP 6: SEND EMAIL (Resend)
    await sendInvoiceEmail({
      player: {
        name: player.name,
        email: player.email
      },
      payment: {
        id: paymentId,
        amount,
        plan,
        programName: program.title,
        sessions
      },
      invoicePath: invoiceUrl
    });

    // ✅ FINAL RESPONSE
    res.json({
      success: true,
      message: "Payment verified and recorded successfully",
      invoice_url: invoiceUrl
    });

  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
});

cron.schedule("0 9 * * *", async () => {
  const [dueUsers] = await db.query(`
    SELECT * FROM players
    WHERE next_payment_date <= CURDATE()
  `);

  // send email reminder
});
app.get("/api/player/fee/:id", async (req, res) => {
  try {
    // We join 'players' with 'programs' to find the price of the player's enrolled program
    const query = `
      SELECT programs.fee AS amount 
      FROM players 
      JOIN programs ON players.program_id = programs.id 
      WHERE players.id = ?`;
      
    const [rows] = await db.query(query, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Player or Program not found" });
    }

    res.json(rows[0]); // Returns { amount: 500 }
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});
app.get("/api/player/payments/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM payments WHERE player_id = ?", [req.params.id]);
  res.json(rows);
});
app.get("/api/admin/payments", async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.*, pl.name as player_name
    FROM payments p
    JOIN players pl ON pl.id = p.player_id
    ORDER BY p.created_at DESC
  `);

  res.json(rows);
});
app.post("/api/admin/payments", async (req, res) => {
  const {
    player_id,
    program_id,
    sessions,
    amount,
    plan,
    status,
    payment_method
  } = req.body;

  await db.query(
    `INSERT INTO payments
     (player_id, source_id, source, sessions, amount, plan, status, payment_method)
     VALUES (?, ?, 'program', ?, ?, ?, ?, ?)`,
    [player_id, program_id, sessions, amount, plan, status, payment_method]
  );

  res.json({ success: true });
});
app.get("/api/programs/:id/pricing", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM program_pricing WHERE program_id = ?",
    [req.params.id]
  );

  res.json(rows);
});
app.post("/api/admin/program-pricing", async (req, res) => {
  const {
    program_id,
    sessions_per_month,
    price_weekly,
    price_monthly,
    price_yearly
  } = req.body;

  await db.query(
    `INSERT INTO program_pricing 
     (program_id, sessions_per_month, price_weekly, price_monthly, price_yearly)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       price_weekly = VALUES(price_weekly),
       price_monthly = VALUES(price_monthly),
       price_yearly = VALUES(price_yearly)`,
    [program_id, sessions_per_month, price_weekly, price_monthly, price_yearly]
  );

  res.json({ success: true });
});