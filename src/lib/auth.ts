import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import NextAuth from "next-auth";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

// Check if required environment variables are set
const hasGoogleCredentials = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const hasDatabase = !!process.env.POSTGRES_URL;

export const authOptions = {
  adapter:
    hasDatabase && hasGoogleCredentials ? PrismaAdapter(prisma) : undefined,
  providers: hasGoogleCredentials
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : [],
  callbacks: {
    async session({
      session,
      user,
      token,
    }: {
      session: Session;
      user?: User;
      token?: JWT;
    }): Promise<Session> {
      if (session.user) {
        // For JWT strategy, use token.id; for database strategy, use user.id
        const userId = user?.id || token?.id;
        if (userId) {
          session.user.id = userId as string;
          try {
            if (hasDatabase) {
              const dbUser = await prisma.user.findUnique({
                where: { id: userId as string },
                select: { credits: true },
              });
              if (dbUser) {
                session.user.credits = dbUser.credits;
              } else {
                session.user.credits = 0;
              }
            } else {
              session.user.credits = token?.credits || 0;
            }
          } catch (error) {
            // If database is not available, set default credits
            console.warn("Database not available, using default credits");
            session.user.credits = 0;
          }
        }
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.credits = (user as any).credits || 0;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: (hasDatabase && hasGoogleCredentials ? "database" : "jwt") as
      | "database"
      | "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
  debug: process.env.NODE_ENV === "development",
  trustHost: true, // Required for NextAuth v5
};

// Export auth function for server-side usage
export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);
