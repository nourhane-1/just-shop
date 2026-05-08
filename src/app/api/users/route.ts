import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}