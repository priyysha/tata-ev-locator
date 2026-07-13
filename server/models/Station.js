const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  chargerType: { type: String, enum: ["fast", "slow"], required: true },
  totalSlots: { type: Number, required: true },
  status: { type: String, enum: ["active", "maintenance"], default: "active" },
});

module.exports = mongoose.model("Station", stationSchema);