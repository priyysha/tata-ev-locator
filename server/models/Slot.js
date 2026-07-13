const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
  date: { type: String, required: true },       // "2026-07-08"
  startTime: { type: String, required: true },  // "09:00"
  endTime: { type: String, required: true },    // "10:00"
  isBooked: { type: Boolean, default: false },
});

module.exports = mongoose.model("Slot", slotSchema);