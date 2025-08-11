import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this'
const CORRECT_PASSWORD = process.env.WRITE_PASSWORD

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (password === CORRECT_PASSWORD) {
      // Create JWT token with expiration
      const token = jwt.sign(
        { authenticated: true, timestamp: Date.now() },
        SECRET_KEY,
        { expiresIn: '24h' }
      )
      
      return NextResponse.json({ success: true, token })
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
