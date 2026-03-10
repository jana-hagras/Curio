import pool from "../../db/connection.js";

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

    // Specialized data
    ...(row.Type === 'Buyer' && { country: row.Country }),
    ...(row.Type === 'Artisan' && {
      bio: row.Bio,
      status: row.Status,
      verified: !!row.Verified
    })
  };
};


// READ ALL
export const getAllUsers = async (req, res, next) => {
  try {
    const query = `
      SELECT u.*, b.Country, a.Bio, a.Status, a.Verified 
      FROM user u
      LEFT JOIN Buyer b ON u.User_id = b.Buyer_id
      LEFT JOIN Artisan a ON u.User_id = a.Artisan_id
    `;
    const [rows] = await pool.query(query);
    return res.status(200).json({ ok: true, data: { users: rows.map(sanitizeUser) } });
  } catch (err) { next(err); }
};

// READ ONE
export const getUserById = async (req, res, next) => {
  try {
    const userId = Number(req.query.id);

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: "Query parameter 'id' is required."
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
      return res.status(404).json({ ok: false, message: "User not found." });
    }

    return res.status(200).json({
      ok: true,
      data: { user: sanitizeUser(rows[0]) }
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE
export const updateUser = async (req, res, next) => {
  try {
    const userId = Number(req.query.id);

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: "Query parameter 'id' is required."
      });
    }

    const { fName, mName, lName, address, phone, profileImage, country, bio, status } = req.body;

    const [userRows] = await pool.query("SELECT Type FROM user WHERE User_id = ?", [userId]);
    if (!userRows.length) return res.status(404).json({ ok: false, message: "User not found." });
    const user = userRows[0];

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Update Base User
      await conn.query(
        "UPDATE user SET FName=COALESCE(?, FName), MName=COALESCE(?, MName), LName=COALESCE(?, LName), Address=COALESCE(?, Address), Phone=COALESCE(?, Phone), ProfileImage=COALESCE(?, ProfileImage) WHERE User_id=?",
        [fName, mName, lName, address, phone, profileImage, userId]
      );

      // Update Subtype
      if (user.Type === 'Buyer') {
        await conn.query("UPDATE Buyer SET Country=COALESCE(?, Country) WHERE Buyer_id=?", [country, userId]);
      } else {
        await conn.query("UPDATE Artisan SET Bio=COALESCE(?, Bio), Status=COALESCE(?, Status) WHERE Artisan_id=?", [bio, status, userId]);
      }

      await conn.commit();
      return getUserById(req, res, next);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) { next(err); }
};

// DELETE
export const deleteUser = async (req, res, next) => {
  try {
    const userId = Number(req.query.id);

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: "Query parameter 'id' is required."
      });
    }
    const [result] = await pool.query("DELETE FROM user WHERE User_id = ?", [userId]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: "User not found." });
    return res.status(200).json({ ok: true, message: "User deleted successfully." });
  } catch (err) { next(err); }
};