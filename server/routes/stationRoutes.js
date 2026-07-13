const express = require("express");
const Station = require("../models/Station");
const Slot = require("../models/Slot");

const router = express.Router();

// GET all stations, with optional filters
router.get("/", async (req, res) => {
  try {
    const { city, chargerType } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (chargerType) filter.chargerType = chargerType;

    const stations = await Station.find(filter);
    res.status(200).json(stations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET availability status for all stations on a given date (defaults to today)
router.get("/availability", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const stations = await Station.find();
    const results = await Promise.all(
      stations.map(async (station) => {
        const slots = await Slot.find({ stationId: station._id, date });
        const totalSlots = slots.length;
        const bookedSlots = slots.filter((s) => s.isBooked).length;
        const isFullyBooked = totalSlots > 0 && bookedSlots === totalSlots;
        return { stationId: station._id, isFullyBooked, totalSlots, bookedSlots };
      })
    );

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single station by id
router.get("/:id", async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ message: "Station not found" });
    res.status(200).json(station);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;