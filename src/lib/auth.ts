import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      avatar?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    role: UserRole
    avatar?: string | null
  }
}

// Demo accounts for client showcase - always available regardless of database state
const DEMO_ACCOUNTS = [
  {
    id: 'demo-admin-001',
    email: 'admin@ctg.com',
    name: 'CTG Admin',
    password: 'admin123',
    role: 'SUPER_ADMIN' as UserRole,
    avatar: null,
  },
  {
    id: 'demo-manager-001',
    email: 'manager@ctg.com',
    name: 'Brand Manager',
    password: 'manager123',
    role: 'MANAGER' as UserRole,
    avatar: null,
  },
  {
    id: 'demo-viewer-001',
    email: 'viewer@ctg.com',
    name: 'Data Viewer',
    password: 'viewer123',
    role: 'VIEWER' as UserRole,
    avatar: null,
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check demo accounts first (always works, no database needed)
        const demoAccount = DEMO_ACCOUNTS.find(
          (account) => account.email === credentials.email
        )
        if (demoAccount && demoAccount.password === credentials.password) {
          return {
            id: demoAccount.id,
            email: demoAccount.email,
            name: demoAccount.name,
            role: demoAccount.role,
            avatar: demoAccount.avatar,
          }
        }

        // Fall back to database lookup for non-demo users
        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user || !user.password) {
            return null
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password)

          if (!passwordMatch) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          }
        } catch {
          // Database unavailable - only demo accounts work
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'datahub-ctg-secret-key-2024-showcase',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role
        token.avatar = (user as any).avatar
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          avatar: token.avatar,
        }
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id && !user.id.startsWith('demo-')) {
        try {
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: 'login',
              entity: 'user',
              entityId: user.id,
            },
          })
        } catch {
          // Ignore error if audit log fails
        }
      }
    },
  },
}
