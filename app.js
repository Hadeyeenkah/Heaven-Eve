// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const session = require("express-session");
const orderRoutes = require('./routes/orderRoutes');
const Order = require('./models/order');

// Ensure all required environment variables are set
const requiredEnvVars = [
  'PAYSTACK_SECRET_KEY', 'GMAIL_USER', 'GMAIL_PASSWORD', 
  'ADMIN_EMAIL', 'MONGODB_URI', 'SESSION_SECRET'
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ Error connecting to MongoDB:', err));

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for authentication (MUST come before static files)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api', orderRoutes);

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🔹 Serve login page explicitly
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 🔹 Serve admin login page explicitly
app.get('/adminLogin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adminLogin.html'));
});

// 🔹 Login Route (POST) - For regular users
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Dummy authentication - Replace with database logic
  if (email === "user@example.com" && password === "password123") {
    req.session.user = email; // Store session
    res.json({ success: true, redirect: "/menu.html" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// 🔹 Admin Login Route (POST)
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  // Admin authentication - Replace with database logic
  if (username === "admin" && password === "admin123") {
    req.session.admin = username; // Store admin session
    res.json({ success: true, redirect: "/admin.html" });
  } else {
    res.status(401).json({ success: false, message: "Invalid admin credentials" });
  }
});

// 🔹 Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/"); // Redirect to home after logout
  });
});

// 🔹 Admin Logout Route
app.get("/admin-logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/"); // Redirect to home after logout
  });
});

// 🔹 Protect menu.html from unauthorized access
app.get('/menu.html', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
  } else {
    res.redirect('/login.html'); // Redirect to login page if not logged in
  }
});

// 🔹 Protect admin.html from unauthorized access
app.get('/admin.html', (req, res) => {
  if (req.session.admin) {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } else {
    res.redirect('/adminLogin.html'); // Redirect to admin login if not logged in
  }
});

// 🔹 Check authentication status (AJAX)
app.get("/check-auth", (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

// 🔹 Check admin authentication status (AJAX)
app.get("/check-admin-auth", (req, res) => {
  res.json({ loggedIn: !!req.session.admin });
});

// 🔹 Admin Orders route
app.get('/admin/orders', async (req, res) => {
  try {
    // Check if admin is logged in
    if (!req.session.admin) {
      return res.redirect('/adminLogin.html');
    }
    
    const orders = await Order.find().sort({ createdAt: -1 }); // Fetch orders, newest first
    res.render('order', { orders }); // Render the 'order.ejs' view
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).send('Error fetching orders');
  }
});

// 🔹 Contact form submission
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.ADMIN_EMAIL,
    subject: `Contact Form Submission from ${name}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// 🔹 Paystack Webhook for Payment Processing
app.post("/api/paystack-webhook", async (req, res) => {
  const event = req.body;

  if (event.event === "charge.success") {
    const { customer, reference, amount, metadata } = event.data;
    
    if (!metadata || !metadata.customerName || !metadata.customerPhone || !metadata.orderItems) {
      console.error("❌ Invalid metadata format in webhook");
      return res.sendStatus(400);
    }

    // Save payment to database
    const newOrder = new Order({
      fullName: metadata.customerName,
      email: customer.email,
      phone: metadata.customerPhone,
      amount: amount / 100, // Convert to NGN
      paymentRef: reference,
      orderItems: metadata.orderItems
    });

    await newOrder.save();

    // Send Confirmation Email with Order Details
    sendOrderConfirmationEmail(customer.email, reference, metadata);

    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

// 🔹 Function to Send Confirmation Email
const sendOrderConfirmationEmail = (email, paymentRef, metadata) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "🛒 Order Confirmation - Payment Successful",
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your payment was successful. Below are your order details:</p>
      <ul>
        <li><strong>Reference:</strong> ${paymentRef}</li>
        <li><strong>Name:</strong> ${metadata.customerName}</li>
        <li><strong>Phone:</strong> ${metadata.customerPhone}</li>
        <li><strong>Items:</strong> ${metadata.orderItems.join(", ")}</li>
        <li><strong>Total Amount:</strong> ₦${metadata.totalAmount / 100}</li>
      </ul>
      <p>We appreciate your business! 🎉</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending order email:", error);
    } else {
      console.log("✅ Order email sent:", info.response);
    }
  });
};

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start server
const PORT = process.env.PORT || 5503;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});