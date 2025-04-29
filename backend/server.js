import express from 'express';
import dotenv from 'dotenv';
import cookie from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import connectToMongoDB from './db/connectToMongoDB.js';
import userRoutes from './routes/user.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import reportRoutes from './routes/report.routes.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

dotenv.config();

// Middleware to parse x-www-form-urlencoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookie());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/report', reportRoutes)

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});