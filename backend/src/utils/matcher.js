import Donor from "../models/Donor.js";
import Receiver from "../models/Receiver.js";
import Match from "../models/Match.js";

// Compatible red-cell donor groups for each recipient group.
const canReceiveFrom = {
  "O-": ["O-"],
  "O+": ["O-","O+"],
  "A-": ["O-","A-"],
  "A+": ["O-","O+","A-","A+"],
  "B-": ["O-","B-"],
  "B+": ["O-","O+","B-","B+"],
  "AB-": ["O-","A-","B-","AB-"],
  "AB+": ["O-","O+","A-","A+","B-","B+","AB-","AB+"]
};

export async function runMatching() {
  // Re-run from the start whenever the active data changes. Each receiver is considered
  // in creation order; the first compatible waiting donor is assigned.
  const receivers = await Receiver.find({ status: "waiting" }).sort({ createdAt: 1, _id: 1 });
  const created = [];
  for (const receiver of receivers) {
    const compatible = canReceiveFrom[receiver.bloodGroup] || [];
    const donor = await Donor.findOne({
      status: "waiting", bloodGroup: { $in: compatible }
    }).sort({ createdAt: 1, _id: 1 });
    if (!donor) continue;
    // Mark both records as matched; match history is retained for audit/display.
    donor.status = "matched";
    receiver.status = "matched";
    await Promise.all([donor.save(), receiver.save()]);
    const match = await Match.create({
      donor: donor._id, receiver: receiver._id,
      donorName: donor.name, donorBloodGroup: donor.bloodGroup, donorCity: donor.city,
      receiverName: receiver.name, receiverBloodGroup: receiver.bloodGroup, receiverCity: receiver.city
    });
    created.push(match);
  }
  return created;
}
