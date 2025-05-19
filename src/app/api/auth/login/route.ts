import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/dbconnect';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


connectDB();

export async function POST(request: NextRequest){
  try{

    const {email, password} = await request.json();
    if(!email || !password){
      return NextResponse.json({message: 'All fields are required'}, {status: 400});
    }

    // Check if user exists
    const user = await User.findOne({email}).select('+password');;
    
    if(!user){
      return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
    }

    // Generate JWT token
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET!, {expiresIn: '7d'});

    const response = NextResponse.json({message: 'Login successful', 
                                        success: true,
                                        user: {id: user._id, username: user.username, email: user.email}}, 
                                        {status: 200});
    response.cookies.set('token', token, {httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60, sameSite: 'strict'});
    return response;
  

  }catch(error){
    console.error('Login error:', error);
    return NextResponse.json({message: 'Internal Server Error'}, {status: 500});
  }
} 