import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

export const generateAndStoreToken = async (
  userId: string,
  tokenField: 'verifyToken' | 'resetToken'
) => {
  const plainToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

  await User.findByIdAndUpdate(userId, {
    [tokenField]: hashedToken,
    [`${tokenField}Expiry`]: Date.now() + 5 * 60 * 1000, // 5 minutes
  });

  return plainToken; // Return plain token to send in email
};
