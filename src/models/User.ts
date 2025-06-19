import mongoose, { Document, Model, Schema , Types} from 'mongoose';
import bcrypt from 'bcrypt';

// 1. Define the interface for a single Refresh Token entry
export interface IRefreshToken {
  jti: string; // JWT ID for unique identification of this specific token
  createdAt: Date; // When this refresh token was issued
  expiresAt: Date; // When this refresh token will expire
  invalidated: boolean; // Flag to manually invalidate a token (e.g., on logout or rotation)
}

// 2. Define the TypeScript interface for your User document
// This extends mongoose.Document and includes all your schema fields plus the new refreshTokens array.
export interface IUser extends Document {
  googleId: any;
  _id: Types.ObjectId;
  username: string;
  email: string;
  password?: string; // Optional because it's 'select: false' and not always present
  isVerified: boolean;
  isAdmin: boolean;
  token?: string | null; // For general purposes (e.g., session token, remember me)
  tokenExpiry?: Date | null;
  forgotPasswordToken?: string;
  forgotPasswordExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;

  refreshTokens: IRefreshToken[]; 
}

// 3. Define your Mongoose Schema
const userSchema: Schema<IUser> = new mongoose.Schema({
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
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Do not return the password field by default in queries
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin : {
    type: Boolean,
    default: false,
  },
  token: { // General purpose token field
    type: String,
    default: null,
  },
  tokenExpiry: { // Expiry for general purpose token
    type: Date,
    default: null,
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
  // NEW: Array for refresh token entries
  refreshTokens: [
    {
      jti: { type: String, required: true, unique: true }, // Unique ID for each refresh token
      createdAt: { type: Date, default: Date.now }, // When this specific refresh token was issued
      expiresAt: { type: Date, required: true }, // When this specific refresh token expires
      invalidated: { type: Boolean, default: false } // To explicitly mark a token as invalid
    }
  ]
}, { timestamps: true }); // Automatically manages createdAt and updatedAt fields

userSchema.index({ "refreshTokens.jti": 1 }, { unique: true, sparse: true, name: "refreshTokens.jti_1" });


// Pre-save hook for password hashing (if password field is modified)
userSchema.pre<IUser>('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// To prevent Mongoose from recompiling the model in hot-reloading environments
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;