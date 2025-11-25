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
const webhookRoutes = require("./routes/webhookRoutes");

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
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// ✅ Initialize Express App
const app = express();

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ===== USER MODEL =====
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

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== AUTHENTICATION ROUTES =====

// ✅ Register Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    console.log("📝 Registration attempt:", email);

    // Validation
    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ Email already registered:", email);
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
      isAdmin: false
    });

    await newUser.save();

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({ 
      message: "Registration successful",
      user: { name, email, phone, address }
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// ✅ Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt:", email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("⚠️ User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("⚠️ Invalid password for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Get admin status from database
    const isAdmin = user.isAdmin;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin },
      process.env.SESSION_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ User logged in: ${email} ${isAdmin ? '(ADMIN)' : '(USER)'}`);

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
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// ✅ Verify Token Route
app.get("/api/auth/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
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
    console.error("❌ Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// ===== OTHER ROUTES =====
app.use("/api", webhookRoutes);
app.use("/api/client", require("./routes/clientRoute"));
app.use("/api/coffee", require("./routes/coffeeRoute"));
app.use("/api/order", require("./routes/orderRoute"));

// ✅ Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
    const orders = await Order.find();
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

app.get("/test-email", (req, res) => {
  sendAdminOrderNotification(
      { name: "Test User", email: "tboysammy@gmail.com", phone: "09064744645" },
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

// ✅ Start server
const PORT = process.env.PORT || 5502;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`\n📝 Authentication API:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register - Register new user`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login - Login user`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/verify - Verify token`);
  console.log(`\n✅ Ready to accept connections\n`);
});