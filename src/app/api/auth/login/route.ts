import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbconnect';
import User, { IRefreshToken } from '@/models/User';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { usersTable as pgUsersTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { generateAccessToken, generateRefreshToken } from '@/utils/authTokens'; // Import from common file.

export async function POST(request: NextRequest) {
  try {
    // Ensure DB connection is established per request, good for serverless.
    await connectDB(); 

    const { email, password } = await request.json();
    if (!email || !password) {
      // All fields are required.
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Find user and select password for comparison.
    const user = await User.findOne({ email }).select('+password');
    // Check user existence and password validity.
    if (!user || !(await bcrypt.compare(password, user.password!))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // PostgreSQL Sync: Check and update/insert user in Drizzle DB.
    const pgUser = await db.select().from(pgUsersTable).where(eq(pgUsersTable.email, user.email)).limit(1);
    if (pgUser.length === 0) {
      // User not in PostgreSQL, insert new entry.
      await db.insert(pgUsersTable).values({
        name: user.username || user.email.split('@')[0],
        email: user.email,
      });
    } else {
      // User found in PostgreSQL, update name if necessary.
      await db.update(pgUsersTable).set({ name: user.username }).where(eq(pgUsersTable.email, user.email));
    }

    // Generate access and refresh tokens.
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, jti, expiresAt } = generateRefreshToken(user._id.toString());

    // Store Refresh Token Details in MongoDB.
    const newRefreshTokenEntry: IRefreshToken = {
      jti: jti,
      createdAt: new Date(),
      expiresAt: expiresAt,
      invalidated: false,
    };

    user.refreshTokens.push(newRefreshTokenEntry); // Add to user's refreshTokens array.
    await user.save(); // Save user document with new refresh token.

    // Prepare response with user info.
    const response = NextResponse.json({
      message: 'Login successful',
      success: true,
      user: { id: user._id, username: user.username, email: user.email },
    });

    // Set Access Token cookie.
    response.cookies.set('token', accessToken, {
      httpOnly: true, // Prevents client-side JS access.
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production.
      path: '/', // Valid for all paths.
      maxAge: 15 * 60, // Access token expiry (15 mins).
      sameSite: 'strict', // CSRF protection.
    });

    // Set Refresh Token cookie.
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true, // Prevents client-side JS access.
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production.
      path: '/', // Valid for all paths.
      maxAge: 7 * 24 * 60 * 60, // Refresh token expiry (7 days).
      sameSite: 'strict', // CSRF protection.
    });

    return response;
  } catch (error) {
    // For backend routes, consider a dedicated logging service instead of console.error in production.
    // E.g., a logging library would capture 'Login error:', error details here.
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}