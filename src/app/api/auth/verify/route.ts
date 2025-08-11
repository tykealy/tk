import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ valid: false })
    }
    
    const decoded = jwt.verify(token, SECRET_KEY)
    return NextResponse.json({ valid: true, decoded })
  } catch (error) {
    return NextResponse.json({ valid: false })
  }
}
