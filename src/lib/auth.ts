import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * NextAuth Configuration for Axiom Finance
 * 
 * Supports:
 * - Google OAuth (if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set)
 * - Apple OAuth (if APPLE credentials are set)
 * - Email/Password (credentials) - always available for demo
 */

export const authOptions: NextAuthOptions = {
  // Configure authentication providers dynamically
  providers: [
    // Google OAuth - Only enable if credentials are provided
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    
    // Apple OAuth - Only enable if credentials are provided  
    ...(process.env.APPLE_ID && process.env.APPLE_PRIVATE_KEY
      ? [AppleProvider({
          clientId: process.env.APPLE_ID,
          clientSecret: `${process.env.APPLE_TEAM_ID},${process.env.APPLE_KEY_ID},${process.env.APPLE_PRIVATE_KEY}`,
        })]
      : []),
    
    // Email/Password fallback - Always available for demo
    CredentialsProvider({
      name: 'Demo Account',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@axiom.finance' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Demo mode: accept any email/password combination
        if (credentials?.email && credentials?.password) {
          return {
            id: 'demo-' + credentials.email,
            email: credentials.email,
            name: credentials.email.split('@')[0],
          };
        }
        return null;
      }
    }),
  ].filter(Boolean) as any,
  
  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Pages
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  
  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    
    async signIn({ user, account }) {
      return true;
    },
  },
  
  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email);
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
};
