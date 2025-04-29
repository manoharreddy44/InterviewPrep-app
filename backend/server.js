import express from 'express';
import dotenv from 'dotenv';
import cookie from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import connectToMongoDB from './db/connectToMongoDB.js';
import userRoutes from './routes/user.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import reportRoutes from './routes/report.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

// Middleware to parse x-www-form-urlencoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookie());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/report', reportRoutes)

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});