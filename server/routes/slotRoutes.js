const express = require("express");
const Slot = require("../models/Slot");

const router = express.Router();

// GET slots for a station on a specific date
router.get("/", async (req, res) => {
  try {
    const { stationId, date } = req.query;
    if (!stationId || !date) {
      return res.status(400).json({ message: "stationId and date are required" });
    }
    const slots = await Slot.find({ stationId, date }).sort({ startTime: 1 });
    res.status(200).json(slots);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;