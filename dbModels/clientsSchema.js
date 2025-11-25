const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const clientsSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,  // Remove any extra spaces around the username
        minlength: 3,  // Ensure username is not too short
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Ensure email is stored in lowercase
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],  // Simple email regex validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6,  // Ensure password is of a minimum length
    },
    phone: {
        type: String,
        required: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please use a valid phone number format'],  // Phone regex (e.g., +1234567890)
    }
},
{
    timestamps: true,
});

// Hash the password before saving the client
clientsSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            // Hash the password with salt rounds of 10
            this.password = await bcrypt.hash(this.password, 10);
            next();
        } catch (error) {
            next(error);  // Pass the error to the next middleware
        }
    } else {
        next();
    }
});

// Compare the provided password with the stored hash
clientsSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Clients', clientsSchema);
