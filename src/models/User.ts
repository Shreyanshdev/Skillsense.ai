import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt'; // Import bcryptjs

// You can optionally define a TypeScript interface for your User document
// if you are using TypeScript strictly, but for simplicity matching your current code,
// we'll omit it unless you request it.

// Define your Mongoose Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
    lowercase: true, // Recommended: Store emails in lowercase
    trim: true // Recommended: Trim whitespace
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, 'Password must be at least 6 characters'], // Added minlength validation as per previous code
    select: false, // Recommended: Do not return the password field by default in queries
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin : {
    type: Boolean,
    default: false,
  },
  token: { // Token for general purposes? (e.g., session token, remember me)
    type: String,
    default: null,
  },
  tokenExpiry: { // Expiry for general token?
    type: Date,
    default: null,
  },
  forgotPasswordToken: String, // Field for password reset token
  forgotPasswordExpiry: Date,   // Field for password reset token expiry
  verifyToken: String,          // Field for email verification token
  verifyTokenExpiry: Date,      // Field for email verification token expiry
}, { timestamps: true }); // Added timestamps: true to automatically manage createdAt and updatedAt fields


// when using hot-reloading in development environments.
const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;