import pool from "../db/connection.js";

/**
 * extractUser — Reads X-User-Id header, queries the DB, attaches req.user.
 * Returns 401 if missing or invalid.
 */
export const extractUser = async (req, res, next) => {
  try {
    const userId = Number(req.headers['x-user-id']);
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required. Missing user identity." });
    }

    const [rows] = await pool.query("SELECT User_id, Type FROM user WHERE User_id = ?", [userId]);
    if (!rows.length) {
      return res.status(401).json({ ok: false, message: "Invalid user. Authentication failed." });
    }

    req.user = { id: rows[0].User_id, type: rows[0].Type };
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * requireArtisan — Checks req.user.type === 'Artisan'. Returns 403 if not.
 * Must be used AFTER extractUser.
 */
export const requireArtisan = (req, res, next) => {
  if (!req.user || req.user.type !== 'Artisan') {
    return res.status(403).json({ ok: false, message: "Forbidden. Only artisans can perform this action." });
  }
  next();
};

/**
 * requireMilestoneOwner — Loads milestone by req.query.id, checks Artisan_id matches req.user.id.
 * Falls back to checking via Application table if Artisan_id is null (legacy data).
 * Must be used AFTER extractUser + requireArtisan.
 */
export const requireMilestoneOwner = async (req, res, next) => {
  try {
    const milestoneId = Number(req.query.id);
    if (!milestoneId) {
      return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });
    }

    const [rows] = await pool.query("SELECT * FROM Milestone WHERE Milestone_id = ?", [milestoneId]);
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Milestone not found." });
    }

    const milestone = rows[0];

    // Direct ownership check (new Artisan_id column)
    if (milestone.Artisan_id) {
      if (milestone.Artisan_id !== req.user.id) {
        return res.status(403).json({ ok: false, message: "Forbidden. You are not the owner of this milestone." });
      }
      return next();
    }

    // Fallback: check via Application table (for milestones created before migration)
    const [appRows] = await pool.query(
      "SELECT Application_id FROM Application WHERE Request_id = ? AND Artisan_id = ? AND Status = 'Approved' LIMIT 1",
      [milestone.Request_id, req.user.id]
    );

    if (!appRows.length) {
      return res.status(403).json({ ok: false, message: "Forbidden. You are not assigned to this project." });
    }

    next();
  } catch (err) {
    next(err);
  }
};
