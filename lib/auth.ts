import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, SubscriptionTier } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        phoneNumber: { label: "Phone Number", type: "text" },
        password: { label: "PIN Code", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials. Email and PIN are required.");
        }
        
        const user = await prisma.user.findFirst({
          where: { 
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials. Please check your information.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid PIN code.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tier = user.tier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.tier = token.tier as SubscriptionTier;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
  debug: process.env.NODE_ENV === "development",
};
