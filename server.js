const express = require('express');
const path = require('path');
require('dotenv').config();
require('./config/mongodb'); // Initialize MongoDB connection

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
const entryRoutes = require('./routes/entryRoutes');
app.use('/', entryRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
