import mongoose from "mongoose";
const donorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 18, max: 100 },
  city: { type: String, required: true, trim: true },
  bloodGroup: { type: String, required: true, enum: ["O-","O+","A-","A+","B-","B+","AB-","AB+"] },
  status: { type: String, enum: ["waiting","matched"], default: "waiting" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
export default mongoose.model("Donor", donorSchema);
