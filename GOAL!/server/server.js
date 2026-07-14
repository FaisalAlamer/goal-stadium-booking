const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./db");

const authRoutes = require("./routes/auth");
const stadiumRoutes = require("./routes/stadiums");
const slotRoutes = require("./routes/slots");
const reservationRoutes = require("./routes/reservations");
const messageRoutes = require("./routes/messages");
const statRoutes = require("./routes/stats");

const app = express();
const PORT = 5020;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname)));

app.use("/api/auth", authRoutes);
app.use("/api/stadiums", stadiumRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stats", statRoutes);

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

connectDB().then(function () {
  app.listen(PORT, function () {
    console.log("Server running on http://localhost:" + PORT);
  });
});
