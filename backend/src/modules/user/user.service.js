import pool from "../../db/connection.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// ----------------------------
// Shape user response
// ----------------------------
const sanitizeUser = (row) => {
  if (!row) return null;

  return {
    id: row.User_id,
    firstName: row.FName,
    middleName: row.MName,
    lastName: row.LName,
    email: row.Email,
    address: row.Address,
    phone: row.Phone,
    type: row.Type,
    joinDate: row.JoinDate,
    profileImage: row.ProfileImage,

    ...(row.Type === "Buyer" && {
      country: row.Country,
    }),

    ...(row.Type === "Artisan" && {
      bio: row.Bio,
      status: row.Status,
      verified: !!row.Verified,
    }),
  };
};

// ----------------------------
// REGISTER
// ----------------------------
export const register = async (req, res, next) => {
  try {
    let {
      fName,
      mName,
      lName,
      email,
      password,
      type,
      phone,
      address,
      country,
      bio,
    } = req.body;

    email = normalizeEmail(email);

    // Required fields
    if (
      !String(fName || "").trim() ||
      !String(mName || "").trim() ||
      !String(email || "").trim() ||
      !String(password || "").trim() ||
      !String(address || "").trim() ||
      !String(phone || "").trim()
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "fName, mName, email, password, address, and phone are required.",
      });
    }

    // Email validation
    if (!email.includes("@")) {
      return res.status(400).json({
        ok: false,
        message: "Invalid email format.",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Type validation
    if (!["Buyer", "Artisan"].includes(type)) {
      return res.status(400).json({
        ok: false,
        message: "Type must be 'Buyer' or 'Artisan'.",
      });
    }

    // Check email exists
    const [existing] = await pool.query(
      "SELECT User_id FROM user WHERE Email = ? LIMIT 1",
      [email]
    );

    if (existing.length) {
      return res.status(409).json({
        ok: false,
        message: "Email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Transaction
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Insert user
      const [userRes] = await conn.query(
        `INSERT INTO user 
        (FName, MName, LName, Email, Password, Phone, Address, Type, JoinDate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)`,
        [
          fName.trim(),
          mName.trim(),
          lName ?? null,
          email,
          hashedPassword,
          phone.trim(),
          address.trim(),
          type,
        ]
      );

      const userId = userRes.insertId;

      // Insert subtype
      if (type === "Buyer") {
        await conn.query(
          "INSERT INTO Buyer (Buyer_id, Country) VALUES (?, ?)",
          [userId, country ?? null]
        );
      } else {
        await conn.query(
          "INSERT INTO Artisan (Artisan_id, Bio, Status) VALUES (?, ?, 'Active')",
          [userId, bio ?? null]
        );
      }

      await conn.commit();

      return res.status(201).json({
        ok: true,
        message: "Account created successfully.",
        data: { userId },
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
};

// ----------------------------
// LOGIN
// ----------------------------
export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    email = normalizeEmail(email);

    const query = `
      SELECT u.*, b.Country, a.Bio, a.Status, a.Verified
      FROM user u
      LEFT JOIN Buyer b ON u.User_id = b.Buyer_id
      LEFT JOIN Artisan a ON u.User_id = a.Artisan_id
      WHERE u.Email = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(query, [email]);

    if (!rows.length) {
      return res.status(401).json({
        ok: false,
        message: "Invalid credentials.",
      });
    }

    const match = await bcrypt.compare(password, rows[0].Password);

    if (!match) {
      return res.status(401).json({
        ok: false,
        message: "Invalid credentials.",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Logged in successfully.",
      data: {
        user: sanitizeUser(rows[0]),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------------
// GET ALL USERS
// ----------------------------
export const getAllUsers = async (req, res, next) => {
  try {
    const query = `
      SELECT u.*, b.Country, a.Bio, a.Status, a.Verified
      FROM user u
      LEFT JOIN Buyer b ON u.User_id = b.Buyer_id
      LEFT JOIN Artisan a ON u.User_id = a.Artisan_id
      ORDER BY u.User_id ASC
    `;

    const [rows] = await pool.query(query);

    return res.status(200).json({
      ok: true,
      data: {
        users: rows.map(sanitizeUser),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------------
// GET USER BY ID
// ----------------------------
export const getUserById = async (req, res, next) => {
  try {
    const userId = Number(req.query.id);

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: "Query parameter 'id' is required.",
      });
    }

    const query = `
      SELECT u.*, b.Country, a.Bio, a.Status, a.Verified
      FROM user u
      LEFT JOIN Buyer b ON u.User_id = b.Buyer_id
      LEFT JOIN Artisan a ON u.User_id = a.Artisan_id
      WHERE u.User_id = ?
    `;

    const [rows] = await pool.query(query, [userId]);

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      ok: true,
      data: {
        user: sanitizeUser(rows[0]),
      },
    });
  } catch (err) {
    next(err);
  }
};