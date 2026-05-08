import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          await connectDB();

          const user = await User.findOne({
            email: String(credentials.email).toLowerCase(),
          }).select("+password");

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (user.isBlocked) {
            throw new Error("Your account is blocked");
          }

          if (!user.password) {
            throw new Error("This account uses Google login");
          }

          const isValid = await bcrypt.compare(
            String(credentials.password),
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image || null,
            role: user.role,
          };
        } catch (error: any) {
          console.error("Credentials authorize error:", error);
          throw new Error(error.message || "Login failed");
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "customer",
              isVerified: true,
              isBlocked: false,
              wishlist: [],
              addresses: [],
            });
          }

          user.id = dbUser._id.toString();
          (user as any).role = dbUser.role;
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }

      if (token.email && (!token.id || String(token.id).includes("-"))) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("JWT callback DB error:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,
});