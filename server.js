// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Ensure all required environment variables are set
const requiredEnvVars = [
  "PAYSTACK_SECRET_KEY",
  "GMAIL_USER",
  "GMAIL_PASSWORD",
  "ADMIN_EMAIL",
  "MONGODB_URI",
  "SESSION_SECRET",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

console.log("✅ All environment variables loaded");

// ✅ Initialize Express App
const app = express();

// ✅ Middleware - MUST be before routes
app.use(cors({
  origin: ['https://heaven-eve.onrender.com', 'http://localhost:5502', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  })
);

// ✅ Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Connect to MongoDB
console.log("🔄 Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Exit if can't connect to database
  });

// ===== DATABASE MODELS =====

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// Order Schema (if you need it)
const orderSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  amount: Number,
  paymentRef: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);

// ===== AUTHENTICATION ROUTES =====

// ✅ Register Route
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("📝 Registration request received");
    const { name, email, phone, address, password } = req.body;

    // Validation
    if (!name || !email || !phone || !address || !password) {
      console.log("⚠️ Missing required fields");
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    if (password.length < 6) {
      console.log("⚠️ Password too short");
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ Email already registered:", email);
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
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
      isAdmin: false
    });

    await newUser.save();

    console.log(`✅ New user registered successfully: ${email}`);

    return res.status(201).json({ 
      success: true,
      message: "Registration successful",
      user: { 
        id: newUser._id,
        name, 
        email, 
        phone, 
        address 
      }
    });

  } catch (error) {
    console.error("❌ Registration error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message 
    });
  }
});

// ✅ Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login request received");
    const { email, password } = req.body;

    console.log("📧 Email:", email);

    // Validation
    if (!email || !password) {
      console.log("⚠️ Missing email or password");
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user
    console.log("🔍 Searching for user in database...");
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("⚠️ User not found:", email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("✅ User found:", user.email);

    // Check password
    console.log("🔒 Verifying password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("⚠️ Invalid password for:", email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("✅ Password verified");

    // Get admin status from database
    const isAdmin = user.isAdmin || false;

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        isAdmin 
      },
      process.env.SESSION_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ User logged in successfully: ${email} ${isAdmin ? '(ADMIN)' : '(USER)'}`);

    // Send response
    return res.status(200).json({
      success: true,
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
    console.error("❌ Login error:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json({ 
      success: false,
      message: "Login failed. Please try again.",
      error: error.message 
    });
  }
});

// ✅ Verify Token Route
app.get("/api/auth/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    return res.status(401).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
});

// ===== OTHER ROUTES =====

// Import other routes (make sure these files exist)
try {
  const webhookRoutes = require("./routes/webhookRoutes");
  app.use("/api", webhookRoutes);
  console.log("✅ Webhook routes loaded");
} catch (err) {
  console.log("⚠️ Webhook routes not found, skipping...");
}

try {
  const clientRoute = require("./routes/clientRoute");
  app.use("/api/client", clientRoute);
  console.log("✅ Client routes loaded");
} catch (err) {
  console.log("⚠️ Client routes not found, skipping...");
}

try {
  const coffeeRoute = require("./routes/coffeeRoute");
  app.use("/api/coffee", coffeeRoute);
  console.log("✅ Coffee routes loaded");
} catch (err) {
  console.log("⚠️ Coffee routes not found, skipping...");
}

try {
  const orderRoute = require("./routes/orderRoute");
  app.use("/api/order", orderRoute);
  console.log("✅ Order routes loaded");
} catch (err) {
  console.log("⚠️ Order routes not found, skipping...");
}

// ✅ Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Server is running",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// ✅ Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ✅ Protect menu.html
app.get("/menu.html", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "public", "menu.html"));
  } else {
    res.redirect("/login.html");
  }
});

// ✅ Check authentication status
app.get("/check-auth", (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

// ✅ Admin Orders route
app.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render("order", { orders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).send("Error fetching orders");
  }
});

// ✅ Contact form submission
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.ADMIN_EMAIL,
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending contact email:", error);
      return res.status(500).send("Error sending email");
    }
    res.status(200).send("✅ Message sent successfully!");
  });
});

// ✅ Paystack Webhook
app.post("/api/paystack-webhook", async (req, res) => {
  console.log("🔔 Webhook Received:", req.body);

  const event = req.body;
  if (event.event === "charge.success") {
    console.log("✅ Charge Success Event Detected");

    try {
      const { customer, reference, amount } = event.data;
      console.log("📩 Customer Info:", customer);
      console.log("💳 Payment Reference:", reference);

      const newOrder = new Order({
        fullName: customer.name,
        email: customer.email,
        phone: customer.phone,
        amount: amount / 100,
        paymentRef: reference
      });

      await newOrder.save();
      console.log("✅ Order Saved to Database");

      sendConfirmationEmail(customer.email, reference);
      sendAdminOrderNotification(customer, reference, amount / 100);

      return res.sendStatus(200);
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  } else {
    console.log("⚠️ Webhook Event Not Handled:", event.event);
    return res.sendStatus(400);
  }
});

// Function to Send Order Notification to Admin
function sendAdminOrderNotification(customer, reference, amount) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Order Received',
    text: `A new order has been placed.\n\nCustomer Name: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nAmount: ₦${amount}\nPayment Ref: ${reference}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending admin order email:', error);
    } else {
      console.log(`✅ Order notification sent to admin: ${process.env.ADMIN_EMAIL}`);
    }
  });
}

// Test email route
app.get("/test-email", (req, res) => {
  sendAdminOrderNotification(
    { name: "Test User", email: "test@example.com", phone: "09064744645" },
    "TEST12345",
    5502
  );
  res.send("Test email sent (Check your inbox)");
});

// ✅ Function to Send Confirmation Email
function sendConfirmationEmail(email, reference) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Payment Confirmation",
    text: `Your payment was successful!\nReference: ${reference}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending confirmation email:", error);
    } else {
      console.log(`✅ Confirmation email sent to ${email}`);
    }
  });
}

// ✅ 404 handler - Must be AFTER all other routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    path: req.path 
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ 
    success: false,
    message: "Internal server error",
    error: err.message 
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5502;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Heaven & Eve Cafe Server`);
  console.log(`${"=".repeat(60)}`);
  console.log(`✅ Server running on: http://0.0.0.0:${PORT}`);
  console.log(`✅ Local access: http://localhost:${PORT}`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/verify`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`\n✅ Ready to accept connections!`);
  console.log(`${"=".repeat(60)}\n`);
});