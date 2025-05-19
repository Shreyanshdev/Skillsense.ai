import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { mailSender } from '../utils/nodemailer'; // Adjust path if needed

// Interface for OTP document
interface OTPDocument extends Document {
  email: string;
  otp: string; // stored as hashed OTP
  createdAt: Date;

  // method to compare plain OTP with hashed OTP
  compareOTP(candidateOTP: string): Promise<boolean>;
}

// Interface for mail options (email sender config)
interface MailOptions {
  email: string;
  emailType: 'VERIFIED' | 'RESET' | 'WELCOME';
  userId?: string;
  otp?: string;  // unhashed OTP sent in the email
}

// Schema for OTP model
const OTPSchema: Schema<OTPDocument> = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true, // Will store the hashed OTP
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60, // TTL: document auto-deletes after 5 minutes
  },
});

// Pre-save middleware to hash OTP and send email with unhashed OTP
OTPSchema.pre<OTPDocument>('save', async function (next) {
  try {
    if (this.isNew) {
      // Save unhashed OTP in a temporary variable
      const unhashedOtp = this.otp;

      // Hash OTP before saving to DB for security
      const salt = await bcrypt.genSalt(10);
      this.otp = await bcrypt.hash(unhashedOtp, salt);

      // Prepare email options with unhashed OTP (so user can see correct OTP)
      const mailOptions: MailOptions = {
        email: this.email,
        emailType: 'VERIFIED', // You can update emailType dynamically if needed
        otp: unhashedOtp,       // Send unhashed OTP in email content
        userId: (this._id as string).toString(),
      };

      // Send email
      await mailSender(mailOptions);
    }
    next();
  } catch (error) {
    console.error('Error sending OTP email:', error);
    next(error as Error);
  }
});

// Method to compare candidate OTP with hashed OTP in DB
OTPSchema.methods.compareOTP = async function (candidateOTP: string): Promise<boolean> {
  return await bcrypt.compare(candidateOTP, this.otp);
};

// Export the model
const OTP = mongoose.models.OTP || mongoose.model<OTPDocument>('OTP', OTPSchema);
export default OTP;
