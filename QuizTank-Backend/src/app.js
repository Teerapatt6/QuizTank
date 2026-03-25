const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const gameRoomRoutes = require('./routes/gameRoomRoutes');
const optionRoutes = require('./routes/optionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const gamePlayRoutes = require('./routes/gamePlayRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const mapRoutes = require('./routes/mapRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/rooms', gameRoomRoutes);
app.use('/api/options', optionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/game-plays', gamePlayRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/maps', mapRoutes);

const port = process.env.PORT || 3000;

pool.connect()
  .then(() => {
    console.log("Database connected");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });