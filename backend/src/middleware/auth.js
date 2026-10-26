import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Please log in first." });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "development_only_change_me");
    req.user = await User.findById(payload.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "Account not found." });
    next();
  } catch { return res.status(401).json({ message: "Invalid or expired session. Please log in again." }); }
}
export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required." });
  next();
}
