import { Router } from "express";
import User from "../models/User.js";
import Donor from "../models/Donor.js";
import Receiver from "../models/Receiver.js";
import Match from "../models/Match.js";
import { protect, adminOnly } from "../middleware/auth.js";
const router = Router();
router.use(protect, adminOnly);
router.get("/users", async (_req, res, next) => {
  try { res.json(await User.find().select("-password").sort({ createdAt: -1 })); } catch(e) { next(e); }
});
router.get("/records", async (_req, res, next) => {
  try {
    const [donors, receivers, matches] = await Promise.all([
      Donor.find().sort({ createdAt: -1 }), Receiver.find().sort({ createdAt: -1 }),
      Match.find().sort({ matchedAt: -1 }).limit(200)
    ]);
    res.json({ donors, receivers, matches });
  } catch(e) { next(e); }
});
router.delete("/records/:type/:id", async (req, res, next) => {
  try {
    const Model = req.params.type === "donors" ? Donor : req.params.type === "receivers" ? Receiver : null;
    if (!Model) return res.status(400).json({ message: "Type must be donors or receivers." });
    const record = await Model.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found." });
    res.json({ message: "Record deleted." });
  } catch(e) { next(e); }
});
router.delete("/users/:id", async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) return res.status(400).json({ message: "You cannot delete your own admin account." });
    const user = await User.findOneAndDelete({ _id: req.params.id, role: "user" });
    if (!user) return res.status(404).json({ message: "User not found or is an admin." });
    res.json({ message: "User deleted." });
  } catch(e) { next(e); }
});
export default router;
