"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTarotReading, CreateReadingParams } from "@/lib/openai";
import { revalidatePath } from "next/cache";

export async function createReading(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // In NextAuth v5, user.id might be in session.user.id or session.user.email
    const userId = (session.user as any).id;
    
    if (!userId) {
      throw new Error("User ID not found in session");
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < 1) {
      throw new Error("Insufficient credits. Please purchase credits to create a reading.");
    }

    // Get form data
    const userImageBase64 = formData.get("userImage") as string;
    const cardsImageBase64 = formData.get("cardsImage") as string;
    const birthDate = formData.get("birthDate") as string;
    const question = formData.get("question") as string;
    const tarotReaderId = (formData.get("tarotReaderId") as string) || "default";

    if (!userImageBase64 || !cardsImageBase64 || !birthDate || !question) {
      throw new Error("Missing required fields");
    }

    // Create AI prediction
    const predictionText = await createTarotReading({
      userImageBase64,
      cardsImageBase64,
      birthDate,
      question,
      tarotReaderId: tarotReaderId as any,
    });

    // Save to database
    const reading = await prisma.reading.create({
      data: {
        userId,
        question,
        birthDate: new Date(birthDate),
        predictionText,
        userImageUrl: userImageBase64.substring(0, 100) + "...", // Store reference only
        cardsImageUrl: cardsImageBase64.substring(0, 100) + "...",
        tarotReaderId,
      },
    });

    // Deduct credit
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/readings");

    return { success: true, readingId: reading.id };
  } catch (error) {
    console.error("Error creating reading:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create reading",
    };
  }
}

