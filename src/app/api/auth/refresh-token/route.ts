import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User, { IRefreshToken, IUser } from '@/models/User';
import { connectDB } from '@/lib/dbconnect';
import { generateAccessToken, generateRefreshToken } from '@/utils/authTokens';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Ensure DB connection is established per request, good for serverless.
  await connectDB(); 
  console.log('--- REFRESH TOKEN ROUTE HIT ---'); 
  const oldRefreshToken: string | undefined = req.cookies.get('refreshToken')?.value;

  if (!oldRefreshToken) {
    return NextResponse.json({ message: 'No refresh token provided.' }, { status: 401 });
  }

  try {
    // Verify the old refresh token.
    const decoded: { id: string; jti: string; exp: number } = jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { id: string; jti: string; exp: number };

    // Find the user by ID from the decoded token.
    const user: IUser | null = await User.findById(decoded.id).select('email username refreshTokens');

    if (!user) {
      // User not found for the given token ID.
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Find the specific refresh token entry by JTI and validate its status and expiry.
    const tokenEntry: IRefreshToken | undefined = user.refreshTokens.find(
      (token: IRefreshToken) =>
        token.jti === decoded.jti &&
        !token.invalidated &&
        token.expiresAt.getTime() > Date.now()
    );

    if (!tokenEntry) {
      // Token either not found, already invalidated, or expired (token theft detection).
      // Invalidate all existing refresh tokens for this user to prevent replay attacks.
      user.refreshTokens.forEach((t: IRefreshToken) => (t.invalidated = true));
      await user.save(); // Persist changes.
      return NextResponse.json({ message: 'Invalid or expired refresh token. Please log in again.' }, { status: 403 });
    }

    // Mark the old refresh token as invalidated.
    tokenEntry.invalidated = true;
    await user.save(); // Persist changes.

    // Generate new access and refresh tokens.
    const newAccessToken: string = generateAccessToken(user);
    const { token: newRefreshToken, jti: newRefreshJti, expiresAt: newRefreshExpiresAt } = generateRefreshToken(user._id.toString());

    // Create a new entry for the new refresh token.
    const newRefreshTokenEntry: IRefreshToken = {
      jti: newRefreshJti,
      createdAt: new Date(),
      expiresAt: newRefreshExpiresAt,
      invalidated: false,
    };
    user.refreshTokens.push(newRefreshTokenEntry); // Add to user's refreshTokens array.
    await user.save(); // Save user document with new refresh token.

    // Prepare response. Access token is NOT sent in body as it's httpOnly.
    const response = NextResponse.json({ success: true });
    
    // Set new Access Token cookie.
    response.cookies.set('token', newAccessToken, {
      httpOnly: true, // Prevents client-side JS access.
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production.
      path: '/', // Valid for all paths.
      maxAge: 15 * 60, // Access token expiry (15 mins).
      sameSite: 'strict', // CSRF protection.
    });

    // Set new Refresh Token cookie.
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true, // Prevents client-side JS access.
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production.
      path: '/', // Valid for all paths.
      maxAge: 7 * 24 * 60 * 60, // Refresh token expiry (7 days).
      sameSite: 'strict', // CSRF protection.
    });

    return response;
  } catch (err: any) {
    // For backend routes, consider a dedicated logging service instead of console.error in production.

    // Handle specific JWT errors for more precise feedback.
    if (err instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: 'Refresh token expired. Please log in again.' }, { status: 403 });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid refresh token signature or malformed token.' }, { status: 403 });
    }
    // Generic internal server error for other unexpected issues.
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}