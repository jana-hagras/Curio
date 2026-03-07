import db from "../../db/connection.js";

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

const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });


// READ ALL
export const getAllUsers = async (req, res, next) => {
  try {
    const query = `
      SELECT u.*, b.Country, a.Bio, a.Status, a.Verified 
      FROM user u
      LEFT JOIN Buyer b ON u.User_id = b.Buyer_id
      LEFT JOIN Artisan a ON u.User_id = a.Artisan_id
    `;
    const rows = await runQuery(query);
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

    const rows = await runQuery(query, [userId]);

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

    const [user] = await runQuery("SELECT Type FROM user WHERE User_id = ?", [userId]);
    if (!user) return res.status(404).json({ ok: false, message: "User not found." });

    await runQuery("BEGIN");
    try {
      // Update Base User
      await runQuery(
        "UPDATE user SET FName=COALESCE(?, FName), MName=COALESCE(?, MName), LName=COALESCE(?, LName), Address=COALESCE(?, Address), Phone=COALESCE(?, Phone), profileImage=COALESCE(?, profileImage)  WHERE User_id=?",
        [fName, mName, lName, address, phone, profileImage, userId]
      );

      // Update Subtype
      if (user.Type === 'Buyer') {
        await runQuery("UPDATE Buyer SET Country=COALESCE(?, Country) WHERE Buyer_id=?", [country, userId]);
      } else {
        await runQuery("UPDATE Artisan SET Bio=COALESCE(?, Bio), Status=COALESCE(?, Status) WHERE Artisan_id=?", [bio, status, userId]);
      }

      await runQuery("COMMIT");
      return getUserById(req, res, next);
    } catch (e) {
      await runQuery("ROLLBACK");
      throw e;
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
    const result = await runQuery("DELETE FROM user WHERE User_id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: "User not found." });
    return res.status(200).json({ ok: true, message: "User deleted successfully." });
  } catch (err) { next(err); }
};