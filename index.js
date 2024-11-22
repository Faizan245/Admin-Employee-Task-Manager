require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/loginSignup'); // Import the routes
const taskRoutes = require('./routes/taskRoutes')
const cors = require('cors');

const app = express();
app.use(express.json());
// Connect to MongoDB
connectDB();

// Middleware

 // Parse JSON bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.urlencoded({ extended: false, limit: 10000, parameterLimit: 3 }));

// Use the authRoutes with a prefix
app.use('/', authRoutes);
app.use('/', taskRoutes);

app.get('/', (req, res) => {
    res.send("Hello World");
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


