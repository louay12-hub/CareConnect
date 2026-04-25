const express = require("express");// houe server engine to handle api request
const cors = require("cors");//security features
const multer = require("multer");//wa2ta user by3mel upload l image
const fs = require("fs");
const path = require("path");//managing file locations
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");//security&hashing ma bi sayyev pas bel database 3a ases 1234 by2lbou la random string.
require("dotenv").config();
const db = require("./db/db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from Node.js backend!" });
});
// Ensure the 'uploads/images' folder exists
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });

app.get("/api/users", (req, res) => {
  db.query("SELECT id, username, email, user_role, dob, created_at,is_active FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// app.get("/api/available_hospital", (req, res) => {
//   db.query("SELECT hospital_id, name, phone, address from hospitals", (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(results);
//   });
// });

app.get("/api/fetch_users", (req, res) => {
  db.query("SELECT id, username, email, user_role, dob, created_at,is_active FROM users WHERE user_role = 1", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  db.query("SELECT id, username, email, user_role, dob, created_at FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  });
});

app.post("/api/users", async (req, res) => {
  const { username, email, password, user_role, dob } = req.body;

  if (!username || !email || !password || user_role === undefined || !dob) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) return res.status(409).json({ error: "User already exists" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);//how  many times the computer run the hashing algorithm

      // Insert user
      db.query(
        "INSERT INTO users (username, email, password, user_role, dob) VALUES (?, ?, ?, ?, ?)",
        [username, email, hashedPassword, user_role, dob],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });

          // Create JWT token
          const token = jwt.sign({ id: results.insertId, email, user_role }, process.env.JWT_SECRET, { expiresIn: "1h" });

          // Return user object along with token
          res.status(201).json({
            message: "User created successfully",
            token,
            user: {
              id: results.insertId,
              username,
              email,
              user_role,
              dob,
            },
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Invalid email or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email, user_role: user.user_role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token, user: { id: user.id, username: user.username, email: user.email, user_role: user.user_role } });
  });
});

app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const { username, email, password, user_role, dob } = req.body;
  db.query("UPDATE users SET username=?, email=?, password=?, user_role=?, dob=? WHERE id=?", [username, email, password, user_role, dob, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User updated successfully" });
  });
});

app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM users WHERE id=?", [userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted successfully" });
  });
});

app.post("/api/contact", (req, res) => {
  const { full_name, email, subject, message, user_id } = req.body; // added user_id

  if (!full_name || !email || !subject || !message || !user_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const checkDuplicateQuery = "SELECT * FROM contact_messages WHERE email = ? AND message = ? AND user_id = ?";
  db.query(checkDuplicateQuery, [email, message, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(409).json({ error: "This message has already been sent." });
    }

    const insertQuery = `
      INSERT INTO contact_messages (full_name, email, subject, message, user_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(insertQuery, [full_name, email, subject, message, user_id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Message sent successfully!",
        messageId: result.insertId,
      });
    });
  });
});



app.get("/api/contact", (req, res) => {
  db.query("SELECT * FROM contact_messages ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


app.get("/api/user-info/:id", (req, res) => {
  const userId = req.params.id;

  const query = "SELECT username, email, dob FROM users WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  });
});

app.get("/api/notifications/:user_id", (req, res) => {
  const userId = req.params.user_id;
  db.query(
    "SELECT * FROM notifications WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results.length) return res.status(404).json({ error: "No notifications found" });
      res.json(results);
    }
  );
});

app.get("/api/hospitals", (req, res) => {
  const query = `
    SELECT hospital_id, user_id, name, address, phone, email, image, created_at, updated_at
    FROM hospitals
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get("/api/doctors", (req, res) => {
  const query = `
    SELECT doctor_id, hospital_id, equipment_id, name, specialization, email, phone, image
    FROM doctors
    ORDER BY name ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/services", (req, res) => {
  const query = `
    SELECT service_id, hospital_id, title, description, image
    FROM services
    ORDER BY title ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get("/api/equipment/:hospital_id", (req, res) => {
  const hospitalId = req.params.hospital_id;

  const query = `
    SELECT equipment_id, name, description, image
    FROM equipment
    WHERE hospital_id = ?
    ORDER BY name ASC
  `;

  db.query(query, [hospitalId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/services_infor/:hospital_id", (req, res) => {
  const hospitalId = req.params.hospital_id;

  const query = `
    SELECT title, description, image, service_id
    FROM services
    WHERE hospital_id = ?
    ORDER BY title ASC
  `;

  db.query(query, [hospitalId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get("/api/appointments", (req, res) => {
  const query = `
    SELECT 
      appointment_id, 
      user_id, 
      doctor_id, 
      hospital_id, 
      equipment_id,
      appointment_date, 
      status, 
      created_at
    FROM appointments
    ORDER BY appointment_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching appointments:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

app.get("/api/doctors/:hospital_id", (req, res) => {
  const hospitalId = req.params.hospital_id;

  const query = `
    SELECT doctor_id, name, specialization, email, phone, image
    FROM doctors
    WHERE hospital_id = ?
    ORDER BY name ASC
  `;

  db.query(query, [hospitalId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get("/api/nurses/:hospital_id", (req, res) => {
  const hospitalId = req.params.hospital_id;

  const query = `
    SELECT nurse_id, name, email, phone
    FROM 
    WHERE hospital_id = ?
    ORDER BY name ASC
  `;

  db.query(query, [hospitalId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get("/api/appointments/:user_id", (req, res) => {
  const userId = req.params.user_id;

  const query = `
    SELECT 
      appointment_id,
      appointment_date,
      status,
      equipment_id,
      doctor_id,
      hospital_id
    FROM appointments
    WHERE user_id = ?
    ORDER BY appointment_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No appointments found for this user." });
    res.json(results);
  });
});

app.get("/api/equipment-name/:equipment_id", (req, res) => {
  const equipmentId = req.params.equipment_id;
  const query = "SELECT name FROM equipment WHERE equipment_id = ?";
  db.query(query, [equipmentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Equipment not found" });
    res.json(results[0]);
  });
});

app.get("/api/doctor-name/:doctor_id", (req, res) => {
  const doctorId = req.params.doctor_id;
  const query = "SELECT name FROM doctors WHERE doctor_id = ?";
  db.query(query, [doctorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Doctor not found" });
    res.json(results[0]);
  });
});

app.get("/api/hospital-name/:hospital_id", (req, res) => {
  const hospitalId = req.params.hospital_id;
  const query = "SELECT name FROM hospitals WHERE hospital_id = ?";
  db.query(query, [hospitalId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Hospital not found" });
    res.json(results[0]);
  });
});
app.delete("/appointments/:appointment_id", (req, res) => {
  const appointmentId = req.params.appointment_id;

  const query = "DELETE FROM appointments WHERE appointment_id = ?";
  db.query(query, [appointmentId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  });
});

app.post("/api/appointments", (req, res) => {
  const { user_id, hospital_id, equipment_id, doctor_id, appointment_date } = req.body;

  if (!user_id || !hospital_id || !equipment_id || !doctor_id || !appointment_date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const checkQuery = `
    SELECT * FROM appointments
    WHERE user_id = ? AND hospital_id = ? AND equipment_id = ? AND doctor_id = ? AND appointment_date = ?
  `;
  db.query(checkQuery, [user_id, hospital_id, equipment_id, doctor_id, appointment_date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res.status(409).json({ message: "You already have an appointment with the same doctor, equipment, and date." });
    }

    const insertQuery = `
      INSERT INTO appointments (user_id, hospital_id, equipment_id, doctor_id, appointment_date, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    db.query(insertQuery, [user_id, hospital_id, equipment_id, doctor_id, appointment_date], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Appointment created successfully",
        appointment_id: result.insertId,
      });
    });
  });
});
// Create a new payment
app.post("/api/payments", (req, res) => {
  const { appointment_id, user_id, hospital_id, amount, payment_method } = req.body;

  if (!appointment_id || !user_id || !hospital_id || !amount || !payment_method) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["cash", "card"].includes(payment_method.toLowerCase())) {
    return res.status(400).json({ error: "Payment method must be 'cash' or 'card'" });
  }

  const insertQuery = `
    INSERT INTO payments (appointment_id, user_id, hospital_id, amount, payment_method, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'paid', NOW())
  `;

  db.query(
    insertQuery,
    [appointment_id, user_id, hospital_id, amount, payment_method.toLowerCase()],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const updateAppointment = `
        UPDATE appointments SET status = 'completed' WHERE appointment_id = ?
      `;
      db.query(updateAppointment, [appointment_id], (err2) => {
        if (err2) console.error("Failed to update appointment status:", err2.message);
      });

      res.status(201).json({
        message: "Payment recorded successfully",
        payment_id: result.insertId,
      });
    }
  );
});

app.get("/api/payments/hospital/:hospital_id", (req, res) => {
  const { hospital_id } = req.params;

  const query = "SELECT * FROM payments WHERE hospital_id = ? ORDER BY created_at DESC";

  db.query(query, [hospital_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No payments found for this hospital." });
    res.json(results);
  });
});



app.get("/api/users/role/:role", (req, res) => {
  const role = parseInt(req.params.role);
  if (role !== 0 && role !== 1 && role !== 2)
    return res.status(400).json({ error: "Invalid role. Must be 0 or 1." });

  const query = "SELECT username, email FROM users WHERE user_role = ?";
  db.query(query, [role], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(200).json(results);
  });
});
app.get("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const query = "SELECT username, email FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(results[0]);
  });
});

// ✅ Activate a user (set is_active = 1)
app.put("/api/users/:id/activate", (req, res) => {
  const userId = req.params.id;
  const query = "UPDATE users SET is_active = 'active' WHERE id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User activated successfully" });
  });
});

// ✅ Deactivate a user (set is_active = 0)
app.put("/api/users/:id/deactivate", (req, res) => {
  const userId = req.params.id;
  const query = "UPDATE users SET is_active = 'inactive' WHERE id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deactivated successfully" });
  });
});

app.put("/api/users/:id/role/admin", (req, res) => {
  const userId = req.params.id;
  const query = "UPDATE users SET user_role = 2 WHERE id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User role updated to 2 (admin) successfully" });
  });
});

app.put("/api/users/:id/role/user", (req, res) => {
  const userId = req.params.id;
  const query = "UPDATE users SET user_role = 0 WHERE id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User role updated to 0 (regular user) successfully" });
  });
});

app.get("/api/equipment", (req, res) => {
  const query = "SELECT * FROM equipment ORDER BY name ASC";

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/equipment/:hospital_id", (req, res) => {
  const { hospital_id } = req.params;
  const query = "SELECT * FROM equipment WHERE hospital_id = ? ORDER BY name ASC";

  db.query(query, [hospital_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No equipment found for this hospital" });
    res.json(results);
  });
});


app.delete("/api/equipment/:equipment_id", (req, res) => {
  const { equipment_id } = req.params;

  const query = "DELETE FROM equipment WHERE equipment_id = ?";

  db.query(query, [equipment_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Equipment not found" });

    res.json({ message: "Equipment deleted successfully" });
  });
});


app.get("/api/hospitals", (req, res) => {
  const query = "SELECT hospital_id, name FROM hospitals";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching hospitals:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});
app.get("/api/equipment/hospital/:hospital_id", (req, res) => {
  const { hospital_id } = req.params;
  const query = `
    SELECT equipment_id, hospital_id, name, description, image
    FROM equipment
    WHERE hospital_id = ?
  `;

  db.query(query, [hospital_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});





app.put("/api/equipment/:equipment_id", upload.single("image"), (req, res) => {
  try {
    const { equipment_id } = req.params;
    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required" });
    }

    // Handle uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `http://localhost:5000/images/${req.file.filename}`;

    }

    // Update equipment
    const updateQuery = `
      UPDATE equipment
      SET name = ?, description = ?, image = COALESCE(?, image), updated_at = NOW()
      WHERE equipment_id = ?
    `;

    db.query(updateQuery, [name, description, imageUrl, equipment_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error while updating equipment" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      // Return updated equipment info
      const selectQuery = "SELECT * FROM equipment WHERE equipment_id = ?";
      db.query(selectQuery, [equipment_id], (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to fetch updated equipment" });
        }

        res.json({
          message: "Equipment updated successfully",
          equipment: rows[0],
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/fetch_hospital_id/:id", (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = "SELECT hospital_id FROM hospitals WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Failed to fetch hospital:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Hospital not found for this user" });
    }

    res.json({ hospital_id: results[0].hospital_id });
  });
});


app.post("/api/equipment", upload.single("image"), (req, res) => {
  try {
    const { hospital_id, name, description } = req.body;

    // Validate required fields
    if (!hospital_id || !name || !description) {
      return res.status(400).json({ error: "Hospital, name, and description are required" });
    }

    // Handle uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `http://localhost:5000/images/${req.file.filename}`;
    }

    // Check if equipment already exists for this hospital
    const checkQuery = "SELECT * FROM equipment WHERE hospital_id = ? AND name = ?";
    db.query(checkQuery, [hospital_id, name], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error while checking equipment" });
      }

      if (results.length > 0) {
        return res.status(409).json({ error: "This equipment already exists for this hospital" });
      }

      // Insert new equipment
      const insertQuery = `
        INSERT INTO equipment (hospital_id, name, description, image, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      db.query(insertQuery, [hospital_id, name, description, imageUrl], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to create equipment" });
        }

        res.status(201).json({
          message: "Equipment created successfully",
          equipment_id: result.insertId,
          hospital_id,
          name,
          description,
          image: imageUrl,
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new hospital
app.post("/api/hospitals", upload.single("image"), (req, res) => {
  const { name, address, phone, email, user_id } = req.body;

  if (!name || !address || !phone || !email || !user_id) {
    return res.status(400).json({ error: "All fields including user_id are required" });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `http://localhost:5000/images/${req.file.filename}`;
  }

  const checkQuery = "SELECT * FROM hospitals WHERE user_id = ?";
  db.query(checkQuery, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(409).json({ error: "Hospital profile already exists for this user" });

    const insertQuery = `
      INSERT INTO hospitals (name, address, phone, email, image, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    db.query(insertQuery, [name, address, phone, email, imageUrl, user_id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Hospital created successfully",
        hospital_id: result.insertId,
        image: imageUrl,
      });
    });
  });
});


// Update hospital
app.put("/api/hospitals/:hospital_id", upload.single("image"), (req, res) => {
  const { hospital_id } = req.params;
  const { name, address, phone, email } = req.body;

  if (!name || !address || !phone || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `http://localhost:5000/images/${req.file.filename}`;
  }

  const query = `
    UPDATE hospitals
    SET name = ?, address = ?, phone = ?, email = ?, image = ?, updated_at = NOW()
    WHERE hospital_id = ?
  `;
  db.query(query, [name, address, phone, email, imageUrl, hospital_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Hospital not found" });

    res.json({ message: "Hospital updated successfully", image: imageUrl });
  });
});

// Delete hospital
app.delete("/api/hospitals/:hospital_id", (req, res) => {
  const { hospital_id } = req.params;

  const query = "DELETE FROM hospitals WHERE hospital_id = ?";
  db.query(query, [hospital_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Hospital not found" });

    res.json({ message: "Hospital deleted successfully" });
  });
});

// Get single hospital
app.get("/api/hospitals/:hospital_id", (req, res) => {
  const { hospital_id } = req.params;

  const query = "SELECT * FROM hospitals WHERE hospital_id = ?";
  db.query(query, [hospital_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Hospital not found" });

    res.json(results[0]);
  });
});
app.get("/appointments", (req, res) => {
  const query = "SELECT * FROM appointments ORDER BY appointment_date DESC";

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
});
app.get("/api/appointments/hospital/:id", (req, res) => {
  const hospital_id = req.params.id;

  const query = `
    SELECT * 
    FROM appointments 
    WHERE hospital_id = ? 
    ORDER BY appointment_date DESC
  `;

  db.query(query, [hospital_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
});



app.get("/api/contact/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const query = `SELECT * FROM contact_messages WHERE user_id = ? ORDER BY created_at DESC`;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No contact messages found for this user." });
    res.json(results);
  });
});
app.get("/api/contact", (req, res) => {
  const query = `SELECT * FROM contact_messages ORDER BY created_at DESC`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No contact messages found." });
    res.json(results);
  });
});


app.post("/api/notifications", (req, res) => {
  const { user_id, title, message } = req.body;

  if (!user_id || !title || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const insertQuery = `
    INSERT INTO notifications (user_id, title, message, is_read, created_at)
    VALUES (?, ?, ?, 0, NOW())
  `;

  db.query(insertQuery, [user_id, title, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Notification created successfully",
      notification_id: result.insertId,
    });
  });
});

app.get("/api/hospitals/:id", (req, res) => {
  const hospitalId = req.params.id;
  const query = "SELECT name FROM hospitals WHERE hospital_id = ?";

  db.query(query, [hospitalId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Hospital not found" });

    res.json(results[0]); // returns { name: "Hospital Name" }
  });
});

app.get("/api/doctors_data/:id", (req, res) => {
  const doctorId = req.params.id;
  if (isNaN(doctorId)) return res.status(400).json({ error: "Invalid doctor ID" });

  console.log("Doctor ID received:", doctorId);

  const query = "SELECT * FROM doctors WHERE doctor_id = ?";
  db.query(query, [doctorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log("DB results:", results);
    if (results.length === 0) return res.status(404).json({ message: "Doctor not found" });

    res.json(results[0]);
  });
});

app.get("/api/equipment_data/:id", (req, res) => {
  const equipmentId = req.params.id;
  if (isNaN(equipmentId)) return res.status(400).json({ error: "Invalid equipment ID" });

  console.log("Equipment ID received:", equipmentId);

  const query = "SELECT * FROM equipment WHERE equipment_id = ?";
  db.query(query, [equipmentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log("DB results:", results);
    if (results.length === 0) return res.status(404).json({ message: "Equipment not found" });

    res.json(results[0]);
  });
});
app.post("/api/notifications", (req, res) => {
  const { user_id, title, message } = req.body;
  if (!user_id || !title || !message) {
    return res.status(400).json({ error: "user_id, title, and message are required" });
  }

  const query = "INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, NOW())";
  db.query(query, [user_id, title, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Notification sent successfully", notification_id: result.insertId });
  });
});

app.put("/api/appointments/:id/cancel", (req, res) => {
  const appointmentId = req.params.id;
  const query = "UPDATE appointments SET status = 'Cancelled' WHERE appointment_id = ?";
  db.query(query, [appointmentId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment cancelled successfully" });
  });
});

app.put("/api/appointments/:id/confirm", (req, res) => {
  const appointmentId = req.params.id;
  const query = "UPDATE appointments SET status = 'Confirmed' WHERE appointment_id = ?";
  db.query(query, [appointmentId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment confirmed successfully" });
  });
});


// CREATE Nurse with image
app.post("/api/create_nurses", upload.single("image"), (req, res) => {
  const { hospital_id, equipment_id, name, email, phone } = req.body;

  if (!hospital_id || !equipment_id || !name || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `http://localhost:5000/images/${req.file.filename}`;
  }

  const query = `
    INSERT INTO nurses (hospital_id, equipment_id, name, email, phone, image, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [hospital_id, equipment_id, name, email, phone, imageUrl],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Nurse created successfully",
        nurse_id: result.insertId,
        hospital_id,
        equipment_id,
        name,
        email,
        phone,
        image: imageUrl,
      });
    }
  );
});


app.put("/api/update_nurses/:nurse_id", upload.single("image"), (req, res) => {
  const { nurse_id } = req.params;
  const { hospital_id, equipment_id, name, email, phone } = req.body;

  if (!hospital_id || !equipment_id || !name || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let imageUrl = null;
  if (req.file) imageUrl = `http://localhost:5000/images/${req.file.filename}`;

  const query = `
    UPDATE nurses
    SET hospital_id = ?, equipment_id = ?, name = ?, email = ?, phone = ?, image = COALESCE(?, image), updated_at = NOW()
    WHERE nurse_id = ?
  `;

  db.query(query, [hospital_id, equipment_id, name, email, phone, imageUrl, nurse_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Nurse not found" });

    res.json({ message: "Nurse updated successfully", image: imageUrl });
  });
});

// DELETE Nurse
app.delete("/api/delete_nurses/:id", (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Nurse ID is required" });

  const query = "DELETE FROM nurses WHERE nurse_id = ?";

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nurse not found" });
    }

    res.json({ message: "Nurse deleted successfully" });
  });
});


app.get("/api/fetch_av_equipment", (req, res) => {
  const query = "SELECT * FROM equipment ORDER BY name ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching equipment:", err);
      return res.status(500).json({ error: "Failed to fetch equipment" });
    }
    res.json(results);
  });
});
app.get("/api/fetch_nurses/:hospital_id", (req, res) => {
  const { hospital_id } = req.params;

  const query = "SELECT * FROM nurses WHERE hospital_id = ? ORDER BY name ASC";
  db.query(query, [hospital_id], (err, results) => {
    if (err) {
      console.error("Error fetching nurses:", err);
      return res.status(500).json({ error: "Failed to fetch nurses" });
    }
    res.json(results);
  });
});

app.get("/api/fetch_services/:hospital_id", (req, res) => {
  const { hospital_id } = req.params;

  const query =
    "SELECT * FROM services WHERE hospital_id = ? ORDER BY title ASC";

  db.query(query, [hospital_id], (err, results) => {
    if (err) {
      console.error("Error fetching services:", err);
      return res.status(500).json({ error: "Failed to fetch services" });
    }
    res.json(results);
  });
});

// CREATE SERVICE
app.post("/api/services", upload.single("image"), (req, res) => {
  const { hospital_id, title, description } = req.body;

  if (!hospital_id || !title || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `http://localhost:5000/images/${req.file.filename}`;
  }

  const query = `
    INSERT INTO services (hospital_id, title, description, image)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [hospital_id, title, description, imageUrl], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Service added successfully",
      service_id: result.insertId,
      image: imageUrl,
    });
  });
});

// UPDATE SERVICE
app.put("/api/services/:service_id", upload.single("image"), (req, res) => {
  const { service_id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `http://localhost:5000/images/${req.file.filename}`;
  }

  let query = "";
  let params = [];

  if (imageUrl) {
    // Update title, description, and image
    query = `
      UPDATE services
      SET title = ?, description = ?, image = ?, updated_at = NOW()
      WHERE service_id = ?
    `;
    params = [title, description, imageUrl, service_id];
  } else {
    // Update only title and description
    query = `
      UPDATE services
      SET title = ?, description = ?, updated_at = NOW()
      WHERE service_id = ?
    `;
    params = [title, description, service_id];
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Service not found" });

    res.json({ message: "Service updated successfully", image: imageUrl });
  });
});

// DELETE SERVICE
app.delete("/api/services/:service_id", (req, res) => {
  const { service_id } = req.params;

  const query = "DELETE FROM services WHERE service_id = ?";
  db.query(query, [service_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Service not found" });

    res.json({ message: "Service deleted successfully" });
  });
});
app.post("/api/hospital_profile", upload.single("image"), (req, res) => {
  const { user_id, name, address, phone, email } = req.body;

  if (!user_id || !name || !address || !phone || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `http://localhost:5000/images/${req.file.filename}`;
  }

  // Check if hospital profile already exists for this user
  const checkQuery = "SELECT * FROM hospitals WHERE user_id = ?";
  db.query(checkQuery, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      // Update existing profile
      const updateQuery = `
        UPDATE hospitals
        SET name = ?, address = ?, phone = ?, email = ?, ${imageUrl ? "image = ?," : ""}
        updated_at = NOW()
        WHERE user_id = ?
      `;

      const params = imageUrl
        ? [name, address, phone, email, imageUrl, user_id]
        : [name, address, phone, email, user_id];

      db.query(updateQuery, params, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to update profile" });
        }
        res.json({ message: "Hospital profile updated successfully" });
      });
    } else {
      // Insert new profile
      const insertQuery = `
        INSERT INTO hospitals (user_id, name, address, phone, email, image, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      db.query(
        insertQuery,
        [user_id, name, address, phone, email, imageUrl],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to create profile" });
          }
          res.json({ message: "Hospital profile created successfully" });
        }
      );
    }
  });
});
app.get("/api/hospital_profile/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = "SELECT * FROM hospitals WHERE user_id = ?";
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Hospital profile not found" });
    }

    const profile = results[0];
    res.json({
      hospital_id: profile.hospital_id,
      user_id: profile.user_id,
      name: profile.name,
      address: profile.address,
      phone: profile.phone,
      email: profile.email,
      image: profile.image,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    });
  });
});

// Endpoint to fetch all equipment
app.get("/api/equipment_data", (req, res) => {
  const { hospital_id } = req.query;

  if (!hospital_id) {
    return res.status(400).json({ error: "hospital_id is required" });
  }

  const query = `
    SELECT equipment_id, name 
    FROM equipment
    WHERE hospital_id = ?
  `;

  db.query(query, [hospital_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch equipment" });
    }

    res.json(results);
  });
});

app.post("/api/create_doctors", upload.single("image"), (req, res) => {
  const { hospital_id, equipment_id, name, specialization, email, phone } = req.body;
  const image = req.file
    ? `http://localhost:5000/images/${req.file.filename}`
    : null;

  if (!hospital_id || !equipment_id || !name || !specialization || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO doctors (hospital_id, equipment_id, name, specialization, email, phone, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [hospital_id, equipment_id, name, specialization, email, phone, image],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to create doctor" });

      res.json({ id: result.insertId, hospital_id, equipment_id, name, specialization, email, phone, image });
    }
  );
});

app.put("/api/update_doctors/:doctor_id", upload.single("image"), (req, res) => {
  const { doctor_id } = req.params;
  const { hospital_id, equipment_id, name, specialization, email, phone } = req.body;

  const image = req.file ? `http://localhost:5000/images/${req.file.filename}` : null;

  if (!hospital_id || !equipment_id || !name || !specialization || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    UPDATE doctors
    SET hospital_id = ?, equipment_id = ?, name = ?, specialization = ?, email = ?, phone = ?, image = COALESCE(?, image)
    WHERE doctor_id = ?
  `;

  db.query(
    query,
    [hospital_id, equipment_id, name, specialization, email, phone, image, doctor_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to update doctor" });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      db.query(
        "SELECT * FROM doctors WHERE doctor_id = ?",
        [doctor_id],
        (err2, rows) => {
          if (err2) return res.status(500).json({ error: "Failed to fetch updated doctor" });
          res.json(rows[0]);
        }
      );
    }
  );
});


app.delete("/api/delete_doctors/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM doctors WHERE doctor_id = ?`;

  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete doctor" });
    res.json({ message: "Doctor deleted successfully", id });
  });
});
app.use("/images", express.static(path.join(__dirname, "uploads")));





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
