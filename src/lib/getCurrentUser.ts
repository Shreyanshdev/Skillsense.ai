// lib/getCurrentUser.ts
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '@/models/User';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('auth_token')?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    if (!decoded?.email) return null;

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const user = await User.findOne({ email: decoded.email }).lean();
    return user;
  } catch (err) {
    console.error('[getCurrentUser]', err);
    return null;
  }
}
