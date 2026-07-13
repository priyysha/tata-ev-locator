const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET my profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE my profile
router.put("/me", protect, async (req, res) => {
  try {
    const { name, evModel } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (evModel !== undefined) user.evModel = evModel;

    await user.save();
    res.status(200).json({ id: user._id, name: user.name, email: user.email, evModel: user.evModel });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;