// app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: payload.id,
        email: payload.email,
        username: payload.username,
      },
    });
  } catch {
    return NextResponse.json({ loggedIn: false, error: 'Invalid token' }, { status: 401 });
  }
}
