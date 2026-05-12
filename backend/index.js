import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', userRoutes);
app.use('/api', videoRoutes);
app.use('/api', commentRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'YouTube Clone API is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
