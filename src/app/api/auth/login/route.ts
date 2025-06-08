// src/app/api/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbconnect'; // For MongoDB
import User from '@/models/User'; // Your Mongoose User model
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- NEW: Import Drizzle/PostgreSQL related components ---
import { db } from '@/lib/db'; // Your Drizzle/PostgreSQL DB connection
import { usersTable as pgUsersTable } from '@/lib/schema'; // Your Drizzle schema for usersTable
import { eq } from 'drizzle-orm'; // For Drizzle queries (e.g., eq for equality)


connectDB(); // Connect to MongoDB

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Check if user exists in MongoDB
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401});
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // --- NEW LOGIC: Synchronize user to PostgreSQL usersTable ---
    try {
      const pgUser = await db.select().from(pgUsersTable).where(eq(pgUsersTable.email, user.email)).limit(1);

      if (pgUser.length === 0) {
        // User does not exist in PostgreSQL usersTable, insert them
        await db.insert(pgUsersTable).values({
          // You need to decide how to generate the ID for PostgreSQL.
          // If 'id' in pgUsersTable is `generatedAlwaysAsIdentity()`, you don't provide it.
          // If it's a UUID, you might generate it here or pass the MongoDB _id string.
          // For now, assuming it's auto-generated `integer().primaryKey().generatedAlwaysAsIdentity()`
          name: user.username || user.email.split('@')[0], // Use username from Mongo or derive from email
          email: user.email,
          // If you have other NOT NULL fields in pgUsersTable, you need to provide them here.
          // For example, if you want to store a reference to the MongoDB _id:
          // mongoUserId: user._id.toString()
        });
        console.log(`User ${user.email} synchronized to PostgreSQL usersTable.`);
      } else {
        console.log(`User ${user.email} already exists in PostgreSQL usersTable.`);
        // Optional: Update user details in pgUsersTable if they can change in MongoDB
        // await db.update(pgUsersTable).set({ name: user.username }).where(eq(pgUsersTable.email, user.email));
      }
    } catch (pgSyncError) {
      console.error('PostgreSQL user synchronization error:', pgSyncError);
      // Decide how to handle this. You might still allow login if DB sync fails,
      // or return a 500 error, or retry. For now, we'll log it.
      // It's crucial this doesn't block the login if MongoDB auth succeeded.
    }
    // --- END NEW LOGIC ---


    // Generate JWT token (as before)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '2d' });

    const response = NextResponse.json({
      message: 'Login successful',
      success: true,
      user: { id: user._id, username: user.username, email: user.email }
    }, { status: 200 });

    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60, sameSite: 'strict' });
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}