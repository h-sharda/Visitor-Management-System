const express = require('express');
const path = require('path');
require('dotenv').config();
require('./config/mongodb');
const cookieParser = require('cookie-parser');

const { checkForAuthenticationCookie } = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const userRoute = require("./routes/userRoutes");
app.use('/user', userRoute);

const entryRoutes = require('./routes/entryRoutes');
app.use('/', entryRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
