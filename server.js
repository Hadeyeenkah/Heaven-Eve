require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with secret key
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Import path module for handling file paths

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in the environment variables');
}

const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for cross-origin requests
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// Route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the index.html file
});

// API route to create a Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  // Validate the amount
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount provided' });
  }

  try {
    // Create a PaymentIntent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert NGN to Kobo (1 NGN = 100 Kobo)
      currency: 'ngn', // Use Nigerian Naira
      payment_method_types: ['card'], // Restrict to card payments
    });

    // Send the client secret for frontend usage
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating Payment Intent:', error.message);
    res.status(500).json({ error: 'Failed to create Payment Intent' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
