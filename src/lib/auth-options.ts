
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB()
        const user = await User.findOne({ email: credentials?.email })
        
        if (!user) throw new Error('No user found with this email')
        if (!user.isVerified) throw new Error('Please verify your email first')
        if (user.isBlocked) throw new Error('Account is blocked')
        if (!user.password) throw new Error('Please login with Google')
        
        const isValid = await bcrypt.compare(credentials!.password, user.password)
        if (!isValid) throw new Error('Invalid password')
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB()
        const exists = await User.findOne({ email: user.email })
        if (!exists) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            isVerified: true,
            role: 'customer',
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        await connectDB()
        const dbUser = await User.findOne({ email: token.email })
        token.id = dbUser?._id.toString()
        token.role = dbUser?.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}