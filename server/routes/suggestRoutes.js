const express = require("express");
const Station = require("../models/Station");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Simple template-based "AI-style" suggestion generator.
// This mimics what a real LLM call would return, using the same
// prompt-building logic — swap in a real anthropic.messages.create()
// call here later if billing is set up (see commented block below).
function generateSuggestion({ evModel, chargePercent, source, destination, stations }) {
  if (stations.length === 0) {
    const cityText = destination ? `${source} or ${destination}` : source;
    return `No stations found in ${cityText} right now. Try a different city.`;
  }

  const sourceStations = stations.filter((s) => s.city === source);
  const destinationStations = destination ? stations.filter((s) => s.city === destination) : [];

  // Critical battery: must charge near current location, destination is irrelevant right now
  const isCritical = chargePercent <= 20;

  let pool;
  let locationNote;

  if (isCritical && sourceStations.length > 0) {
    pool = sourceStations;
    locationNote = `Since you're at ${chargePercent}%, you should charge in ${source} before continuing your journey${destination ? ` to ${destination}` : ""}.`;
  } else if (destinationStations.length > 0 && !isCritical) {
    // Decent charge: can consider charging near destination instead
    pool = destinationStations;
    locationNote = `With ${chargePercent}% charge, you likely have enough range to reach ${destination} and charge there instead.`;
  } else {
    pool = sourceStations.length > 0 ? sourceStations : stations;
    locationNote = `Here's a good option based on your current location in ${source}.`;
  }

  const urgency = isCritical ? "fast" : "slow";
  const preferred = pool.filter((s) => s.chargerType === urgency);
  const picks = (preferred.length > 0 ? preferred : pool).slice(0, 2);

  const names = picks.map((s) => `${s.name} (${s.city})`).join(" or ");
  const chargerNote = isCritical
    ? "A fast charger is recommended to minimize wait time given your low battery."
    : "A regular charger works fine here since your battery isn't critically low.";

  return `We'd suggest ${names}. ${chargerNote} ${locationNote}`;
}

router.post("/", protect, async (req, res) => {
  try {
    const { evModel, chargePercent, source, destination } = req.body;

    if (!evModel || chargePercent === undefined || !source) {
      return res.status(400).json({ message: "evModel, chargePercent, and source are required" });
    }

    const cities = destination ? [source, destination] : [source];
    const stations = await Station.find({ city: { $in: cities }, status: "active" });

    const suggestion = generateSuggestion({ evModel, chargePercent, source, destination, stations });

    res.status(200).json({ suggestion });

    /* 
    ---- Real LLM version (requires Anthropic billing) ----
    Uncomment this and remove the mock call above once billing is set up:

    const Anthropic = require("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stationList = stations.map(s => `- ${s.name} (${s.chargerType}, ${s.city}, ${s.address})`).join("\n");
    const prompt = destination
      ? `A user drives a Tata ${evModel} at ${chargePercent}% charge, traveling from ${source} to ${destination}. Stations:\n${stationList}\n\nRecommend 1-2 stations and explain briefly why.`
      : `A user drives a Tata ${evModel} at ${chargePercent}% charge, in ${source}. Stations:\n${stationList}\n\nRecommend 1-2 stations and explain briefly why.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const suggestionText = message.content.map(b => b.type === "text" ? b.text : "").join("");
    res.status(200).json({ suggestion: suggestionText });
    */
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;