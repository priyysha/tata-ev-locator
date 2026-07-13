const express = require("express");
const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE booking
router.post("/", protect, async (req, res) => {
  try {
    const { stationId, slotId } = req.body;

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.isBooked) return res.status(400).json({ message: "This slot is already booked" });

    slot.isBooked = true;
    await slot.save();

    const booking = await Booking.create({
      userId: req.userId,
      stationId,
      slotId,
      status: "upcoming",
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET my bookings
router.get("/me", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate("stationId")
      .populate("slotId")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CANCEL booking
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not your booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    const slot = await Slot.findById(booking.slotId);
    if (slot) {
      slot.isBooked = false;
      await slot.save();
    }

    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// MARK AS COMPLETED (charging finished)
router.patch("/:id/complete", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not your booking" });
    }

    booking.status = "completed";
    await booking.save();

    const slot = await Slot.findById(booking.slotId);
    if (slot) {
      slot.isBooked = false;
      await slot.save();
    }

    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET my charging stats
router.get("/stats", protect, async (req, res) => {
  try {
    const completedBookings = await Booking.find({ userId: req.userId, status: "completed" })
      .populate("stationId");

    const RATE_PER_KWH = { fast: 18, slow: 12 };
    const KWH_PER_SESSION = { fast: 50, slow: 7 }; // assumed full 1-hour slot charge
    const EV_KM_PER_KWH = 6; // assumed efficiency
    const PETROL_COST_PER_KM = 6; // assumed equivalent petrol running cost

    let totalSessions = completedBookings.length;
    let totalKwh = 0;
    let totalCost = 0;

    completedBookings.forEach((b) => {
      const type = b.stationId?.chargerType || "slow";
      const kwh = KWH_PER_SESSION[type];
      totalKwh += kwh;
      totalCost += kwh * RATE_PER_KWH[type];
    });

    const estimatedKmDriven = totalKwh * EV_KM_PER_KWH;
    const estimatedPetrolCost = estimatedKmDriven * PETROL_COST_PER_KM;
    const estimatedSavings = Math.max(0, estimatedPetrolCost - totalCost);

    res.status(200).json({
      totalSessions,
      totalKwh: Math.round(totalKwh),
      totalCost: Math.round(totalCost),
      estimatedSavings: Math.round(estimatedSavings),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;