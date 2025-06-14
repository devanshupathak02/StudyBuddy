import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request) {
  try {
    const { mode, email, password, name, userType } = await request.json()

    // Connect to MongoDB
    await connectDB()

    if (mode === 'signup') {
      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          { message: 'User already exists' },
          { status: 400 }
        )
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Create new user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        userType,
      })

      return NextResponse.json({
        message: 'User created successfully',
        user: { 
          id: newUser._id, 
          name: newUser.name, 
          email: newUser.email, 
          userType: newUser.userType 
        }
      })
    }

    // Login
    const user = await User.findOne({ email })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: 'Login successful',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        userType: user.userType 
      }
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 