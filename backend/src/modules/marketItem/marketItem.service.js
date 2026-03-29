import pool from "../../db/connection.js";

const sanitizeItem = (row) => {
  if (!row) return null;
  return {
    id: row.Item_id,
    artisan_id: row.Artisan_id,
    item: row.Item,
    description: row.Description,
    image: row.Image,
    availQuantity: row.AvailQuantity,
    price: row.Price,
    category: row.Category,
    dateAdded: row.DateAdded,
    artisanName: row.FName ? `${row.FName} ${row.LName}` : null,
  };
};

const ITEM_QUERY = `
  SELECT mi.*, u.FName, u.LName
  FROM MarketItem mi
  LEFT JOIN Artisan a ON mi.Artisan_id = a.Artisan_id
  LEFT JOIN user u ON a.Artisan_id = u.User_id
`;

// =============================
// 🔍 SEARCH MARKET ITEMS (NEW)
// =============================
export const searchItems = async (req, res, next) => {
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
      ${ITEM_QUERY}
      WHERE 
        mi.Item_id LIKE ?
        OR mi.Artisan_id LIKE ?
        OR mi.Item LIKE ?
        OR mi.Description LIKE ?
        OR mi.Category LIKE ?
        OR mi.Price LIKE ?
        OR u.FName LIKE ?
        OR u.LName LIKE ?
    `;

    const values = Array(8).fill(searchValue);

    const [rows] = await pool.query(query, values);

    return res.status(200).json({
      ok: true,
      data: {
        items: rows.map(sanitizeItem)
      }
    });

  } catch (err) {
    next(err);
  }
};

// CREATE
export const createItem = async (req, res, next) => {
  try {
    const { artisan_id, item, description, image, availQuantity, price, category } = req.body;
    if (!artisan_id || !item || !price) {
      return res.status(400).json({ ok: false, message: "artisan_id, item, and price are required." });
    }

    const [result] = await pool.query(
      "INSERT INTO MarketItem (Artisan_id, Item, Description, Image, AvailQuantity, Price, Category, DateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)",
      [artisan_id, item, description || null, image || null, availQuantity || 0, price, category || null]
    );

    const [rows] = await pool.query(`${ITEM_QUERY} WHERE mi.Item_id = ?`, [result.insertId]);
    return res.status(201).json({ ok: true, data: { item: sanitizeItem(rows[0]) } });
  } catch (err) { next(err); }
};

// READ ALL
export const getAllItems = async (req, res, next) => {
  try {
    const [rows] = await pool.query(ITEM_QUERY);
    return res.status(200).json({ ok: true, data: { items: rows.map(sanitizeItem) } });
  } catch (err) { next(err); }
};

// READ BY ID
export const getItemById = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    const [rows] = await pool.query(`${ITEM_QUERY} WHERE mi.Item_id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: "Item not found." });

    return res.status(200).json({ ok: true, data: { item: sanitizeItem(rows[0]) } });
  } catch (err) { next(err); }
};

// READ BY ARTISAN
export const getItemsByArtisan = async (req, res, next) => {
  try {
    const artisanId = Number(req.query.artisan_id);
    if (!artisanId) return res.status(400).json({ ok: false, message: "Query parameter 'artisan_id' is required." });

    const [rows] = await pool.query(`${ITEM_QUERY} WHERE mi.Artisan_id = ?`, [artisanId]);
    return res.status(200).json({ ok: true, data: { items: rows.map(sanitizeItem) } });
  } catch (err) { next(err); }
};

// UPDATE
export const updateItem = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    const { item, description, image, availQuantity, price, category } = req.body;
    await pool.query(
      "UPDATE MarketItem SET Item=COALESCE(?,Item), Description=COALESCE(?,Description), Image=COALESCE(?,Image), AvailQuantity=COALESCE(?,AvailQuantity), Price=COALESCE(?,Price), Category=COALESCE(?,Category) WHERE Item_id=?",
      [item, description, image, availQuantity, price, category, id]
    );
    return getItemById(req, res, next);
  } catch (err) { next(err); }
};

// DELETE
export const deleteItem = async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ ok: false, message: "Query parameter 'id' is required." });

    const [result] = await pool.query("DELETE FROM MarketItem WHERE Item_id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: "Item not found." });

    return res.status(200).json({ ok: true, message: "Item deleted successfully." });
  } catch (err) { next(err); }
};
