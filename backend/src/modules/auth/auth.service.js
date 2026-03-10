import pool from "../../db/connection.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const sanitizeUser = (row) => {
  if (!row) return null;
  return {
    id: row.User_id,
    fullName: `${row.FName} ${row.LName}`.trim(),
    middleName: row.MName,
    email: row.Email,
    phone: row.Phone,
    type: row.Type,
    joinDate: row.JoinDate,
    // Subtype specific fields
    country: row.Country || null,
    artisanBio: row.Bio || null,
    artisanStatus: row.Status || null,
    isVerified: !!row.Verified
  };
};

// ------------------------------------
// REGISTER
// ------------------------------------
export const register = async (req, res, next) => {
  try {
    let { fName, mName, lName, email, password, type, phone, address, country, bio } = req.body;

    email = normalizeEmail(email);
    if (!['Buyer', 'Artisan'].includes(type)) {
      return res.status(400).json({ ok: false, message: "Type must be 'Buyer' or 'Artisan'." });
    }

    // Check availability
    const [existing] = await pool.query("SELECT User_id FROM user WHERE Email = ? LIMIT 1", [email]);
    if (existing.length) {
      return res.status(409).json({ ok: false, message: "Email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Transaction to ensure User and Subtype are created together
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Insert into Supertype table 'user'
      const [userRes] = await conn.query(
        `INSERT INTO user (FName, MName, LName, Email, Password, Phone, Address, Type, JoinDate) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)`,
        [fName ?? null, mName ?? null, lName ?? null, email, hashedPassword, phone ?? null, address ?? null, type]
      );

      const userId = userRes.insertId;

      // 2. Insert into Subtype table
      if (type === 'Buyer') {
        await conn.query("INSERT INTO Buyer (Buyer_id, Country) VALUES (?, ?)", [userId, country ?? null]);
      } else {
        await conn.query("INSERT INTO Artisan (Artisan_id, Bio, Status) VALUES (?, ?, 'Active')", [userId, bio ?? null]);
      }

      await conn.commit();

      return res.status(201).json({
        ok: true,
        message: "Account created successfully.",
        data: { userId }
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    return next(err);
  }
};

// ------------------------------------
// LOGIN
// ------------------------------------
export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = normalizeEmail(email);

    // Join with both subtypes so we get the full profile regardless of Type
    const query = `
      SELECT u.*, b.Country, a.Bio, a.Status, a.Verified
      FROM user u
      LEFT JOIN Buyer b ON u.User_id = b.Buyer_id
      LEFT JOIN Artisan a ON u.User_id = a.Artisan_id
      WHERE u.Email = ? LIMIT 1
    `;

    const [rows] = await pool.query(query, [email]);
    if (!rows.length) {
      return res.status(401).json({ ok: false, message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, rows[0].Password);
    if (!match) {
      return res.status(401).json({ ok: false, message: "Invalid credentials." });
    }

    return res.status(200).json({
      ok: true,
      message: "Logged in successfully.",
      data: { user: sanitizeUser(rows[0]) },
    });
  } catch (err) {
    return next(err);
  }
};

// ------------------------------------
// Session Check
// ------------------------------------
export const me = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const query = `
      SELECT u.*, b.Country, a.Bio, a.Status, a.Verified
      FROM user u
      LEFT JOIN Buyer b ON u.User_id = b.Buyer_id
      LEFT JOIN Artisan a ON u.User_id = a.Artisan_id
      WHERE u.User_id = ?
    `;

    const [rows] = await pool.query(query, [userId]);
    if (!rows.length) return res.status(404).json({ ok: false, message: "User not found." });

    return res.status(200).json({
      ok: true,
      data: { user: sanitizeUser(rows[0]) },
    });
  } catch (err) {
    return next(err);
  }
};