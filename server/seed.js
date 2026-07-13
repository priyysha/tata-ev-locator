require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require("mongoose");
require("dotenv").config();
const Station = require("./models/Station");
const Slot = require("./models/Slot");

const stations = [
  // Lucknow (concentrated here as requested)
  { name: "Tata.ev Hub Gomti Nagar", address: "Vipin Khand, Gomti Nagar, near Phoenix Palassio Mall, Lucknow, UP 226010", city: "Lucknow", lat: 26.8467, lng: 81.0091, chargerType: "fast", totalSlots: 4 },
  { name: "Tata.ev Point Hazratganj", address: "Shahnajaf Road, Hazratganj, Lucknow, UP 226001", city: "Lucknow", lat: 26.8500, lng: 80.9450, chargerType: "slow", totalSlots: 6 },
  { name: "Tata.ev Hub Alambagh", address: "Alambagh Bus Station Road, Alambagh, Lucknow, UP 226005", city: "Lucknow", lat: 26.8145, lng: 80.9184, chargerType: "fast", totalSlots: 3 },
  { name: "Tata.ev Point Indira Nagar", address: "Faizabad Road, Indira Nagar, Lucknow, UP 226016", city: "Lucknow", lat: 26.8781, lng: 80.9942, chargerType: "slow", totalSlots: 5 },
  { name: "Tata.ev Hub Aliganj", address: "Sector H, Aliganj, Lucknow, UP 226024", city: "Lucknow", lat: 26.8853, lng: 80.9411, chargerType: "fast", totalSlots: 4 },
  { name: "Tata.ev Point Chinhat", address: "Sitapur Road, Chinhat, Lucknow, UP 227105", city: "Lucknow", lat: 26.8917, lng: 81.0339, chargerType: "slow", totalSlots: 5 },
  { name: "Tata.ev Hub Rajajipuram", address: "Purania Chungi, Rajajipuram, Lucknow, UP 226017", city: "Lucknow", lat: 26.8296, lng: 80.8848, chargerType: "fast", totalSlots: 3 },

  // Other UP cities (a few, as requested)
  { name: "Tata.ev Hub Civil Lines", address: "The Mall, Civil Lines, Kanpur, UP 208001", city: "Kanpur", lat: 26.4670, lng: 80.3350, chargerType: "fast", totalSlots: 4 },
  { name: "Tata.ev Point Sector 18", address: "Atta Market, Sector 18, Noida, UP 201301", city: "Noida", lat: 28.5697, lng: 77.3251, chargerType: "fast", totalSlots: 4 },
  { name: "Tata.ev Point Sadar Bazar", address: "Sadar Bazar, Agra Cantt, Agra, UP 282001", city: "Agra", lat: 27.1591, lng: 78.0092, chargerType: "slow", totalSlots: 5 },
];

const timeSlots = [
  ["09:00", "10:00"], ["10:00", "11:00"], ["11:00", "12:00"],
  ["14:00", "15:00"], ["15:00", "16:00"], ["16:00", "17:00"],
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding");

  await Station.deleteMany();
  await Slot.deleteMany();

  const createdStations = await Station.insertMany(stations);
  console.log(`${createdStations.length} stations created`);

  const slotsToInsert = [];
  const today = new Date();

  for (const station of createdStations) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const dateStr = date.toISOString().split("T")[0];

      for (const [start, end] of timeSlots) {
        slotsToInsert.push({
          stationId: station._id,
          date: dateStr,
          startTime: start,
          endTime: end,
          isBooked: false,
        });
      }
    }
  }

  await Slot.insertMany(slotsToInsert);
  console.log(`${slotsToInsert.length} slots created`);

  mongoose.connection.close();
  console.log("Seeding done, connection closed");
}

seed();