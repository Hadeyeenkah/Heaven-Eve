const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// User Schema with isAdmin field
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // ✅ Admin flag in database
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ✅ Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      isAdmin: false // Default to regular user
    });

    await newUser.save();

    res.status(201).json({ 
      message: "Registration successful",
      user: { name, email, phone, address }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Get admin status from database (secure!)
    const isAdmin = user.isAdmin;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin },
      process.env.SESSION_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Send response
    res.json({
      message: "Login successful",
      token,
      isAdmin,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

module.exports = router;