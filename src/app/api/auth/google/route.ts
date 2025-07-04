import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbconnect'; // MongoDB connection.
import User, { IRefreshToken } from '@/models/User'; // Mongoose User model and IRefreshToken.
import { db } from '@/lib/db';               // Drizzle client (PostgreSQL).
import { usersTable as pgUsersTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import axios from 'axios';
import crypto from 'crypto'; // For generating random passwords.
import qs from 'querystring';
import { generateAccessToken, generateRefreshToken } from '@/utils/authTokens'; // Import common token functions.


connectDB(); 

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_BASE_URL, // For constructing redirect_uri.
} = process.env;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    console.error("Google OAuth: No code received from Google.");
    // Use new URL for robust redirect construction
    return NextResponse.redirect(new URL('/login?error=missing_code', NEXT_PUBLIC_BASE_URL));
  }

  const googleRedirectUri = `${NEXT_PUBLIC_BASE_URL}/api/auth/google`; 

  try {
    // 1. Exchange authorization code for Google tokens.
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      qs.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: googleRedirectUri,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, id_token } = tokenRes.data; // Also get id_token, often useful

    if (!access_token) { // Check for access_token specifically
      console.error("Google OAuth: No access_token received from Google.");
      throw new Error('Failed to get access token from Google.');
    }

    // 2. Fetch user info from Google.
    // Use v3/userinfo for consistency, it's more modern and typically has 'sub'
    const userRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // CRITICAL FIX: Google's unique user ID is 'sub', not 'id'
    const { email, name, sub } = userRes.data; 

    if (!email) {
      console.error("Google OAuth: No email received from Google user info.");
      throw new Error('Could not retrieve email from Google user information.');
    }

    // 3. Handle user in MongoDB.
    let user = await User.findOne({ email });
    if (!user) {
      const randomPwd = crypto.randomBytes(16).toString('hex');
      const hashed = await bcrypt.hash(randomPwd, 10);

      user = await User.create({
        email,
        username: name || email.split('@')[0], // Use email part if name is not available
        password: hashed,
        isVerified: true, // Assumes Google auth implies verification.
        googleId: sub, // Store Google's unique ID
      });
      console.log("MongoDB: New user created via Google OAuth.");
    } else {
      let userUpdated = false;
      if (user.username !== name) {
        user.username = name;
        userUpdated = true;
      }
      if (!user.googleId) { // If user existed but without googleId (e.g., created via email/password)
        user.googleId = sub;
        userUpdated = true;
      }
      if (userUpdated) {
        await user.save(); // Save user changes.
        console.log("MongoDB: Existing user updated via Google OAuth.");
      } else {
        console.log("MongoDB: Existing user found, no updates needed.");
      }
    }

    // 4. Handle user in PostgreSQL (Drizzle).
    try {
      const pgUser = await db.select().from(pgUsersTable).where(eq(pgUsersTable.email, email)).limit(1);
      if (pgUser.length === 0) {
        await db.insert(pgUsersTable).values({ email, name: name || email.split('@')[0]}); // Include googleId
        console.log("PostgreSQL: New user created via Google OAuth.");
      } else {
        let pgUserUpdated = false;
        if (pgUser[0].name !== name) {
          await db.update(pgUsersTable).set({ name }).where(eq(pgUsersTable.email, email));
          pgUserUpdated = true;
        }
        if (pgUserUpdated) {
            console.log("PostgreSQL: Existing user updated via Google OAuth.");
        } else {
            console.log("PostgreSQL: Existing user found in PG, no updates needed.");
        }
      }
    } catch (pgErr: any) {
      // Log the PG error but re-throw as generic for outer catch to handle redirect
      console.error(`PostgreSQL operation failed:`, pgErr);
      throw new Error(`PostgreSQL operation failed: ${pgErr.message || JSON.stringify(pgErr)}`);
    }

    // 5. Generate and store custom JWT tokens.
    // Ensure user._id is accessible and valid.
    if (!user || !user._id) {
        console.error("User object or _id is invalid after DB operations.");
        throw new Error("User data invalid for token generation.");
    }
    const appAccessToken = generateAccessToken(user);
    const { token: appRefreshToken, jti, expiresAt } = generateRefreshToken(user._id.toString());

    // Store new refresh token in MongoDB.
    const newRefreshTokenEntry: IRefreshToken = {
      jti: jti,
      createdAt: new Date(),
      expiresAt: expiresAt,
      invalidated: false,
    };
    user.refreshTokens.push(newRefreshTokenEntry); // Add to refreshTokens array.
    await user.save(); // Save user with new refresh token.
    console.log("Tokens generated and refresh token stored.");

    // 6. Set cookies and redirect to dashboard.
    // Ensure NEXT_PUBLIC_BASE_URL is correct in your .env
    const redirectUrl = `${NEXT_PUBLIC_BASE_URL}/dashboard`; 
    const response = NextResponse.redirect(new URL(redirectUrl));

    // Set Access Token cookie.
    response.cookies.set("token", appAccessToken, {
      httpOnly: true, // Prevents client-side JS access.
      path: "/", // Valid for all paths.
      maxAge: 15 * 60, // Access token expiry (15 mins).
      sameSite: "lax", // IMPORTANT: 'lax' is generally better for OAuth redirects.
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production.
    });

    // Set Refresh Token cookie.
    response.cookies.set("refreshToken", appRefreshToken, {
      httpOnly: true, // Prevents client-side JS access.
      path: "/", // Valid for all paths.
      maxAge: 7 * 24 * 60 * 60, // Refresh token expiry (7 days).
      sameSite: "lax", // IMPORTANT: 'lax' is generally better for OAuth redirects.
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production.
    });

    console.log(`Google OAuth Success: Redirecting to ${redirectUrl}`);
    return response;
  } catch (err: any) {
    console.error("--- Google OAuth Callback FAILED ---"); // Log failure.
    // Differentiate error types for better logging.
    if (axios.isAxiosError(err)) {
      console.error("Axios Error Details:", err.response?.status, err.response?.data, err.message);
    } else {
      console.error("General Error Details:", err.message, err.stack);
    }

    // Redirect to login with an error query parameter.
    return NextResponse.redirect(new URL('/login?error=oauth_failed', NEXT_PUBLIC_BASE_URL));
  }
}