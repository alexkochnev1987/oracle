/**
 * Migration script to give 10 credits to existing users
 * Users in whitelist are skipped (they have unlimited credits)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Whitelist emails from ai-whitelist.ts
const WHITELIST_EMAILS = [
  "alexkochnev1987@gmail.com",
  "aliaksandr.kochneu@innowise.com",
];

async function migrateExistingUsers() {
  try {
    console.log("Starting migration: Giving 10 credits to existing users...");

    // Get all users with credits = 0 (excluding whitelist users)
    const usersToUpdate = await prisma.user.findMany({
      where: {
        credits: 0,
        email: {
          notIn: WHITELIST_EMAILS,
        },
      },
      select: {
        id: true,
        email: true,
        credits: true,
      },
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    if (usersToUpdate.length === 0) {
      console.log("No users to update. Migration complete.");
      return;
    }

    // Update all users with 10 credits
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: usersToUpdate.map((u) => u.id),
        },
      },
      data: {
        credits: 10,
      },
    });

    console.log(`Successfully updated ${result.count} users with 10 credits`);
    console.log("Migration complete!");

    // Log whitelist users that were skipped
    const whitelistUsers = await prisma.user.findMany({
      where: {
        email: {
          in: WHITELIST_EMAILS,
        },
      },
      select: {
        email: true,
        credits: true,
      },
    });

    if (whitelistUsers.length > 0) {
      console.log("\nWhitelist users (skipped - unlimited credits):");
      whitelistUsers.forEach((user) => {
        console.log(`  - ${user.email} (credits: ${user.credits})`);
      });
    }
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateExistingUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });

