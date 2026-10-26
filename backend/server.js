import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import authRoutes from "./src/routes/auth.js";
import recordRoutes from "./src/routes/records.js";
import adminRoutes from "./src/routes/admin.js";
import User from "./src/models/User.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "LifeFlow" }));
app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/admin", adminRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lifeflow")
  .then(async () => {
    const email = (process.env.ADMIN_EMAIL || "admin@lifeflow.local").toLowerCase();
    if (!(await User.findOne({ email }))) {
      const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 12);
      await User.create({ name: process.env.ADMIN_NAME || "LifeFlow Admin", email, password, role: "admin" });
      console.log(`Created admin account: ${email}. Change its password before deployment.`);
    }
    app.listen(PORT, () => console.log(`LifeFlow API running on port ${PORT}`));
  })
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
