// src/utils/tokenUtils.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IUser } from '@/models/User'; // Assuming you have an IUser interface defined in your User model file

// Define the shape of the data you want to embed in your JWT payload
interface AccessTokenPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  username: string;
  // Add any other user data you need frequently for authentication/authorization
}

interface RefreshTokenPayload extends jwt.JwtPayload {
  id: string; // User ID
  jti: string; // JWT ID - unique identifier for the refresh token
}

/**
 * Helper to generate a short-lived access token with user details embedded.
 *
 * @param user The user object (or at least an object with _id, email, username).
 * @returns The signed JWT access token.
 */
export const generateAccessToken = (user: Pick<IUser, '_id' | 'email' | 'username'>): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }

  // Create the payload for the access token
  const payload: AccessTokenPayload = {
    id: user._id.toString(), // Ensure _id is a string, as JWTs are string-based
    email: user.email,
    username: user.username,
  };

  // Sign the token with the secret and set expiry
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' }); // Short-lived access token
};

/**
 * Helper to generate a long-lived refresh token with a unique ID (jti) and explicit expiry date.
 *
 * @param userId The ID of the user for whom the refresh token is being generated.
 * @returns An object containing the signed refresh token, its unique ID (jti), and its absolute expiry date.
 */
export const generateRefreshToken = (userId: string): { token: string; jti: string; expiresAt: Date } => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not defined.');
  }

  const jti: string = crypto.randomBytes(16).toString('hex'); // Generate a unique ID for this refresh token
  const expiresInSeconds: number = 7 * 24 * 60 * 60; // 7 days in seconds
  const expiresAt: Date = new Date(Date.now() + expiresInSeconds * 1000); // Calculate absolute expiry date

  // Create the payload for the refresh token (only user ID and jti needed here)
  const payload: RefreshTokenPayload = {
    id: userId,
    jti: jti,
  };

  // Sign the token with the secret and set expiry
  const token: string = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: expiresInSeconds });

  return { token, jti, expiresAt };
};

// Optional: You might want a utility to verify tokens as well, or keep it in the route
// This is useful for backend validation of refresh tokens or in middleware.
export const verifyToken = (token: string, secret: string): AccessTokenPayload | RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded as AccessTokenPayload | RefreshTokenPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};