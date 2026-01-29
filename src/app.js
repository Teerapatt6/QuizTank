const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
// const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// เรียกใช้ Route ที่เราแยกไว้
app.use('/api/auth', authRoutes); // URL จะเป็น http://localhost:3000/api/auth/login
// app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes); // 👈 เพิ่มบรรทัดนี้เข้าไปครับ

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});