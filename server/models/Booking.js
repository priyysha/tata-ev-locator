const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  status: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);