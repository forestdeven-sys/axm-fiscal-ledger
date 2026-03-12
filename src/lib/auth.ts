import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * NextAuth Configuration for Axiom Finance
 * 
 * Supports:
 * - Google OAuth
 * - Apple OAuth  
 * - Email/Password (credentials)
 */

export const authOptions: NextAuthOptions = {
  // Use JWT strategy (no database required for demo mode)
  // In production, add PrismaAdapter(db) when using a real database
  
  // Configure authentication providers
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    
    // Apple OAuth
    AppleProvider({
      clientId: process.env.APPLE_ID || '',
      clientSecret: process.env.APPLE_TEAM_ID + ',' + process.env.APPLE_KEY_ID + ',' + process.env.APPLE_PRIVATE_KEY || '',
    }),
    
    // Email/Password fallback (for demo/development)
    // In production, use a proper auth library or implement secure password hashing
    CredentialsProvider({
      name: 'Demo Account',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@axiom.finance' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Demo mode: accept any email/password combination
        // In production, implement proper password verification
        if (credentials?.email && credentials?.password) {
          // Return user object - in production, verify password hash
          return {
            id: 'demo-' + credentials.email,
            email: credentials.email,
            name: credentials.email.split('@')[0],
          };
        }
        return null;
      }
    }),
  ],
  
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
    // Add user ID to session
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    // Add user ID to session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    
    // Handle new user sign-up
    async signIn({ user, account }) {
      // Allow sign in
      return true;
    },
  },
  
  // Events
  events: {
    async createUser({ user }) {
      // User created via OAuth - could send welcome email here
      console.log('New user created:', user.email);
    },
  },
  
  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === 'development',
};
