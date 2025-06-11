import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

export async function POST(request) {
  try {
    const { mode, email, password, name, userType } = await request.json()

    // Read existing users
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'))
    const { users } = usersData

    if (mode === 'signup') {
      // Check if user already exists
      if (users.some(user => user.email === email)) {
        return NextResponse.json(
          { message: 'User already exists' },
          { status: 400 }
        )
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword, // Store hashed password
        userType,
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2))

      return NextResponse.json({
        message: 'User created successfully',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, userType: newUser.userType }
      })
    } else {
      // Login
      const user = users.find(u => u.email === email)
      
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
        user: { id: user.id, name: user.name, email: user.email, userType: user.userType }
      })
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 