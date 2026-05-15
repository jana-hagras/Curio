import pool from "../../db/connection.js";

const sanitizeMilestone = (row) => {
  if (!row) return null;
  return {
    id: row.Milestone_id,
    request_id: row.Request_id,
    artisan_id: row.Artisan_id,
    title: row.Title,
    description: row.Description,
    dueDate: row.DueDate,
    escrowAmount: row.EscrowAmount,
    escrowReleaseDate: row.EscrowReleaseDate,
    status: row.Status,
  };
};

// =============================
// 🔄 RECALCULATE ESCROW for a Request
// Updates the Payment record to match milestone totals
// =============================
async function recalcEscrow(requestId) {
  // Sum of pending milestone escrow amounts (not yet completed)
  const [pendingRows] = await pool.query(
    "SELECT COALESCE(SUM(EscrowAmount), 0) AS total FROM Milestone WHERE Request_id = ? AND Status != 'Completed'",
    [requestId]
  );
  // Sum of completed milestone escrow amounts (already released)
  const [completedRows] = await pool.query(
    "SELECT COALESCE(SUM(EscrowAmount), 0) AS total FROM Milestone WHERE Request_id = ? AND Status = 'Completed'",
    [requestId]
  );

  const pendingTotal = Number(pendingRows[0].total);
  const completedTotal = Number(completedRows[0].total);

  // Determine escrow status
  let escrowStatus;
  if (completedTotal <= 0 && pendingTotal <= 0) {
    escrowStatus = 'none';
  } else if (completedTotal <= 0) {
    escrowStatus = 'held';
  } else if (pendingTotal <= 0) {
    escrowStatus = 'fully_released';
  } else {
    escrowStatus = 'partially_released';
  }

  // Update Payment record
  await pool.query(
    `UPDATE Payment SET 
      EscrowHeld = ?,
      EscrowReleased = ?,
      EscrowStatus = ?
     WHERE Request_id = ? AND PaymentType = 'escrow'`,
    [pendingTotal, completedTotal, escrowStatus, requestId]
  );
}

// =============================
// 🔍 SEARCH MILESTONES
// =============================
export const searchMilestones = async (req, res, next) => {
  try {
    const value = req.query.value;

    if (!value) {
      return res.status(400).json({
        ok: false,
        message: "Search value is required"
      });
    }

    const searchValue = `%${value}%`;

    const query = `
      SELECT * FROM Milestone
      WHERE 
        Milestone_id LIKE ?
        OR Request_id LIKE ?
        OR Title LIKE ?
        OR Description LIKE ?
        OR DueDate LIKE ?
        OR EscrowAmount LIKE ?
        OR EscrowReleaseDate LIKE ?
        OR Status LIKE ?
    `;

    const values = Array(8).fill(searchValue);

    const [rows] = await pool.query(query, values);

    return res.status(200).json({
      ok: true,
      data: {
        milestones: rows.map(sanitizeMilestone)
      }
    });

  } catch (err) {
    next(err);
  }
};

// =============================
// ➕ CREATE MILESTONE (artisan-only)
// =============================
export const createMilestone = async (req, res, next) => {
  try {
    const { request_id, title, description, dueDate, escrowAmount, status } = req.body;
    if (!request_id || !title) {
      return res.status(400).json({ ok: false, message: "request_id and title are required." });
    }

    // Determine artisan_id: from authenticated user or from _systemCall
    let artisan_id = null;

    if (req._systemCall) {
      // Server-side auto-generation (e.g., from application approval)
      artisan_id = req.body.artisan_id || null;
    } else {
      // Normal artisan request — validate ownership
      artisan_id = req.user.id;

      // Verify this artisan has an approved application for this request
      const [appRows] = await pool.query(
        "SELECT Application_id FROM Application WHERE Request_id = ? AND Artisan_id = ? AND Status = 'Approved' LIMIT 1",
        [request_id, artisan_id]
      );

      if (!appRows.length) {
        return res.status(403).json({
          ok: false,
          message: "Forbidden. You are not assigned to this project."
        });
      }
    }

    const [result] = await pool.query(
      "INSERT INTO Milestone (Request_id, Artisan_id, Title, Description, DueDate, EscrowAmount, Status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [request_id, artisan_id, title, description || null, dueDate || null, escrowAmount || null, status || 'Pending']
    );

    // Recalculate escrow after adding milestone
    await recalcEscrow(request_id);

    const [rows] = await pool.query("SELECT * FROM Milestone WHERE Milestone_id = ?", [result.insertId]);
    return res.status(201).json({ ok: true, data: { milestone: sanitizeMilestone(rows[0]) } });
  } catch (err) { next(err); }
};

// READ BY REQUEST
export const getMilestonesByRequest = async (req, res, next) => {
  try {
    const requestId = Number(req.query.request_id);
    if (!requestId) return res.status(400).json({ ok: false, message: "Query parameter 'request_id' is required." });

    const [rows] = await pool.query("SELECT * FROM Milestone WHERE Request_id = ? ORDER BY DueDate ASC, Milestone_id ASC", [requestId]);
    return res.status(200).json({ ok: true, data: { milestones: rows.map(sanitizeMilestone) } });
  } catch (err) { next(err); }
};

// READ BY ID
export const getMilestoneById = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    const [rows] = await pool.query("SELECT * FROM Milestone WHERE Milestone_id = ?", [id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: "Milestone not found." });

    return res.status(200).json({ ok: true, data: { milestone: sanitizeMilestone(rows[0]) } });
  } catch (err) { next(err); }
};

// =============================
// ✏️ UPDATE MILESTONE (artisan-only, ownership validated by middleware)
// =============================
export const updateMilestone = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    // Block editing completed milestones
    const [existing] = await pool.query("SELECT * FROM Milestone WHERE Milestone_id = ?", [id]);
    if (existing.length && existing[0].Status === 'Completed') {
      return res.status(400).json({ ok: false, message: "Cannot edit a completed milestone." });
    }

    const { title, description, dueDate, escrowAmount, escrowReleaseDate, status } = req.body;
    await pool.query(
      "UPDATE Milestone SET Title=COALESCE(?,Title), Description=COALESCE(?,Description), DueDate=COALESCE(?,DueDate), EscrowAmount=COALESCE(?,EscrowAmount), EscrowReleaseDate=COALESCE(?,EscrowReleaseDate), Status=COALESCE(?,Status) WHERE Milestone_id=?",
      [title, description, dueDate, escrowAmount, escrowReleaseDate, status, id]
    );

    // Recalculate escrow if amount changed
    if (escrowAmount !== undefined && existing.length) {
      await recalcEscrow(existing[0].Request_id);
    }

    return getMilestoneById(req, res, next);
  } catch (err) { next(err); }
};

// =============================
// ✅ COMPLETE MILESTONE (with escrow release logic)
// =============================
export const completeMilestone = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    // 1. Fetch the milestone
    const [milestoneRows] = await pool.query("SELECT * FROM Milestone WHERE Milestone_id = ?", [id]);
    if (!milestoneRows.length) return res.status(404).json({ ok: false, message: "Milestone not found." });

    const milestone = milestoneRows[0];

    // Prevent re-completing
    if (milestone.Status === 'Completed') {
      return res.status(400).json({ ok: false, message: "Milestone is already completed." });
    }

    const requestId = milestone.Request_id;
    const releaseAmount = Number(milestone.EscrowAmount || 0);

    // 2. Mark milestone as Completed with release date
    await pool.query(
      "UPDATE Milestone SET Status = 'Completed', EscrowReleaseDate = CURRENT_DATE WHERE Milestone_id = ?",
      [id]
    );

    // 3. Release escrow funds on the Payment record
    if (releaseAmount > 0) {
      // Find the escrow payment for this request
      const [paymentRows] = await pool.query(
        "SELECT * FROM Payment WHERE Request_id = ? AND PaymentType = 'escrow' LIMIT 1",
        [requestId]
      );

      if (paymentRows.length) {
        const payment = paymentRows[0];
        const newReleased = Number(payment.EscrowReleased || 0) + releaseAmount;
        const newHeld = Math.max(0, Number(payment.EscrowHeld || 0) - releaseAmount);

        // Determine new escrow status
        let newEscrowStatus;
        if (newHeld <= 0) {
          newEscrowStatus = 'fully_released';
        } else {
          newEscrowStatus = 'partially_released';
        }

        await pool.query(
          `UPDATE Payment SET 
            EscrowReleased = ?,
            EscrowHeld = ?,
            EscrowStatus = ?
           WHERE Payment_id = ?`,
          [newReleased, newHeld, newEscrowStatus, payment.Payment_id]
        );
      }
    }

    // 4. Check if all milestones for this request are now completed
    const [allMilestones] = await pool.query(
      "SELECT Status FROM Milestone WHERE Request_id = ?",
      [requestId]
    );
    const allCompleted = allMilestones.every(m => m.Status === 'Completed');

    // If all milestones done, update payment status
    if (allCompleted) {
      await pool.query(
        "UPDATE Payment SET EscrowStatus = 'fully_released' WHERE Request_id = ? AND PaymentType = 'escrow'",
        [requestId]
      );
    }

    // 5. Return updated milestone
    const [updatedRows] = await pool.query("SELECT * FROM Milestone WHERE Milestone_id = ?", [id]);
    return res.status(200).json({
      ok: true,
      message: "Milestone completed and escrow funds released.",
      data: { milestone: sanitizeMilestone(updatedRows[0]) }
    });

  } catch (err) { next(err); }
};

// =============================
// 🗑️ DELETE MILESTONE (artisan-only, ownership validated by middleware)
// =============================
export const deleteMilestone = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    // Block deletion of completed milestones (escrow already released)
    const [existing] = await pool.query("SELECT * FROM Milestone WHERE Milestone_id = ?", [id]);
    if (!existing.length) return res.status(404).json({ ok: false, message: "Milestone not found." });

    if (existing[0].Status === 'Completed') {
      return res.status(400).json({ ok: false, message: "Cannot delete a completed milestone. Escrow funds have already been released." });
    }

    const requestId = existing[0].Request_id;

    const [result] = await pool.query("DELETE FROM Milestone WHERE Milestone_id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: "Milestone not found." });

    // Recalculate escrow after deletion
    await recalcEscrow(requestId);

    return res.status(200).json({ ok: true, message: "Milestone deleted successfully." });
  } catch (err) { next(err); }
};
