require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/loginSignup'); // Import the routes
const taskRoutes = require('./routes/taskRoutes')
const cors = require('cors');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.urlencoded({ extended: false, limit: 10000, parameterLimit: 3 }));

// Use the authRoutes with a prefix
app.use('/', authRoutes);
app.use('/', taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
