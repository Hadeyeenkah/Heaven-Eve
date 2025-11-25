require("dotenv").config();
const mongoose = require("mongoose");

// User Schema (same as in authRoute.js)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
  createdAt: Date
});

const User = mongoose.model("User", userSchema);

// ✅ Function to make a user admin
async function makeAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ User not found with email:", email);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`✅ Successfully made ${email} an admin!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log("Usage: node makeAdmin.js <email>");
  console.log("Example: node makeAdmin.js admin@heavenandeve.com");
  process.exit(1);
}

makeAdmin(email);