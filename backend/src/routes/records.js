import { Router } from "express";
import Donor from "../models/Donor.js";
import Receiver from "../models/Receiver.js";
import Match from "../models/Match.js";
import { protect } from "../middleware/auth.js";
import { runMatching } from "../utils/matcher.js";
const router = Router();
router.use(protect);
const validGroups = ["O-","O+","A-","A+","B-","B+","AB-","AB+"];
function validate(body, receiver=false) {
  const age = Number(body.age);
  if (!body.name?.trim() || !body.city?.trim() || !validGroups.includes(body.bloodGroup) ||
      !Number.isInteger(age) || age < (receiver ? 0 : 18) || age > 120)
    return "Enter a valid name, age, city, and blood group.";
  return null;
}
router.post("/donors", async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    const donor = await Donor.create({ ...req.body, age: Number(req.body.age), createdBy: req.user._id });
    const matches = await runMatching();
    res.status(201).json({ donor, matches, message: matches.length ? "Donor saved and a match was found." : "Donor saved to the waiting list." });
  } catch (e) { next(e); }
});
router.post("/receivers", async (req, res, next) => {
  try {
    const error = validate(req.body, true);
    if (error) return res.status(400).json({ message: error });
    const receiver = await Receiver.create({ ...req.body, age: Number(req.body.age), createdBy: req.user._id });
    const matches = await runMatching();
    res.status(201).json({ receiver, matches, message: matches.length ? "Request saved and a match was found." : "Request saved to the FIFO waiting queue." });
  } catch (e) { next(e); }
});
router.get("/summary", async (_req, res, next) => {
  try {
    const [donors, receivers, matches, recentMatches] = await Promise.all([
      Donor.find({ status: "waiting" }).sort({ createdAt: 1 }),
      Receiver.find({ status: "waiting" }).sort({ createdAt: 1 }),
      Match.countDocuments(),
      Match.find().sort({ matchedAt: -1 }).limit(20)
    ]);
    res.json({ donors, receivers, totalMatches: matches, recentMatches });
  } catch (e) { next(e); }
});
router.get("/matches", async (_req, res, next) => {
  try { res.json(await Match.find().sort({ matchedAt: -1 }).limit(100)); } catch (e) { next(e); }
});
export default router;
