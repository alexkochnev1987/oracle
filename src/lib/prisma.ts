import { PrismaClient } from "@prisma/client";
import { isUserAllowedForAI } from "./ai-whitelist";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Use Client Extensions to set initial credits for new users
// This is the recommended approach in Prisma 5.x (replaces deprecated $use middleware)
const prismaWithExtensions = prismaClient.$extends({
  query: {
    user: {
      async create({ args, query }) {
        // Check if user is in whitelist (unlimited credits)
        const userEmail = args.data.email;
        const isWhitelisted = isUserAllowedForAI(userEmail);

        // Set credits to 10 for new users (not in whitelist)
        // Whitelist users don't need credits, so we leave it as default (0)
        if (!isWhitelisted && args.data.credits === undefined) {
          args.data.credits = 10;
        }

        return query(args);
      },
    },
  },
});

export const prisma =
  globalForPrisma.prisma ?? (prismaWithExtensions as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
