import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await req.json()
    const user = await User.findByIdAndUpdate(params.id, body, { new: true }).select('-password')
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
  
    await User.findByIdAndUpdate(params.id, { isBlocked: true })
    return NextResponse.json({ message: 'User blocked' })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}