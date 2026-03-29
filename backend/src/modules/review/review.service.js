import pool from "../../db/connection.js";

const sanitizeReview = (row) => {
  if (!row) return null;
  return {
    id: row.Review_id,
    buyer_id: row.Buyer_id,
    item_id: row.Item_id,
    rating: row.Rating,
    comment: row.Comment,
    attachment: row.Attachment,
    reviewDate: row.ReviewDate,
    buyerName: row.FName ? `${row.FName} ${row.LName}` : null,
    itemName: row.Item || null,
  };
};

const REVIEW_QUERY = `
  SELECT rv.*, u.FName, u.LName, mi.Item
  FROM Review rv
  LEFT JOIN Buyer b ON rv.Buyer_id = b.Buyer_id
  LEFT JOIN user u ON b.Buyer_id = u.User_id
  LEFT JOIN MarketItem mi ON rv.Item_id = mi.Item_id
`;

// =============================
// 🔍 SEARCH REVIEWS
// =============================
export const searchReviews = async (req, res, next) => {
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
      ${REVIEW_QUERY}
      WHERE 
        rv.Review_id LIKE ?
        OR rv.Buyer_id LIKE ?
        OR rv.Item_id LIKE ?
        OR rv.Rating LIKE ?
        OR rv.Comment LIKE ?
        OR rv.Attachment LIKE ?
        OR rv.ReviewDate LIKE ?
        OR u.FName LIKE ?
        OR u.LName LIKE ?
        OR mi.Item LIKE ?
    `;

    const values = Array(10).fill(searchValue);

    const [rows] = await pool.query(query, values);

    return res.status(200).json({
      ok: true,
      data: {
        reviews: rows.map(sanitizeReview)
      }
    });

  } catch (err) {
    next(err);
  }
};

// CREATE
export const createReview = async (req, res, next) => {
  try {
    const { buyer_id, item_id, rating, comment, attachment } = req.body;
    if (!buyer_id || !item_id || !rating) {
      return res.status(400).json({ ok: false, message: "buyer_id, item_id, and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ ok: false, message: "Rating must be between 1 and 5." });
    }

    const [result] = await pool.query(
      "INSERT INTO Review (Buyer_id, Item_id, Rating, Comment, Attachment) VALUES (?, ?, ?, ?, ?)",
      [buyer_id, item_id, rating, comment || null, attachment || null]
    );

    const [rows] = await pool.query(`${REVIEW_QUERY} WHERE rv.Review_id = ?`, [result.insertId]);
    return res.status(201).json({ ok: true, data: { review: sanitizeReview(rows[0]) } });
  } catch (err) { next(err); }
};

// READ BY ITEM
export const getReviewsByItem = async (req, res, next) => {
  try {
    const itemId = Number(req.query.item_id);
    if (!itemId) return res.status(400).json({ ok: false, message: "Query parameter 'item_id' is required." });

    const [rows] = await pool.query(`${REVIEW_QUERY} WHERE rv.Item_id = ?`, [itemId]);
    return res.status(200).json({ ok: true, data: { reviews: rows.map(sanitizeReview) } });
  } catch (err) { next(err); }
};

// READ BY BUYER
export const getReviewsByBuyer = async (req, res, next) => {
  try {
    const buyerId = Number(req.query.buyer_id);
    if (!buyerId) return res.status(400).json({ ok: false, message: "Query parameter 'buyer_id' is required." });

    const [rows] = await pool.query(`${REVIEW_QUERY} WHERE rv.Buyer_id = ?`, [buyerId]);
    return res.status(200).json({ ok: true, data: { reviews: rows.map(sanitizeReview) } });
  } catch (err) { next(err); }
};

// READ BY ID
export const getReviewById = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    const [rows] = await pool.query(`${REVIEW_QUERY} WHERE rv.Review_id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: "Review not found." });

    return res.status(200).json({ ok: true, data: { review: sanitizeReview(rows[0]) } });
  } catch (err) { next(err); }
};

// UPDATE
export const updateReview = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    const { rating, comment, attachment } = req.body;
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ ok: false, message: "Rating must be between 1 and 5." });
    }

    await pool.query(
      "UPDATE Review SET Rating=COALESCE(?,Rating), Comment=COALESCE(?,Comment), Attachment=COALESCE(?,Attachment) WHERE Review_id=?",
      [rating, comment, attachment, id]
    );
    return getReviewById(req, res, next);
  } catch (err) { next(err); }
};

// DELETE
export const deleteReview = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    const [result] = await pool.query("DELETE FROM Review WHERE Review_id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: "Review not found." });

    return res.status(200).json({ ok: true, message: "Review deleted successfully." });
  } catch (err) { next(err); }
};
