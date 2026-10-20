const bcrypt = require("bcrypt");
const express = require("express");
const Database = require("better-sqlite3");
const session = require("express-session");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "costech-helpdesk-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

// Create / connect to database

const db = new Database("./database/costech_helpdesk.db");

// Create users table

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'client',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`,
).run();

// Create support staff table

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS support_staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`,
).run();

// Create default admin account if it does not exist

const adminEmail = "admin@costech.com";
const adminPassword = "Admin123";

const existingAdmin = db
  .prepare(
    `
    SELECT * FROM users WHERE email = ?
`,
  )
  .get(adminEmail);

if (!existingAdmin) {
  const hashedAdminPassword = bcrypt.hashSync(adminPassword, 10);

  db.prepare(
    `
        INSERT INTO users (full_name, email, password, role)
        VALUES (?, ?, ?, ?)
    `,
  ).run("Costech Administrator", adminEmail, hashedAdminPassword, "admin");

  console.log("Default admin account created.");
}

// Create default support staff member if one does not exist

const staffEmail = "support@costech.com";

const existingStaff = db
  .prepare(
    `
    SELECT * FROM support_staff WHERE email = ?
`,
  )
  .get(staffEmail);

if (!existingStaff) {
  db.prepare(
    `
        INSERT INTO support_staff (full_name, email)
        VALUES (?, ?)
    `,
  ).run("Costech Support Staff", staffEmail);

  console.log("Default support staff member created.");
}

// Create tickets table

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        resolution_notes TEXT,
        amount REAL DEFAULT 0,
        payment_required INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`,
).run();

// Add assigned staff column if it does not already exist

try {
  db.prepare(
    `
        ALTER TABLE tickets
        ADD COLUMN assigned_staff_id INTEGER
    `,
  ).run();

  console.log("Assigned staff column added.");
} catch (error) {
  // Column already exists, so no action is needed.
}

// Add payment status column if it does not already exist

try {
  db.prepare(
    `
        ALTER TABLE tickets
        ADD COLUMN payment_status TEXT DEFAULT 'Unpaid'
    `,
  ).run();

  console.log("Payment status column added.");
} catch (error) {
  // Column already exists, so no action is needed.
}

// Register a new user

app.post("/register", (req, res) => {
  const {
    fullname,
    email,
    password,
    "confirm-password": confirmPassword,
  } = req.body;

  if (password !== confirmPassword) {
    return res.send(`
            <h1>Registration Failed</h1>
            <p>Passwords do not match.</p>
            <a href="/register.html">Try Again</a>
        `);
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const statement = db.prepare(`
            INSERT INTO users (full_name, email, password)
            VALUES (?, ?, ?)
        `);

    statement.run(fullname, email, hashedPassword);

    res.send(`
            <h1>Registration Successful</h1>
            <p>Your account has been created successfully.</p>
            <a href="/login.html">Go to Login</a>
        `);
  } catch (error) {
    res.send(`
            <h1>Registration Failed</h1>
            <p>This email may already be registered.</p>
            <a href="/register.html">Try Again</a>
        `);
  }
});

// Log in a user

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db
    .prepare(
      `
        SELECT * FROM users WHERE email = ?
    `,
    )
    .get(email);

  if (!user) {
    return res.send(`
            <h1>Login Failed</h1>
            <p>No account found with that email.</p>
            <a href="/login.html">Try Again</a>
        `);
  }

  const passwordMatches = bcrypt.compareSync(password, user.password);

  if (!passwordMatches) {
    return res.send(`
            <h1>Login Failed</h1>
            <p>Incorrect password.</p>
            <a href="/login.html">Try Again</a>
        `);
  }

  // Store logged-in user information in the session

  req.session.user = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };

  // Send the user to the correct dashboard

  if (user.role === "admin") {
    res.redirect("/admin-dashboard.html");
  } else {
    res.redirect("/client-dashboard.html");
  }
});

// Get the currently logged-in user

app.get("/session-user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: "Not logged in",
    });
  }

  res.json({
    id: req.session.user.id,
    full_name: req.session.user.full_name,
    email: req.session.user.email,
    role: req.session.user.role,
  });
});

// Get the logged-in user's support requests

app.get("/my-tickets", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: "Not logged in",
    });
  }

  const tickets = db
    .prepare(
      `
    SELECT
        tickets.id,
        tickets.title,
        tickets.category,
        tickets.description,
        tickets.priority,
        tickets.status,
        tickets.resolution_notes,
        tickets.payment_required,
        tickets.amount,
        tickets.payment_status,
        tickets.created_at,
        support_staff.full_name AS staff_name,
        support_staff.email AS staff_email
    FROM tickets
    LEFT JOIN support_staff
        ON tickets.assigned_staff_id = support_staff.id
    WHERE tickets.user_id = ?
    ORDER BY tickets.created_at DESC
`,
    )
    .all(req.session.user.id);

  res.json(tickets);
});

// Get support request statistics for the logged-in client

app.get("/client-stats", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: "Not logged in",
    });
  }

  if (req.session.user.role !== "client") {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  const userId = req.session.user.id;

  const total = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE user_id = ?
    `,
    )
    .get(userId).count;

  const pending = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE user_id = ?
        AND status = 'Pending'
    `,
    )
    .get(userId).count;

  const inProgress = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE user_id = ?
        AND status = 'In Progress'
    `,
    )
    .get(userId).count;

  const resolved = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE user_id = ?
        AND status = 'Resolved'
    `,
    )
    .get(userId).count;

  res.json({
    total,
    pending,
    inProgress,
    resolved,
  });
});

// Get all support requests for the admin dashboard

app.get("/admin-tickets", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  const tickets = db
    .prepare(
      `
        SELECT
    tickets.id,
    tickets.title,
    tickets.category,
    tickets.description,
    tickets.priority,
    tickets.status,
    tickets.resolution_notes,
    tickets.assigned_staff_id,
    tickets.payment_required,
    tickets.amount,
    tickets.payment_status,
    tickets.created_at,
    users.full_name,
    users.email
    
        FROM tickets
        JOIN users ON tickets.user_id = users.id
        ORDER BY tickets.created_at DESC
    `,
    )
    .all();

  res.json(tickets);
});

// Get support request statistics for the admin dashboard

app.get("/admin-stats", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  const total = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
    `,
    )
    .get().count;

  const pending = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE status = 'Pending'
    `,
    )
    .get().count;

  const inProgress = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE status = 'In Progress'
    `,
    )
    .get().count;

  const resolved = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE status = 'Resolved'
    `,
    )
    .get().count;

  res.json({
    total,
    pending,
    inProgress,
    resolved,
  });
});

// Get request counts by priority

app.get("/admin-priority-stats", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  const low = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE priority = 'Low'
    `,
    )
    .get().count;

  const medium = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE priority = 'Medium'
    `,
    )
    .get().count;

  const high = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM tickets
        WHERE priority = 'High'
    `,
    )
    .get().count;

  res.json({
    low,
    medium,
    high,
  });
});

// Get request counts by category

app.get("/admin-category-stats", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  const categories = db
    .prepare(
      `
        SELECT
            category,
            COUNT(*) AS count
        FROM tickets
        GROUP BY category
        ORDER BY count DESC
    `,
    )
    .all();

  res.json(categories);
});

// Get request counts by support staff

app.get("/admin-staff-stats", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  const staffStats = db
    .prepare(
      `
        SELECT
            support_staff.id,
            support_staff.full_name,
            support_staff.email,
            COUNT(tickets.id) AS ticket_count
        FROM support_staff
        LEFT JOIN tickets
            ON support_staff.id = tickets.assigned_staff_id
        GROUP BY support_staff.id
        ORDER BY ticket_count DESC
    `,
    )
    .all();

  res.json(staffStats);
});

// Get all registered clients for the admin dashboard

app.get("/admin-users", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  const users = db
    .prepare(
      `
        SELECT
            users.id,
            users.full_name,
            users.email,
            users.created_at,
            COUNT(tickets.id) AS ticket_count
        FROM users
        LEFT JOIN tickets
            ON users.id = tickets.user_id
        WHERE users.role = 'client'
        GROUP BY users.id
        ORDER BY users.created_at DESC
    `,
    )
    .all();

  res.json(users);
});

// Get all support staff

app.get("/support-staff", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  const staff = db
    .prepare(
      `
        SELECT
            id,
            full_name,
            email
        FROM support_staff
        ORDER BY full_name ASC
    `,
    )
    .all();

  res.json(staff);
});

// Add a new support staff member

app.post("/add-support-staff", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }

  const { full_name, email } = req.body;

  try {
    db.prepare(
      `
            INSERT INTO support_staff (
                full_name,
                email
            )
            VALUES (?, ?)
        `,
    ).run(full_name, email);

    res.redirect("/admin-dashboard.html");
  } catch (error) {
    console.error(error);

    res.status(400).send(`
            <h1>Unable to Add Support Staff</h1>

            <p>
                The email address may already belong
                to another support staff member.
            </p>

            <a href="/admin-dashboard.html">
                Return to Admin Dashboard
            </a>
        `);
  }
});

// Delete a support staff member

app.post("/delete-support-staff", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }

  const { staff_id } = req.body;

  try {
    const deleteStaff = db.transaction(() => {
      // Unassign this staff member from existing tickets

      db.prepare(
        `
                UPDATE tickets
                SET assigned_staff_id = NULL
                WHERE assigned_staff_id = ?
            `,
      ).run(staff_id);

      // Delete the support staff member

      db.prepare(
        `
                DELETE FROM support_staff
                WHERE id = ?
            `,
      ).run(staff_id);
    });

    deleteStaff();

    res.redirect("/admin-dashboard.html");
  } catch (error) {
    console.error(error);

    res.status(500).send(`
            <h1>Unable to Delete Support Staff</h1>

            <p>
                Something went wrong while removing
                the support staff member.
            </p>

            <a href="/admin-dashboard.html">
                Return to Admin Dashboard
            </a>
        `);
  }
});

// Delete a client account

app.post("/delete-user", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }

  const { user_id } = req.body;

  try {
    // Delete the client's support requests first
    db.prepare(
      `
            DELETE FROM tickets
            WHERE user_id = ?
        `,
    ).run(user_id);

    // Delete the client account
    db.prepare(
      `
            DELETE FROM users
            WHERE id = ?
            AND role = 'client'
        `,
    ).run(user_id);

    res.redirect("/admin-dashboard.html");
  } catch (error) {
    console.error(error);

    res.status(500).send(`
            <h1>Delete Failed</h1>

            <p>
                Unable to delete the client account.
            </p>

            <a href="/admin-dashboard.html">
                Return to Admin Dashboard
            </a>
        `);
  }
});

// Update a support request

app.post("/update-ticket", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }

  const {
    ticket_id,
    status,
    resolution_notes,
    assigned_staff_id,
    payment_required,
    amount,
    payment_status,
  } = req.body;

  try {
    const statement = db.prepare(`
    UPDATE tickets
    SET
        status = ?,
        resolution_notes = ?,
        assigned_staff_id = ?,
        payment_required = ?,
        amount = ?,
        payment_status = ?
    WHERE id = ?
`);

    statement.run(
      status,
      resolution_notes || null,
      assigned_staff_id || null,
      payment_required === "1" ? 1 : 0,
      payment_required === "1" ? Number(amount) || 0 : 0,
      payment_required === "1" ? payment_status : "Unpaid",
      ticket_id,
    );

    res.redirect("/admin-dashboard.html");
  } catch (error) {
    console.error(error);

    res.status(500).send(`
            <h1>Update Failed</h1>
            <p>Unable to update the support request.</p>
            <a href="/admin-dashboard.html">
                Return to Admin Dashboard
            </a>
        `);
  }
});

// Logout

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// Submit a support request

app.post("/submit-ticket", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }

  if (req.session.user.role !== "client") {
    return res.status(403).send("Access denied");
  }

  const { title, category, description, priority } = req.body;

  try {
    const statement = db.prepare(`
            INSERT INTO tickets (
                user_id,
                title,
                category,
                description,
                priority
            )
            VALUES (?, ?, ?, ?, ?)
        `);

    statement.run(req.session.user.id, title, category, description, priority);

    res.send(`
            <h1>Request Submitted Successfully</h1>

            <p>
                Your support request has been recorded.
            </p>

            <a href="/my-tickets.html">
                View My Requests
            </a>
        `);
  } catch (error) {
    console.error(error);

    res.send(`
            <h1>Something went wrong</h1>

            <p>
                Your support request could not be submitted.
            </p>

            <a href="/submit-ticket.html">
                Try Again
            </a>
        `);
  }
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
