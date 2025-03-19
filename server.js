// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const session = require("express-session");
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

// ✅ Initialize Express App BEFORE using it
const app = express();

// ✅ Connect to MongoDB BEFORE using routes
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Session middleware for authentication
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

// ✅ Routes
app.use("/api", webhookRoutes);
app.use("/api/client", require("./routes/clientRoute"))
app.use("/api/coffee", require("./routes/coffeeRoute"))
app.use("/api/order", require("./routes/orderRoute"))

// ✅ Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ✅ Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/"); // Redirect to home after logout
  });
});

// ✅ Protect menu.html from unauthorized access
app.get("/menu.html", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "public", "menu.html"));
  } else {
    res.redirect("/login.html"); // Redirect to login page if not logged in
  }
});

// ✅ Check authentication status (AJAX)
app.get("/check-auth", (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

// ✅ Admin Orders route
app.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch orders from the database
    res.render("order", { orders }); // Render the 'order.ejs' view
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

// ✅ Paystack Webhook for Payment Processing
app.use(express.json()); // Ensure JSON parsing for incoming webhooks

app.post("/api/paystack-webhook", async (req, res) => {
  console.log("🔔 Webhook Received:", req.body); // Log incoming webhook data

  const event = req.body;
  if (event.event === "charge.success") {
      console.log("✅ Charge Success Event Detected");

      try {
          const { customer, reference, amount } = event.data;
          console.log("📩 Customer Info:", customer);
          console.log("💳 Payment Reference:", reference);

          // Save the order in the database
          const newOrder = new Order({
              fullName: customer.name,
              email: customer.email,
              phone: customer.phone,
              amount: amount / 100,
              paymentRef: reference
          });

          await newOrder.save();
          console.log("✅ Order Saved to Database");

          // Send confirmation email to customer
          sendConfirmationEmail(customer.email, reference);

          // Send notification email to admin
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
const PORT = process.env.PORT || 5503; // Use environment variable for port, default to 5503
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

