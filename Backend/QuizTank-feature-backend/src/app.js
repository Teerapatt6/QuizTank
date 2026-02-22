const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
// const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
const gameRoutes = require('./routes/gameRoutes');
const gameRoomRoutes = require('./routes/gameRoomRoutes');
app.use('/api/games', gameRoutes);
app.use('/api/rooms', gameRoomRoutes);
const optionRoutes = require('./routes/optionRoutes');
app.use('/api/options', optionRoutes);
app.use('/api/users', userRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const challengeRoutes = require('./routes/challengeRoutes');
app.use('/api/challenges', challengeRoutes);

const gamePlayRoutes = require('./routes/gamePlayRoutes');
app.use('/api/game-plays', gamePlayRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const mapRoutes = require('./routes/mapRoutes');
app.use('/api/maps', mapRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});