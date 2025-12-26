"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTarotReading, CreateReadingParams } from "@/lib/openai";
import { revalidatePath } from "next/cache";

// Parse date from dd-mm-yy format
function parseDate(dateString: string): Date {
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    throw new Error("Invalid date format. Expected dd-mm-yy");
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  let year = parseInt(parts[2], 10);

  // Convert 2-digit year to 4-digit year
  // Assume years 00-30 are 2000-2030, years 31-99 are 1931-1999
  if (year < 100) {
    year = year <= 30 ? 2000 + year : 1900 + year;
  }

  const date = new Date(year, month, day);

  // Validate date
  if (
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    throw new Error("Invalid date");
  }

  // Check if date is not in the future
  if (date > new Date()) {
    throw new Error("Birth date cannot be in the future");
  }

  return date;
}

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
      throw new Error(
        "Insufficient credits. Please purchase credits to create a reading."
      );
    }

    // Get form data
    const userImageBase64 = formData.get("userImage") as string;
    const cardsImageBase64 = formData.get("cardsImage") as string;
    const birthDate = formData.get("birthDate") as string;
    const question = formData.get("question") as string;
    const tarotReaderId =
      (formData.get("tarotReaderId") as string) || "default";

    if (!userImageBase64 || !cardsImageBase64 || !birthDate || !question) {
      throw new Error("Missing required fields");
    }

    // Parse date from dd-mm-yy format
    let parsedDate: Date;
    try {
      parsedDate = parseDate(birthDate);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Invalid date format. Please use dd-mm-yy format"
      );
    }

    // Format date as YYYY-MM-DD for AI
    const formattedDate = `${parsedDate.getFullYear()}-${String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`;

    // Create AI prediction
    const predictionText = await createTarotReading({
      userImageBase64,
      cardsImageBase64,
      birthDate: formattedDate,
      question,
      tarotReaderId: tarotReaderId as any,
    });

    // Save to database
    const reading = await prisma.reading.create({
      data: {
        userId,
        question,
        birthDate: parsedDate,
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
      error:
        error instanceof Error ? error.message : "Failed to create reading",
    };
  }
}
