const User = require("../models/User"); 

const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "email and role are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({ name, email, role });
    await newUser.save();

    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createUser };
