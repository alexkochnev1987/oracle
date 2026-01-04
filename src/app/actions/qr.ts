"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export interface QrCodeData {
  id: string;
  token: string;
  expiresAt: Date | null;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: Date;
  readingsCount?: number;
}

export async function createQrCode(
  expiresAt: Date | null,
  maxUses: number
): Promise<{ success: boolean; qrCode?: QrCodeData; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return { success: false, error: "User ID not found in session" };
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate: maxUses should not exceed available credits
    if (maxUses > user.credits) {
      return {
        success: false,
        error: "Max uses cannot exceed available credits",
      };
    }

    // Check if user already has a QR code - delete it before creating new one
    const existingQrCode = await prisma.qrCode.findFirst({
      where: { userId },
    });

    if (existingQrCode) {
      // Delete existing QR code
      await prisma.qrCode.delete({
        where: { id: existingQrCode.id },
      });
    }

    // Generate unique token
    const token = randomUUID();

    // Create QR code
    const qrCode = await prisma.qrCode.create({
      data: {
        userId,
        token,
        expiresAt,
        maxUses,
        currentUses: 0,
        isActive: true,
      },
    });

    revalidatePath("/qr");
    revalidatePath("/qr/create");

    return {
      success: true,
      qrCode: {
        id: qrCode.id,
        token: qrCode.token,
        expiresAt: qrCode.expiresAt,
        maxUses: qrCode.maxUses,
        currentUses: qrCode.currentUses,
        isActive: qrCode.isActive,
        createdAt: qrCode.createdAt,
      },
    };
  } catch (error) {
    console.error("Error creating QR code:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create QR code",
    };
  }
}

export async function getUserQrCodes(): Promise<{
  success: boolean;
  qrCodes?: QrCodeData[];
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return { success: false, error: "User ID not found in session" };
    }

    const qrCodes = await prisma.qrCode.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Get readings count for each QR code
    const qrCodesWithStats = await Promise.all(
      qrCodes.map(async (qrCode) => {
        const readingsCount = await prisma.reading.count({
          where: { qrCodeId: qrCode.id },
        });

        return {
          id: qrCode.id,
          token: qrCode.token,
          expiresAt: qrCode.expiresAt,
          maxUses: qrCode.maxUses,
          currentUses: qrCode.currentUses,
          isActive: qrCode.isActive,
          createdAt: qrCode.createdAt,
          readingsCount,
        };
      })
    );

    return { success: true, qrCodes: qrCodesWithStats };
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch QR codes",
    };
  }
}

export async function deactivateQrCode(
  qrCodeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return { success: false, error: "User ID not found in session" };
    }

    // Check if QR code belongs to user
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: qrCodeId },
      select: { userId: true },
    });

    if (!qrCode || qrCode.userId !== userId) {
      return { success: false, error: "QR code not found" };
    }

    await prisma.qrCode.update({
      where: { id: qrCodeId },
      data: { isActive: false },
    });

    revalidatePath("/qr");
    revalidatePath("/qr/create");

    return { success: true };
  } catch (error) {
    console.error("Error deactivating QR code:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to deactivate QR code",
    };
  }
}

export async function activateQrCode(
  qrCodeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return { success: false, error: "User ID not found in session" };
    }

    // Check if QR code belongs to user
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: qrCodeId },
      select: { userId: true },
    });

    if (!qrCode || qrCode.userId !== userId) {
      return { success: false, error: "QR code not found" };
    }

    await prisma.qrCode.update({
      where: { id: qrCodeId },
      data: { isActive: true },
    });

    revalidatePath("/qr");
    revalidatePath("/qr/create");

    return { success: true };
  } catch (error) {
    console.error("Error activating QR code:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to activate QR code",
    };
  }
}

export async function validateQrToken(token: string): Promise<{
  success: boolean;
  qrCode?: {
    id: string;
    userId: string;
    isActive: boolean;
    expiresAt: Date | null;
    currentUses: number;
    maxUses: number;
  };
  error?: string;
}> {
  try {
    const qrCode = await prisma.qrCode.findUnique({
      where: { token },
      select: {
        id: true,
        userId: true,
        isActive: true,
        expiresAt: true,
        currentUses: true,
        maxUses: true,
      },
    });

    if (!qrCode) {
      return { success: false, error: "QR code not found" };
    }

    if (!qrCode.isActive) {
      return { success: false, error: "QR code is not active" };
    }

    // Check if expired
    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return { success: false, error: "QR code has expired" };
    }

    // Check if max uses reached
    if (qrCode.currentUses >= qrCode.maxUses) {
      return { success: false, error: "QR code usage limit reached" };
    }

    return { success: true, qrCode };
  } catch (error) {
    console.error("Error validating QR token:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to validate QR token",
    };
  }
}

export async function getReadingsByQrCode(qrCodeId: string): Promise<{
  success: boolean;
  readings?: Array<{
    id: string;
    question: string;
    createdAt: Date;
    tarotReaderId: string;
  }>;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return { success: false, error: "User ID not found in session" };
    }

    // Check if QR code belongs to user
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: qrCodeId },
      select: { userId: true },
    });

    if (!qrCode || qrCode.userId !== userId) {
      return { success: false, error: "QR code not found" };
    }

    const readings = await prisma.reading.findMany({
      where: { qrCodeId },
      select: {
        id: true,
        question: true,
        createdAt: true,
        tarotReaderId: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, readings };
  } catch (error) {
    console.error("Error fetching readings by QR code:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch readings",
    };
  }
}
