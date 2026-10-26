import mongoose from "mongoose";
const matchSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "Receiver" },
  donorName: String, donorBloodGroup: String, donorCity: String,
  receiverName: String, receiverBloodGroup: String, receiverCity: String,
  matchedAt: { type: Date, default: Date.now }
}, { timestamps: true });
export default mongoose.model("Match", matchSchema);
