import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "curio_default_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ── Issue a token ───────────────────────
export const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// ── Verify token & attach req.user ──────
export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
    req.user = decoded; // { id, type, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Invalid or expired token." });
  }
};

// ── Require specific role(s) ────────────
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authentication required." });
  }
  if (!roles.includes(req.user.type)) {
    return res.status(403).json({ ok: false, message: `Access denied. Requires: ${roles.join(" or ")}.` });
  }
  next();
};
